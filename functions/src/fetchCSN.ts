import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';
// NOTIFICACIONES ELIMINADAS PARA COSTO 0

const db = getFirestore();

// Mapeo de magnitud a severidad para sismos
function magnitudeToSeverity(magnitude: number): number {
  if (magnitude < 3.0) return 1;
  if (magnitude < 4.0) return 2;
  if (magnitude < 5.0) return 3;
  if (magnitude < 6.0) return 4;
  return 5;
}

// Función para formatear ubicación
function formatLocation(region: string, comuna?: string): string {
  if (comuna && comuna !== region) {
    return `${comuna}, ${region}`;
  }
  return region;
}

// Función para calcular radio basado en magnitud
function calculateEventRadius(magnitude: number): number {
  return Math.max(30, Math.round(magnitude * 15));
}

type FetchOptions = { dryRun?: boolean };

// Cron job: Fetch CSN cada 10 minutos
// Función principal para procesar el fetch (exportada para consolidación)
export async function processCSNFetch(
  options: FetchOptions = {}
): Promise<{ dryRun: boolean; total: number; processed: number; skipped: number } | void> {
  const dryRun = options.dryRun === true;
  logger.info('🚀 Iniciando fetch de eventos del CSN');
  if (dryRun) {
    logger.info('🧪 Modo dryRun activo (sin escrituras en Firestore)');
  }

  try {
    // Sitio web del Centro Sismológico Nacional de Chile
    const response = await fetch('https://sismologia.cl/');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlText = await response.text();

    // Parsear HTML para extraer datos de sismos
    const events = parseCSNHTML(htmlText);
    logger.info(`📊 Recibidos ${events.length} eventos del CSN`);

    // OPTIMIZACIÓN: Obtener IDs existentes de una vez para evitar lecturas en el loop
    const existingIds = new Set<string>();
    if (!dryRun) {
      try {
        const existingDocs = await db.collection('events')
          .where('source', '==', 'csn')
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
        // Validar que tenga datos mínimos requeridos
        if (!event.id || !event.magnitude || !event.lat || !event.lng) {
          logger.warn(`⚠️ Evento CSN sin datos completos: ${JSON.stringify(event)}`);
          skippedCount++;
          continue;
        }

        if (!dryRun) {
          // Verificar si el evento ya existe usando el Set optimizado
          if (existingIds.has(event.id)) {
            skippedCount++;
            continue;
          }

          // Fallback: Si el Set está vacío (por error en carga masiva), verificar individualmente
          if (existingIds.size === 0) {
            const checkDoc = await db.collection('events')
              .where('source', '==', 'csn')
              .where('externalId', '==', event.id)
              .limit(1)
              .get();
            if (!checkDoc.empty) {
              skippedCount++;
              continue;
            }
          }
        }

        // Calcular geohash y otros datos
        const geohash = geohashForLocation([event.lat, event.lng]);
        const magnitude = event.magnitude;
        const severity = magnitudeToSeverity(magnitude);
        const radiusKm = calculateEventRadius(magnitude);

        // Crear documento del evento
        const eventRef = db.collection('events').doc();
        const eventId = eventRef.id;
        const eventData = {
          id: eventId,
          disasterType: 'earthquake',
          source: 'csn',
          externalId: event.id,
          title: event.title,
          description: event.location,
          severity,
          location: {
            latitude: event.lat,
            longitude: event.lng
          },
          geohash,
          locationName: event.location,
          radiusKm,
          magnitude,
          depth: event.depth,
          metadata: {
            region: event.region,
            link: event.link
          },
          eventTime: Timestamp.fromDate(event.time),
          expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        if (!dryRun && batch) {
          batch.set(eventRef, eventData);
        }
        processedCount++;

        logger.info(`✅ Procesado evento CSN: ${event.id} - M${magnitude.toFixed(1)} - ${eventData.title}`);

      } catch (error) {
        logger.error(`❌ Error procesando evento CSN ${event.id}:`, error);
        continue;
      }
    }

    // Ejecutar batch
    if (!dryRun && processedCount > 0 && batch) {
      await batch.commit();
      logger.info(`💾 Guardados ${processedCount} nuevos eventos en Firestore`);
    }

    logger.info(`📈 Resumen: ${processedCount} procesados, ${skippedCount} omitidos`);
    logger.info('✅ Fetch CSN completado exitosamente');
    if (dryRun) {
      return {
        dryRun: true,
        total: events.length,
        processed: processedCount,
        skipped: skippedCount
      };
    }

  } catch (error) {
    logger.error('❌ Error en processCSNFetch:', error);
    throw error;
  }
}

// Parser simplificado de HTML CSN
function parseCSNHTML(htmlText: string): any[] {
  const events: any[] = [];

  try {
    // Buscar la tabla de últimos sismos
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/i;
    const tableMatch = htmlText.match(tableRegex);

    if (!tableMatch) {
      logger.warn('No se encontró tabla de sismos en HTML del CSN');
      return events;
    }

    const tableContent = tableMatch[0];

    // Buscar filas de la tabla con datos de sismos
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    let rowCount = 0;

    while ((rowMatch = rowRegex.exec(tableContent)) !== null && rowCount < 20) { // Limitar a 20 filas
      const rowContent = rowMatch[1];

      // Saltar filas de encabezado
      if (rowContent.includes('<th') || rowContent.includes('Fecha Local') || rowContent.includes('Magnitud')) {
        continue;
      }

      // Extraer celdas
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells: string[] = [];
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
        let cellContent = cellMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        cells.push(cellContent);
      }

      if (cells.length >= 3) {
        // Nuevo formato detectado: [Fecha+Lugar, Profundidad, Magnitud]
        const firstCell = cells[0];

        // El formato de fecha es YYYY-MM-DD HH:MM:SS
        const dateRegex = /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/;
        const dateMatch = firstCell.match(dateRegex);

        if (dateMatch) {
          const dateTimeStr = dateMatch[0];
          const locationStr = firstCell.replace(dateTimeStr, '').trim();
          const depthStr = cells[1];
          const magnitudeStr = cells[2];

          const magnitude = parseFloat(magnitudeStr);
          const depth = depthStr ? parseFloat(depthStr.replace('km', '').trim()) : null;

          if (!isNaN(magnitude)) {
            // Extraer coordenadas aproximadas de Chile basado en la ubicación
            const coords = estimateChileCoordinates(locationStr);
            const eventTime = new Date(dateTimeStr.replace(' ', 'T'));

            const eventId = `csn-${dateTimeStr.replace(/[^0-9]/g, '')}`;

            events.push({
              id: eventId,
              title: `Sismo M${magnitude.toFixed(1)} - ${locationStr}`,
              description: locationStr,
              time: eventTime,
              lat: coords.lat,
              lng: coords.lng,
              magnitude,
              depth,
              location: locationStr,
              region: 'Chile',
              link: 'https://sismologia.cl/'
            });

            rowCount++;
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error parsing CSN HTML:', error);
  }

  return events;
}

// Función auxiliar para estimar coordenadas en Chile basado en ubicación
function estimateChileCoordinates(locationStr: string): { lat: number; lng: number } {
  const location = locationStr.toLowerCase();

  // Coordenadas aproximadas de regiones de Chile
  if (location.includes('iquique') || location.includes('tarapacá')) {
    return { lat: -20.2, lng: -70.1 };
  }
  if (location.includes('antofagasta') || location.includes('calama')) {
    return { lat: -23.6, lng: -70.4 };
  }
  if (location.includes('copiapó') || location.includes('atacama')) {
    return { lat: -27.4, lng: -70.3 };
  }
  if (location.includes('coquimbo') || location.includes('la serena')) {
    return { lat: -29.9, lng: -71.3 };
  }
  if (location.includes('valparaíso') || location.includes('viña')) {
    return { lat: -33.0, lng: -71.6 };
  }
  if (location.includes('santiago') || location.includes('metropolitana')) {
    return { lat: -33.4, lng: -70.7 };
  }
  if (location.includes('talca') || location.includes('maule')) {
    return { lat: -35.4, lng: -71.7 };
  }
  if (location.includes('concepción') || location.includes('bío')) {
    return { lat: -36.8, lng: -73.0 };
  }
  if (location.includes('temuco') || location.includes('araucanía')) {
    return { lat: -38.7, lng: -72.6 };
  }
  if (location.includes('valdivia') || location.includes('ríos')) {
    return { lat: -39.8, lng: -73.2 };
  }
  if (location.includes('punta arenas') || location.includes('magallanes')) {
    return { lat: -53.2, lng: -70.9 };
  }

  // Default: Centro de Chile
  return { lat: -33.4, lng: -70.7 };
}
