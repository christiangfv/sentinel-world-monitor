import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';

const db = getFirestore();

// Mapeo de tipos GDACS a nuestros tipos de desastre
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GDACS_TYPE_MAPPING: Record<string, string> = {
  'EQ': 'earthquake',     // Earthquake
  'TC': 'storm',          // Tropical Cyclone
  'FL': 'flood',          // Flood
  'VO': 'volcano',        // Volcano
  'WF': 'wildfire',       // Wildfire
  'DR': 'landslide',      // Drought (mapeado a landslide por ahora)
  'TS': 'tsunami'         // Tsunami
};

// Mapeo de severidad GDACS a nuestro sistema
function gdacsAlertLevelToSeverity(alertLevel: string, disasterType: string): number {
  // GDACS usa Green, Orange, Red
  switch (alertLevel.toLowerCase()) {
    case 'green':
      return 1;
    case 'orange':
      return 2;
    case 'red':
      return 3;
    default:
      return 1;
  }
}

// Función para determinar el tipo de desastre basado en el título y descripción
function determineDisasterType(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();

  if (text.includes('earthquake') || text.includes('sismo')) return 'earthquake';
  if (text.includes('tsunami')) return 'tsunami';
  if (text.includes('volcan') || text.includes('eruption')) return 'volcano';
  if (text.includes('flood') || text.includes('inundation')) return 'flood';
  if (text.includes('fire') || text.includes('wildfire')) return 'wildfire';
  if (text.includes('cyclone') || text.includes('hurricane') || text.includes('storm')) return 'storm';
  if (text.includes('landslide') || text.includes('mudslide')) return 'landslide';

  return 'earthquake'; // Default
}

// Cron job: Fetch GDACS cada 30 minutos (optimizado para reducir costos)
export const fetchGDACSEvents = onSchedule({
  schedule: 'every 30 minutes',
  region: 'southamerica-east1',
  timeoutSeconds: 60,
  memory: '256MiB',
}, async (): Promise<void> => {
  logger.info('🚀 Iniciando fetch de eventos del GDACS');

  try {
    const response = await fetch('https://www.gdacs.org/xml/rss.xml');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parsear XML básico (podríamos usar una librería más robusta en producción)
    const events = parseGDACSXML(xmlText);
    logger.info(`📊 Recibidos ${events.length} eventos del GDACS`);

    const batch = db.batch();
    let processedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      try {
        // Verificar si el evento ya existe
        const existingDoc = await db.collection('events')
          .where('source', '==', 'gdacs')
          .where('externalId', '==', event.guid)
          .limit(1)
          .get();

        if (!existingDoc.empty) {
          skippedCount++;
          continue;
        }

        // Determinar tipo de desastre
        const disasterType = determineDisasterType(event.title, event.description);
        const severity = gdacsAlertLevelToSeverity(event.alertLevel, disasterType);

        // Calcular geohash
        const geohash = geohashForLocation([event.lat, event.lng]);

        // Crear documento del evento
        const eventRef = db.collection('events').doc();
        const eventData = {
          disasterType,
          source: 'gdacs',
          externalId: event.guid,
          title: event.title,
          description: event.description,
          severity,
          location: {
            lat: event.lat,
            lng: event.lng
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

        batch.set(eventRef, eventData);
        processedCount++;

        logger.info(`✅ Procesado evento GDACS: ${event.guid} - ${event.title}`);

      } catch (error) {
        logger.error(`❌ Error procesando evento GDACS ${event.guid}:`, error);
        continue;
      }
    }

    // Ejecutar batch
    if (processedCount > 0) {
      await batch.commit();
      logger.info(`💾 Guardados ${processedCount} nuevos eventos en Firestore`);
    }

    logger.info(`📈 Resumen: ${processedCount} procesados, ${skippedCount} omitidos`);
    logger.info('✅ Fetch GDACS completado exitosamente');

  } catch (error) {
    logger.error('❌ Error en fetchGDACSEvents:', error);
    throw error;
  }
});

// Parser simplificado de XML GDACS
function parseGDACSXML(xmlText: string): any[] {
  const events: any[] = [];

  try {
    // Método simplificado: buscar patrones básicos sin flag 's'
    const items = xmlText.split('<item>').slice(1);

    for (const item of items) {
      const endIndex = item.indexOf('</item>');
      if (endIndex === -1) continue;

      const itemContent = item.substring(0, endIndex);

      // Extraer datos básicos
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const guidMatch = itemContent.match(/<guid>(.*?)<\/guid>/);
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
      const latMatch = itemContent.match(/<geo:lat>(.*?)<\/geo:lat>/);
      const lngMatch = itemContent.match(/<geo:long>(.*?)<\/geo:long>/);

      const alertLevelMatch = itemContent.match(/<gdacs:alertlevel>(.*?)<\/gdacs:alertlevel>/);
      const countryMatch = itemContent.match(/<gdacs:country>(.*?)<\/gdacs:country>/);

      const title = titleMatch?.[1] || '';
      const description = descriptionMatch?.[1] || '';
      const link = linkMatch?.[1] || '';
      const guid = guidMatch?.[1] || '';
      const pubDate = pubDateMatch?.[1] || '';
      const lat = parseFloat(latMatch?.[1] || '0');
      const lng = parseFloat(lngMatch?.[1] || '0');

      const alertLevel = alertLevelMatch?.[1] || 'Green';
      const country = countryMatch?.[1] || '';

      if (lat && lng && title) {
        events.push({
          title,
          description,
          link,
          guid,
          pubDate,
          lat,
          lng,
          alertLevel,
          country,
          version: 1
        });
      }
    }
  } catch (error) {
    logger.error('Error parsing GDACS XML:', error);
  }

  return events;
}
