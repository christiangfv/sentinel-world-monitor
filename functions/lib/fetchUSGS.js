"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUSGSEvents = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
const db = (0, firestore_1.getFirestore)();
// Mapeo de magnitud a severidad para sismos
function magnitudeToSeverity(magnitude) {
    if (magnitude < 4.0)
        return 1;
    if (magnitude < 5.0)
        return 2;
    if (magnitude < 6.0)
        return 3;
    return 4;
}
// Función para formatear ubicación
function formatLocation(place) {
    // Limpiar y formatear el lugar
    return place
        .replace(/\d+km\s+/i, '') // Remover distancias
        .replace(/\s+of\s+/i, ' de ') // Traducir "of" a "de"
        .replace(/\s+to\s+/i, ' a ') // Traducir "to" a "a"
        .trim();
}
// Función para calcular radio basado en magnitud
function calculateEventRadius(magnitude) {
    // Radio mínimo de 50km, aumenta con la magnitud
    return Math.max(50, Math.round(magnitude * 20));
}
// Cron job: Fetch USGS cada 15 minutos (optimizado para reducir costos)
exports.fetchUSGSEvents = (0, scheduler_1.onSchedule)({
    schedule: 'every 15 minutes',
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
}, async () => {
    firebase_functions_1.logger.info('🚀 Iniciando fetch de eventos del USGS');
    try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        firebase_functions_1.logger.info(`📊 Recibidos ${data.features.length} eventos del USGS`);
        const batch = db.batch();
        let processedCount = 0;
        let skippedCount = 0;
        for (const feature of data.features) {
            try {
                const { id, properties, geometry } = feature;
                const [lng, lat, depth] = geometry.coordinates;
                // Validar coordenadas
                if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
                    firebase_functions_1.logger.warn(`⚠️ Evento ${id} tiene coordenadas inválidas: lat=${lat}, lng=${lng}`);
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
                const geohash = (0, geofire_common_1.geohashForLocation)([lat, lng]);
                const magnitude = properties.mag || 0;
                const severity = magnitudeToSeverity(magnitude);
                const radiusKm = calculateEventRadius(magnitude);
                // Crear documento del evento
                const eventRef = db.collection('events').doc();
                const eventData = {
                    disasterType: 'earthquake',
                    source: 'usgs',
                    externalId: id,
                    title: properties.title,
                    description: formatLocation(properties.place),
                    severity,
                    location: {
                        lat,
                        lng
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
                    eventTime: firestore_1.Timestamp.fromMillis(properties.time),
                    expiresAt: firestore_1.Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
                    createdAt: firestore_1.Timestamp.now(),
                    updatedAt: firestore_1.Timestamp.now()
                };
                batch.set(eventRef, eventData);
                processedCount++;
                firebase_functions_1.logger.info(`✅ Procesado evento USGS: ${id} - M${magnitude.toFixed(1)} - ${properties.title}`);
            }
            catch (error) {
                firebase_functions_1.logger.error(`❌ Error procesando evento USGS ${feature.id}:`, error);
                continue;
            }
        }
        // Ejecutar batch
        if (processedCount > 0) {
            await batch.commit();
            firebase_functions_1.logger.info(`💾 Guardados ${processedCount} nuevos eventos en Firestore`);
        }
        firebase_functions_1.logger.info(`📈 Resumen: ${processedCount} procesados, ${skippedCount} omitidos`);
        firebase_functions_1.logger.info('✅ Fetch USGS completado exitosamente');
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en fetchUSGSEvents:', error);
        throw error;
    }
});
//# sourceMappingURL=fetchUSGS.js.map