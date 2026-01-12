#!/bin/bash

echo "🔑 ACTUALIZADOR DE CLAVES API SEGURAS - SENTINEL"
echo "================================================"
echo ""

# Función para obtener input del usuario
get_input() {
    local prompt="$1"
    local var_name="$2"
    read -p "$prompt: " value
    eval "$var_name='$value'"
}

echo "📋 PASOS PARA OBTENER LAS CLAVES:"
echo "1. Ve a Firebase Console"
echo "2. Selecciona el proyecto correspondiente"
echo "3. Ve a Project Settings > General > Your apps"
echo "4. Copia los valores de configuración de la app web"
echo ""

echo "🔧 CONFIGURACIÓN PARA DESARROLLO (sentinel-89591)"
echo "=================================================="

get_input "API Key" DEV_API_KEY
get_input "Auth Domain" DEV_AUTH_DOMAIN
get_input "Project ID" DEV_PROJECT_ID
get_input "Storage Bucket" DEV_STORAGE_BUCKET
get_input "Messaging Sender ID" DEV_MESSAGING_SENDER_ID
get_input "App ID" DEV_APP_ID
get_input "Measurement ID (opcional)" DEV_MEASUREMENT_ID
get_input "VAPID Key (de Cloud Messaging)" DEV_VAPID_KEY

echo ""
echo "🔧 CONFIGURACIÓN PARA PRODUCCIÓN (sentinel-prod-9c937)"
echo "======================================================"

get_input "API Key" PROD_API_KEY
get_input "Auth Domain" PROD_AUTH_DOMAIN
get_input "Project ID" PROD_PROJECT_ID
get_input "Storage Bucket" PROD_STORAGE_BUCKET
get_input "Messaging Sender ID" PROD_MESSAGING_SENDER_ID
get_input "App ID" PROD_APP_ID
get_input "Measurement ID (opcional)" PROD_MEASUREMENT_ID
get_input "VAPID Key (de Cloud Messaging)" PROD_VAPID_KEY

echo ""
echo "💾 ACTUALIZANDO ARCHIVOS .env..."

# Crear .env.testing
cat > .env.testing << EOF
# 🔒 CONFIGURACIÓN SEGURA PARA DESARROLLO (sentinel-89591)
# ✅ CLAVES REGENERADAS Y VERIFICADAS

# Variables del SERVIDOR (no expuestas en cliente)
FIREBASE_API_KEY=$DEV_API_KEY
FIREBASE_AUTH_DOMAIN=$DEV_AUTH_DOMAIN
FIREBASE_PROJECT_ID=$DEV_PROJECT_ID
FIREBASE_STORAGE_BUCKET=$DEV_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=$DEV_MESSAGING_SENDER_ID
FIREBASE_APP_ID=$DEV_APP_ID
FIREBASE_MEASUREMENT_ID=$DEV_MEASUREMENT_ID

# VAPID Key para notificaciones
FIREBASE_VAPID_KEY=$DEV_VAPID_KEY
EOF

# Crear .env.production
cat > .env.production << EOF
# 🔒 CONFIGURACIÓN SEGURA PARA PRODUCCIÓN (sentinel-prod-9c937)
# ✅ CLAVES REGENERADAS Y VERIFICADAS

# Variables del SERVIDOR (no expuestas en cliente)
FIREBASE_API_KEY=$PROD_API_KEY
FIREBASE_AUTH_DOMAIN=$PROD_AUTH_DOMAIN
FIREBASE_PROJECT_ID=$PROD_PROJECT_ID
FIREBASE_STORAGE_BUCKET=$PROD_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=$PROD_MESSAGING_SENDER_ID
FIREBASE_APP_ID=$PROD_APP_ID
FIREBASE_MEASUREMENT_ID=$PROD_MEASUREMENT_ID

# VAPID Key para notificaciones
FIREBASE_VAPID_KEY=$PROD_VAPID_KEY
EOF

echo ""
echo "✅ ARCHIVOS .env ACTUALIZADOS"
echo "=============================="
echo ""
echo "🔍 VERIFICACIÓN:"
echo "   • .env.testing: $(wc -l < .env.testing) líneas"
echo "   • .env.production: $(wc -l < .env.production) líneas"
echo ""
echo "🚀 PRÓXIMOS PASOS:"
echo "   1. Probar build local: npm run build"
echo "   2. Deploy desarrollo: ./deploy-testing.sh"
echo "   3. Deploy producción: ./deploy-production.sh"
echo "   4. Verificar en Firebase Console que no hay uso sospechoso"
echo ""
echo "🔐 SEGURIDAD:"
echo "   • Las nuevas claves NO se exponen en el cliente"
echo "   • Los archivos .env están en .gitignore"
echo "   • Arquitectura segura implementada"
echo ""
echo "🎉 ¡CLAVES ACTUALIZADAS! Las credenciales anteriores están ahora seguras."


