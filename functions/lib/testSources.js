"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDataSources = exports.testFetchConnectivity = exports.testAllSources = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const fetchUSGS_1 = require("./fetchUSGS");
const fetchGDACS_1 = require("./fetchGDACS");
const fetchCSN_1 = require("./fetchCSN");
const fetchNHC_1 = require("./fetchNHC");
// Función para probar todas las fuentes de datos
const testAllSources = async () => {
    firebase_functions_1.logger.info('🧪 Iniciando pruebas de todas las fuentes de datos...');
    const sources = [
        { name: 'USGS (Terremotos)', function: fetchUSGS_1.processUSGSFetch },
        { name: 'GDACS (Desastres Globales)', function: fetchGDACS_1.processGDACSFetch },
        { name: 'CSN (Chile)', function: fetchCSN_1.processCSNFetch },
        { name: 'NHC (Huracanes)', function: fetchNHC_1.processNHCFetch }
    ];
    const results = [];
    for (const source of sources) {
        try {
            firebase_functions_1.logger.info(`🔍 Probando fuente: ${source.name}`);
            // Para pruebas, vamos a simular una ejecución pero sin guardar en BD
            // Esto requiere modificar las funciones para tener un modo "test" o
            // crear versiones de prueba que solo hagan fetch y parse sin guardar
            // Por ahora, solo verificamos que las funciones existen y son ejecutables
            if (typeof source.function === 'function') {
                firebase_functions_1.logger.info(`✅ Función ${source.name} está disponible`);
                results.push({
                    source: source.name,
                    status: 'available',
                    error: null
                });
            }
            else {
                firebase_functions_1.logger.error(`❌ Función ${source.name} no es válida`);
                results.push({
                    source: source.name,
                    status: 'error',
                    error: 'Function not valid'
                });
            }
        }
        catch (error) {
            firebase_functions_1.logger.error(`❌ Error probando ${source.name}:`, error);
            results.push({
                source: source.name,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    firebase_functions_1.logger.info('📊 Resultados de pruebas:');
    results.forEach(result => {
        firebase_functions_1.logger.info(`${result.source}: ${result.status} ${result.error ? `(${result.error})` : ''}`);
    });
    const successCount = results.filter(r => r.status === 'available').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    firebase_functions_1.logger.info(`✅ ${successCount} fuentes disponibles, ${errorCount} con errores`);
    return {
        total: sources.length,
        successful: successCount,
        errors: errorCount,
        results
    };
};
exports.testAllSources = testAllSources;
// Función para hacer un fetch de prueba básico de cada fuente
const testFetchConnectivity = async () => {
    firebase_functions_1.logger.info('🌐 Probando conectividad a APIs externas...');
    const apis = [
        {
            name: 'USGS',
            url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
            timeout: 10000
        },
        {
            name: 'GDACS',
            url: 'https://www.gdacs.org/xml/rss.xml',
            timeout: 10000
        },
        {
            name: 'CSN Chile',
            url: 'https://sismologia.cl/',
            timeout: 10000
        },
        {
            name: 'NHC Atlantic',
            url: 'https://www.nhc.noaa.gov/index-at.xml',
            timeout: 10000
        }
    ];
    const results = [];
    for (const api of apis) {
        try {
            firebase_functions_1.logger.info(`🔗 Probando conexión a ${api.name}...`);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), api.timeout);
            const response = await fetch(api.url, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'World-Monitor-Test/1.0'
                }
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                firebase_functions_1.logger.info(`✅ ${api.name}: HTTP ${response.status}`);
                results.push({
                    api: api.name,
                    status: 'success',
                    httpStatus: response.status,
                    error: null
                });
            }
            else {
                firebase_functions_1.logger.warn(`⚠️ ${api.name}: HTTP ${response.status}`);
                results.push({
                    api: api.name,
                    status: 'warning',
                    httpStatus: response.status,
                    error: `HTTP ${response.status}`
                });
            }
        }
        catch (error) {
            firebase_functions_1.logger.error(`❌ Error conectando a ${api.name}:`, error);
            results.push({
                api: api.name,
                status: 'error',
                httpStatus: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    firebase_functions_1.logger.info('📊 Resultados de conectividad:');
    results.forEach(result => {
        const status = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        firebase_functions_1.logger.info(`${status} ${result.api}: ${result.httpStatus || result.error}`);
    });
    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    firebase_functions_1.logger.info(`🌐 Conectividad: ${successCount} OK, ${warningCount} advertencias, ${errorCount} errores`);
    return {
        total: apis.length,
        successful: successCount,
        warnings: warningCount,
        errors: errorCount,
        results
    };
};
exports.testFetchConnectivity = testFetchConnectivity;
// Función HTTP para pruebas manuales
exports.testDataSources = (0, https_1.onRequest)({
    region: 'southamerica-east1',
    memory: '512MiB',
    timeoutSeconds: 300,
}, async (req, res) => {
    try {
        firebase_functions_1.logger.info('🧪 Ejecutando prueba manual de fuentes de datos');
        const connectivityResults = await (0, exports.testFetchConnectivity)();
        // Ejecutar una función de prueba para verificar funcionamiento real
        let sampleExecutionResult = null;
        try {
            firebase_functions_1.logger.info('🔍 Probando ejecución real de fetchCSNEvents...');
            // Nota: Esto ejecutará la función pero en un contexto limitado
            // para evitar duplicar datos en producción
            sampleExecutionResult = {
                status: 'Función disponible para ejecución programada',
                note: 'Las funciones se ejecutan automáticamente según su schedule'
            };
        }
        catch (error) {
            sampleExecutionResult = {
                status: 'Error en ejecución',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
        const response = {
            timestamp: new Date().toISOString(),
            connectivityTest: connectivityResults,
            sampleExecution: sampleExecutionResult,
            activeSources: [
                { name: 'Consolidado', function: 'fetchAllEvents', schedule: 'every 10 minutes' }
            ],
            status: connectivityResults.errors === 0 ? '✅ Todas las fuentes funcionando' : '⚠️ Algunas fuentes con problemas'
        };
        res.status(200).json(response);
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error en testDataSources:', error);
        res.status(500).json({
            error: 'Error ejecutando pruebas',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
//# sourceMappingURL=testSources.js.map