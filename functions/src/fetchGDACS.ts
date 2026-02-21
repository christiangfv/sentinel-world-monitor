import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
// NOTIFICACIONES ELIMINADAS PARA COSTO 0
import { geohashForLocation } from 'geofire-common';

const db = getFirestore();

// Mapeo de tipos GDACS a nuestros tipos de desastre
const GDACS_TYPE_MAPPING: Record<string, string> = {
  'EQ': 'earthquake',
  'TC': 'storm',
  'FL': 'flood',
  'VO': 'volcano',
  'WF': 'wildfire',
  'DR': 'landslide',   // Drought → landslide (más cercano en nuestro sistema)
  'TS': 'tsunami'
};

// Mapeo de severidad GDACS a nuestro sistema (1-4)
// Red con eventosig alto → 4, Red normal → 3, Orange → 2, Green → 1
function gdacsAlertLevelToSeverity(alertLevel: string, eventScore?: number): number {
  switch (alertLevel.toLowerCase()) {
    case 'red':
      // Si el score es muy alto (>3.0 en escala GDACS), es nivel 4 (crítico)
      return (eventScore && eventScore >= 3.0) ? 4 : 3;
    case 'orange':
      return 2;
    case 'green':
    default:
      return 1;
  }
}

type FetchOptions = { dryRun?: boolean };

// Cron job: Fetch GDACS cada 30 minutos (optimizado para reducir costos)
// Función principal para procesar el fetch (exportada para consolidación)
export async function processGDACSFetch(
  options: FetchOptions = {}
): Promise<{ dryRun: boolean; total: number; processed: number; skipped: number } | void> {
  const dryRun = options.dryRun === true;
  logger.info('🚀 Iniciando fetch de eventos del GDACS');
  if (dryRun) {
    logger.info('🧪 Modo dryRun activo (sin escrituras en Firestore)');
  }

  try {
    const response = await fetch('https://www.gdacs.org/xml/rss.xml');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parsear XML básico (podríamos usar una librería más robusta en producción)
    const events = parseGDACSXML(xmlText);
    logger.info(`📊 Recibidos ${events.length} eventos del GDACS`);

    // OPTIMIZACIÓN: Obtener IDs existentes de una vez para evitar lecturas en el loop
    const existingIds = new Set<string>();
    if (!dryRun) {
      try {
        const existingDocs = await db.collection('events')
          .where('source', '==', 'gdacs')
          .orderBy('eventTime', 'desc')
          .limit(500)
          .get();
        existingDocs.forEach(doc => {
          const extId = doc.data().externalId;
          if (extId) existingIds.add(extId);
        });
        logger.info(`🔍 Cargados ${existingIds.size} IDs existentes para verificación`);
      } catch (error) {
        logger.error('❌ Error cargando IDs existentes:', error);
        // Continuamos aunque falle la carga masiva (menos eficiente pero seguro)
      }
    }

    const batch = dryRun ? null : db.batch();
    let processedCount = 0;
    let skippedCount = 0;
    // NOTIFICACIONES ELIMINADAS COMPLETAMENTE PARA COSTO 0

    for (const event of events) {
      try {
        if (!dryRun) {
          // Verificar si el evento ya existe usando el Set optimizado
          if (existingIds.has(event.guid)) {
            skippedCount++;
            continue;
          }

          // Fallback: Si el Set está vacío (por error en carga masiva), verificar individualmente
          if (existingIds.size === 0) {
            const checkDoc = await db.collection('events')
              .where('source', '==', 'gdacs')
              .where('externalId', '==', event.guid)
              .limit(1)
              .get();
            if (!checkDoc.empty) {
              skippedCount++;
              continue;
            }
          }
        }

        // Determinar tipo de desastre usando el código GDACS directamente
        const disasterType = GDACS_TYPE_MAPPING[event.eventType] || 'earthquake';
        const severity = gdacsAlertLevelToSeverity(event.alertLevel, event.eventScore);

        // Calcular geohash
        const geohash = geohashForLocation([event.lat, event.lng]);

        // Crear documento del evento
        const eventRef = db.collection('events').doc();
        const eventId = eventRef.id;
        const eventData = {
          id: eventId,
          disasterType,
          source: 'gdacs',
          externalId: event.guid,
          title: event.title,
          description: event.description,
          severity,
          location: {
            latitude: event.lat,
            longitude: event.lng
          },
          geohash,
          locationName: event.country || 'Ubicación desconocida',
          radiusKm: 100, // GDACS no proporciona radio específico
          magnitude: null,
          depth: null,
          metadata: {
            alertLevel: event.alertLevel,
            eventType: event.eventType,
            country: event.country,
            glide: event.glide,
            version: event.version,
            link: event.link,
            enclosure: event.enclosure
          },
          eventTime: Timestamp.fromDate(new Date(event.pubDate)),
          expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        if (!dryRun && batch) {
          batch.set(eventRef, eventData);
        }
        processedCount++;

        logger.info(`✅ Procesado evento GDACS: ${event.guid} - ${event.title}`);

      } catch (error) {
        logger.error(`❌ Error procesando evento GDACS ${event.guid}:`, error);
        continue;
      }
    }

    // Ejecutar batch
    if (!dryRun && processedCount > 0 && batch) {
      await batch.commit();
      logger.info(`💾 Guardados ${processedCount} nuevos eventos en Firestore`);
    }

    logger.info(`📈 Resumen: ${processedCount} procesados, ${skippedCount} omitidos`);
    logger.info('✅ Fetch GDACS completado exitosamente');
    if (dryRun) {
      return {
        dryRun: true,
        total: events.length,
        processed: processedCount,
        skipped: skippedCount
      };
    }

  } catch (error) {
    logger.error('❌ Error en processGDACSFetch:', error);
    throw error;
  }
}

// Extrae texto de un tag XML, soportando tanto texto plano como CDATA
function extractXmlText(content: string, tag: string): string {
  // Intentar CDATA primero
  const cdataMatch = content.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdataMatch) return cdataMatch[1].trim();
  // Fallback: texto plano
  const plainMatch = content.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return plainMatch ? plainMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim() : '';
}

