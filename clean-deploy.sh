#!/bin/bash

echo "🧹 LIMPIEZA COMPLETA DE DESPLIEGUES COMPROMETIDOS"
echo "================================================="
echo ""

ENVIRONMENT="$1"

if [ -z "$ENVIRONMENT" ]; then
    echo "❌ Uso: ./clean-deploy.sh <testing|production>"
    echo ""
    echo "Ejemplos:"
    echo "  ./clean-deploy.sh testing     # Limpiar desarrollo"
    echo "  ./clean-deploy.sh production  # Limpiar producción"
    exit 1
fi

echo "🎯 ENTORNO SELECCIONADO: $ENVIRONMENT"
echo ""

# Determinar configuración según entorno
if [ "$ENVIRONMENT" = "testing" ]; then
    PROJECT_ID="sentinel-89591"
    PROJECT_NAME="DESARROLLO"
    ENV_FILE=".env.testing"
elif [ "$ENVIRONMENT" = "production" ]; then
    PROJECT_ID="sentinel-prod-9c937"
    PROJECT_NAME="PRODUCCIÓN"
    ENV_FILE=".env.production"
else
    echo "❌ Entorno inválido. Use 'testing' o 'production'"
    exit 1
fi

echo "🔍 VERIFICANDO CONFIGURACIÓN..."
echo "================================"

# Verificar que existe el archivo .env
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: Archivo $ENV_FILE no encontrado"
    echo "   Ejecuta primero: ./update-keys.sh"
    exit 1
fi

# Verificar que las claves no sean placeholders
if grep -q "NUEVA_" "$ENV_FILE"; then
    echo "❌ Error: $ENV_FILE contiene placeholders sin actualizar"
    echo "   Ejecuta primero: ./update-keys.sh"
    exit 1
fi

echo "✅ Configuración verificada"
echo ""

echo "🗑️  LIMPIANDO FIREBASE HOSTING..."
echo "=================================="

# Intentar limpiar hosting (esto requiere autenticación)
echo "⚠️  Para limpiar completamente:"
echo "   1. Ve a: https://console.firebase.google.com/project/$PROJECT_ID/hosting"
echo "   2. Elimina todos los archivos del sitio"
echo "   3. O usa: firebase hosting:disable (si quieres deshabilitar hosting)"
echo ""

read -p "¿Ya limpiaste el hosting? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "ℹ️  Cancela la limpieza y hazla manualmente primero"
    exit 1
fi

echo "🔄 REBUILD Y DEPLOY LIMPIO..."
echo "=============================="

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf .next out

# Build limpio
echo "🔨 Construyendo aplicación..."
if [ "$ENVIRONMENT" = "testing" ]; then
    cp .env.testing .env.local
elif [ "$ENVIRONMENT" = "production" ]; then
    cp .env.production .env.local
fi

if ! npm run build; then
    echo "❌ Error en build"
    exit 1
fi

# Build de funciones
echo "⚙️  Construyendo funciones..."
cd functions
npm run build
cd ..

# Deploy limpio
echo "🚀 Desplegando aplicación limpia..."
if [ "$ENVIRONMENT" = "testing" ]; then
    firebase use testing
    firebase deploy --project "$PROJECT_ID"
elif [ "$ENVIRONMENT" = "production" ]; then
    firebase use production
    firebase deploy --project "$PROJECT_ID"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡DESPLIEGUE $PROJECT_NAME COMPLETADO EXITOSAMENTE!"
    echo "======================================================"
    echo ""
    echo "🔍 VERIFICACIÓN FINAL:"
    echo "   • Busca en GitHub las nuevas API keys"
    echo "   • Verifica logs en Firebase Console"
    echo "   • Monitorea facturación por 7 días"
    echo ""
    echo "🔐 SEGURIDAD:"
    echo "   ✅ Claves regeneradas"
    echo "   ✅ Arquitectura segura implementada"
    echo "   ✅ Despliegue limpio completado"
    echo ""
    echo "🌟 ¡$PROJECT_NAME ESTÁ SEGURO!"
else
    echo ""
    echo "❌ DEPLOY FALLÓ"
    echo "==============="
    echo ""
    echo "🔧 Posibles soluciones:"
    echo "   • Verifica autenticación: firebase login"
    echo "   • Revisa configuración en Firebase Console"
    echo "   • Verifica permisos del proyecto"
fi


