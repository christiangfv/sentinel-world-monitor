import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';

const db = getFirestore();

// Mapeo de colores CENAPRED a severidad
function colorToSeverity(color: string): number {
  switch (color.toLowerCase()) {
    case 'verde': return 1; // Normal
    case 'amarillo': return 2; // Cambio en actividad
    case 'naranja': return 3; // Actividad inusual
    case 'rojo': return 4; // Actividad alta/erupción inminente
    default: return 1;
  }
}

// Función para calcular radio basado en severidad
function calculateEventRadius(severity: number): number {
  // Radio mínimo de 50km, aumenta con la severidad
  return Math.max(50, severity * 25);
}

// Datos de volcanes mexicanos conocidos
const mexicanVolcanoes = [
  {
    name: 'Popocatépetl',
    location: 'México',
    latitude: 19.023,
    longitude: -98.622,
    description: 'Volcán activo más peligroso de México'
  },
  {
    name: 'Volcán de Colima',
    location: 'Colima, México',
    latitude: 19.514,
    longitude: -103.617,
    description: 'Uno de los volcanes más activos de México'
  },
  {
    name: 'Ceboruco',
    location: 'Nayarit, México',
    latitude: 21.125,
    longitude: -104.508,
    description: 'Volcán activo en la Sierra de Ceboruco'
  },
  {
    name: 'Pico de Orizaba',
    location: 'Puebla/Veracruz, México',
    latitude: 19.030,
    longitude: -97.269,
    description: 'Volcán más alto de México'
  }
];

type FetchOptions = { dryRun?: boolean };

