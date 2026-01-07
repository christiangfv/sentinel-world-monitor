import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';
import { sendCriticalNotifications } from './index';

const db = getFirestore();

// Mapeo de categorías de huracanes a severidad
function hurricaneCategoryToSeverity(category: string): number {
  if (category.includes('Tropical Depression') || category.includes('Low')) return 1;
  if (category.includes('Tropical Storm') || category.includes('Moderate')) return 2;
  if (category.includes('Category 1') || category.includes('Category 2')) return 3;
  if (category.includes('Category 3') || category.includes('Category 4')) return 4;
  if (category.includes('Category 5') || category.includes('Major')) return 5;
  return 2; // Default para tormentas tropicales
}

// Función para extraer coordenadas de texto
function extractCoordinates(text: string): { lat: number; lng: number } | null {
  // Buscar patrones como "18.5N 68.2W" o "18.5°N 68.2°W"
  const coordMatch = text.match(/(\d+(?:\.\d+)?)[°\s]*([NS])\s+(\d+(?:\.\d+)?)[°\s]*([EW])/i);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const latDir = coordMatch[2].toUpperCase();
    const lng = parseFloat(coordMatch[3]);
    const lngDir = coordMatch[4].toUpperCase();

    return {
      lat: latDir === 'S' ? -lat : lat,
      lng: lngDir === 'W' ? -lng : lng
    };
  }
  return null;
}

// Función para extraer velocidad del viento
function extractWindSpeed(text: string): number | null {
  const windMatch = text.match(/(\d+)\s*(?:mph|km\/h|kts?|knots?)/i);
  return windMatch ? parseInt(windMatch[1]) : null;
}

// Cron job: Fetch NHC cada 30 minutos
export const fetchNHCEvents = onSchedule({
  schedule: 'every 30 minutes',
  region: 'southamerica-east1',
  timeoutSeconds: 60,
  memory: '256MiB',
}, async (): Promise<void> => {
  logger.info('🚀 Iniciando fetch de eventos del NHC');

  try {
    // API del National Hurricane Center - Atlantic
    const atlanticResponse = await fetch('https://www.nhc.noaa.gov/index-at.xml');

    if (!atlanticResponse.ok) {
      throw new Error(`HTTP error! status: ${atlanticResponse.status}`);
    }

    const atlanticXmlText = await atlanticResponse.text();

    // Parsear eventos del Atlántico
    const atlanticEvents = parseNHCXML(atlanticXmlText, 'Atlantic');

    // Intentar obtener eventos del Pacífico también
    let pacificEvents: any[] = [];
    try {
      const pacificResponse = await fetch('https://www.nhc.noaa.gov/index-ep.xml');
      if (pacificResponse.ok) {
        const pacificXmlText = await pacificResponse.text();
        pacificEvents = parseNHCXML(pacificXmlText, 'Pacific');
      }
    } catch (error) {
      logger.warn('No se pudieron obtener eventos del Pacífico:', error);
    }

    const allEvents = [...atlanticEvents, ...pacificEvents];
    logger.info(`📊 Recibidos ${allEvents.length} eventos del NHC (${atlanticEvents.length} Atlántico, ${pacificEvents.length} Pacífico)`);

    const batch = db.batch();
    let processedCount = 0;
    let skippedCount = 0;
    const criticalEvents: any[] = []; // Eventos de severidad 4+ para notificaciones

    for (const event of allEvents) {
      try {
        // Verificar si el evento ya existe
        const existingDoc = await db.collection('events')
          .where('source', '==', 'nhc')
          .where('externalId', '==', event.guid)
          .limit(1)
          .get();

        if (!existingDoc.empty) {
          skippedCount++;
          continue;
        }

        // Extraer coordenadas si están disponibles
        const coords = extractCoordinates(event.description);
        const lat = coords ? coords.lat : 25.0; // Centro del Caribe/Atlántico
        const lng = coords ? coords.lng : -70.0;
        const geohash = geohashForLocation([lat, lng]);

        // Extraer velocidad del viento
        const windSpeed = extractWindSpeed(event.description);

        // Determinar severidad basada en la categoría
        const severity = hurricaneCategoryToSeverity(event.title);

        // Crear documento del evento
        const eventRef = db.collection('events').doc();
        const eventId = eventRef.id;
        const eventData = {
          id: eventId,
          disasterType: 'storm',
          source: 'nhc',
          externalId: event.guid,
          title: event.title,
          description: event.description,
          severity,
          location: {
            latitude: lat,
            longitude: lng
          },
          geohash,
          locationName: event.area || `${event.ocean} Ocean`,
          radiusKm: 400, // Radio amplio para huracanes
          magnitude: null,
          depth: null,
          metadata: {
            ocean: event.ocean,
            category: event.category,
            windSpeed,
            area: event.area,
            movement: event.movement,
            pressure: event.pressure,
            link: event.link
          },
          eventTime: Timestamp.fromDate(new Date(event.pubDate)),
          expiresAt: Timestamp.fromMillis(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días para huracanes
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        batch.set(eventRef, eventData);
        processedCount++;

        // Agregar a lista de eventos críticos si severidad >= 4
        if (severity >= 4) {
          criticalEvents.push(eventData);
        }

        logger.info(`✅ Procesado evento NHC: ${event.guid} - ${event.title}`);

      } catch (error) {
        logger.error(`❌ Error procesando evento NHC ${event.guid}:`, error);
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
    logger.info('✅ Fetch NHC completado exitosamente');

  } catch (error) {
    logger.error('❌ Error en fetchNHCEvents:', error);
    throw error;
  }
});

// Parser simplificado de XML NHC
function parseNHCXML(xmlText: string, ocean: string): any[] {
  const events: any[] = [];

  try {
    const items = xmlText.split('<item>').slice(1);

    for (const item of items) {
      const endIndex = item.indexOf('</item>');
      if (endIndex === -1) continue;

      const itemContent = item.substring(0, endIndex);

      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const guidMatch = itemContent.match(/<guid>(.*?)<\/guid>/);
      const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);

      const title = titleMatch?.[1] || '';
      const description = descriptionMatch?.[1] || '';
      const link = linkMatch?.[1] || '';
      const guid = guidMatch?.[1] || '';
      const pubDate = pubDateMatch?.[1] || '';

      // Solo procesar si es un huracán, tormenta tropical, o depresión tropical activa
      if (!title.toLowerCase().includes('hurricane') &&
          !title.toLowerCase().includes('tropical storm') &&
          !title.toLowerCase().includes('tropical depression') &&
          !title.toLowerCase().includes('potential')) {
        continue;
      }

      // Extraer información adicional de la descripción
      const areaMatch = description.match(/LOCATION:\s*([^<\n]+)/i);
      const movementMatch = description.match(/MOVEMENT:\s*([^<\n]+)/i);
      const pressureMatch = description.match(/MINIMUM\s+CENTRAL\s+PRESSURE:\s*(\d+)/i);

      const area = areaMatch ? areaMatch[1].trim() : `${ocean} Ocean`;
      const movement = movementMatch ? movementMatch[1].trim() : null;
      const pressure = pressureMatch ? parseInt(pressureMatch[1]) : null;

      events.push({
        title,
        description,
        link,
        guid: guid || `nhc-${ocean.toLowerCase()}-${Date.now()}-${Math.random()}`,
        pubDate: pubDate || new Date().toISOString(),
        ocean,
        area,
        movement,
        pressure,
        category: title
      });
    }
  } catch (error) {
    logger.error(`Error parsing NHC ${ocean} XML:`, error);
  }

  return events;
}
