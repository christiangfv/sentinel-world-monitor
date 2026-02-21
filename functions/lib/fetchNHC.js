"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processNHCFetch = processNHCFetch;
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
const geofire_common_1 = require("geofire-common");
// NOTIFICACIONES ELIMINADAS PARA COSTO 0
const db = (0, firestore_1.getFirestore)();
// Mapeo de categorías de huracanes a severidad
function hurricaneCategoryToSeverity(category) {
    if (category.includes('Tropical Depression') || category.includes('Low'))
        return 1;
    if (category.includes('Tropical Storm') || category.includes('Moderate'))
        return 2;
    if (category.includes('Category 1') || category.includes('Category 2'))
        return 3;
    if (category.includes('Category 3') || category.includes('Category 4'))
        return 4;
    if (category.includes('Category 5') || category.includes('Major'))
        return 5;
    return 2; // Default para tormentas tropicales
}
// Función para extraer coordenadas de texto
function extractCoordinates(text) {
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
function extractWindSpeed(text) {
    const windMatch = text.match(/(\d+)\s*(?:mph|km\/h|kts?|knots?)/i);
    return windMatch ? parseInt(windMatch[1]) : null;
}
// Cron job: Fetch NHC cada 30 minutos
// Función principal para procesar el fetch (exportada para consolidación)
async function processNHCFetch(options = {}) {
    const dryRun = options.dryRun === true;
    firebase_functions_1.logger.info('🚀 Iniciando fetch de eventos del NHC');
    if (dryRun) {
        firebase_functions_1.logger.info('🧪 Modo dryRun activo (sin escrituras en Firestore)');
    }
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
        let pacificEvents = [];
        try {
            const pacificResponse = await fetch('https://www.nhc.noaa.gov/index-ep.xml');
            if (pacificResponse.ok) {
                const pacificXmlText = await pacificResponse.text();
                pacificEvents = parseNHCXML(pacificXmlText, 'Pacific');
            }
        }
        catch (error) {
            firebase_functions_1.logger.warn('No se pudieron obtener eventos del Pacífico:', error);
        }
        const allEvents = [...atlanticEvents, ...pacificEvents];
        firebase_functions_1.logger.info(`📊 Recibidos ${allEvents.length} eventos del NHC (${atlanticEvents.length} Atlántico, ${pacificEvents.length} Pacífico)`);
        // OPTIMIZACIÓN: Obtener IDs existentes de una vez para evitar lecturas en el loop
        const existingIds = new Set();
        if (!dryRun) {
            try {
                const existingDocs = await db.collection('events')
                    .where('source', '==', 'nhc')
                    .orderBy('eventTime', 'desc')
                    .limit(500)
                    .get();
                existingDocs.forEach(doc => {
                    const extId = doc.data().externalId;
                    if (extId)
                        existingIds.add(extId);
                });
                firebase_functions_1.logger.info(`🔍 Cargados ${existingIds.size} IDs existentes para verificación`);
            }
            catch (error) {
                firebase_functions_1.logger.error('❌ Error cargando IDs existentes:', error);
                // Continuamos aunque falle la carga masiva (menos eficiente pero seguro)
            }
        }
        const batch = dryRun ? null : db.batch();
        let processedCount = 0;
        let skippedCount = 0;
        // NOTIFICACIONES ELIMINADAS COMPLETAMENTE PARA COSTO 0
        for (const event of allEvents) {
            try {
                if (!dryRun) {
                    // Verificar si el evento ya existe usando el Set optimizado
                    if (existingIds.has(event.guid)) {
                        skippedCount++;
                        continue;
                    }
                    // Fallback: Si el Set está vacío (por error en carga masiva), verificar individualmente
                    if (existingIds.size === 0) {
                        const checkDoc = await db.collection('events')
                            .where('source', '==', 'nhc')
                            .where('externalId', '==', event.guid)
                            .limit(1)
                            .get();
                        if (!checkDoc.empty) {
                            skippedCount++;
                            continue;
                        }
                    }
                }
                // Extraer coordenadas si están disponibles
                const coords = extractCoordinates(event.description);
                const lat = coords ? coords.lat : 25.0; // Centro del Caribe/Atlántico
                const lng = coords ? coords.lng : -70.0;
                const geohash = (0, geofire_common_1.geohashForLocation)([lat, lng]);
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
                    eventTime: firestore_1.Timestamp.fromDate(new Date(event.pubDate)),
                    expiresAt: firestore_1.Timestamp.fromMillis(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días para huracanes
                    createdAt: firestore_1.Timestamp.now(),
                    updatedAt: firestore_1.Timestamp.now()
                };
                if (!dryRun && batch) {
                    batch.set(eventRef, eventData);
                }
                processedCount++;
                firebase_functions_1.logger.info(`✅ Procesado evento NHC: ${event.guid} - ${event.title}`);
            }
            catch (error) {
                firebase_functions_1.logger.error(`❌ Error procesando evento NHC ${event.guid}:`, error);
                continue;
            }
        }
        // Ejecutar batch
        if (!dryRun && processedCount > 0 && batch) {
            await batch.commit();
            firebase_functions_1.logger.info(`💾 Guardados ${processedCount} nuevos eventos en Firestore`);
        }
        firebase_functions_1.logger.info(`📈 Resumen: ${processedCount} procesados, ${skippedCount} omitidos`);
        firebase_functions_1.logger.info('✅ Fetch NHC completado exitosamente');
        if (dryRun) {
            return {
                dryRun: true,
                total: allEvents.length,
                processed: processedCount,
                skipped: skippedCount
            };
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en processNHCFetch:', error);
        throw error;
    }
}
// Parser simplificado de XML NHC
function parseNHCXML(xmlText, ocean) {
    const events = [];
    try {
        const items = xmlText.split('<item>').slice(1);
        for (const item of items) {
            const endIndex = item.indexOf('</item>');
            if (endIndex === -1)
                continue;
            const itemContent = item.substring(0, endIndex);
            const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
            const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
            const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
            const guidMatch = itemContent.match(/<guid>(.*?)<\/guid>/);
            const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/);
            const title = (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) || '';
            const description = (descriptionMatch === null || descriptionMatch === void 0 ? void 0 : descriptionMatch[1]) || '';
            const link = (linkMatch === null || linkMatch === void 0 ? void 0 : linkMatch[1]) || '';
            const guid = (guidMatch === null || guidMatch === void 0 ? void 0 : guidMatch[1]) || '';
            const pubDate = (pubDateMatch === null || pubDateMatch === void 0 ? void 0 : pubDateMatch[1]) || '';
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
    }
    catch (error) {
        firebase_functions_1.logger.error(`Error parsing NHC ${ocean} XML:`, error);
    }
    return events;
}
//# sourceMappingURL=fetchNHC.js.map