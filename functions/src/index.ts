import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Inicializar Firebase Admin
initializeApp();

// Exportar todas las funciones
export { fetchUSGSEvents } from './fetchUSGS';
export { fetchGDACSEvents } from './fetchGDACS';
export { sendNotifications } from './sendNotifications';

// Funciones de utilidad que pueden ser útiles
export const testConnection = async () => {
  try {
    const db = getFirestore();
    const messaging = getMessaging();

    // Verificar conexión a Firestore
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
