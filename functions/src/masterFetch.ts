import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { processUSGSFetch } from './fetchUSGS';
import { processCSNFetch } from './fetchCSN';
import { processGDACSFetch } from './fetchGDACS';
import { processNHCFetch } from './fetchNHC';
import { processNASAFetch } from './fetchNASA';
import { processSSNFetch } from './fetchSSN';
import { processCENAPREDFetch } from './fetchCENAPRED';

/**
 * Función consolidada que ejecuta todos los fetchers esenciales
 * Frecuencia configurable por entorno:
 * - Producción: cada 1 hora (alta frecuencia para datos actualizados)
 * - Desarrollo: cada 12 horas (baja frecuencia para testing)
 */
const getScheduleFrequency = (): string => {
    // Usar el project ID para determinar el entorno (más confiable)
    const projectId = process.env.GCP_PROJECT || 'production';
    const isDevelopment = projectId.includes('testing') || projectId.includes('dev');

    logger.info(`🔍 SCHEDULE CONFIG - GCP_PROJECT: ${projectId}, isDevelopment: ${isDevelopment}`);
    const result = isDevelopment ? 'every 12 hours' : 'every 1 hours';

    logger.info(`📊 SCHEDULE RESULT: ${result}`);
    return result;
};

export const fetchAllEvents = onSchedule({
    schedule: getScheduleFrequency(),
    timeoutSeconds: 120,
    memory: '256MiB',
}, async (): Promise<void> => {
    const frequency = getScheduleFrequency();
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         process.env.FIREBASE_PROJECT_ID?.includes('testing') ||
                         process.env.FIREBASE_PROJECT_ID?.includes('dev');
    const projectId = process.env.FIREBASE_PROJECT_ID || 'unknown';

    logger.info(`🚀 Iniciando ejecución consolidada de fetchAllEvents`);
    logger.info(`📊 CONFIGURACIÓN - Proyecto: ${projectId}, Ambiente: ${isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN'}, Frecuencia: ${frequency}`);

    const start = Date.now();
    const tasks = [
        { name: 'USGS', fn: processUSGSFetch },
        { name: 'CSN', fn: processCSNFetch },
        { name: 'GDACS', fn: processGDACSFetch },
        { name: 'NHC', fn: processNHCFetch },
        { name: 'NASA', fn: processNASAFetch },
        { name: 'SSN', fn: processSSNFetch },
        { name: 'CENAPRED', fn: processCENAPREDFetch }
    ];

    for (const task of tasks) {
        try {
            logger.info(`🔍 Ejecutando fetch de ${task.name}...`);
            await task.fn();
            logger.info(`✅ Fetch de ${task.name} completado.`);
        } catch (error) {
            logger.error(`❌ Error en fetch de ${task.name}:`, error);
            // Continuamos con la siguiente tarea aunque falle una
        }
    }

    const duration = (Date.now() - start) / 1000;
    const scheduleFrequency = getScheduleFrequency();
    logger.info(`🏁 Ejecución consolidada finalizada en ${duration}s (frecuencia: ${scheduleFrequency})`);
});
