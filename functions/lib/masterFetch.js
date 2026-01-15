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
const fetchCENAPRED_1 = require("./fetchCENAPRED");
/**
 * Función consolidada que ejecuta todos los fetchers esenciales
 * Frecuencia configurable por entorno:
 * - Producción: cada 1 hora (alta frecuencia para datos actualizados)
 * - Desarrollo: cada 12 horas (baja frecuencia para testing)
 */
const getScheduleFrequency = () => {
    // Usar el project ID para determinar el entorno (más confiable)
    const projectId = process.env.GCP_PROJECT || 'production';
    const isDevelopment = projectId.includes('testing') || projectId.includes('dev');
    firebase_functions_1.logger.info(`🔍 SCHEDULE CONFIG - GCP_PROJECT: ${projectId}, isDevelopment: ${isDevelopment}`);
    const result = isDevelopment ? 'every 12 hours' : 'every 1 hours';
    firebase_functions_1.logger.info(`📊 SCHEDULE RESULT: ${result}`);
    return result;
};
exports.fetchAllEvents = (0, scheduler_1.onSchedule)({
    schedule: getScheduleFrequency(),
    timeoutSeconds: 120,
    memory: '256MiB',
}, async () => {
    var _a, _b;
    const frequency = getScheduleFrequency();
    const isDevelopment = process.env.NODE_ENV === 'development' ||
        ((_a = process.env.FIREBASE_PROJECT_ID) === null || _a === void 0 ? void 0 : _a.includes('testing')) ||
        ((_b = process.env.FIREBASE_PROJECT_ID) === null || _b === void 0 ? void 0 : _b.includes('dev'));
    const projectId = process.env.FIREBASE_PROJECT_ID || 'unknown';
    firebase_functions_1.logger.info(`🚀 Iniciando ejecución consolidada de fetchAllEvents`);
    firebase_functions_1.logger.info(`📊 CONFIGURACIÓN - Proyecto: ${projectId}, Ambiente: ${isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN'}, Frecuencia: ${frequency}`);
    const start = Date.now();
    const tasks = [
        { name: 'USGS', fn: fetchUSGS_1.processUSGSFetch },
        { name: 'CSN', fn: fetchCSN_1.processCSNFetch },
        { name: 'GDACS', fn: fetchGDACS_1.processGDACSFetch },
        { name: 'NHC', fn: fetchNHC_1.processNHCFetch },
        { name: 'NASA', fn: fetchNASA_1.processNASAFetch },
        { name: 'SSN', fn: fetchSSN_1.processSSNFetch },
        { name: 'CENAPRED', fn: fetchCENAPRED_1.processCENAPREDFetch }
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
    const scheduleFrequency = getScheduleFrequency();
    firebase_functions_1.logger.info(`🏁 Ejecución consolidada finalizada en ${duration}s (frecuencia: ${scheduleFrequency})`);
});
//# sourceMappingURL=masterFetch.js.map