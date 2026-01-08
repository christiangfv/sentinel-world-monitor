<div align="center">

# 🌍 Sentinel World Monitor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0+-orange)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC)](https://tailwindcss.com/)

*Monitoreo inteligente de desastres naturales en tiempo real*

[📱 Demo en Producción](https://sentinel-prod-9c937.web.app) • [🧪 Demo de Testing](https://sentinel-89591.web.app) • [📖 Documentación](#-documentación) • [🚀 Inicio Rápido](#-instalación-rápida)

---

</div>

## 📋 Tabla de Contenidos

- [✨ Características](#-características)
- [🎯 Casos de Uso](#-casos-de-uso)
- [🛠️ Stack Tecnológico](#%EF%B8%8F-stack-tecnológico)
- [🚀 Instalación Rápida](#-instalación-rápida)
- [⚙️ Configuración](#%EF%B8%8F-configuración)
- [🔧 Despliegue](#-despliegue)
- [📱 Uso de la Aplicación](#-uso-de-la-aplicación)
- [🏗️ Arquitectura](#%EF%B8%8F-arquitectura)
- [🧪 Testing](#-testing)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)
- [👥 Equipo](#-equipo)
- [📞 Soporte](#-soporte)

---

## ✨ Características

### 🚨 **Monitoreo en Tiempo Real**
- **Actualización automática** cada 5-15 minutos desde múltiples fuentes oficiales
- **Cobertura global** de desastres naturales
- **Alertas inteligentes** basadas en ubicación y preferencias

### 🗺️ **Mapas Interactivos Avanzados**
- **Visualización 3D** con react-globe.gl para vista global
- **Mapas detallados** con Leaflet y OpenStreetMap
- **Zonas personalizables** con radio configurable
- **Clusters inteligentes** para mejor rendimiento

### 📢 **Sistema de Notificaciones**
- **Push notifications** nativas en móvil y desktop
- **Filtros avanzados** por tipo de desastre y severidad
- **Personalización completa** de alertas por usuario
- **Modo offline** con notificaciones almacenadas

### 🔐 **Seguridad Empresarial**
- **Autenticación Google** OAuth 2.0
- **Encriptación end-to-end** de datos sensibles
- **Reglas de acceso** restrictivas en Firestore
- **Validación de entrada** en backend y frontend

### 📱 **Experiencia PWA**
- **Instalación nativa** en móvil y desktop
- **Funcionamiento offline** con cache inteligente
- **Sincronización automática** al reconectar
- **Performance optimizada** con lazy loading

---

## 🎯 Casos de Uso

### 👥 **Usuarios Finales**
- **Familias**: Mantenerse informados sobre desastres en zonas de residencia
- **Profesionales**: Monitoreo de áreas de trabajo o viaje
- **Comunidades**: Alertas para grupos vulnerables

### 🏢 **Organizaciones**
- **Protección Civil**: Monitoreo coordinado de emergencias
- **Empresas**: Seguridad de empleados en zonas de riesgo
- **Medios**: Información actualizada para reportajes

### 🌍 **Escala Global**
- **Cobertura completa** de continentes
- **Múltiples fuentes** de datos oficiales
- **Idiomas múltiples** (actualmente español, extensible)

---

## 🛠️ Stack Tecnológico

### **Frontend**
```typescript
- Next.js 15+ (App Router)
- React 19+ (Concurrent Features)
- TypeScript 5+ (Type Safety)
- Tailwind CSS 3+ (Utility-First)
```

### **Backend & Infraestructura**
```typescript
- Firebase Hosting (CDN Global)
- Firebase Auth (OAuth 2.0)
- Firestore (NoSQL Database)
- Cloud Functions (Serverless)
- FCM (Push Notifications)
```

### **Mapas & Visualización**
```typescript
- Leaflet + React-Leaflet (Mapas 2D)
- React Globe.gl (Visualización 3D)
- OpenStreetMap (Datos cartográficos)
- GeoFire Common (Queries geoespaciales)
```

### **Herramientas de Desarrollo**
```bash
- ESLint + Prettier (Code Quality)
- Jest + Testing Library (Testing)
- Husky + Commitlint (Git Hooks)
- Firebase Tools (Deployment)
```

---

## 🚀 Instalación Rápida

### **Prerrequisitos**
- Node.js ≥18.0.0
- npm ≥9.0.0
- Git
- Firebase CLI

### **1. Clonación y Configuración**
```bash
# Clonar repositorio
git clone https://github.com/christiangfv/sentinel-world-monitor.git
cd sentinel-world-monitor

# Instalar dependencias
npm install

# Configurar Firebase
npm install -g firebase-tools
firebase login
```

### **2. Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus credenciales de Firebase
nano .env.local
```

### **3. Configuración Inicial**
```bash
# Configurar proyecto Firebase
firebase use testing  # o production

# Build de desarrollo
npm run dev
```

---

## ⚙️ Configuración

### **Variables de Entorno**

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

# Environment
NODE_ENV=development
```

### **Configuración de Firebase**

#### **Proyecto de Testing**
```bash
firebase use testing
firebase projects:list
```

#### **Proyecto de Producción**
```bash
firebase use production
firebase projects:list
```

### **Configuración PWA**

El archivo `public/manifest.json` contiene la configuración PWA:

```json
{
  "name": "Sentinel World Monitor",
  "short_name": "Sentinel",
  "description": "Monitoreo de desastres naturales en tiempo real",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0ea5e9",
  "background_color": "#0f172a"
}
```

---

## 🔧 Despliegue

### **Desarrollo Local**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción local
```

### **Despliegue a Testing**
```bash
./deploy-testing.sh
```
**URL**: https://sentinel-89591.web.app

### **Despliegue a Producción**
```bash
./deploy-production.sh
```
**URL**: https://sentinel-prod-9c937.web.app

### **Verificación de Despliegue**
```bash
# Verificar estado del despliegue
firebase hosting:site:get-live sentinel-prod-9c937

# Ver logs de funciones
firebase functions:log --only fetchAllEvents
```

---

## 📱 Uso de la Aplicación

### **Primeros Pasos**
1. **Acceder** a la aplicación web
2. **Iniciar sesión** con Google
3. **Configurar zonas** de interés geográfico
4. **Personalizar preferencias** de notificaciones

### **Funcionalidades Principales**

#### **🗺️ Mapa Interactivo**
- **Vista global** con globe 3D
- **Vista detallada** con mapas 2D
- **Zonas activas** marcadas con colores
- **Eventos en tiempo real** con animaciones

#### **⚙️ Configuración Personal**
- **Zonas geográficas** con radio configurable
- **Tipos de desastre** a monitorear
- **Niveles de severidad** mínima
- **Preferencias de notificación**

#### **📢 Sistema de Alertas**
- **Notificaciones push** automáticas
- **Alertas por email** (próximamente)
- **Dashboard de eventos** históricos
- **Filtros avanzados**

### **Modo Offline**
- **Cache inteligente** de mapas y datos
- **Notificaciones almacenadas** para envío posterior
- **Sincronización automática** al reconectar

---

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase      │    │   External      │
│   (Next.js)     │◄──►│   Services      │◄──►│   APIs          │
│                 │    │                 │    │                 │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • React 19      │    │ • Hosting       │    │ • USGS API      │
│ • TypeScript    │    │ • Firestore     │    │ • GDACS API     │
│ • PWA           │    │ • Functions     │    │ • JMA API       │
│ • Responsive    │    │ • Auth          │    │ • EMSC API      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              ▲
                              │
                       ┌─────────────────┐
                       │   Cloud         │
                       │   Functions     │
                       │                 │
                       ├─────────────────┤
                       │ • Data Fetching │
                       │ • Notifications │
                       │ • Processing    │
                       └─────────────────┘
```

### **Componentes Arquitectónicos**

#### **📊 Capa de Datos**
- **Fuentes externas**: USGS, GDACS, JMA, EMSC
- **Procesamiento**: Cloud Functions con Node.js
- **Almacenamiento**: Firestore con índices geoespaciales

#### **🔐 Seguridad**
- **Autenticación**: Firebase Auth con Google OAuth
- **Autorización**: Reglas de Firestore por usuario
- **Validación**: Input sanitization en cliente y servidor

#### **📱 Interfaz de Usuario**
- **Responsive Design**: Mobile-first con Tailwind CSS
- **PWA Features**: Service Worker, Cache, Offline
- **Accesibilidad**: ARIA labels, keyboard navigation

---

## 🧪 Testing

### **Ejecutar Tests**
```bash
# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

### **Testing E2E** (Próximamente)
```bash
# Con Playwright (planeado)
npm run test:e2e
```

### **Linting y Formateo**
```bash
# Verificar código
npm run lint

# Formatear código
npm run format
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor lee nuestras guías:

### **Proceso de Contribución**

1. **Fork** el proyecto
2. **Crear** rama feature: `git checkout -b feature/nueva-funcionalidad`
3. **Commit** cambios: `git commit -m 'feat: agregar nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Crear Pull Request**

### **Estándares de Código**

- **TypeScript** estricto activado
- **ESLint** y **Prettier** configurados
- **Conventional Commits** para mensajes
- **Tests** requeridos para nuevas features

### **Tipos de Contribuciones**

- 🐛 **Bug fixes**
- ✨ **Nuevas funcionalidades**
- 📚 **Documentación**
- 🎨 **UI/UX mejoras**
- 🧪 **Tests**
- 🌐 **Internacionalización**

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

**Nota**: Este proyecto es propiedad de Sentinel y está destinado para uso en monitoreo de desastres naturales.

---

## 👥 Equipo

### **Desarrollo**
- **Christian González** - *Full Stack Developer* - [christiangfv](https://github.com/christiangfv)

### **Colaboradores**
¡Únete a nuestro equipo! Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más información.

---

## 📞 Soporte

### **Reportar Issues**
- [GitHub Issues](https://github.com/christiangfv/sentinel-world-monitor/issues)
- Usar templates de bug/feature request

### **Documentación**
- [Wiki del Proyecto](https://github.com/christiangfv/sentinel-world-monitor/wiki)
- [API Documentation](docs/api.md)

### **Comunidad**
- **Discussions**: Para preguntas generales
- **Issues**: Para bugs y feature requests
- **Pull Requests**: Para contribuciones

### **Contacto Directo**
Para soporte técnico urgente, contactar al equipo de desarrollo.

---

<div align="center">

**Hecho con ❤️ para la seguridad de las comunidades**

[⬆️ Volver al inicio](#sentinel-world-monitor)

---

*Última actualización: Enero 2025*

</div>
