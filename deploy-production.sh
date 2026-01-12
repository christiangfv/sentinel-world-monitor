#!/bin/bash

echo "🚀 DEPLOYING SENTINEL TO PRODUCTION..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto Sentinel"
    exit 1
fi

# Verificar que las variables de entorno existen
if [ ! -f ".env.production" ]; then
    echo "❌ Error: Archivo .env.production no encontrado."
    echo "   Crea el archivo con las variables de entorno de producción."
    exit 1
fi

echo "✅ Verificando build de producción..."
cp .env.production .env.local
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build falló. Revisa los errores arriba."
    exit 1
fi

echo ""
echo "✅ Build exitoso. Iniciando deploy a producción..."

# Deploy a producción
firebase use production
firebase deploy --project sentinel-prod-9c937

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOY A PRODUCCIÓN COMPLETADO EXITOSAMENTE!"
    echo "🌐 Tu app estará disponible en: https://sentinel-prod-9c937.web.app"
    echo ""
    echo "📱 Funcionalidades disponibles:"
    echo "   • Monitoreo de desastres naturales en tiempo real"
    echo "   • Mapa interactivo con eventos"
    echo "   • Autenticación con Google"
    echo "   • Zonas personalizables"
    echo "   • Costo 0 garantizado (notificaciones eliminadas)"
    echo ""
else
    echo ""
    echo "❌ DEPLOY FALLÓ. Revisa los errores arriba."
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   1. Verifica que Cloud Functions API esté habilitado en producción"
    echo "   2. Verifica que Firestore esté configurado en producción"
    echo "   3. Revisa las variables de entorno en .env.production"
    echo "   4. Ejecuta: firebase functions:log --project sentinel-prod-9c937"
fi
