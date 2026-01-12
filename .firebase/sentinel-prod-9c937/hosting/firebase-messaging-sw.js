// Service Worker Mínimo - Sentinel World Monitor
// Versión ultra-limpia para evitar cualquier error
// Sin Firebase, sin messaging, solo cache básico
// Versión: 2026-01-12 - Build final corregido

const CACHE_NAME = 'sentinel-v3';
const STATIC_CACHE_URLS = ['/', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE_URLS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.map(name => name !== CACHE_NAME ? caches.delete(name) : Promise.resolve())
    ))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
