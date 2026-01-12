#!/bin/bash

echo "🔒 SCRIPT DE REPARACIÓN DE SEGURIDAD - SENTINEL WORLD MONITOR"
echo "============================================================"
echo ""

echo "🚨 ALERTA CRÍTICA: Credenciales Firebase expuestas en repositorio público"
echo "Las variables NEXT_PUBLIC_* se incluyen en el bundle JavaScript del cliente"
echo ""

echo "🛑 PASOS PARA SOLUCIONAR:"
echo ""

echo "1. 🔥 REGENERAR CLAVES EN FIREBASE CONSOLE"
echo "   • Ve a: https://console.firebase.google.com/project/sentinel-prod-9c937/settings/general/web"
echo "   • En 'Your apps' → 'Web app' → Configuración"
echo "   • Haz clic en 'Delete app' para eliminar la app web existente"
echo "   • Crea una nueva app web con 'Add app' → '</>' (Web)"
echo "   • Copia las nuevas credenciales"
echo ""

echo "2. 🧹 LIMPIAR FIREBASE HOSTING"
echo "   • Ve a: https://console.firebase.google.com/project/sentinel-prod-9c937/hosting"
echo "   • Haz clic en 'Delete site' o elimina manualmente los archivos expuestos"
echo ""

echo "3. 🔄 ACTUALIZAR ARCHIVOS .ENV"
echo "   Reemplaza el contenido de .env.production con las nuevas credenciales:"
echo ""

cat << 'EOF'
# Configuración SEGURA de Firebase para Producción (sin NEXT_PUBLIC_)
FIREBASE_API_KEY=[NUEVA_API_KEY_DE_FIREBASE]
FIREBASE_AUTH_DOMAIN=[NUEVO_AUTH_DOMAIN.firebaseapp.com]
FIREBASE_PROJECT_ID=sentinel-prod-9c937
FIREBASE_STORAGE_BUCKET=[NUEVO_STORAGE_BUCKET]
FIREBASE_MESSAGING_SENDER_ID=[NUEVO_SENDER_ID]
FIREBASE_APP_ID=[NUEVA_APP_ID]
FIREBASE_MEASUREMENT_ID=[NUEVA_MEASUREMENT_ID]

# VAPID Key (regenerar en Cloud Messaging)
FIREBASE_VAPID_KEY=[NUEVA_VAPID_KEY]
EOF

echo ""
echo "4. 🚀 HACER NUEVO DEPLOY LIMPIO"
echo "   ./deploy-production.sh"
echo ""

echo "5. ✅ VERIFICAR QUE LAS NUEVAS CLAVES NO ESTÉN EXPUESTAS"
echo "   • Busca en GitHub las nuevas claves API"
echo "   • Si aparecen, repite el proceso"
echo ""

echo "📋 CHECKLIST DE SEGURIDAD:"
echo "   □ Claves API regeneradas en Firebase Console"
echo "   □ App web eliminada y recreada"
echo "   □ Firebase Hosting limpiado"
echo "   □ Archivos .env actualizados con nuevas claves"
echo "   □ Nuevo deploy realizado"
echo "   □ Verificación de que no hay claves expuestas"
echo ""

echo "🛡️ MEDIDAS PREVENTIVAS IMPLEMENTADAS:"
echo "   • Variables cambiadas de NEXT_PUBLIC_* a FIREBASE_* (no se exponen en cliente)"
echo "   • Configuración actualizada para usar variables del servidor"
echo ""

echo "⚠️  IMPORTANTE: No hagas commit hasta completar todos los pasos"
echo "   Las nuevas claves podrían exponerse si las commiteas accidentalmente"
echo ""

echo "🔗 ENLACES ÚTILES:"
echo "   Firebase Console: https://console.firebase.google.com"
echo "   Hosting: https://console.firebase.google.com/project/sentinel-prod-9c937/hosting"
echo "   Settings: https://console.firebase.google.com/project/sentinel-prod-9c937/settings/general"


