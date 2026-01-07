# Sentinel - App de Monitoreo de Desastres Naturales

Aplicación web PWA para monitorear desastres naturales en tiempo real (sismos, tsunamis, incendios, etc.). Los usuarios pueden registrarse con Google, configurar zonas geográficas de interés, y recibir notificaciones push cuando ocurra un evento cerca de sus zonas.

## 🚀 Características Principales

- **Monitoreo en Tiempo Real**: Eventos de desastres naturales actualizados cada 5-15 minutos
- **Mapas Interactivos**: Visualización con Leaflet y OpenStreetMap
- **Notificaciones Push**: Alertas personalizadas por zona geográfica
- **PWA**: Funciona offline y se instala como app nativa
- **Multi-plataforma**: Responsive design optimizado para móvil y desktop
- **Autenticación**: Login seguro con Google

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
- **Backend/DB**: Firebase (Hosting, Auth, Firestore, Cloud Functions, FCM)
- **Mapas**: Leaflet + React-Leaflet + OpenStreetMap
- **Geolocalización**: geofire-common para queries geoespaciales

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone git@github.com:christiangfv/sentinel.git
cd sentinel
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto
firebase init
```

### 4. Variables de entorno
Crear archivo `.env.local` en la raíz del proyecto:
```env
# Firebase Frontend (obtener de Firebase Console > Project Settings > Your Apps)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

### 6. Deploy a producción
```bash
npm run build
firebase deploy
```

## 🏗️ Estructura del Proyecto

```
sentinel/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Layout principal
│   │   ├── page.tsx                  # Home - Mapa + Feed
│   │   ├── login/page.tsx            # Página de login
│   │   ├── dashboard/page.tsx        # Panel del usuario
│   │   ├── settings/page.tsx         # Configuración
│   │   └── event/[id]/page.tsx       # Detalle de evento
│   ├── components/
│   │   ├── layout/                   # Header, Sidebar, Nav
│   │   ├── map/                      # Mapa y markers
│   │   ├── events/                   # Feed y cards de eventos
│   │   ├── user/                     # CRUD de zonas y preferencias
│   │   ├── auth/                     # Login y guards
│   │   └── ui/                       # Componentes base (Button, Card, etc.)
│   └── lib/
│       ├── firebase/                 # Config y funciones Firebase
│       ├── hooks/                    # Hooks personalizados
│       ├── utils/                    # Utilidades
│       ├── constants/                # Configuración de desastres
│       └── types/                    # Tipos TypeScript
├── functions/                        # Cloud Functions
│   ├── src/
│   │   ├── index.ts                  # Entry point
│   │   ├── fetchUSGS.ts              # Polling USGS
│   │   ├── fetchGDACS.ts             # Polling GDACS
│   │   └── sendNotifications.ts      # Push notifications
│   └── package.json
├── public/
│   ├── manifest.json                 # PWA manifest
│   ├── firebase-messaging-sw.js      # Service Worker FCM
│   └── icons/                        # Iconos PWA
├── firebase.json                     # Config hosting + functions
├── firestore.rules                   # Security rules
├── firestore.indexes.json            # Índices Firestore
└── package.json
```

## 🌍 APIs Integradas

### USGS Earthquake API
- **Endpoint**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson`
- **Frecuencia**: Cada 5 minutos
- **Cobertura**: Sismos magnitud 2.5+ globales

### GDACS (Global Disaster Alert)
- **Endpoint**: `https://www.gdacs.org/xml/rss.xml`
- **Frecuencia**: Cada 15 minutos
- **Cobertura**: Múltiples tipos de desastre

## 🗄️ Estructura Firestore

### Colecciones principales:
- `events` - Eventos de desastres
- `users/{uid}/zones` - Zonas de monitoreo por usuario
- `users/{uid}/alertPrefs` - Preferencias de alertas
- `notifications` - Historial de notificaciones enviadas

## 📱 PWA Features

- **Instalación**: Se puede instalar como app nativa
- **Offline**: Funciona sin conexión (mapas cacheados)
- **Push Notifications**: Alertas en tiempo real
- **Background Sync**: Sincronización cuando vuelve la conexión

## 🔒 Seguridad

- Autenticación obligatoria para funcionalidades personalizadas
- Security Rules de Firestore que protegen datos de usuarios
- Validación de datos en cliente y servidor
- Rate limiting en Cloud Functions

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev              # Frontend + emuladores Firebase
firebase emulators:start  # Solo emuladores
```

### Producción
```bash
npm run build
firebase deploy         # Deploy hosting + functions
```

### CI/CD
GitHub Actions configurado para deploy automático en push a `main`.

## 📋 Tipos de Desastre Soportados

- 🌍 **Sismos** (USGS)
- 🌊 **Tsunamis**
- 🌋 **Erupciones Volcánicas**
- 🔥 **Incendios Forestales**
- 💧 **Inundaciones**
- 🌀 **Tormentas/Huracanes**
- ⛰️ **Deslizamientos de Tierra**

## 🎨 Diseño

- **Mobile-first**: Optimizado para dispositivos móviles
- **Dark/Light mode**: Soporte para ambos temas
- **Responsive**: Funciona en todos los tamaños de pantalla
- **Accesible**: Cumple estándares WCAG

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autor

**Christian González** - [christiangfv](https://github.com/christiangfv)

---

¡Mantente seguro monitoreando los desastres naturales con **Sentinel**! 🌍⚠️