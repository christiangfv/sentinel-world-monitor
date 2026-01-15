import { logger } from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { geohashForLocation } from 'geofire-common';

const db = getFirestore();

type FetchOptions = { dryRun?: boolean };

// Helper to map EONET category to our DisasterType
function mapCategoryToDisasterType(categoryId: string): string | null {
    switch (categoryId) {
        case 'wildfires': return 'wildfire';
        case 'volcanoes': return 'volcano';
        case 'landslides': return 'landslide';
        case 'floods': return 'flood';
        case 'severeStorms': return 'storm';
        default: return null;
    }
}

// Helper to estimate severity (EONET doesn't provide it directly)
function estimateSeverity(title: string): number {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('major') || lowerTitle.includes('severe') || lowerTitle.includes('eruption')) return 3;
    return 2; // Default to Medium
}

export async function processNASAFetch(
    options: FetchOptions = {}
): Promise<{ dryRun: boolean; total: number; processed: number; skipped: number } | void> {
    const dryRun = options.dryRun === true;
    logger.info('🚀 Iniciando fetch de eventos de NASA EONET');
    if (dryRun) {
        logger.info('🧪 Modo dryRun activo (sin escrituras en Firestore)');
    }

    try {
        // Fetch active events from the last 30 days
        // Categories: 8(Wildfires), 12(Volcanoes), 14(Landslides), 9(Floods), 10(Severe Storms)
        const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&category=8,12,14,9,10';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        logger.info(`📊 Recibidos ${data.events.length} eventos de NASA EONET`);

        // Optimizado: Obtener IDs existentes masivamente
        const existingIds = new Set<string>();
        if (!dryRun) {
            try {
                const existingDocs = await db.collection('events')
                    .where('source', '==', 'nasa_eonet')
                    .limit(500)
                    .get();
                existingDocs.forEach(doc => {
                    const extId = doc.data().externalId;
                    if (extId) existingIds.add(extId);
                });
            } catch (error) {
                logger.error('❌ Error cargando IDs existentes:', error);
            }
        }

        const batch = dryRun ? null : db.batch();
        let processedCount = 0;
        let skippedCount = 0;

        for (const event of data.events) {
            try {
                const { id, title, description, categories, geometry } = event;

                if (!dryRun) {
                    // Skip if exists
                    if (existingIds.has(id)) {
                        skippedCount++;
                        continue;
                    }
                }

                // Map Category
                const categoryId = categories[0]?.id;
                const disasterType = mapCategoryToDisasterType(categoryId);

                if (!disasterType) {
                    // logger.debug(`⚠️ Categoría no soportada: ${categoryId} (${title})`);
                    skippedCount++;
                    continue;
                }

                // Get latest location (geometry is array of points over time)
                const latestGeo = geometry[geometry.length - 1];
                const [lng, lat] = latestGeo.coordinates;
                const date = new Date(latestGeo.date);

                if (typeof lat !== 'number' || typeof lng !== 'number') {
                    skippedCount++;
                    continue;
                }

                const geohash = geohashForLocation([lat, lng]);
                const severity = estimateSeverity(title);

                // Doc Ref
                const eventRef = db.collection('events').doc();
                const eventData = {
                    id: eventRef.id,
                    disasterType,
                    source: 'nasa_eonet',
                    externalId: id,
                    title,
                    description: description || title,
                    severity,
                    location: {
                        latitude: lat,
                        longitude: lng
                    },
                    geohash,
                    locationName: 'Ubicación remota (Satellite)', // EONET rarely gives place names
                    radiusKm: 20 + (severity * 10),
                    metadata: {
                        eonet_link: event.link,
                        categories: categories
                    },
                    eventTime: Timestamp.fromDate(date),
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    expiresAt: Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
                };

                if (!dryRun && batch) {
                    batch.set(eventRef, eventData);
                }
                processedCount++;

            } catch (err) {
                logger.error(`❌ Error procesando evento NASA ${event.id}:`, err);
                continue;
            }
        }

        if (!dryRun && processedCount > 0 && batch) {
            await batch.commit();
            logger.info(`💾 Guardados ${processedCount} nuevos eventos de NASA en Firestore`);
        }

        logger.info(`📈 Resumen NASA: ${processedCount} procesados, ${skippedCount} omitidos`);
        if (dryRun) {
            return {
                dryRun: true,
                total: data.events.length,
                processed: processedCount,
                skipped: skippedCount
            };
        }

    } catch (error) {
        logger.error('❌ Error en processNASAFetch:', error);
        // No throw to verify other fetchers can continue if this fails
    }
}
