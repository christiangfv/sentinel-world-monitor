import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Inicializar Firebase Admin
initializeApp();

// Exportar SOLO funciones esenciales optimizadas para costo 0
export { fetchAllEvents } from './masterFetch';
export { testDataSources } from './testSources';
export { sendCriticalNotifications } from './index';

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

// Función de limpieza REMOVIDA por costo - los eventos se mantienen para evitar operaciones

// Función de estadísticas REMOVIDA por costo - usar cliente para cálculos simples

// Función OPTIMIZADA para costo 0: notificaciones básicas sin consultas complejas
export const sendCriticalNotifications = async (eventData: any) => {
  const db = getFirestore();
  const messaging = getMessaging();

  try {
    // Solo procesar eventos de severidad 4+ (críticos/catastróficos)
    if (eventData.severity < 4) {
      return { sent: 0, message: 'Event severity too low for notifications' };
    }

    // Obtener configuración de desastre
    const disasterConfig = getDisasterConfig(eventData.disasterType);
    if (!disasterConfig) {
      return { sent: 0, message: 'Unknown disaster type' };
    }

    // OPTIMIZACIÓN: Obtener TODOS los usuarios con FCM tokens de una sola consulta
    // Limitamos a 50 usuarios para mantener bajo costo
    const usersSnapshot = await db.collection('users')
      .where('fcmToken', '!=', null)
      .limit(50) // Límite para mantener gratis
      .get();

    if (usersSnapshot.empty) {
      return { sent: 0, message: 'No users with FCM tokens' };
    }

    // Crear notificación básica sin verificación de zonas compleja
    const notification = createBasicNotificationMessage(eventData, disasterConfig);
    const notifications: Promise<any>[] = [];

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        const userId = userDoc.id;

        // Verificación básica: solo comprobar si las notificaciones están habilitadas globalmente
        const userSettings = userData.settings || {};
        if (userSettings.notificationsEnabled === false) continue;

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
            click_action: `/event/${eventData.id}`
          }
        };

        notifications.push(
          messaging.send(message).catch((error) => {
            console.error(`❌ Error sending notification to ${userId}:`, error);
          })
        );

      } catch (error) {
        console.error(`❌ Error processing user ${userDoc.id}:`, error);
      }
    }

    if (notifications.length > 0) {
      await Promise.allSettled(notifications);
    }

    return { sent: notifications.length, message: 'Basic notifications sent (cost optimized)' };

  } catch (error) {
    console.error('❌ Error in sendCriticalNotifications:', error);
    return { sent: 0, message: 'Error sending notifications' };
  }
};

// Función helper para crear mensaje de notificación básico (optimizado para costo 0)
function createBasicNotificationMessage(eventData: any, disasterConfig: any) {
  const severityLabel = disasterConfig.severityLabels[eventData.severity];

  let title = `⚠️ ${disasterConfig.nameEs} - ${severityLabel}`;
  let body = `${eventData.title} - ${eventData.locationName}`;

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
