"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFetchConnectivity = exports.testAllSources = void 0;
const firebase_functions_1 = require("firebase-functions");
const fetchUSGS_1 = require("./fetchUSGS");
const fetchGDACS_1 = require("./fetchGDACS");
const fetchCSN_1 = require("./fetchCSN");
const fetchEMSC_1 = require("./fetchEMSC");
const fetchBOM_1 = require("./fetchBOM");
const fetchNHC_1 = require("./fetchNHC");
const fetchJMA_1 = require("./fetchJMA");
// Función para probar todas las fuentes de datos
const testAllSources = async () => {
    firebase_functions_1.logger.info('🧪 Iniciando pruebas de todas las fuentes de datos...');
    const sources = [
        { name: 'USGS (Terremotos)', function: fetchUSGS_1.fetchUSGSEvents },
        { name: 'GDACS (Desastres Globales)', function: fetchGDACS_1.fetchGDACSEvents },
        { name: 'CSN (Chile)', function: fetchCSN_1.fetchCSNEvents },
        { name: 'EMSC (Europa)', function: fetchEMSC_1.fetchEMSCvents },
        { name: 'BOM (Australia)', function: fetchBOM_1.fetchBOMEvents },
        { name: 'NHC (Huracanes)', function: fetchNHC_1.fetchNHCEvents },
        { name: 'JMA (Japón)', function: fetchJMA_1.fetchJMAEvents }
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
            url: 'https://api.csn.uchile.cl/api/v1/last_events',
            timeout: 10000
        },
        {
            name: 'EMSC',
            url: 'https://www.emsc-csem.org/service/rss/rss.php?typ=emsc',
            timeout: 10000
        },
        {
            name: 'BOM Australia',
            url: 'https://www.bom.gov.au/fwo/IDY00000.xml',
            timeout: 10000
        },
        {
            name: 'NHC Atlantic',
            url: 'https://www.nhc.noaa.gov/index-at.xml',
            timeout: 10000
        },
        {
            name: 'JMA Japan',
            url: 'https://www.jma.go.jp/en/quake/quakee_index.html',
            timeout: 15000
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
//# sourceMappingURL=testSources.js.map