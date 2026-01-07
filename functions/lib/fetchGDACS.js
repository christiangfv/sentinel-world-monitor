"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchGDACSEvents = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const index_1 = require("./index");
const geofire_common_1 = require("geofire-common");
const db = (0, firestore_1.getFirestore)();
// Mapeo de tipos GDACS a nuestros tipos de desastre
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GDACS_TYPE_MAPPING = {
    'EQ': 'earthquake', // Earthquake
    'TC': 'storm', // Tropical Cyclone
    'FL': 'flood', // Flood
    'VO': 'volcano', // Volcano
    'WF': 'wildfire', // Wildfire
    'DR': 'landslide', // Drought (mapeado a landslide por ahora)
    'TS': 'tsunami' // Tsunami
};
// Mapeo de severidad GDACS a nuestro sistema
function gdacsAlertLevelToSeverity(alertLevel, disasterType) {
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
function determineDisasterType(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('earthquake') || text.includes('sismo'))
        return 'earthquake';
    if (text.includes('tsunami'))
        return 'tsunami';
    if (text.includes('volcan') || text.includes('eruption'))
        return 'volcano';
    if (text.includes('flood') || text.includes('inundation'))
        return 'flood';
    if (text.includes('fire') || text.includes('wildfire'))
        return 'wildfire';
    if (text.includes('cyclone') || text.includes('hurricane') || text.includes('storm'))
        return 'storm';
    if (text.includes('landslide') || text.includes('mudslide'))
        return 'landslide';
    return 'earthquake'; // Default
}
// Cron job: Fetch GDACS cada 30 minutos (optimizado para reducir costos)
exports.fetchGDACSEvents = (0, scheduler_1.onSchedule)({
    schedule: 'every 30 minutes',
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
}, async () => {
    firebase_functions_1.logger.info('🚀 Iniciando fetch de eventos del GDACS');
    try {
        const response = await fetch('https://www.gdacs.org/xml/rss.xml');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const xmlText = await response.text();
        // Parsear XML básico (podríamos usar una librería más robusta en producción)
        const events = parseGDACSXML(xmlText);
        firebase_functions_1.logger.info(`📊 Recibidos ${events.length} eventos del GDACS`);
        const batch = db.batch();
        let processedCount = 0;
        let skippedCount = 0;
        const criticalEvents = []; // Eventos de severidad 4+ para notificaciones
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
                const geohash = (0, geofire_common_1.geohashForLocation)([event.lat, event.lng]);
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
                    eventTime: firestore_1.Timestamp.fromDate(new Date(event.pubDate)),
                    expiresAt: firestore_1.Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
                    createdAt: firestore_1.Timestamp.now(),
                    updatedAt: firestore_1.Timestamp.now()
                };
                batch.set(eventRef, eventData);
                processedCount++;
                // Agregar a lista de eventos críticos si severidad >= 4
                if (severity >= 4) {
                    criticalEvents.push(eventData);
                }
                firebase_functions_1.logger.info(`✅ Procesado evento GDACS: ${event.guid} - ${event.title}`);
            }
            catch (error) {
                firebase_functions_1.logger.error(`❌ Error procesando evento GDACS ${event.guid}:`, error);
                continue;
            }
        }
        // Ejecutar batch
        if (processedCount > 0) {
            await batch.commit();
            firebase_functions_1.logger.info(`💾 Guardados ${processedCount} nuevos eventos en Firestore`);
            // Enviar notificaciones para eventos críticos
            if (criticalEvents.length > 0) {
                firebase_functions_1.logger.info(`🚨 Enviando notificaciones para ${criticalEvents.length} eventos críticos...`);
                for (const criticalEvent of criticalEvents) {
                    try {
                        const result = await (0, index_1.sendCriticalNotifications)(criticalEvent);
                        if (result.sent > 0) {
                            firebase_functions_1.logger.info(`📤 Enviadas ${result.sent} notificaciones para evento crítico ${criticalEvent.externalId}`);
                        }
                    }
                    catch (error) {
                        firebase_functions_1.logger.error(`❌ Error enviando notificaciones para evento ${criticalEvent.externalId}:`, error);
                    }
                }
            }
        }
        firebase_functions_1.logger.info(`📈 Resumen: ${processedCount} procesados, ${skippedCount} omitidos`);
        firebase_functions_1.logger.info('✅ Fetch GDACS completado exitosamente');
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en fetchGDACSEvents:', error);
        throw error;
    }
});
// Parser simplificado de XML GDACS
function parseGDACSXML(xmlText) {
    const events = [];
    try {
        // Método simplificado: buscar patrones básicos sin flag 's'
        const items = xmlText.split('<item>').slice(1);
        for (const item of items) {
            const endIndex = item.indexOf('</item>');
            if (endIndex === -1)
                continue;
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
            const title = (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) || '';
            const description = (descriptionMatch === null || descriptionMatch === void 0 ? void 0 : descriptionMatch[1]) || '';
            const link = (linkMatch === null || linkMatch === void 0 ? void 0 : linkMatch[1]) || '';
            const guid = (guidMatch === null || guidMatch === void 0 ? void 0 : guidMatch[1]) || '';
            const pubDate = (pubDateMatch === null || pubDateMatch === void 0 ? void 0 : pubDateMatch[1]) || '';
            const lat = (latMatch === null || latMatch === void 0 ? void 0 : latMatch[1]) ? parseFloat(latMatch[1]) : null;
            const lng = (lngMatch === null || lngMatch === void 0 ? void 0 : lngMatch[1]) ? parseFloat(lngMatch[1]) : null;
            const alertLevel = (alertLevelMatch === null || alertLevelMatch === void 0 ? void 0 : alertLevelMatch[1]) || 'Green';
            const country = (countryMatch === null || countryMatch === void 0 ? void 0 : countryMatch[1]) || '';
            // Validar coordenadas: deben existir, ser números válidos y no ser 0,0
            if (!lat || !lng || isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0) || !title) {
                continue; // Saltar eventos con coordenadas inválidas
            }
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
    catch (error) {
        firebase_functions_1.logger.error('Error parsing GDACS XML:', error);
    }
    return events;
}
//# sourceMappingURL=fetchGDACS.js.map