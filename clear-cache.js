#!/usr/bin/env node

/**
 * Script para limpiar cache del navegador y forzar actualización del service worker
 * Ejecutar en la consola del navegador:
 *
 * // Limpiar service workers
 * navigator.serviceWorker.getRegistrations().then(registrations => {
 *   registrations.forEach(registration => registration.unregister());
 * });
 *
 * // Limpiar cache de storage
 * caches.keys().then(names => {
 *   names.forEach(name => caches.delete(name));
 * });
 *
 * // Limpiar localStorage
 * localStorage.clear();
 *
 * // Recargar página
 * window.location.reload(true);
 */

console.log(`
🧹 SCRIPT PARA LIMPIAR CACHE DEL NAVEGADOR - Sentinel World Monitor

Ejecuta estos comandos en la consola del navegador (F12 > Console):

1. 🔄 Desregistrar Service Workers antiguos:
\`\`\`
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    console.log('Desregistrando:', registration.scope);
    registration.unregister();
  });
  console.log('✅ Service Workers desregistrados');
});
\`\`\`

2. 🗑️ Limpiar Cache Storage:
\`\`\`
caches.keys().then(names => {
  names.forEach(name => {
    console.log('Eliminando cache:', name);
    caches.delete(name);
  });
  console.log('✅ Caches limpiados');
});
\`\`\`

3. 🧽 Limpiar Local Storage:
\`\`\`
localStorage.clear();
sessionStorage.clear();
console.log('✅ Storage limpiado');
\`\`\`

4. 🔄 Forzar recarga completa:
\`\`\`
window.location.reload(true);
\`\`\`

Después de ejecutar estos comandos, la aplicación debería cargar sin errores.
Los nuevos service workers se registrarán automáticamente.

📋 ERRORES QUE SOLUCIONA:
- Service Worker con event handlers de push obsoletos
- Firebase config incomplete
- Archivos JavaScript cacheados incorrectamente
- Múltiples registros de service worker

⚠️ NOTA: Esto limpiará todos los datos locales de la aplicación.
`);
