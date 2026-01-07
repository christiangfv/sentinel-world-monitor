"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemStats = exports.cleanupExpiredEvents = exports.testConnection = exports.sendNotifications = exports.fetchGDACSEvents = exports.fetchUSGSEvents = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const messaging_1 = require("firebase-admin/messaging");
// Inicializar Firebase Admin
(0, app_1.initializeApp)();
// Exportar todas las funciones
var fetchUSGS_1 = require("./fetchUSGS");
Object.defineProperty(exports, "fetchUSGSEvents", { enumerable: true, get: function () { return fetchUSGS_1.fetchUSGSEvents; } });
var fetchGDACS_1 = require("./fetchGDACS");
Object.defineProperty(exports, "fetchGDACSEvents", { enumerable: true, get: function () { return fetchGDACS_1.fetchGDACSEvents; } });
var sendNotifications_1 = require("./sendNotifications");
Object.defineProperty(exports, "sendNotifications", { enumerable: true, get: function () { return sendNotifications_1.sendNotifications; } });
// Funciones de utilidad que pueden ser útiles
const testConnection = async () => {
    try {
        const db = (0, firestore_1.getFirestore)();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const messaging = (0, messaging_1.getMessaging)();
        // Verificar conexión a Firestore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const testDoc = await db.collection('test').doc('connection').get();
        console.log('✅ Firestore connection OK');
        // Verificar configuración de Messaging
        console.log('✅ Firebase Messaging configured');
        return { success: true, message: 'All connections OK' };
    }
    catch (error) {
        console.error('❌ Connection test failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};
exports.testConnection = testConnection;
// Función para limpiar eventos expirados (útil para mantenimiento)
const cleanupExpiredEvents = async () => {
    try {
        const db = (0, firestore_1.getFirestore)();
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
    }
    catch (error) {
        console.error('❌ Error cleaning up expired events:', error);
        throw error instanceof Error ? error : new Error('Unknown error');
    }
};
exports.cleanupExpiredEvents = cleanupExpiredEvents;
// Función para obtener estadísticas del sistema
const getSystemStats = async () => {
    try {
        const db = (0, firestore_1.getFirestore)();
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
    }
    catch (error) {
        console.error('❌ Error getting system stats:', error);
        throw error instanceof Error ? error : new Error('Unknown error');
    }
};
exports.getSystemStats = getSystemStats;
//# sourceMappingURL=index.js.map