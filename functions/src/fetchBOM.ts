import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';
import { sendCriticalNotifications } from './index';

const db = getFirestore();

// Mapeo de categorías de ciclones a severidad
function cycloneCategoryToSeverity(category: string): number {
  const cat = category.toLowerCase();
  if (cat.includes('tropical depression') || cat.includes('low')) return 1;
  if (cat.includes('tropical storm') || cat.includes('moderate')) return 2;
  if (cat.includes('severe tropical cyclone') || cat.includes('category 1') || cat.includes('category 2')) return 3;
  if (cat.includes('category 3') || cat.includes('category 4')) return 4;
  if (cat.includes('category 5')) return 5;
  return 2; // Default para tormentas tropicales
}

// Mapeo de tipos de alertas meteorológicas
function weatherAlertToSeverity(alertType: string, severity: string): number {
  const alertLower = alertType.toLowerCase();
  const sevLower = severity.toLowerCase();

  // Alertas críticas
  if (alertLower.includes('major') || sevLower.includes('extreme') || sevLower.includes('catastrophic')) return 5;
  if (sevLower.includes('severe')) return 4;
  if (sevLower.includes('moderate')) return 3;
  if (sevLower.includes('minor')) return 2;

  return 2; // Default
}

// Función para determinar el tipo de desastre
function determineDisasterType(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();

  if (text.includes('cyclone') || text.includes('hurricane') || text.includes('typhoon')) return 'storm';
  if (text.includes('flood')) return 'flood';
  if (text.includes('heat') || text.includes('temperature')) return 'heatwave';
  if (text.includes('bushfire') || text.includes('wildfire')) return 'wildfire';
  if (text.includes('storm') || text.includes('thunder')) return 'storm';
  if (text.includes('rain') || text.includes('precipitation')) return 'flood';

  return 'storm'; // Default
}

