# 🚨 INCIDENTE DE SEGURIDAD - Credenciales Firebase Expuestas

## 📅 Fecha del Incidente
**12 de enero de 2026**

## 🔍 Descripción del Problema

Google Cloud Platform detectó que la clave API de Firebase `AIzaSyDp2z1FBMgNWJeAhOuOXgrglx9yFf_ras8` del proyecto `sentinel-prod-9c937` estaba expuesta públicamente en el repositorio GitHub.

### Ubicación de la Brecha
- **URL expuesta:** `https://github.com/christiangfv/sentinel-world-monitor/blob/af8ab5098878cd2211dcd780f387bef5496ae80c/.firebase/sentinel-89591/hosting/_next/static/chunks/58-1b06bc405fa711c5.js`
- **Tipo:** Archivo JavaScript compilado en Firebase Hosting
- **Causa:** Variables `NEXT_PUBLIC_*` incluidas en bundle del cliente

## ⚠️ Nivel de Riesgo
**ALTO** - Credenciales de producción expuestas públicamente

### Impacto Potencial
- ✅ **Acceso no autorizado** a Firebase services
- ✅ **Uso indebido** de cuota gratuita
- ✅ **Posible manipulación** de datos
- ✅ **Facturación inesperada** por abuso

## ✅ Medidas Inmediatas Tomadas

### 1. Contención
- [ ] **Regenerar claves API** en Firebase Console
- [ ] **Eliminar app web existente** en Firebase
- [ ] **Crear nueva app web** con credenciales frescas
- [ ] **Limpiar Firebase Hosting** de archivos expuestos

### 2. Prevención
- [x] **Cambiar arquitectura** de variables de entorno
- [x] **Reemplazar `NEXT_PUBLIC_*`** por variables del servidor
- [x] **Actualizar configuración Firebase** para mayor seguridad
- [x] **Crear script de reparación** (`security-fix.sh`)

### 3. Monitoreo
- [ ] **Verificar logs de acceso** en Firebase Console
- [ ] **Monitorear uso de API** por posibles abusos
- [ ] **Auditar actividad de facturación**

## 🛠️ Solución Técnica Implementada

### Cambio Arquitectónico
```typescript
// ❌ ANTES (INSEGURO)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Se expone en cliente
  // ...
};

// ✅ DESPUÉS (SEGURO)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ...
};
```

### Variables de Entorno Seguras
```bash
# ❌ Variables públicas (expuestas en bundle JS)
NEXT_PUBLIC_FIREBASE_API_KEY=...

# ✅ Variables del servidor (no expuestas)
FIREBASE_API_KEY=...
```

## 📋 Checklist de Recuperación

- [ ] Regenerar todas las claves API en Firebase Console
- [ ] Actualizar archivos `.env.production` y `.env.testing`
- [ ] Limpiar y redeploy en Firebase Hosting
- [ ] Verificar que las nuevas claves no aparezcan en GitHub
- [ ] Monitorear logs y facturación por 30 días
- [ ] Actualizar documentación de seguridad

## 🎯 Lecciones Aprendidas

1. **Nunca usar `NEXT_PUBLIC_*`** para credenciales sensibles
2. **Las variables públicas se incluyen** en el bundle JavaScript del cliente
3. **Firebase Hosting sirve archivos estáticos** que pueden contener credenciales
4. **Revisar builds antes de deploy** en busca de datos sensibles

## 📞 Contacto de Emergencia

En caso de problemas adicionales:
- Firebase Support: https://firebase.google.com/support
- Google Cloud Security: security@google.com

## 🔄 Estado Actual
- **Status:** Mitigación en progreso
- **Prioridad:** CRÍTICA
- **Próximo paso:** Regenerar credenciales y redeploy

---

**Nota:** Este documento debe mantenerse hasta completar la recuperación completa del sistema.
