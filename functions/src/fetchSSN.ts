import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';

const db = getFirestore();

// Mapeo de magnitud a severidad para sismos (escala mexicana)
function magnitudeToSeverity(magnitude: number): number {
  if (magnitude < 4.0) return 1; // Leve
  if (magnitude < 5.0) return 2; // Moderado
  if (magnitude < 6.0) return 3; // Fuerte
  return 4; // Muy fuerte/catastrófico
}

// Función para calcular radio basado en magnitud
function calculateEventRadius(magnitude: number): number {
  // Radio mínimo de 30km, aumenta con la magnitud
  return Math.max(30, Math.round(magnitude * 15));
}

// Función para parsear la descripción del RSS
function parseSSNDescription(description: string): {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
} {
  // Ejemplo: "Fecha:2026-01-12 04:58:45 (Hora de México)<br/>Lat/Lon: 16.867/-99.487<br/>Profundidad: 7.1 km"

  const dateMatch = description.match(/Fecha:(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  const latLonMatch = description.match(/Lat\/Lon:\s*([-\d.]+)\/([-\d.]+)/);
  const depthMatch = description.match(/Profundidad:\s*([\d.]+)\s*km/);

  if (!dateMatch || !latLonMatch || !depthMatch) {
    throw new Error(`No se pudo parsear la descripción: ${description}`);
  }

  return {
    date: dateMatch[1],
    time: dateMatch[2],
    latitude: parseFloat(latLonMatch[1]),
    longitude: parseFloat(latLonMatch[2]),
    depth: parseFloat(depthMatch[1])
  };
}

type FetchOptions = { dryRun?: boolean };

// Función principal para procesar el fetch del SSN (Servicio Sismológico Nacional de México)
export async function processSSNFetch(
  options: FetchOptions = {}
): Promise<{ dryRun: boolean; total: number; processed: number; skipped: number } | void> {
  const dryRun = options.dryRun === true;
  logger.info('🇲🇽 Iniciando fetch de eventos del SSN (México)');
  if (dryRun) {
    logger.info('🧪 Modo dryRun activo (sin escrituras en Firestore)');
  }

  try {
    const response = await fetch('http://www.ssn.unam.mx/rss/ultimos-sismos.xml');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    logger.info(`📄 XML recibido del SSN (${xmlText.length} caracteres)`);

    // Parsear XML manualmente (sin dependencias adicionales)
    const events = parseSSNRSS(xmlText);
    logger.info(`📊 Encontrados ${events.length} sismos en el feed del SSN`);

    // OPTIMIZACIÓN PARA COSTO 0: Obtener IDs existentes de las últimas 48 horas
    const existingIds = new Set<string>();
    if (!dryRun) {
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      try {
        const existingDocs = await db.collection('events')
          .where('source', '==', 'ssn')
          .where('eventTime', '>=', Timestamp.fromDate(twoDaysAgo))
          .get();
        existingDocs.forEach(doc => {
          const extId = doc.data().externalId;
          if (extId) existingIds.add(extId);
        });
        logger.info(`🔍 Cargados ${existingIds.size} IDs recientes para verificación (costo optimizado)`);
      } catch (error) {
        logger.error('❌ Error cargando IDs existentes:', error);
      }
    }

    const batch = dryRun ? null : db.batch();
    let processedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      try {
        const { title, description, link, lat, lng } = event;

        if (!dryRun) {
          // Verificar si el evento ya existe usando link como ID único
          if (existingIds.has(link)) {
            skippedCount++;
            continue;
          }
        }

        // Parsear datos del evento
        const parsedData = parseSSNDescription(description);
        const magnitudeMatch = title.match(/^(\d+\.?\d*),\s/);

        if (!magnitudeMatch) {
          logger.warn(`⚠️ No se pudo extraer magnitud del título: ${title}`);
          skippedCount++;
          continue;
        }

        const magnitude = parseFloat(magnitudeMatch[1]);
        const severity = magnitudeToSeverity(magnitude);
        const radiusKm = calculateEventRadius(magnitude);

        // Crear geohash
        const geohash = geohashForLocation([parsedData.latitude, parsedData.longitude]);

        // Crear ID único basado en fecha, hora y coordenadas
        const externalId = `${parsedData.date}_${parsedData.time}_${parsedData.latitude}_${parsedData.longitude}`;

        // Crear título limpio
        const cleanTitle = title.replace(/^[\d.]+\,\s*/, '').trim();

        // Crear fecha completa en UTC (el SSN reporta en hora de México, que es UTC-6)
        const mexicoTime = new Date(`${parsedData.date}T${parsedData.time}-06:00`);
        const eventTime = Timestamp.fromDate(mexicoTime);

        const eventRef = db.collection('events').doc();
        const eventId = eventRef.id;

        const eventData = {
          id: eventId,
          disasterType: 'earthquake',
          source: 'ssn',
          externalId,
          title: cleanTitle,
          description: `Sismo de magnitud ${magnitude} registrado por el Servicio Sismológico Nacional de México`,
          severity,
          location: {
            latitude: parsedData.latitude,
            longitude: parsedData.longitude
          },
          geohash,
          locationName: cleanTitle,
          radiusKm,
          magnitude,
          depth: parsedData.depth,
          metadata: {
            fecha: parsedData.date,
            hora: parsedData.time,
            zona: 'Mexico',
            fuente: 'Servicio Sismológico Nacional (SSN)',
            url: link
          },
          eventTime,
          expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        if (!dryRun && batch) {
          batch.set(eventRef, eventData);
        }
        processedCount++;

        logger.info(`✅ Procesado sismo SSN: M${magnitude.toFixed(1)} - ${cleanTitle}`);

      } catch (error) {
        logger.error(`❌ Error procesando evento SSN:`, error);
        continue;
      }
    }

    // Ejecutar batch
    if (!dryRun && processedCount > 0 && batch) {
      await batch.commit();
      logger.info(`💾 Guardados ${processedCount} nuevos sismos de México en Firestore`);
    }

    logger.info(`📈 Resumen SSN: ${processedCount} procesados, ${skippedCount} omitidos`);
    logger.info('✅ Fetch SSN (México) completado exitosamente');
    if (dryRun) {
      return {
        dryRun: true,
        total: events.length,
        processed: processedCount,
        skipped: skippedCount
      };
    }

  } catch (error) {
    logger.error('❌ Error en processSSNFetch:', error);
    throw error;
  }
}

// Función para parsear el XML RSS del SSN
function parseSSNRSS(xmlText: string): Array<{
  title: string;
  description: string;
  link: string;
  lat: number;
  lng: number;
}> {
  const events: Array<{
    title: string;
    description: string;
    link: string;
    lat: number;
    lng: number;
  }> = [];

  try {
    // Extraer items del RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemText = match[1];

      // Extraer datos del item — soporta tanto texto plano como CDATA
      const titleMatch = itemText.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s);
      const descMatch = itemText.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/);
      const linkMatch = itemText.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/s);
      const latMatch = itemText.match(/<geo:lat>([\d.-]+)<\/geo:lat>/);
      const lngMatch = itemText.match(/<geo:long>([\d.-]+)<\/geo:long>/);

      if (titleMatch && descMatch && latMatch && lngMatch) {
        events.push({
          title: titleMatch[1].trim(),
          description: descMatch[1].trim(),
          link: linkMatch?.[1]?.trim() || '',
          lat: parseFloat(latMatch[1]),
          lng: parseFloat(lngMatch[1])
        });
      }
    }

  } catch (error) {
    logger.error('❌ Error parseando XML del SSN:', error);
  }

  return events;
}



