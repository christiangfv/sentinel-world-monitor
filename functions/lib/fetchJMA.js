"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJMAEvents = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
const index_1 = require("./index");
const db = (0, firestore_1.getFirestore)();
// Mapeo de intensidad sísmica JMA a severidad
function jmaIntensityToSeverity(intensity) {
    const int = intensity.toLowerCase();
    if (int.includes('1') || int.includes('2'))
        return 1;
    if (int.includes('3'))
        return 2;
    if (int.includes('4'))
        return 3;
    if (int.includes('5-') || int.includes('5弱'))
        return 4;
    if (int.includes('5+') || int.includes('5強') || int.includes('6') || int.includes('7'))
        return 5;
    return 2; // Default
}
// Mapeo de magnitud a severidad para sismos
function magnitudeToSeverity(magnitude) {
    if (magnitude < 4.0)
        return 1;
    if (magnitude < 5.0)
        return 2;
    if (magnitude < 6.0)
        return 3;
    if (magnitude < 7.0)
        return 4;
    return 5;
}
// Función para determinar el tipo de desastre basado en el título
function determineDisasterType(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('tsunami'))
        return 'tsunami';
    if (text.includes('earthquake') || text.includes('震源') || text.includes('地震'))
        return 'earthquake';
    if (text.includes('volcano') || text.includes('volcanic') || text.includes('火山'))
        return 'volcano';
    if (text.includes('typhoon') || text.includes('台風'))
        return 'storm';
    return 'earthquake'; // Default
}
// Cron job: Fetch JMA cada 15 minutos
exports.fetchJMAEvents = (0, scheduler_1.onSchedule)({
    schedule: 'every 15 minutes',
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
}, async () => {
    firebase_functions_1.logger.info('🚀 Iniciando fetch de eventos del JMA');
    try {
        // API del Japan Meteorological Agency - Earthquakes
        const earthquakeResponse = await fetch('https://www.jma.go.jp/en/quake/quakee_index.html');
        if (!earthquakeResponse.ok) {
            throw new Error(`HTTP error! status: ${earthquakeResponse.status}`);
        }
        const earthquakeHtml = await earthquakeResponse.text();
        // Parsear terremotos
        const earthquakeEvents = parseJMAEarthquakeHTML(earthquakeHtml);
        // Intentar obtener información de tsunamis si está disponible
        let tsunamiEvents = [];
        try {
            const tsunamiResponse = await fetch('https://www.jma.go.jp/en/tsunami/tsunami_index.html');
            if (tsunamiResponse.ok) {
                const tsunamiHtml = await tsunamiResponse.text();
                tsunamiEvents = parseJMATsunamiHTML(tsunamiHtml);
            }
        }
        catch (error) {
            firebase_functions_1.logger.warn('No se pudieron obtener eventos de tsunami del JMA:', error);
        }
        const allEvents = [...earthquakeEvents, ...tsunamiEvents];
        firebase_functions_1.logger.info(`📊 Recibidos ${allEvents.length} eventos del JMA (${earthquakeEvents.length} terremotos, ${tsunamiEvents.length} tsunamis)`);
        const batch = db.batch();
        let processedCount = 0;
        let skippedCount = 0;
        const criticalEvents = []; // Eventos de severidad 4+ para notificaciones
        for (const event of allEvents) {
            try {
                // Validar coordenadas
                if (!event.lat || !event.lng || isNaN(event.lat) || isNaN(event.lng)) {
                    firebase_functions_1.logger.warn(`⚠️ Evento JMA sin coordenadas válidas: ${event.id}`);
                    skippedCount++;
                    continue;
                }
                // Verificar si el evento ya existe
                const existingDoc = await db.collection('events')
                    .where('source', '==', 'jma')
                    .where('externalId', '==', event.id)
                    .limit(1)
                    .get();
                if (!existingDoc.empty) {
                    skippedCount++;
                    continue;
                }
                // Determinar tipo de desastre
                const disasterType = determineDisasterType(event.title, event.description);
                // Calcular severidad
                let severity = event.severity || 2;
                if (event.magnitude) {
                    severity = magnitudeToSeverity(event.magnitude);
                }
                if (event.intensity) {
                    severity = Math.max(severity, jmaIntensityToSeverity(event.intensity));
                }
                const geohash = (0, geofire_common_1.geohashForLocation)([event.lat, event.lng]);
                const radiusKm = event.radiusKm || calculateEventRadius(event.magnitude || 0, disasterType);
                // Crear documento del evento
                const eventRef = db.collection('events').doc();
                const eventId = eventRef.id;
                const eventData = {
                    id: eventId,
                    disasterType,
                    source: 'jma',
                    externalId: event.id,
                    title: event.title,
                    description: event.description,
                    severity,
                    location: {
                        latitude: event.lat,
                        longitude: event.lng
                    },
                    geohash,
                    locationName: event.location || 'Japón',
                    radiusKm,
                    magnitude: event.magnitude || null,
                    depth: event.depth || null,
                    metadata: {
                        intensity: event.intensity,
                        maxIntensity: event.maxIntensity,
                        region: event.region,
                        prefecture: event.prefecture,
                        tsunamiWarning: event.tsunamiWarning,
                        link: event.link
                    },
                    eventTime: firestore_1.Timestamp.fromDate(new Date(event.time)),
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
                firebase_functions_1.logger.info(`✅ Procesado evento JMA: ${event.id} - ${event.title}`);
            }
            catch (error) {
                firebase_functions_1.logger.error(`❌ Error procesando evento JMA ${event.id}:`, error);
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
        firebase_functions_1.logger.info('✅ Fetch JMA completado exitosamente');
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en fetchJMAEvents:', error);
        throw error;
    }
});
// Función para calcular radio basado en magnitud y tipo
function calculateEventRadius(magnitude, disasterType) {
    if (disasterType === 'tsunami')
        return 1000; // Radio amplio para tsunamis
    if (disasterType === 'earthquake') {
        return Math.max(50, Math.round(magnitude * 20));
    }
    return 200; // Default
}
// Parser simplificado de HTML JMA para terremotos
function parseJMAEarthquakeHTML(htmlText) {
    const events = [];
    try {
        // Buscar tabla de terremotos (enfoque simplificado)
        const tableRegex = /<table[^>]*class="[^"]*quakeindex[^"]*"[^>]*>(.*?)<\/table>/is;
        const tableMatch = htmlText.match(tableRegex);
        if (!tableMatch) {
            firebase_functions_1.logger.warn('No se encontró tabla de terremotos en HTML del JMA');
            return events;
        }
        const tableContent = tableMatch[1];
        // Buscar filas de la tabla
        const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
        let rowMatch;
        while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
            const rowContent = rowMatch[1];
            // Saltar filas de encabezado
            if (rowContent.includes('<th') || rowContent.includes('Time')) {
                continue;
            }
            // Extraer celdas
            const cellRegex = /<td[^>]*>(.*?)<\/td>/gis;
            const cells = [];
            let cellMatch;
            while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
                cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
            }
            if (cells.length >= 6) {
                const time = cells[0];
                const lat = parseFloat(cells[1]) || null;
                const lng = parseFloat(cells[2]) || null;
                const depth = parseFloat(cells[3]) || null;
                const magnitude = parseFloat(cells[4]) || null;
                const maxIntensity = cells[5];
                const location = cells[6] || 'Japón';
                if (lat && lng && magnitude) {
                    const eventId = `jma-eq-${time.replace(/[^0-9]/g, '')}-${Math.random().toString(36).substr(2, 9)}`;
                    events.push({
                        id: eventId,
                        title: `Terremoto M${magnitude.toFixed(1)} - ${location}`,
                        description: `Terremoto de magnitud ${magnitude} localizado en ${location}`,
                        time: new Date().toISOString(), // Usar tiempo actual si no está disponible
                        lat,
                        lng,
                        depth,
                        magnitude,
                        maxIntensity,
                        intensity: maxIntensity,
                        location,
                        region: 'Japón',
                        severity: magnitudeToSeverity(magnitude),
                        radiusKm: calculateEventRadius(magnitude, 'earthquake')
                    });
                }
            }
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error parsing JMA Earthquake HTML:', error);
    }
    return events;
}
// Parser simplificado de HTML JMA para tsunamis
function parseJMATsunamiHTML(htmlText) {
    const events = [];
    try {
        // Buscar información de tsunamis (enfoque simplificado)
        const tsunamiRegex = /(?:tsunami|津波).*?(?:warning|advisory|警報)/gi;
        const tsunamiMatches = htmlText.match(tsunamiRegex);
        if (tsunamiMatches && tsunamiMatches.length > 0) {
            // Si hay tsunamis activos, crear un evento general
            const eventId = `jma-tsunami-${Date.now()}`;
            events.push({
                id: eventId,
                title: 'Alerta de Tsunami - Japón',
                description: 'El JMA ha emitido una alerta de tsunami para la costa de Japón',
                time: new Date().toISOString(),
                lat: 36.0, // Centro aproximado de Japón
                lng: 138.0,
                location: 'Costa de Japón',
                region: 'Japón',
                disasterType: 'tsunami',
                severity: 5, // Tsunamis son siempre críticos
                tsunamiWarning: true,
                radiusKm: 1000
            });
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error parsing JMA Tsunami HTML:', error);
    }
    return events;
}
//# sourceMappingURL=fetchJMA.js.map