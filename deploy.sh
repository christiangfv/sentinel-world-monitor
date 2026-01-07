#!/bin/bash

echo "🚀 DEPLOYING SENTINEL TO FIREBASE..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto Sentinel"
    exit 1
fi

# Verificar que las variables de entorno existen
if [ ! -f ".env.local" ]; then
    echo "❌ Error: Archivo .env.local no encontrado. Crea las variables de entorno primero."
    exit 1
fi

echo "✅ Verificando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build falló. Revisa los errores arriba."
    exit 1
fi

echo ""
echo "✅ Build exitoso. Iniciando deploy..."

# Deploy completo
firebase deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOY COMPLETADO EXITOSAMENTE!"
    echo "🌐 Tu app estará disponible en: https://sentinel-89591.web.app"
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
    echo "   1. Verifica que Cloud Functions API esté habilitado"
    echo "   2. Verifica que Firestore esté configurado"
    echo "   3. Revisa las variables de entorno en .env.local"
    echo "   4. Ejecuta: firebase functions:log (para ver logs de functions)"
fi
EOF && chmod +x deploy.sh