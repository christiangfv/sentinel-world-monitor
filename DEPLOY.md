# 🚀 Guía de Deploy - Sentinel

## ✅ Estado del Proyecto
**Build Status**: ✅ EXITOSO
**Ready for Production**: ✅ SÍ

## 📋 Requisitos Previos

### 1. Cuenta de Firebase
- Crear proyecto en [Firebase Console](https://console.firebase.google.com)
- Habilitar Authentication (Google Provider)
- Configurar Firestore Database
- Habilitar Cloud Functions
- Configurar Firebase Cloud Messaging (FCM)

### 2. API Keys de Firebase
Obtener las siguientes claves desde Firebase Console > Project Settings > Your Apps:
- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `vapidKey` (para FCM)

## 🛠️ Pasos de Deploy

### 1. Preparar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus claves reales de Firebase
nano .env.local
```

Contenido del `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=tu_vapid_key
```

### 2. Configurar Firebase CLI

```bash
# Instalar Firebase CLI (si no está instalado)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto (seleccionar opciones)
firebase init
# Hosting: Yes
# Functions: Yes
# Firestore: Yes
# Emulator: Optional
```

### 3. Configurar Proyecto Firebase

Actualizar `.firebaserc`:
```json
{
  "projects": {
    "default": "tu-proyecto-firebase"
  }
}
```

### 4. Deploy a Firebase

```bash
# Instalar dependencias de functions
cd functions && npm install && cd ..

# Build del proyecto
npm run build

# Deploy completo (hosting + functions)
firebase deploy

# O deploy por separado:
firebase deploy --only hosting    # Frontend
firebase deploy --only functions  # Backend
```

## 🌐 URLs de Producción

Después del deploy exitoso, tu aplicación estará disponible en:
- **Frontend**: `https://tu-proyecto.web.app`
- **Functions**: `https://southamerica-east1-tu-proyecto.cloudfunctions.net/`

## ⚙️ Configuración de Firebase Console

### 1. Authentication
- Ir a Authentication > Sign-in method
- Habilitar "Google" como provider
- Configurar OAuth consent screen

### 2. Firestore Database
- Crear base de datos en modo "Production"
- Ubicación: `southamerica-east1` (Santiago)
- Reglas de seguridad ya están configuradas en `firestore.rules`

### 3. Cloud Functions
- Runtime: Node.js 20
- Región: `southamerica-east1`
- Memoria: 256MB (por defecto)

### 4. Cloud Messaging (FCM)
- Ir a Cloud Messaging
- Generar clave VAPID
- Configurar Web Push certificates

## 🔧 Configuración de APIs Externas

### USGS Earthquake API
- ✅ Ya configurada en Cloud Functions
- Endpoint: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson`
- Frecuencia: Cada 5 minutos

### GDACS API
- ✅ Ya configurada en Cloud Functions
- Endpoint: `https://www.gdacs.org/xml/rss.xml`
- Frecuencia: Cada 15 minutos

## 📊 Monitoreo y Logs

### Ver logs de Functions
```bash
firebase functions:log
```

### Ver estado del deploy
```bash
firebase deploy --only hosting:functions --dry-run
```

### Monitoreo en Firebase Console
- Functions > Logs
- Firestore > Usage
- Hosting > Analytics

## 🚨 Solución de Problemas

### Error: "Functions did not deploy properly"
```bash
# Ver logs detallados
firebase functions:log --only fetchUSGSEvents

# Redeploy functions
firebase deploy --only functions
```

### Error: "Build failed"
```bash
# Limpiar cache
rm -rf .next
npm run build
```

### Error: "Firebase project not found"
```bash
# Verificar configuración
firebase projects:list
firebase use tu-proyecto-id
```

## 🔄 Actualizaciones

### Deploy de solo funciones
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Deploy de solo frontend
```bash
npm run build
firebase deploy --only hosting
```

## 📈 Escalabilidad

### Configuración de Functions
- **Memoria**: 256MB - 2GB (según necesidad)
- **Timeout**: 60s - 540s
- **Concurrencia**: 1 - 3000

### Optimizaciones
- ✅ Code splitting automático
- ✅ Image optimization
- ✅ Static generation
- ✅ CDN global de Firebase

## 🎯 Checklist de Deploy

- [ ] Proyecto Firebase creado
- [ ] Authentication configurado
- [ ] Firestore habilitado
- [ ] Functions configuradas
- [ ] FCM configurado
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Deploy completado
- [ ] URLs funcionando
- [ ] Funcionalidades probadas

## 📞 Soporte

Si tienes problemas durante el deploy:
1. Verificar logs: `firebase functions:log`
2. Revisar configuración en Firebase Console
3. Verificar variables de entorno
4. Consultar documentación de Firebase

---

**¡Tu aplicación Sentinel está lista para salvar vidas monitoreando desastres naturales en tiempo real!** 🌍⚡🔔

