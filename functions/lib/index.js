"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.testDataSources = exports.fetchAllEvents = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// MESSAGING IMPORT ELIMINADO PARA COSTO 0
// Inicializar Firebase Admin
(0, app_1.initializeApp)();
// Exportar SOLO funciones esenciales optimizadas para costo 0
var masterFetch_1 = require("./masterFetch");
Object.defineProperty(exports, "fetchAllEvents", { enumerable: true, get: function () { return masterFetch_1.fetchAllEvents; } });
var testSources_1 = require("./testSources");
Object.defineProperty(exports, "testDataSources", { enumerable: true, get: function () { return testSources_1.testDataSources; } });
// NOTIFICACIONES ELIMINADAS COMPLETAMENTE PARA COSTO 0
// Funciones de utilidad que pueden ser útiles
const testConnection = async () => {
    try {
        const db = (0, firestore_1.getFirestore)();
        // Verificar conexión a Firestore
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const testDoc = await db.collection('test').doc('connection').get();
        console.log('✅ Firestore connection OK');
        console.log('✅ Messaging disabled for cost optimization');
        return { success: true, message: 'Connections OK (messaging disabled for cost 0)' };
    }
    catch (error) {
        console.error('❌ Connection test failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};
exports.testConnection = testConnection;
// Función de limpieza REMOVIDA por costo - los eventos se mantienen para evitar operaciones
// Función de estadísticas REMOVIDA por costo - usar cliente para cálculos simples
// NOTIFICACIONES ELIMINADAS COMPLETAMENTE PARA ASEGURAR COSTO 0
// La función sendCriticalNotifications ha sido removida para eliminar costos de FCM
// FUNCIONES DE NOTIFICACIÓN ELIMINADAS COMPLETAMENTE
// CONFIGURACIÓN DE DESASTRES ELIMINADA (SOLO SE USABA PARA NOTIFICACIONES)
// DISTANCE BETWEEN IMPORT ELIMINADO (SOLO SE USABA PARA NOTIFICACIONES)
//# sourceMappingURL=index.js.map