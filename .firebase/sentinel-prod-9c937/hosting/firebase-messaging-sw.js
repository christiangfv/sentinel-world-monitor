// Service Worker Simplificado - Solo Cache Offline
// Notificaciones push eliminadas para costo 0

// No se necesita Firebase ni configuración dinámica

// Cache para recursos offline
const CACHE_NAME = 'sentinel-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/badge-72.svg',
  '/offline.html'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalándose');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto, agregando recursos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Error durante instalación:', error);
      })
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activándose');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requests para cache offline
self.addEventListener('fetch', (event) => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Solo cachear responses exitosas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cachear la response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('Fetch falló:', error);
            // Si la request falló y es una página, mostrar página offline
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Página offline básica
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
