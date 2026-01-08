# Sentinel - App de Monitoreo de Desastres Naturales

Aplicación web PWA para monitorear desastres naturales en tiempo real (sismos, tsunamis, incendios, etc.). Los usuarios pueden registrarse con Google, configurar zonas geográficas de interés, y recibir notificaciones push cuando ocurra un evento cerca de sus zonas.

Esta versión incluye implementación segura con mejores prácticas de desarrollo.

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
git clone git@github.com:christiangfv/sentinel-world-monitor.git
cd sentinel-world-monitor
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

#### Para Testing (Desarrollo) (`.env.testing`):
```env
# Firebase Testing Configuration (Development Environment)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyArZVsBh-9ANzntpw0hTi9M3yEJLNNOk3E
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sentinel-89591.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sentinel-89591
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sentinel-89591.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=638359914064
NEXT_PUBLIC_FIREBASE_APP_ID=1:638359914064:web:4ad700b8777dbda615f355
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BBL9i3ARw_RB1eozgOqbJOfe4CmbogsmoK3aIct5b1gZ27A5RntkixCueemSEWZPZ_Njf5HQ1h0wxzrgIzwvbSU

NODE_ENV=development
```

#### Para Producción (`.env.production`):
```env
# Firebase Production Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDp2z1FBMgNWJeAhOuOXgrglx9yFf_ras8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sentinel-prod-9c937.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sentinel-prod-9c937
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sentinel-prod-9c937.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=846642937822
NEXT_PUBLIC_FIREBASE_APP_ID=1:846642937822:web:b0db6f6c5f3db4c3d3274f
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_production_vapid_key_here

NODE_ENV=production
```

### 4. Configurar Firebase CLI
```bash
# Instalar Firebase CLI (si no está instalado)
npm install -g firebase-tools

# Login en Firebase
firebase login

# Usar proyecto de testing por defecto
firebase use testing
```

## 🚀 Despliegue

### Despliegue a Testing
```bash
./deploy-testing.sh
```

### Despliegue a Producción
```bash
./deploy-production.sh
```

## 📱 Uso de la Aplicación

1. **Registro**: Los usuarios se registran con Google
2. **Configuración**: Se configuran zonas geográficas de interés
3. **Preferencias**: Se configuran tipos de desastre y severidad mínima
4. **Notificaciones**: Se reciben alertas push cuando ocurren eventos relevantes

## 🏗️ Arquitectura

### Frontend (Next.js)
- **Páginas**: Dashboard, Event Details, Settings, Login
- **Componentes**: Mapa, Lista de eventos, Configuración de usuario
- **Hooks**: Autenticación, PWA, Notificaciones

### Backend (Firebase)
- **Firestore**: Base de datos NoSQL para usuarios, eventos, zonas
- **Cloud Functions**: Procesamiento de eventos y envío de notificaciones
- **Authentication**: Autenticación con Google
- **Hosting**: Despliegue estático de la aplicación

## 🤝 Contribución

1. Crear rama desde `develop`
2. Implementar cambios
3. Ejecutar tests: `npm test`
4. Hacer commit y push
5. Crear Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de Sentinel.

## 📞 Soporte

Para soporte técnico contactar al equipo de desarrollo.
