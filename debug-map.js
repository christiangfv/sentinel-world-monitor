#!/usr/bin/env node

/**
 * Script de diagnóstico para problemas de mapas en producción
 * Ejecutar con: node debug-map.js
 */

const https = require('https');

async function testTileProvider(url, name) {
  return new Promise((resolve) => {
    console.log(`🔍 Probando ${name}...`);

    const req = https.request(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SentinelMonitor/1.0)',
        'Accept': 'image/*',
        'Referer': 'https://sentinel-prod-9c937.web.app'
      },
      timeout: 5000
    }, (res) => {
      const status = res.statusCode;
      const headers = res.headers;

      console.log(`   Status: ${status}`);
      console.log(`   Content-Type: ${headers['content-type'] || 'N/A'}`);
      console.log(`   CORS: ${headers['access-control-allow-origin'] || 'No especificado'}`);

      if (status === 200) {
        console.log(`   ✅ ${name} funciona`);
      } else {
        console.log(`   ❌ ${name} falló (${status})`);
      }

      resolve({ name, status, headers });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error de red: ${err.message}`);
      resolve({ name, status: 'ERROR', error: err.message });
    });

    req.on('timeout', () => {
      console.log(`   ⏰ Timeout (${name})`);
      req.destroy();
      resolve({ name, status: 'TIMEOUT' });
    });

    req.end();
  });
}

async function main() {
  console.log('🗺️ DIAGNÓSTICO DE MAPAS - SENTINEL WORLD MONITOR');
  console.log('===============================================');
  console.log('');

  // Tiles de CARTO (los que están fallando)
  const cartoLight = 'https://a.basemaps.cartocdn.com/light_all/10/512/341.png';
  const cartoDark = 'https://a.basemaps.cartocdn.com/dark_all/10/512/341.png';

  // Tiles alternativos
  const osmTile = 'https://a.tile.openstreetmap.org/10/512/341.png';
  const stadiaTile = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/10/512/341.png';

  console.log('🌐 PROBANDO PROVEEDORES DE TILES:');
  console.log('');

  const results = await Promise.all([
    testTileProvider(cartoLight, 'CARTO Light'),
    testTileProvider(cartoDark, 'CARTO Dark'),
    testTileProvider(osmTile, 'OpenStreetMap'),
    testTileProvider(stadiaTile, 'Stadia Maps (Dark)')
  ]);

  console.log('');
  console.log('📊 RESULTADOS:');
  console.log('==============');

  const working = results.filter(r => r.status === 200);
  const failing = results.filter(r => r.status !== 200);

  console.log(`✅ Proveedores funcionando: ${working.length}`);
  console.log(`❌ Proveedores fallando: ${failing.length}`);

  console.log('');
  console.log('🔧 RECOMENDACIONES:');
  console.log('===================');

  if (failing.some(r => r.name.includes('CARTO'))) {
    console.log('• CARTO tiles están fallando - implementar fallback automático');
    console.log('• Agregar timeout de 10 segundos para detectar fallos');
    console.log('• Usar OpenStreetMap como fallback');
  }

  if (working.some(r => r.name.includes('OpenStreetMap'))) {
    console.log('• OpenStreetMap funciona - usar como fallback primario');
  }

  if (working.some(r => r.name.includes('Stadia'))) {
    console.log('• Stadia Maps funciona - usar para tema oscuro');
  }

  console.log('');
  console.log('🚀 PRÓXIMOS PASOS:');
  console.log('==================');
  console.log('1. Implementar fallback automático en DisasterMap.tsx');
  console.log('2. Agregar indicadores visuales de estado del mapa');
  console.log('3. Configurar timeout y manejo de errores');
  console.log('4. Probar en producción después del deploy');

  console.log('');
  console.log('📝 NOTAS PARA PRODUCCIÓN:');
  console.log('=========================');
  console.log('• Verificar que las URLs de tiles no estén bloqueadas por firewall');
  console.log('• Considerar usar Mapbox si CARTO sigue fallando');
  console.log('• Agregar logging del lado cliente para debugging');
}

main().catch(console.error);