// Cron job: Fetch BOM cada 30 minutos
export const fetchBOMEvents = onSchedule({
  schedule: 'every 30 minutes',
  region: 'southamerica-east1',
  timeoutSeconds: 60,
  memory: '256MiB',
}, async (): Promise<void> => {
  logger.info('🚀 Iniciando fetch de eventos del BOM');

  try {
    // Página web del Bureau of Meteorology Australia - Ciclones activos
    const cycloneResponse = await fetch('https://www.bom.gov.au/cyclone/');

    if (!cycloneResponse.ok) {
      throw new Error(`HTTP error! status: ${cycloneResponse.status}`);
    }

    const cycloneHtmlText = await cycloneResponse.text();

    // Parsear ciclones desde HTML
    const cycloneEvents = parseBOMCycloneHTML(cycloneHtmlText);

    // Intentar obtener alertas de la página principal
    let alertEvents: any[] = [];
    try {
      const alertsResponse = await fetch('https://www.bom.gov.au/');
      if (alertsResponse.ok) {
        const alertsHtmlText = await alertsResponse.text();
        alertEvents = parseBOMAlertsHTML(alertsHtmlText);
      }
    } catch (error) {
      logger.warn('No se pudieron obtener alertas generales del BOM:', error);
    }

    const allEvents = [...cycloneEvents, ...alertEvents];
    logger.info(`📊 Recibidos ${allEvents.length} eventos del BOM (${cycloneEvents.length} ciclones, ${alertEvents.length} alertas)`);

    const batch = db.batch();
    let processedCount = 0;
    let skippedCount = 0;
    const criticalEvents: any[] = []; // Eventos de severidad 4+ para notificaciones

    for (const event of allEvents) {
      try {
        // Validar coordenadas si existen
        if (event.lat && event.lng && (isNaN(event.lat) || isNaN(event.lng))) {
          logger.warn(`⚠️ Evento BOM con coordenadas inválidas: ${event.guid}`);
          skippedCount++;
          continue;
        }

        // Verificar si el evento ya existe
        const existingDoc = await db.collection('events')
          .where('source', '==', 'bom')
          .where('externalId', '==', event.guid)
          .limit(1)
          .get();

        if (!existingDoc.empty) {
          skippedCount++;
          continue;
        }

        // Determinar tipo de desastre
        const disasterType = determineDisasterType(event.title, event.description);
        const severity = event.severity || weatherAlertToSeverity(event.alertType || '', event.description);

        // Usar coordenadas centrales de Australia si no hay coordenadas específicas
        const lat = event.lat || -25.0; // Centro aproximado de Australia
        const lng = event.lng || 135.0;
        const geohash = geohashForLocation([lat, lng]);

        // Crear documento del evento
        const eventRef = db.collection('events').doc();
        const eventId = eventRef.id;
        const eventData = {
          id: eventId,
          disasterType,
          source: 'bom',
          externalId: event.guid,
          title: event.title,
          description: event.description,
          severity,
          location: {
            latitude: lat,
            longitude: lng
          },
          geohash,
          locationName: event.area || 'Australia',
          radiusKm: event.radiusKm || 500, // Radio amplio para fenómenos meteorológicos
          magnitude: null,
          depth: null,
          metadata: {
            alertType: event.alertType,
            area: event.area,
            region: event.region,
            category: event.category,
            windSpeed: event.windSpeed,
            pressure: event.pressure,
            link: event.link
          },
          eventTime: Timestamp.fromDate(new Date(event.pubDate)),
          expiresAt: Timestamp.fromMillis(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días para eventos meteorológicos
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        batch.set(eventRef, eventData);
        processedCount++;

        // Agregar a lista de eventos críticos si severidad >= 4
        if (severity >= 4) {
          criticalEvents.push(eventData);
        }

        logger.info(`✅ Procesado evento BOM: ${event.guid} - ${event.title}`);

      } catch (error) {
        logger.error(`❌ Error procesando evento BOM ${event.guid}:`, error);
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
    logger.info('✅ Fetch BOM completado exitosamente');

  } catch (error) {
    logger.error('❌ Error en fetchBOMEvents:', error);
    throw error;
  }
});

// Parser simplificado de HTML BOM para ciclones
function parseBOMCycloneHTML(htmlText: string): any[] {
  const events: any[] = [];

  try {
    // Buscar información de ciclones activos en el HTML
    const cycloneRegex = /tropical\s+cyclone|cyclone\s+active|severe\s+tropical\s+cyclone/gi;
    const cycloneMatches = htmlText.match(cycloneRegex);

    if (cycloneMatches && cycloneMatches.length > 0) {
      // Si hay ciclones activos, crear un evento general
      const eventId = `bom-cyclone-${Date.now()}`;

      events.push({
        title: 'Ciclón Tropical Activo - Australia',
        description: 'El BOM ha reportado ciclones tropicales activos cerca de Australia',
        link: 'https://www.bom.gov.au/cyclone/',
        guid: eventId,
        pubDate: new Date().toISOString(),
        lat: -15.0, // Centro aproximado de la región de ciclones australianos
        lng: 130.0,
        severity: 4, // Ciclones son generalmente severos
        alertType: 'Cyclone',
        area: 'Australia',
        region: 'Pacific Ocean',
        category: 'Active Cyclone',
        windSpeed: null,
        pressure: null,
        radiusKm: 500
      });
    }
  } catch (error) {
    logger.error('Error parsing BOM Cyclone HTML:', error);
  }

  return events;
}

// Parser simplificado de HTML BOM para alertas generales
function parseBOMAlertsHTML(htmlText: string): any[] {
  const events: any[] = [];

  try {
    // Buscar alertas en la página principal
    const alertRegex = /warnings?\s+available|severe\s+weather|heat\s+warning/gi;
    const alertMatches = htmlText.match(alertRegex);

    if (alertMatches && alertMatches.length > 0) {
      // Si hay alertas activas, crear eventos generales
      const eventId = `bom-alert-${Date.now()}`;

      events.push({
        title: 'Alerta Meteorológica - Australia',
        description: 'El BOM ha emitido alertas meteorológicas para Australia',
        link: 'https://www.bom.gov.au/',
        guid: eventId,
        pubDate: new Date().toISOString(),
        lat: -25.0, // Centro de Australia
        lng: 135.0,
        severity: 3, // Alertas meteorológicas moderadas
        alertType: 'Weather Alert',
        area: 'Australia',
        region: 'Australia',
        radiusKm: 1000
      });
    }
  } catch (error) {
    logger.error('Error parsing BOM Alerts HTML:', error);
  }

  return events;
}
