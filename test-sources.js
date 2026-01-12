#!/usr/bin/env node

/**
 * Script para probar todas las fuentes de datos localmente
 * Ejecutar con: node test-sources.js
 */

const https = require('https');
const http = require('http');

// Función para hacer fetch con timeout
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'World-Monitor-Test/1.0',
        ...options.headers
      }
    })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Fuentes de datos a probar
const sources = [
  {
    name: 'USGS (Terremotos)',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
    description: 'Servicio Geológico de Estados Unidos - Terremotos globales'
  },
  {
    name: 'GDACS (Desastres Globales)',
    url: 'https://www.gdacs.org/xml/rss.xml',
    description: 'Sistema Global de Alerta y Coordinación de Desastres'
  },
  {
    name: 'CSN Chile',
    url: 'https://sismologia.cl/',
    description: 'Centro Sismológico Nacional de Chile'
  },
  {
    name: 'NHC Atlantic',
    url: 'https://www.nhc.noaa.gov/index-at.xml',
    description: 'Centro Nacional de Huracanes - Océano Atlántico'
  },
  {
    name: 'NASA EONET',
    url: 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=5&days=7',
    description: 'NASA Earth Observatory Natural Event Tracker'
  },
  {
    name: 'SSN México',
    url: 'http://www.ssn.unam.mx/rss/ultimos-sismos.xml',
    description: 'Servicio Sismológico Nacional de México - Sismos en México'
  },
  {
    name: 'CENAPRED México',
    url: 'https://www.gob.mx/cenapred',
    description: 'Centro Nacional de Prevención de Desastres - Volcanes en México'
  }
];

async function testSource(source) {
  console.log(`\n🔍 Probando: ${source.name}`);
  console.log(`📝 ${source.description}`);
  console.log(`🔗 ${source.url}`);

  try {
    const startTime = Date.now();
    const response = await fetchWithTimeout(source.url, {}, 15000);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ HTTP ${response.status} (${duration}ms)`);

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      console.log(`📄 Content-Type: ${contentType}`);

      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          console.log(`📊 Eventos encontrados: ${data.events.length}`);
          if (data.events.length > 0) {
            console.log(`📝 Ejemplo: ${data.events[0].title || data.events[0].description || 'Sin título'}`);
          }
        } else if (data.features && Array.isArray(data.features)) {
          console.log(`📊 Features encontrados: ${data.features.length}`);
          if (data.features.length > 0) {
            console.log(`📝 Ejemplo: ${data.features[0].properties?.title || 'Sin título'}`);
          }
        } else if (data) {
          console.log(`📊 Datos recibidos: ${JSON.stringify(data).substring(0, 100)}...`);
        }
      } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
        const text = await response.text();
        console.log(`📄 XML recibido (${text.length} caracteres)`);
        // Buscar elementos RSS
        const itemCount = (text.match(/<item>/g) || []).length;
        const entryCount = (text.match(/<entry>/g) || []).length;
        if (itemCount > 0) console.log(`📊 Items RSS: ${itemCount}`);
        if (entryCount > 0) console.log(`📊 Entries Atom: ${entryCount}`);
      } else {
        const text = await response.text();
        console.log(`📄 Contenido: ${text.substring(0, 200)}...`);
      }
    }

    return { name: source.name, status: 'success', statusCode: response.status, duration };

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { name: source.name, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('🧪 PRUEBA DE FUENTES DE DATOS - SENTINEL WORLD MONITOR');
  console.log('=====================================================');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('');

  const results = [];

  for (const source of sources) {
    const result = await testSource(source);
    results.push(result);
    // Pequeña pausa entre pruebas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 RESUMEN FINAL');
  console.log('================');

  const successful = results.filter(r => r.status === 'success').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`✅ Fuentes funcionando: ${successful}`);
  console.log(`❌ Fuentes con error: ${errors}`);
  console.log(`📊 Total probadas: ${results.length}`);

  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status === 'success' ? `HTTP ${result.statusCode} (${result.duration}ms)` : result.error}`);
  });

  console.log('\n🎯 PRÓXIMO PASO: Agregar fuente de México');
  console.log('======================================');
  console.log('🔍 Buscando APIs sismológicas de México...');
  console.log('   • Servicio Sismológico Nacional (SSN)');
  console.log('   • Centro de Investigación Científica y Educación Superior de Ensenada (CICESE)');
  console.log('   • Universidad Nacional Autónoma de México (UNAM)');

  if (successful === sources.length) {
    console.log('\n🎉 ¡Todas las fuentes actuales funcionan correctamente!');
  } else {
    console.log('\n⚠️ Algunas fuentes tienen problemas que requieren atención.');
  }
}

main().catch(console.error);
