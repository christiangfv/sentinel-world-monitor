#!/bin/bash

echo "🚀 DEPLOY FINAL - SENTINEL A FIREBASE"
echo "===================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto Sentinel"
    exit 1
fi

echo "📋 Checklist pre-deploy:"
echo "✅ Proyecto Firebase configurado"
echo "✅ Cloud Functions API habilitado"
echo "✅ Cloud Build API habilitado"
echo "✅ Firestore Database creado"
echo "✅ Functions compiladas"
echo ""

read -p "¿Has completado toda la configuración en Firebase Console? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deploy cancelado. Completa la configuración primero."
    exit 1
fi

echo ""
echo "🔨 Iniciando build del proyecto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falló. Revisa los errores arriba."
    exit 1
fi

echo ""
echo "📦 Build exitoso. Iniciando deploy a Firebase..."
echo ""

# Deploy completo
firebase deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡DEPLOY COMPLETADO EXITOSAMENTE!"
    echo "=================================="
    echo ""
    echo "🌐 URLs de tu aplicación:"
    echo "   Frontend: https://sentinel-89591.web.app"
    echo "   Functions: https://southamerica-east1-sentinel-89591.cloudfunctions.net/"
    echo ""
    echo "📱 Funcionalidades activas:"
    echo "   • 🗺️ Mapa interactivo de desastres"
    echo "   • 🔐 Autenticación con Google"
    echo "   • 🔔 Notificaciones push en tiempo real"
    echo "   • 🎯 Zonas personalizables"
    echo "   • 📊 Eventos de USGS y GDACS"
    echo ""
    echo "🔧 Próximos pasos:"
    echo "   • Configurar FCM VAPID key para notificaciones push"
    echo "   • Probar todas las funcionalidades"
    echo "   • Configurar CI/CD en GitHub Actions"
    echo ""
    echo "📊 Monitoreo:"
    echo "   • Functions logs: firebase functions:log"
    echo "   • Console: https://console.firebase.google.com/project/sentinel-89591"
    echo ""
else
    echo ""
    echo "❌ DEPLOY FALLÓ"
    echo "=============="
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   • Verifica que Firestore esté completamente creado"
    echo "   • Revisa logs: firebase functions:log"
    echo "   • Verifica permisos en Firebase Console"
    echo "   • Intenta deploy parcial: firebase deploy --only hosting"
    echo ""
fi
EOF && chmod +x deploy_final.sh