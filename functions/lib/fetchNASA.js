"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNASAFetch = processNASAFetch;
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
const db = (0, firestore_1.getFirestore)();
// Helper to map EONET category to our DisasterType
function mapCategoryToDisasterType(categoryId) {
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
function estimateSeverity(title, categoryId) {
    const t = title.toLowerCase();
    if (categoryId === 'wildfires') {
        // Quemas controladas (prescribed fires, RX burns) = baja severidad
        if (t.includes('rx') || t.includes('prescribed'))
            return 1;
        // Incendios grandes o severos
        if (t.includes('major') || t.includes('large') || t.includes('severe') || t.includes('complex'))
            return 3;
        // Incendio forestal estándar
        return 2;
    }
    if (t.includes('major') || t.includes('severe') || t.includes('eruption') || t.includes('large'))
        return 3;
    return 2;
}
// Helper to extract location name from EONET title
// Titles like "SHNF C-92 RX Prescribed Fire, San Jacinto, Texas" → "San Jacinto, Texas"
function extractLocationName(title) {
    // Buscar patrón: "..., Place, State/Country"
    const parts = title.split(',');
    if (parts.length >= 2) {
        // El nombre del lugar está en las últimas 1-2 partes
        return parts.slice(-2).map(p => p.trim()).join(', ');
    }
    // Si no hay comas, buscar últimas palabras después de keywords
    const cleaned = title
        .replace(/\bRX\b/gi, '')
        .replace(/Prescribed Fire/gi, '')
        .replace(/Wildfire/gi, '')
        .replace(/Fire/gi, '')
        .trim();
    return cleaned || 'Ubicación remota (Satellite)';
}
async function processNASAFetch(options = {}) {
    var _a;
    const dryRun = options.dryRun === true;
    firebase_functions_1.logger.info('🚀 Iniciando fetch de eventos de NASA EONET');
    if (dryRun) {
        firebase_functions_1.logger.info('🧪 Modo dryRun activo (sin escrituras en Firestore)');
    }
    try {
        // Fetch active events from the last 30 days
        // API v3 usa slugs (no IDs numéricos de v2)
        const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&category=wildfires,volcanoes,landslides,floods,severeStorms';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        firebase_functions_1.logger.info(`📊 Recibidos ${data.events.length} eventos de NASA EONET`);
        // Optimizado: Obtener IDs existentes masivamente
        const existingIds = new Set();
        if (!dryRun) {
            try {
                const existingDocs = await db.collection('events')
                    .where('source', '==', 'nasa_eonet')
                    .limit(500)
                    .get();
                existingDocs.forEach(doc => {
                    const extId = doc.data().externalId;
                    if (extId)
                        existingIds.add(extId);
                });
            }
            catch (error) {
                firebase_functions_1.logger.error('❌ Error cargando IDs existentes:', error);
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
                const categoryId = (_a = categories[0]) === null || _a === void 0 ? void 0 : _a.id;
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
                const geohash = (0, geofire_common_1.geohashForLocation)([lat, lng]);
                const severity = estimateSeverity(title, categoryId);
                const locationName = extractLocationName(title);
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
                    locationName,
                    radiusKm: 20 + (severity * 10),
                    metadata: {
                        eonet_link: event.link,
                        categories: categories
                    },
                    eventTime: firestore_1.Timestamp.fromDate(date),
                    createdAt: firestore_1.Timestamp.now(),
                    updatedAt: firestore_1.Timestamp.now(),
                    expiresAt: firestore_1.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
                };
                if (!dryRun && batch) {
                    batch.set(eventRef, eventData);
                }
                processedCount++;
            }
            catch (err) {
                firebase_functions_1.logger.error(`❌ Error procesando evento NASA ${event.id}:`, err);
                continue;
            }
        }
        if (!dryRun && processedCount > 0 && batch) {
            await batch.commit();
            firebase_functions_1.logger.info(`💾 Guardados ${processedCount} nuevos eventos de NASA en Firestore`);
        }
        firebase_functions_1.logger.info(`📈 Resumen NASA: ${processedCount} procesados, ${skippedCount} omitidos`);
        if (dryRun) {
            return {
                dryRun: true,
                total: data.events.length,
                processed: processedCount,
                skipped: skippedCount
            };
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en processNASAFetch:', error);
        // No throw to verify other fetchers can continue if this fails
    }
}
//# sourceMappingURL=fetchNASA.js.map