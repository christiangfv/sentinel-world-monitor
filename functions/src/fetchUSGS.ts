import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';
import { sendCriticalNotifications } from './index';

const db = getFirestore();

// Mapeo de magnitud a severidad para sismos
function magnitudeToSeverity(magnitude: number): number {
  if (magnitude < 4.0) return 1;
  if (magnitude < 5.0) return 2;
  if (magnitude < 6.0) return 3;
  return 4;
}

// Función para formatear ubicación
function formatLocation(place: string): string {
  // Limpiar y formatear el lugar
  return place
    .replace(/\d+km\s+/i, '') // Remover distancias
    .replace(/\s+of\s+/i, ' de ') // Traducir "of" a "de"
    .replace(/\s+to\s+/i, ' a ') // Traducir "to" a "a"
    .trim();
}

// Función para calcular radio basado en magnitud
function calculateEventRadius(magnitude: number): number {
  // Radio mínimo de 50km, aumenta con la magnitud
  return Math.max(50, Math.round(magnitude * 20));
}

// Cron job: Fetch USGS cada 15 minutos (optimizado para reducir costos)
export const fetchUSGSEvents = onSchedule({
  schedule: 'every 15 minutes',
  region: 'southamerica-east1',
  timeoutSeconds: 60,
  memory: '256MiB',
}, async (): Promise<void> => {
  logger.info('🚀 Iniciando fetch de eventos del USGS');

  try {
    const response = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson'
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    logger.info(`📊 Recibidos ${data.features.length} eventos del USGS`);

    const batch = db.batch();
    let processedCount = 0;
    let skippedCount = 0;
    const criticalEvents: any[] = []; // Eventos de severidad 4+ para notificaciones

    for (const feature of data.features) {
      try {
        const { id, properties, geometry } = feature;
        const [lng, lat, depth] = geometry.coordinates;

        // Validar coordenadas
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
          logger.warn(`⚠️ Evento ${id} tiene coordenadas inválidas: lat=${lat}, lng=${lng}`);
          skippedCount++;
          continue;
        }

        // Verificar si el evento ya existe
        const existingDoc = await db.collection('events')
          .where('source', '==', 'usgs')
          .where('externalId', '==', id)
          .limit(1)
          .get();

        if (!existingDoc.empty) {
          skippedCount++;
          continue;
        }

        // Calcular geohash y otros datos
        const geohash = geohashForLocation([lat, lng]);
        const magnitude = properties.mag || 0;
        const severity = magnitudeToSeverity(magnitude);
        const radiusKm = calculateEventRadius(magnitude);

        // Crear documento del evento
        const eventRef = db.collection('events').doc();
        const eventId = eventRef.id;
        const eventData = {
          id: eventId,
          disasterType: 'earthquake',
          source: 'usgs',
          externalId: id,
          title: properties.title,
          description: formatLocation(properties.place),
          severity,
          location: {
            latitude: lat,
            longitude: lng
          },
          geohash,
          locationName: formatLocation(properties.place),
          radiusKm,
          magnitude,
          depth,
          metadata: {
            felt: properties.felt || null,
            cdi: properties.cdi || null,
            mmi: properties.mmi || null,
            alert: properties.alert || null,
            status: properties.status,
            tsunami: properties.tsunami || 0,
            sig: properties.sig || null,
            net: properties.net,
            code: properties.code,
            ids: properties.ids,
            sources: properties.sources,
            types: properties.types,
            nst: properties.nst || null,
            dmin: properties.dmin || null,
            rms: properties.rms || null,
            gap: properties.gap || null,
            url: properties.url,
            detail: properties.detail
          },
          eventTime: Timestamp.fromMillis(properties.time),
          expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        batch.set(eventRef, eventData);
        processedCount++;

        // Agregar a lista de eventos críticos si severidad >= 4
        if (severity >= 4) {
          criticalEvents.push(eventData);
        }

        logger.info(`✅ Procesado evento USGS: ${id} - M${magnitude.toFixed(1)} - ${properties.title}`);

      } catch (error) {
        logger.error(`❌ Error procesando evento USGS ${feature.id}:`, error);
        continue;
      }
    }

    // Ejecutar batch
    if (processedCount > 0) {
      await batch.commit();
      logger.info(`💾 Guardados ${processedCount} nuevos eventos en Firestore`);

      // Enviar notificaciones para eventos críticos
      if (criticalEvents.length > 0) {
        logger.info(`🚨 Enviando notificaciones para ${criticalEvents.length} eventos críticos...`);
        for (const criticalEvent of criticalEvents) {
          try {
            const result = await sendCriticalNotifications(criticalEvent);
            if (result.sent > 0) {
              logger.info(`📤 Enviadas ${result.sent} notificaciones para evento crítico ${criticalEvent.externalId}`);
            }
          } catch (error) {
            logger.error(`❌ Error enviando notificaciones para evento ${criticalEvent.externalId}:`, error);
          }
        }
      }
    }

    logger.info(`📈 Resumen: ${processedCount} procesados, ${skippedCount} omitidos`);
    logger.info('✅ Fetch USGS completado exitosamente');

  } catch (error) {
    logger.error('❌ Error en fetchUSGSEvents:', error);
    throw error;
  }
});