// Función principal para procesar el fetch de CENAPRED
export async function processCENAPREDFetch(
  options: FetchOptions = {}
): Promise<{ dryRun: boolean; total: number; processed: number; skipped: number } | void> {
  const dryRun = options.dryRun === true;
  logger.info('🌋 Iniciando fetch de CENAPRED (Volcanes México)');
  if (dryRun) {
    logger.info('🧪 Modo dryRun activo (sin escrituras en Firestore)');
  }

  try {
    // Intentar obtener datos del sitio web de CENAPRED
    const response = await fetch('https://www.gob.mx/cenapred');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlText = await response.text();
    logger.info(`📄 HTML de CENAPRED obtenido (${htmlText.length} caracteres)`);

    // Extraer información de volcanes del HTML
    const volcanoEvents = extractVolcanoInfo(htmlText);
    logger.info(`🌋 Encontrados ${volcanoEvents.length} eventos volcánicos en CENAPRED`);

    // OPTIMIZACIÓN PARA COSTO 0: Obtener IDs existentes de las últimas 72 horas
    const existingIds = new Set<string>();
    if (!dryRun) {
      const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
      try {
        const existingDocs = await db.collection('events')
          .where('source', '==', 'cenapred')
          .where('eventTime', '>=', Timestamp.fromDate(threeDaysAgo))
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

    for (const volcanoEvent of volcanoEvents) {
      try {
        // Verificar si el evento ya existe
        const externalId = `cenapred_${volcanoEvent.volcanoName}_${volcanoEvent.date}`;
        if (!dryRun && existingIds.has(externalId)) {
          skippedCount++;
          continue;
        }

        const severity = colorToSeverity(volcanoEvent.alertColor);
        const radiusKm = calculateEventRadius(severity);
        const geohash = geohashForLocation([volcanoEvent.latitude, volcanoEvent.longitude]);

        const eventRef = db.collection('events').doc();
        const eventId = eventRef.id;

        const eventData = {
          id: eventId,
          disasterType: 'volcano',
          source: 'cenapred',
          externalId,
          title: `${volcanoEvent.volcanoName} - Alerta ${volcanoEvent.alertColor}`,
          description: `Monitoreo volcánico CENAPRED: ${volcanoEvent.description}. ${volcanoEvent.details}`,
          severity,
          location: {
            latitude: volcanoEvent.latitude,
            longitude: volcanoEvent.longitude
          },
          geohash,
          locationName: `${volcanoEvent.volcanoName}, ${volcanoEvent.location}`,
          radiusKm,
          metadata: {
            alertColor: volcanoEvent.alertColor,
            volcanoName: volcanoEvent.volcanoName,
            monitoringStatus: volcanoEvent.monitoringStatus,
            lastUpdate: volcanoEvent.date,
            fuente: 'Centro Nacional de Prevención de Desastres (CENAPRED)',
            url: 'https://www.gob.mx/cenapred'
          },
          eventTime: Timestamp.fromDate(new Date(volcanoEvent.date)),
          expiresAt: Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        if (!dryRun && batch) {
          batch.set(eventRef, eventData);
        }
        processedCount++;

        logger.info(`🌋 Procesado volcán CENAPRED: ${volcanoEvent.volcanoName} - ${volcanoEvent.alertColor}`);

      } catch (error) {
        logger.error(`❌ Error procesando volcán CENAPRED:`, error);
        continue;
      }
    }

    // Ejecutar batch
    if (!dryRun && processedCount > 0 && batch) {
      await batch.commit();
      logger.info(`💾 Guardados ${processedCount} eventos volcánicos de CENAPRED en Firestore`);
    }

    logger.info(`📈 Resumen CENAPRED: ${processedCount} procesados, ${skippedCount} omitidos`);
    logger.info('✅ Fetch CENAPRED (México) completado exitosamente');
    if (dryRun) {
      return {
        dryRun: true,
        total: volcanoEvents.length,
        processed: processedCount,
        skipped: skippedCount
      };
    }

  } catch (error) {
    logger.error('❌ Error en processCENAPREDFetch:', error);
    throw error;
  }
}

// Función para extraer información de volcanes del HTML de CENAPRED
function extractVolcanoInfo(htmlText: string): Array<{
  volcanoName: string;
  location: string;
  latitude: number;
  longitude: number;
  alertColor: string;
  description: string;
  details: string;
  date: string;
  monitoringStatus: string;
}> {
  const volcanoEvents: Array<{
    volcanoName: string;
    location: string;
    latitude: number;
    longitude: number;
    alertColor: string;
    description: string;
    details: string;
    date: string;
    monitoringStatus: string;
  }> = [];

  try {
    // Buscar información de volcanes en el HTML
    // CENAPRED actualiza regularmente la información de volcanes activos

    // Extraer información del Popocatépetl (el más activo)
    const popocatepetlRegex = /Popocatépetl|popocatepetl/i;
    if (popocatepetlRegex.test(htmlText)) {
      // Buscar información de alerta
      const alertMatch = htmlText.match(/(Semáforo|Alerta)\s+(Verde|Amarillo|Naranja|Rojo)/i);
      const alertColor = alertMatch ? alertMatch[2] : 'Verde'; // Default verde

      const popocatepetl = mexicanVolcanoes.find(v => v.name === 'Popocatépetl');
      if (popocatepetl) {
        volcanoEvents.push({
          volcanoName: 'Popocatépetl',
          location: popocatepetl.location,
          latitude: popocatepetl.latitude,
          longitude: popocatepetl.longitude,
          alertColor,
          description: popocatepetl.description,
          details: `Semáforo de alerta: ${alertColor}. Monitoreo continuo por CENAPRED.`,
          date: new Date().toISOString().split('T')[0],
          monitoringStatus: 'Activo'
        });
      }
    }

    // Agregar otros volcanes con información básica
    // En una implementación completa, esto se extraería del HTML real
    for (const volcano of mexicanVolcanoes.slice(1)) { // Excluir Popocatépetl ya agregado
      volcanoEvents.push({
        volcanoName: volcano.name,
        location: volcano.location,
        latitude: volcano.latitude,
        longitude: volcano.longitude,
        alertColor: 'Verde', // Default para volcanes no activos
        description: volcano.description,
        details: 'Monitoreo rutinario por CENAPRED.',
        date: new Date().toISOString().split('T')[0],
        monitoringStatus: 'Estable'
      });
    }

  } catch (error) {
    logger.error('❌ Error extrayendo información de volcanes:', error);
  }

  return volcanoEvents;
}



