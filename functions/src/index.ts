import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Inicializar Firebase Admin
initializeApp();

// Exportar funciones esenciales y consolidadas
export { fetchAllEvents } from './masterFetch';
export { testDataSources } from './testSources';

// Funciones de utilidad que pueden ser útiles
export const testConnection = async () => {
  try {
    const db = getFirestore();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const messaging = getMessaging();

    // Verificar conexión a Firestore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testDoc = await db.collection('test').doc('connection').get();
    console.log('✅ Firestore connection OK');

    // Verificar configuración de Messaging
    console.log('✅ Firebase Messaging configured');

    return { success: true, message: 'All connections OK' };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Función para limpiar eventos expirados (útil para mantenimiento)
export const cleanupExpiredEvents = async () => {
  try {
    const db = getFirestore();
    const now = new Date();

    const expiredEvents = await db.collection('events')
      .where('expiresAt', '<', now)
      .get();

    if (expiredEvents.empty) {
      console.log('ℹ️ No expired events to clean up');
      return { cleaned: 0 };
    }

    const batch = db.batch();
    expiredEvents.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🧹 Cleaned up ${expiredEvents.size} expired events`);

    return { cleaned: expiredEvents.size };
  } catch (error) {
    console.error('❌ Error cleaning up expired events:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
};

// Función para obtener estadísticas del sistema
export const getSystemStats = async () => {
  try {
    const db = getFirestore();

    const [eventsCount, usersCount, notificationsCount] = await Promise.all([
      db.collection('events').count().get(),
      db.collection('users').count().get(),
      db.collection('notifications').count().get()
    ]);

    return {
      events: eventsCount.data().count,
      users: usersCount.data().count,
      notifications: notificationsCount.data().count,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting system stats:', error);
    throw error instanceof Error ? error : new Error('Unknown error');
  }
};

// Función helper para enviar notificaciones (solo para eventos críticos severidad 4+)
export const sendCriticalNotifications = async (eventData: any) => {
  const db = getFirestore();
  const messaging = getMessaging();

  try {
    // Solo procesar eventos de severidad 4+ (críticos/catastróficos)
    if (eventData.severity < 4) {
      return { sent: 0, message: 'Event severity too low for notifications' };
    }

    const eventLocation = eventData.location;

    // Validar coordenadas
    if (!eventLocation || typeof eventLocation.latitude !== 'number' ||
      typeof eventLocation.longitude !== 'number' ||
      isNaN(eventLocation.latitude) || isNaN(eventLocation.longitude)) {
      return { sent: 0, message: 'Invalid event coordinates' };
    }

    // Verificar que esté en región poblada (Sudamérica)
    const { latitude, longitude } = eventLocation;
    if (latitude < -60 || latitude > 20 || longitude < -90 || longitude > -30) {
      return { sent: 0, message: 'Event outside relevant region' };
    }

    // Obtener configuración de desastre
    const disasterConfig = getDisasterConfig(eventData.disasterType);
    if (!disasterConfig) {
      return { sent: 0, message: 'Unknown disaster type' };
    }

    // Verificar que haya usuarios con tokens FCM
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return { sent: 0, message: 'No users with FCM tokens' };
    }

    // Buscar todos los usuarios con tokens
    const allUsersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .get();

    const notifications: Promise<any>[] = [];
    let totalNotifications = 0;

    for (const userDoc of allUsersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Obtener zonas activas del usuario
        const zonesSnapshot = await db.collection(`users/${userId}/zones`)
          .where('isActive', '==', true)
          .get();

        if (zonesSnapshot.empty) continue;

        // Obtener preferencias de alerta
        const alertPrefDoc = await db.doc(`users/${userId}/alertPrefs/${eventData.disasterType}`).get();
        const alertPref = alertPrefDoc.data();

        if (!alertPref?.pushEnabled) continue;
        if (eventData.severity < (alertPref.minSeverity || 1)) continue;

        // Verificar si alguna zona intersecta con el evento
        let shouldNotify = false;
        let closestZone = null;
        let minDistance = Infinity;

        for (const zoneDoc of zonesSnapshot.docs) {
          const zone = zoneDoc.data();
          const distance = distanceBetween(
            [eventLocation.latitude, eventLocation.longitude],
            [zone.location.latitude, zone.location.longitude]
          );

          if (distance <= zone.radiusKm || distance <= (eventData.radiusKm || 100)) {
            shouldNotify = true;
            if (distance < minDistance) {
              minDistance = distance;
              closestZone = zone;
            }
          }
        }

        if (shouldNotify && closestZone) {
          const notification = createNotificationMessage(eventData, closestZone, disasterConfig);

          const message = {
            token: userData.fcmToken,
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: {
              eventId: eventData.id,
              disasterType: eventData.disasterType,
              severity: eventData.severity.toString(),
              zoneId: closestZone.id,
              click_action: `/event/${eventData.id}`
            }
          };

          notifications.push(
            messaging.send(message).then(() => {
              return db.collection('notifications').add({
                userId,
                eventId: eventData.id,
                event: eventData,
                channel: 'push',
                sentAt: new Date(),
                readAt: null,
                zoneId: closestZone.id,
                title: notification.title,
                body: notification.body
              });
            }).catch((error) => {
              console.error(`❌ Error sending notification to ${userId}:`, error);
            })
          );

          totalNotifications++;
        }
      } catch (error) {
        console.error(`❌ Error processing user ${userDoc.id}:`, error);
      }
    }

    if (notifications.length > 0) {
      await Promise.allSettled(notifications);
    }

    return { sent: totalNotifications, message: 'Notifications sent successfully' };

  } catch (error) {
    console.error('❌ Error in sendCriticalNotifications:', error);
    return { sent: 0, message: 'Error sending notifications' };
  }
};

// Función helper para crear mensaje de notificación
function createNotificationMessage(eventData: any, zone: any, disasterConfig: any) {
  const severityLabel = disasterConfig.severityLabels[eventData.severity];
  const distance = Math.round(distanceBetween(
    [eventData.location.latitude, eventData.location.longitude],
    [zone.location.latitude, zone.location.longitude]
  ));

  let title = `⚠️ ${disasterConfig.nameEs} - ${severityLabel}`;
  let body = `${eventData.title}. A ${distance}km de ${zone.name}`;

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

// Función helper para obtener configuración de desastre
function getDisasterConfig(disasterType: string) {
  const configs: Record<string, any> = {
    earthquake: {
      nameEs: 'Sismo',
      severityLabels: { 1: 'Menor', 2: 'Leve', 3: 'Moderado', 4: 'Severo' }
    },
    tsunami: {
      nameEs: 'Tsunami',
      severityLabels: { 1: 'Vigilancia', 2: 'Aviso', 3: 'Alerta', 4: 'Alerta Máxima' }
    },
    volcano: {
      nameEs: 'Volcán',
      severityLabels: { 1: 'Verde', 2: 'Amarillo', 3: 'Naranja', 4: 'Rojo' }
    },
    wildfire: {
      nameEs: 'Incendio',
      severityLabels: { 1: 'Controlado', 2: 'Activo', 3: 'Fuera de Control', 4: 'Catastrófico' }
    },
    flood: {
      nameEs: 'Inundación',
      severityLabels: { 1: 'Menor', 2: 'Moderada', 3: 'Severa', 4: 'Catastrófica' }
    },
    storm: {
      nameEs: 'Tormenta',
      severityLabels: { 1: 'Tropical', 2: 'Categoría 1-2', 3: 'Categoría 3-4', 4: 'Categoría 5' }
    },
    landslide: {
      nameEs: 'Deslizamiento',
      severityLabels: { 1: 'Menor', 2: 'Moderado', 3: 'Severo', 4: 'Catastrófico' }
    }
  };
  return configs[disasterType] || null;
}

// Importar distanceBetween
import { distanceBetween } from 'geofire-common';
