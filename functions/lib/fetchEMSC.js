"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEMSCvents = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
const index_1 = require("./index");
const db = (0, firestore_1.getFirestore)();
// Mapeo de magnitud a severidad para sismos
function magnitudeToSeverity(magnitude) {
    if (magnitude < 3.5)
        return 1;
    if (magnitude < 4.5)
        return 2;
    if (magnitude < 5.5)
        return 3;
    if (magnitude < 6.5)
        return 4;
    return 5;
}
// Función para calcular radio basado en magnitud
function calculateEventRadius(magnitude) {
    return Math.max(40, Math.round(magnitude * 18));
}
// Cron job: Fetch EMSC cada 15 minutos
exports.fetchEMSCvents = (0, scheduler_1.onSchedule)({
    schedule: 'every 15 minutes',
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
}, async () => {
    firebase_functions_1.logger.info('🚀 Iniciando fetch de eventos del EMSC');
    try {
        // Página web del European-Mediterranean Seismological Centre
        const response = await fetch('https://www.emsc-csem.org/Earthquake_information/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const htmlText = await response.text();
        // Parsear HTML para extraer datos de terremotos
        const events = parseEMSCHTML(htmlText);
        firebase_functions_1.logger.info(`📊 Recibidos ${events.length} eventos del EMSC`);
        const batch = db.batch();
        let processedCount = 0;
        let skippedCount = 0;
        const criticalEvents = []; // Eventos de severidad 4+ para notificaciones
        for (const event of events) {
            try {
                // Validar coordenadas
                if (!event.lat || !event.lng || isNaN(event.lat) || isNaN(event.lng)) {
                    firebase_functions_1.logger.warn(`⚠️ Evento EMSC sin coordenadas válidas: ${event.guid}`);
                    skippedCount++;
                    continue;
                }
                // Verificar si el evento ya existe
                const existingDoc = await db.collection('events')
                    .where('source', '==', 'emsc')
                    .where('externalId', '==', event.guid)
                    .limit(1)
                    .get();
                if (!existingDoc.empty) {
                    skippedCount++;
                    continue;
                }
                // Calcular geohash y otros datos
                const geohash = (0, geofire_common_1.geohashForLocation)([event.lat, event.lng]);
                const magnitude = event.magnitude || 0;
                const severity = magnitudeToSeverity(magnitude);
                const radiusKm = calculateEventRadius(magnitude);
                // Crear documento del evento
                const eventRef = db.collection('events').doc();
                const eventId = eventRef.id;
                const eventData = {
                    id: eventId,
                    disasterType: 'earthquake',
                    source: 'emsc',
                    externalId: event.guid,
                    title: event.title,
                    description: event.description,
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
                        agency: event.agency,
                        status: event.status,
                        link: event.link
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
                firebase_functions_1.logger.info(`✅ Procesado evento EMSC: ${event.guid} - M${magnitude.toFixed(1)} - ${event.title}`);
            }
            catch (error) {
                firebase_functions_1.logger.error(`❌ Error procesando evento EMSC ${event.guid}:`, error);
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
        firebase_functions_1.logger.info('✅ Fetch EMSC completado exitosamente');
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en fetchEMSCvents:', error);
        throw error;
    }
});
// Parser simplificado de HTML EMSC
function parseEMSCHTML(htmlText) {
    const events = [];
    try {
        // Buscar la tabla de terremotos
        const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/i;
        const tableMatch = htmlText.match(tableRegex);
        if (!tableMatch) {
            firebase_functions_1.logger.warn('No se encontró tabla de terremotos en HTML del EMSC');
            return events;
        }
        const tableContent = tableMatch[0];
        // Buscar filas de la tabla
        const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
        let rowMatch;
        let rowCount = 0;
        while ((rowMatch = rowRegex.exec(tableContent)) !== null && rowCount < 20) {
            const rowContent = rowMatch[1];
            // Saltar filas de encabezado
            if (rowContent.includes('<th') || rowContent.includes('Date & Time') || rowContent.includes('Citizen response')) {
                continue;
            }
            // Extraer celdas
            const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
            const cells = [];
            let cellMatch;
            while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                const cellContent = cellMatch[1].replace(/<[^>]*>/g, '').trim();
                cells.push(cellContent);
            }
            // Formato esperado: [checkbox, DateTime, Lat, Lon, Depth, Mag, Region]
            if (cells.length >= 7) {
                const dateTimeStr = cells[1];
                const latStr = cells[2];
                const lngStr = cells[3];
                const depthStr = cells[4];
                const magStr = cells[5];
                const regionStr = cells[6];
                const lat = parseFloat(latStr);
                const lng = parseFloat(lngStr);
                const depth = parseFloat(depthStr);
                const magnitude = parseFloat(magStr);
                if (!isNaN(lat) && !isNaN(lng) && !isNaN(magnitude) && regionStr) {
                    const eventId = `emsc-${dateTimeStr.replace(/[^0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;
                    events.push({
                        title: `Terremoto M${magnitude.toFixed(1)} - ${regionStr}`,
                        description: `Terremoto de magnitud ${magnitude} en ${regionStr}`,
                        link: 'https://www.emsc-csem.org/Earthquake_information/',
                        guid: eventId,
                        pubDate: new Date().toISOString(),
                        lat,
                        lng,
                        depth: isNaN(depth) ? null : depth,
                        magnitude,
                        location: regionStr,
                        region: regionStr,
                        agency: 'EMSC',
                        status: 'reviewed'
                    });
                    rowCount++;
                }
            }
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error parsing EMSC HTML:', error);
    }
    return events;
}
//# sourceMappingURL=fetchEMSC.js.map