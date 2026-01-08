#!/bin/bash

echo "🧪 DEPLOYING SENTINEL TO TESTING..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto Sentinel"
    exit 1
fi

# Verificar que las variables de entorno existen
if [ ! -f ".env.testing" ]; then
    echo "❌ Error: Archivo .env.testing no encontrado."
    echo "   Crea el archivo con las variables de entorno de testing."
    exit 1
fi

echo "✅ Verificando build de testing..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build falló. Revisa los errores arriba."
    exit 1
fi

echo ""
echo "✅ Build exitoso. Iniciando deploy a testing..."

# Deploy a testing
firebase use testing
firebase deploy --project sentinel-testing-2025

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOY A TESTING COMPLETADO EXITOSAMENTE!"
    echo "🧪 Tu app de testing estará disponible en: https://sentinel-testing-2025.web.app"
    echo ""
    echo "📱 Funcionalidades disponibles:"
    echo "   • Monitoreo de desastres naturales en tiempo real"
    echo "   • Mapa interactivo con eventos"
    echo "   • Notificaciones push"
    echo "   • Autenticación con Google"
    echo "   • Zonas personalizables"
    echo ""
else
    echo ""
    echo "❌ DEPLOY FALLÓ. Revisa los errores arriba."
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   1. Verifica que Cloud Functions API esté habilitado en testing"
    echo "   2. Verifica que Firestore esté configurado en testing"
    echo "   3. Revisa las variables de entorno en .env.testing"
    echo "   4. Ejecuta: firebase functions:log --project sentinel-testing-2025"
fi
