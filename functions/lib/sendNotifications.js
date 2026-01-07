"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotifications = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const firebase_functions_1 = require("firebase-functions");
const firestore_2 = require("firebase-admin/firestore");
const messaging_1 = require("firebase-admin/messaging");
const geofire_common_1 = require("geofire-common");
const db = (0, firestore_2.getFirestore)();
const messaging = (0, messaging_1.getMessaging)();
// Trigger: Enviar notificaciones cuando se crea un evento
exports.sendNotifications = (0, firestore_1.onDocumentCreated)({
    document: 'events/{eventId}',
    region: 'southamerica-east1',
    timeoutSeconds: 60,
    memory: '256MiB',
}, async (event) => {
    var _a;
    const eventData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!eventData) {
        firebase_functions_1.logger.error('No event data received');
        return;
    }
    const eventId = event.params.eventId;
    firebase_functions_1.logger.info(`🔔 Procesando notificaciones para evento: ${eventId}`);
    try {
        const eventLocation = eventData.location;
        const eventRadiusKm = eventData.radiusKm || 100;
        // Obtener configuración de desastres
        const disasterConfig = getDisasterConfig(eventData.disasterType);
        if (!disasterConfig) {
            firebase_functions_1.logger.warn(`Configuración no encontrada para tipo de desastre: ${eventData.disasterType}`);
            return;
        }
        // Buscar usuarios con zonas activas que intersecten con el evento
        const usersSnapshot = await db.collection('users')
            .where('fcmToken', '!=', null)
            .get();
        firebase_functions_1.logger.info(`👥 Encontrados ${usersSnapshot.size} usuarios con tokens FCM`);
        const notifications = [];
        let totalNotifications = 0;
        for (const userDoc of usersSnapshot.docs) {
            try {
                const userData = userDoc.data();
                const userId = userDoc.id;
                // Obtener zonas activas del usuario
                const zonesSnapshot = await db.collection(`users/${userId}/zones`)
                    .where('isActive', '==', true)
                    .get();
                if (zonesSnapshot.empty) {
                    continue; // Usuario sin zonas activas
                }
                // Obtener preferencias de alerta para este tipo de desastre
                const alertPrefDoc = await db.doc(`users/${userId}/alertPrefs/${eventData.disasterType}`).get();
                const alertPref = alertPrefDoc.data();
                // Verificar si el usuario quiere notificaciones para este tipo
                if (!(alertPref === null || alertPref === void 0 ? void 0 : alertPref.pushEnabled)) {
                    continue; // Usuario no quiere notificaciones para este tipo
                }
                // Verificar si la severidad del evento cumple con la mínima configurada
                if (eventData.severity < (alertPref.minSeverity || 1)) {
                    continue; // Severidad insuficiente
                }
                // Verificar si alguna zona del usuario está dentro del radio del evento
                let shouldNotify = false;
                let closestZone = null;
                let minDistance = Infinity;
                for (const zoneDoc of zonesSnapshot.docs) {
                    const zone = zoneDoc.data();
                    // Calcular distancia entre el evento y el centro de la zona
                    const distance = (0, geofire_common_1.distanceBetween)([eventLocation.latitude, eventLocation.longitude], [zone.location.latitude, zone.location.longitude]); // Retorna distancia en km
                    // Verificar si el evento está dentro del radio de la zona
                    // O si la zona está dentro del radio del evento
                    if (distance <= zone.radiusKm || distance <= eventRadiusKm) {
                        shouldNotify = true;
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestZone = zone;
                        }
                    }
                }
                if (shouldNotify && closestZone) {
                    // Crear mensaje de notificación
                    const notification = createNotificationMessage(eventData, closestZone, disasterConfig);
                    // Enviar notificación
                    const message = {
                        token: userData.fcmToken,
                        notification: {
                            title: notification.title,
                            body: notification.body,
                        },
                        data: {
                            eventId: eventId,
                            disasterType: eventData.disasterType,
                            severity: eventData.severity.toString(),
                            zoneId: closestZone.id,
                            click_action: `/event/${eventId}`
                        },
                        webpush: {
                            fcmOptions: {
                                link: `/event/${eventId}`
                            },
                            notification: {
                                icon: '/icons/icon-192.png',
                                badge: '/icons/badge-72.png',
                                vibrate: [200, 100, 200, 200, 100, 200],
                                requireInteraction: true,
                                actions: [
                                    {
                                        action: 'view',
                                        title: 'Ver Detalles'
                                    },
                                    {
                                        action: 'dismiss',
                                        title: 'Cerrar'
                                    }
                                ]
                            }
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                sound: 'default',
                                channelId: 'disaster-alerts',
                                priority: 'high',
                                defaultVibrateTimings: true,
                                defaultSound: true
                            }
                        },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'default',
                                    badge: 1,
                                    alert: {
                                        title: notification.title,
                                        body: notification.body
                                    }
                                }
                            }
                        }
                    };
                    notifications.push(messaging.send(message).then((response) => {
                        firebase_functions_1.logger.info(`✅ Notificación enviada a ${userId}: ${response}`);
                        // Registrar la notificación en la base de datos
                        return db.collection('notifications').add({
                            userId,
                            eventId,
                            event: eventData, // Incluir datos del evento para referencia
                            channel: 'push',
                            sentAt: new Date(),
                            readAt: null,
                            zoneId: closestZone.id,
                            title: notification.title,
                            body: notification.body
                        });
                    }).catch((error) => {
                        firebase_functions_1.logger.error(`❌ Error enviando notificación a ${userId}:`, error);
                        // No relanzar error para no detener otras notificaciones
                    }));
                    totalNotifications++;
                }
            }
            catch (error) {
                firebase_functions_1.logger.error(`❌ Error procesando usuario ${userDoc.id}:`, error);
                continue;
            }
        }
        // Esperar a que se envíen todas las notificaciones
        if (notifications.length > 0) {
            await Promise.allSettled(notifications);
            firebase_functions_1.logger.info(`📤 Enviadas ${totalNotifications} notificaciones para evento ${eventId}`);
        }
        else {
            firebase_functions_1.logger.info(`ℹ️ No se enviaron notificaciones para evento ${eventId}`);
        }
        firebase_functions_1.logger.info('✅ Envío de notificaciones completado');
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en sendNotifications:', error);
        throw error;
    }
});
// Función para crear el mensaje de notificación
function createNotificationMessage(eventData, zone, disasterConfig) {
    const severityLabel = disasterConfig.severityLabels[eventData.severity];
    const distance = Math.round(calculateDistance(eventData.location.latitude, eventData.location.longitude, zone.location.latitude, zone.location.longitude));
    let title = `⚠️ ${disasterConfig.nameEs} - ${severityLabel}`;
    let body = `${eventData.title}. A ${distance}km de ${zone.name}`;
    // Personalizar mensaje según el tipo de desastre
    switch (eventData.disasterType) {
        case 'earthquake':
            if (eventData.magnitude) {
                title = `🌍 Sismo M${eventData.magnitude.toFixed(1)} - ${severityLabel}`;
            }
            break;
        case 'tsunami':
            title = `🌊 Alerta de Tsunami - ${severityLabel}`;
            break;
        case 'volcano':
            title = `🌋 Actividad Volcánica - ${severityLabel}`;
            break;
        case 'wildfire':
            title = `🔥 Incendio Forestal - ${severityLabel}`;
            break;
        case 'flood':
            title = `💧 Inundación - ${severityLabel}`;
            break;
        case 'storm':
            title = `🌀 Tormenta - ${severityLabel}`;
            break;
    }
    return { title, body };
}
// Función helper para calcular distancia
function calculateDistance(lat1, lng1, lat2, lng2) {
    return (0, geofire_common_1.distanceBetween)([lat1, lng1], [lat2, lng2]);
}
// Función para obtener configuración de desastre
function getDisasterConfig(disasterType) {
    const configs = {
        earthquake: {
            nameEs: 'Sismo',
            severityLabels: {
                1: 'Menor',
                2: 'Leve',
                3: 'Moderado',
                4: 'Severo'
            }
        },
        tsunami: {
            nameEs: 'Tsunami',
            severityLabels: {
                1: 'Vigilancia',
                2: 'Aviso',
                3: 'Alerta',
                4: 'Alerta Máxima'
            }
        },
        volcano: {
            nameEs: 'Volcán',
            severityLabels: {
                1: 'Verde',
                2: 'Amarillo',
                3: 'Naranja',
                4: 'Rojo'
            }
        },
        wildfire: {
            nameEs: 'Incendio',
            severityLabels: {
                1: 'Controlado',
                2: 'Activo',
                3: 'Fuera de Control',
                4: 'Catastrófico'
            }
        },
        flood: {
            nameEs: 'Inundación',
            severityLabels: {
                1: 'Menor',
                2: 'Moderada',
                3: 'Severa',
                4: 'Catastrófica'
            }
        },
        storm: {
            nameEs: 'Tormenta',
            severityLabels: {
                1: 'Tropical',
                2: 'Categoría 1-2',
                3: 'Categoría 3-4',
                4: 'Categoría 5'
            }
        },
        landslide: {
            nameEs: 'Deslizamiento',
            severityLabels: {
                1: 'Menor',
                2: 'Moderado',
                3: 'Severo',
                4: 'Catastrófico'
            }
        }
    };
    return configs[disasterType] || null;
}
//# sourceMappingURL=sendNotifications.js.map