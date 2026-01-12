import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// MESSAGING IMPORT ELIMINADO PARA COSTO 0

// Inicializar Firebase Admin
initializeApp();

// Exportar SOLO funciones esenciales optimizadas para costo 0
export { fetchAllEvents } from './masterFetch';
export { testDataSources } from './testSources';
// NOTIFICACIONES ELIMINADAS COMPLETAMENTE PARA COSTO 0

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

// NOTIFICACIONES ELIMINADAS COMPLETAMENTE PARA ASEGURAR COSTO 0
// La función sendCriticalNotifications ha sido removida para eliminar costos de FCM

// FUNCIONES DE NOTIFICACIÓN ELIMINADAS COMPLETAMENTE

// CONFIGURACIÓN DE DESASTRES ELIMINADA (SOLO SE USABA PARA NOTIFICACIONES)

// DISTANCE BETWEEN IMPORT ELIMINADO (SOLO SE USABA PARA NOTIFICACIONES)
