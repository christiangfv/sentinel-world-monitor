import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { processUSGSFetch } from './fetchUSGS';
import { processCSNFetch } from './fetchCSN';
import { processGDACSFetch } from './fetchGDACS';
import { processNHCFetch } from './fetchNHC';

/**
 * Función consolidada que ejecuta todos los fetchers esenciales
 * Frecuencia: Cada 10 minutos para optimizar el uso de la cuota gratuita
 */
export const fetchAllEvents = onSchedule({
    schedule: 'every 10 minutes',
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
        { name: 'NHC', fn: processNHCFetch }
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
    logger.info(`🏁 Ejecución consolidada finalizada en ${duration}s`);
});
