"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllEvents = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
const fetchUSGS_1 = require("./fetchUSGS");
const fetchCSN_1 = require("./fetchCSN");
const fetchGDACS_1 = require("./fetchGDACS");
const fetchNHC_1 = require("./fetchNHC");
const fetchNASA_1 = require("./fetchNASA");
const fetchSSN_1 = require("./fetchSSN");
/**
 * Función consolidada que ejecuta todos los fetchers esenciales
 * Frecuencia: Cada 2 horas para mantener costos en cero (cuota gratuita)
 */
exports.fetchAllEvents = (0, scheduler_1.onSchedule)({
    schedule: 'every 2 hours',
    region: 'southamerica-east1',
    timeoutSeconds: 300, // Aumentamos el timeout para dar tiempo a todas las fuentes
    memory: '256MiB',
}, async () => {
    firebase_functions_1.logger.info('🚀 Iniciando ejecución consolidada de fetchAllEvents');
    const start = Date.now();
    const tasks = [
        { name: 'USGS', fn: fetchUSGS_1.processUSGSFetch },
        { name: 'CSN', fn: fetchCSN_1.processCSNFetch },
        { name: 'GDACS', fn: fetchGDACS_1.processGDACSFetch },
        { name: 'NHC', fn: fetchNHC_1.processNHCFetch },
        { name: 'NASA', fn: fetchNASA_1.processNASAFetch },
        { name: 'SSN', fn: fetchSSN_1.processSSNFetch }
    ];
    for (const task of tasks) {
        try {
            firebase_functions_1.logger.info(`🔍 Ejecutando fetch de ${task.name}...`);
            await task.fn();
            firebase_functions_1.logger.info(`✅ Fetch de ${task.name} completado.`);
        }
        catch (error) {
            firebase_functions_1.logger.error(`❌ Error en fetch de ${task.name}:`, error);
            // Continuamos con la siguiente tarea aunque falle una
        }
    }
    const duration = (Date.now() - start) / 1000;
    firebase_functions_1.logger.info(`🏁 Ejecución consolidada finalizada en ${duration}s`);
});
//# sourceMappingURL=masterFetch.js.map