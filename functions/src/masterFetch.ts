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
    // Verificar si estamos en desarrollo por variable de entorno o project ID
    const isDevelopment = process.env.NODE_ENV === 'development' ||
                         process.env.FIREBASE_PROJECT_ID?.includes('testing') ||
                         process.env.FIREBASE_PROJECT_ID?.includes('dev');

    return isDevelopment ? 'every 12 hours' : 'every 1 hours';
};

export const fetchAllEvents = onSchedule({
    schedule: getScheduleFrequency(),
    region: 'southamerica-east1',
    timeoutSeconds: 300, // Aumentamos el timeout para dar tiempo a todas las fuentes
    memory: '256MiB',
}, async (): Promise<void> => {
    logger.info('🚀 Iniciando ejecución consolidada de fetchAllEvents');

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
    const frequency = getScheduleFrequency();
    logger.info(`🏁 Ejecución consolidada finalizada en ${duration}s (frecuencia: ${frequency})`);
});
