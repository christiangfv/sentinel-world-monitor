# Sentinel - App de Monitoreo de Desastres Naturales (Versión Segura)

Aplicación web PWA para monitorear desastres naturales en tiempo real (sismos, tsunamis, incendios, etc.). Los usuarios pueden registrarse con Google, configurar zonas geográficas de interés, y recibir notificaciones push cuando ocurra un evento cerca de sus zonas.

## 🔒 SEGURIDAD - CRÍTICO

**Esta versión ha sido completamente revisada y corregida para eliminar vulnerabilidades de seguridad críticas.**

### ✅ Correcciones Implementadas
- ✅ Eliminadas claves API hardcodeadas de `firebase.json`
- ✅ Service Worker seguro con configuración dinámica
- ✅ Variables de entorno segregadas por ambiente
- ✅ Autenticación mock deshabilitada en producción
- ✅ Configuración de Firebase segura por ambiente

### 🚨 NO USAR LA VERSIÓN ANTERIOR
La versión anterior contenía vulnerabilidades críticas de seguridad que han sido corregidas en esta versión.

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

## 📦 Instalación y Configuración Segura

### 1. Clonar el repositorio seguro
```bash
git clone git@github.com:christiangfv/sentinel-world-monitor-secure.git
cd sentinel-world-monitor-secure
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar ambientes Firebase

#### Crear proyectos Firebase (ya creados)
- **Producción**: `sentinel-prod-9c937`
- **Testing**: `sentinel-89591`

### 4. Configurar variables de entorno

#### Para Testing (`.env.testing`):
```env
# Firebase Testing Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_testing_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sentinel-89591.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sentinel-89591
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sentinel-89591.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_testing_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_testing_app_id_here
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_testing_vapid_key_here

NODE_ENV=development
```

#### Para Producción (`.env.production`):
```env
# Firebase Production Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sentinel-prod-9c937.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sentinel-prod-9c937
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sentinel-prod-9c937.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_production_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_production_app_id_here
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_production_vapid_key_here

NODE_ENV=production
```

### 5. Configurar Firebase CLI
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

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno para desarrollo
cp .env.testing .env.local

# Ejecutar en modo desarrollo
npm run dev
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

### Seguridad Implementada
- ✅ Autenticación segura con Firebase Auth
- ✅ Reglas de Firestore que protegen datos de usuario
- ✅ Validación de entrada en Cloud Functions
- ✅ Service Worker seguro sin credenciales hardcodeadas
- ✅ Variables de entorno segregadas por ambiente
- ✅ Rate limiting y validaciones en backend

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
