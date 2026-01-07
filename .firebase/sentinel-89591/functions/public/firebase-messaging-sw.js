// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con la del cliente)
firebase.initializeApp({
  apiKey: "demo_api_key", // Se reemplazará en producción
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo_app_id"
});

const messaging = firebase.messaging();

// Manejar mensajes en background
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje FCM recibido en background:', payload);

  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  const notificationOptions = {
    body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/badge-72.svg',
    vibrate: [200, 100, 200, 200, 100, 200],
    requireInteraction: true,
    silent: false,
    tag: data.eventId || 'sentinel-notification',
    data: {
      eventId: data.eventId,
      disasterType: data.disasterType,
      url: `/event/${data.eventId}`
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalles',
        icon: '/icons/icon-192.svg'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };

  self.registration.showNotification(title || 'Nueva Alerta', notificationOptions);
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click recibido:', event);

  event.notification.close();

  const { action, data } = event;

  if (action === 'view' && data?.url) {
    event.waitUntil(
      clients.openWindow(data.url)
    );
  } else if (action === 'dismiss') {
    // Solo cerrar, no hacer nada
  } else {
    // Click por defecto en la notificación
    event.waitUntil(
      clients.openWindow(data?.url || '/')
    );
  }
});

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