// Parser de XML GDACS — soporta texto plano y CDATA
function parseGDACSXML(xmlText: string): any[] {
  const events: any[] = [];

  try {
    const items = xmlText.split('<item>').slice(1);

    for (const item of items) {
      const endIndex = item.indexOf('</item>');
      if (endIndex === -1) continue;

      const itemContent = item.substring(0, endIndex);

      // Campos básicos — soporta CDATA y texto plano
      const title = extractXmlText(itemContent, 'title');
      const description = extractXmlText(itemContent, 'description');
      const link = extractXmlText(itemContent, 'link');
      const guid = extractXmlText(itemContent, 'guid');
      const pubDate = extractXmlText(itemContent, 'pubDate');

      // Coordenadas: <geo:lat> / <geo:long> o <georss:point>
      let lat: number | null = null;
      let lng: number | null = null;

      const latMatch = itemContent.match(/<geo:lat>(.*?)<\/geo:lat>/);
      const lngMatch = itemContent.match(/<geo:long>(.*?)<\/geo:long>/);
      if (latMatch && lngMatch) {
        lat = parseFloat(latMatch[1]);
        lng = parseFloat(lngMatch[1]);
      } else {
        // Fallback: <georss:point>lat lng</georss:point>
        const pointMatch = itemContent.match(/<georss:point>(.*?)<\/georss:point>/);
        if (pointMatch) {
          const parts = pointMatch[1].trim().split(/\s+/);
          if (parts.length >= 2) {
            lat = parseFloat(parts[0]);
            lng = parseFloat(parts[1]);
          }
        }
      }

      // Tags GDACS específicos
      const alertLevel = extractXmlText(itemContent, 'gdacs:alertlevel') || 'Green';
      const country = extractXmlText(itemContent, 'gdacs:country');
      // gdacs:eventtype: EQ, TC, FL, VO, WF, DR, TS
      const eventType = extractXmlText(itemContent, 'gdacs:eventtype');
      // gdacs:eventscore: score numérico (0.0 - 4.0+) para determinar severidad
      const eventScoreRaw = extractXmlText(itemContent, 'gdacs:eventscore');
      const eventScore = eventScoreRaw ? parseFloat(eventScoreRaw) : undefined;

      // Validar coordenadas
      if (lat === null || lng === null || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        continue;
      }

      // Necesitamos al menos guid o title para identificar el evento
      if (!guid && !title) continue;

      events.push({
        title,
        description,
        link,
        guid: guid || `gdacs-${pubDate}-${lat}-${lng}`,
        pubDate,
        lat,
        lng,
        alertLevel,
        country,
        eventType,    // EQ, TC, FL, VO, WF, DR, TS
        eventScore,   // score numérico para severidad
        version: 1
      });
    }
  } catch (error) {
    logger.error('Error parsing GDACS XML:', error);
  }

  return events;
}
