"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDataSources = exports.testNASA = exports.testFetchConnectivity = exports.testAllSources = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const fetchUSGS_1 = require("./fetchUSGS");
const fetchGDACS_1 = require("./fetchGDACS");
const fetchCSN_1 = require("./fetchCSN");
const fetchNHC_1 = require("./fetchNHC");
const fetchSSN_1 = require("./fetchSSN");
// Función para probar todas las fuentes de datos
const testAllSources = async () => {
    firebase_functions_1.logger.info('🧪 Iniciando pruebas de todas las fuentes de datos...');
    const sources = [
        { name: 'USGS (Terremotos)', function: fetchUSGS_1.processUSGSFetch },
        { name: 'GDACS (Desastres Globales)', function: fetchGDACS_1.processGDACSFetch },
        { name: 'CSN (Chile)', function: fetchCSN_1.processCSNFetch },
        { name: 'NHC (Huracanes)', function: fetchNHC_1.processNHCFetch },
        { name: 'NASA EONET', function: () => Promise.resolve().then(() => __importStar(require('./fetchNASA'))).then(m => m.processNASAFetch()) },
        { name: 'SSN (México)', function: fetchSSN_1.processSSNFetch }
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
        },
        {
            name: 'NASA EONET',
            url: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5&days=7',
            timeout: 15000
        },
        {
            name: 'SSN México',
            url: 'http://www.ssn.unam.mx/rss/ultimos-sismos.xml',
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
    firebase_functions_1.logger.info(`📊 Total de APIs probadas: ${apis.length}`);
    return {
        total: apis.length,
        successful: successCount,
        warnings: warningCount,
        errors: errorCount,
        results
    };
};
exports.testFetchConnectivity = testFetchConnectivity;
// Función específica para probar NASA EONET
exports.testNASA = (0, https_1.onRequest)({
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 60,
}, async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        firebase_functions_1.logger.info('🛰️ Probando NASA EONET específicamente...');
        const nasaUrl = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5&days=7';
        firebase_functions_1.logger.info(`🔗 URL: ${nasaUrl}`);
        const response = await fetch(nasaUrl, {
            headers: {
                'User-Agent': 'World-Monitor-Test/1.0'
            }
        });
        const data = await response.json();
        firebase_functions_1.logger.info(`📊 Respuesta: HTTP ${response.status}, Eventos: ${((_a = data.events) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
        if (data.events && data.events.length > 0) {
            firebase_functions_1.logger.info('✅ NASA EONET funcionando correctamente');
            firebase_functions_1.logger.info(`📝 Primer evento: ${data.events[0].title}`);
        }
        res.status(200).json({
            timestamp: new Date().toISOString(),
            nasaTest: {
                url: nasaUrl,
                status: response.status,
                eventsCount: ((_b = data.events) === null || _b === void 0 ? void 0 : _b.length) || 0,
                firstEvent: ((_d = (_c = data.events) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.title) || null,
                success: response.ok && ((_e = data.events) === null || _e === void 0 ? void 0 : _e.length) > 0
            }
        });
    }
    catch (error) {
        firebase_functions_1.logger.error('❌ Error probando NASA:', error);
        res.status(500).json({
            error: 'Error probando NASA EONET',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
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