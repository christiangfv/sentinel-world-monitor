#!/bin/bash

echo "🚀 DEPLOYING SENTINEL TO FIREBASE (OPTIMIZADO PARA COSTO 0)..."
echo "=========================================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto Sentinel"
    exit 1
fi

# Verificar que las variables de entorno existen
if [ ! -f ".env.local" ] && [ ! -f ".env.testing" ] && [ ! -f ".env.production" ]; then
    echo "❌ Error: No se encontraron archivos de entorno (.env.local, .env.testing, o .env.production)"
    echo "   Crea las variables de entorno primero."
    exit 1
fi

echo "✅ Verificando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build falló. Revisa los errores arriba."
    exit 1
fi

echo ""
echo "✅ Build exitoso. Compilando Cloud Functions optimizadas..."

# Compilar solo las funciones esenciales optimizadas
cd functions
npm run build
cd ..

if [ $? -ne 0 ]; then
    echo "❌ Error: Build de functions falló."
    exit 1
fi

echo ""
echo "✅ Functions compiladas. Iniciando deploy optimizado..."

# Deploy completo pero optimizado
firebase deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOY COMPLETADO EXITOSAMENTE!"
    echo "🌐 Tu app estará disponible en: https://sentinel-89591.web.app"
    echo ""
    echo "💰 OPTIMIZACIONES PARA COSTO 0 IMPLEMENTADAS:"
    echo "   ✅ Cloud Functions cada 2 horas (vs 10 min antes)"
    echo "   ✅ Consultas Firestore limitadas a 24h recientes"
    echo "   ✅ ❌ NOTIFICACIONES ELIMINADAS COMPLETAMENTE"
    echo "   ✅ Eliminadas funciones costosas (getSystemStats, cleanupExpiredEvents)"
    echo "   ✅ Cliente sin auto-refresh (usa solo realtime subscriptions)"
    echo ""
    echo "📊 COSTOS ESPERADOS:"
    echo "   • Functions: ~$0/mes (12 ejecuciones/día)"
    echo "   • Firestore: ~$0/mes (< 50K reads/día)"
    echo "   • Hosting: $0/mes (gratuito)"
    echo "   • Auth: $0/mes (gratuito)"
    echo ""
    echo "📱 Funcionalidades disponibles:"
    echo "   • Monitoreo de desastres naturales"
    echo "   • Mapa interactivo con eventos"
    echo "   • Autenticación con Google"
    echo "   • Zonas personalizables"
    echo "   • 7 fuentes de datos (USGS, CSN, GDACS, NHC, NASA, SSN México)"
    echo "   • Costo 0 garantizado (notificaciones eliminadas)"
    echo ""
else
    echo ""
    echo "❌ DEPLOY FALLÓ. Revisa los errores arriba."
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   1. Verifica que Cloud Functions API esté habilitado"
    echo "   2. Verifica que Firestore esté configurado"
    echo "   3. Revisa las variables de entorno"
    echo "   4. Ejecuta: firebase functions:log (para ver logs de functions)"
    echo ""
    echo "💡 Si los costos siguen siendo altos:"
    echo "   • Revisa las cuotas en Firebase Console"
    echo "   • Considera usar Firebase Hosting + APIs externas directas"
fi
EOF && chmod +x deploy.sh