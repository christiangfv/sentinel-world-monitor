import { onRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { processUSGSFetch } from './fetchUSGS';
import { processGDACSFetch } from './fetchGDACS';
import { processCSNFetch } from './fetchCSN';
import { processNHCFetch } from './fetchNHC';
import { processSSNFetch } from './fetchSSN';
import { processCENAPREDFetch } from './fetchCENAPRED';

const getScheduleFrequency = (): string => {
    // Usar el project ID para determinar el entorno (más confiable)
    const projectId = process.env.GCP_PROJECT || 'production';
    const isDevelopment = projectId.includes('testing') || projectId.includes('dev');

    logger.info(`🔍 SCHEDULE CONFIG - GCP_PROJECT: ${projectId}, isDevelopment: ${isDevelopment}`);
    const result = isDevelopment ? 'every 12 hours' : 'every 1 hours';

    logger.info(`📊 SCHEDULE RESULT: ${result}`);
    return result;
};

// Función para probar todas las fuentes de datos
export const testAllSources = async () => {
  logger.info('🧪 Iniciando pruebas de todas las fuentes de datos (modo dryRun)...');

  const sources = [
    { name: 'USGS (Terremotos)', function: () => processUSGSFetch({ dryRun: true }) },
    { name: 'GDACS (Desastres Globales)', function: () => processGDACSFetch({ dryRun: true }) },
    { name: 'CSN (Chile)', function: () => processCSNFetch({ dryRun: true }) },
    { name: 'NHC (Huracanes)', function: () => processNHCFetch({ dryRun: true }) },
    { name: 'NASA EONET', function: () => import('./fetchNASA').then(m => m.processNASAFetch({ dryRun: true })) },
    { name: 'SSN (México)', function: () => processSSNFetch({ dryRun: true }) },
    { name: 'CENAPRED (México)', function: () => processCENAPREDFetch({ dryRun: true }) }
  ];

  const results = [];

  for (const source of sources) {
    try {
      logger.info(`🔍 Probando fuente: ${source.name}`);

      const summary = await source.function();
      const hasSummary = summary && typeof summary === 'object' && 'dryRun' in summary;

      results.push({
        source: source.name,
        status: 'success',
        summary: hasSummary ? summary : null,
        error: null
      });

      if (hasSummary) {
        logger.info(`✅ ${source.name}: ${summary.processed} procesados, ${summary.skipped} omitidos`);
      } else {
        logger.info(`✅ ${source.name}: ejecutado`);
      }

    } catch (error) {
      logger.error(`❌ Error probando ${source.name}:`, error);
      results.push({
        source: source.name,
        status: 'error',
        summary: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  logger.info('📊 Resultados de pruebas:');
  results.forEach(result => {
    logger.info(`${result.source}: ${result.status} ${result.error ? `(${result.error})` : ''}`);
  });

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  logger.info(`✅ ${successCount} fuentes OK, ${errorCount} con errores`);

  return {
    total: sources.length,
    successful: successCount,
    errors: errorCount,
    results
  };
};

// Función para hacer un fetch de prueba básico de cada fuente
export const testFetchConnectivity = async () => {
  logger.info('🌐 Probando conectividad a APIs externas...');

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
    },
    {
      name: 'CENAPRED México',
      url: 'https://www.gob.mx/cenapred',
      timeout: 15000
    }
  ];

  const results = [];

  for (const api of apis) {
    try {
      logger.info(`🔗 Probando conexión a ${api.name}...`);

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
        logger.info(`✅ ${api.name}: HTTP ${response.status}`);
        results.push({
          api: api.name,
          status: 'success',
          httpStatus: response.status,
          error: null
        });
      } else {
        logger.warn(`⚠️ ${api.name}: HTTP ${response.status}`);
        results.push({
          api: api.name,
          status: 'warning',
          httpStatus: response.status,
          error: `HTTP ${response.status}`
        });
      }

    } catch (error) {
      logger.error(`❌ Error conectando a ${api.name}:`, error);
      results.push({
        api: api.name,
        status: 'error',
        httpStatus: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  logger.info('📊 Resultados de conectividad:');
  results.forEach(result => {
    const status = result.status === 'success' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    logger.info(`${status} ${result.api}: ${result.httpStatus || result.error}`);
  });

  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  logger.info(`🌐 Conectividad: ${successCount} OK, ${warningCount} advertencias, ${errorCount} errores`);
  logger.info(`📊 Total de APIs probadas: ${apis.length}`);

  return {
    total: apis.length,
    successful: successCount,
    warnings: warningCount,
    errors: errorCount,
    results
  };
};

// Función específica para probar NASA EONET
export const testNASA = onRequest({
  region: 'southamerica-east1',
  memory: '256MiB',
  timeoutSeconds: 60,
}, async (req, res) => {
  try {
    logger.info('🛰️ Probando NASA EONET específicamente...');

    const nasaUrl = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5&days=7';
    logger.info(`🔗 URL: ${nasaUrl}`);

    const response = await fetch(nasaUrl, {
      headers: {
        'User-Agent': 'World-Monitor-Test/1.0'
      }
    });

    const data = await response.json();
    logger.info(`📊 Respuesta: HTTP ${response.status}, Eventos: ${data.events?.length || 0}`);

    if (data.events && data.events.length > 0) {
      logger.info('✅ NASA EONET funcionando correctamente');
      logger.info(`📝 Primer evento: ${data.events[0].title}`);
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      nasaTest: {
        url: nasaUrl,
        status: response.status,
        eventsCount: data.events?.length || 0,
        firstEvent: data.events?.[0]?.title || null,
        success: response.ok && data.events?.length > 0
      }
    });

  } catch (error) {
    logger.error('❌ Error probando NASA:', error);
    res.status(500).json({
      error: 'Error probando NASA EONET',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Función HTTP para pruebas manuales
export const testDataSources = onRequest({
  region: 'southamerica-east1',
  memory: '512MiB',
  timeoutSeconds: 300,
}, async (req, res) => {
  try {
    logger.info('🧪 Ejecutando prueba manual de fuentes de datos - INICIO');

    const connectivityResults = await testFetchConnectivity();
    const captureResults = await testAllSources();

    const schedule = getScheduleFrequency();

    const response = {
      timestamp: new Date().toISOString(),
      connectivityTest: connectivityResults,
      captureTest: captureResults,
      activeSources: [
        { name: 'Consolidado', function: 'fetchAllEvents', schedule: schedule }
      ],
      status: connectivityResults.errors === 0 && captureResults.errors === 0
        ? '✅ Todas las fuentes funcionando'
        : '⚠️ Algunas fuentes con problemas'
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('❌ Error en testDataSources:', error);
    res.status(500).json({
      error: 'Error ejecutando pruebas',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
