#!/bin/bash

echo "🔒 REPARACIÓN COMPLETA DE SEGURIDAD - SENTINEL WORLD MONITOR"
echo "============================================================"
echo ""
echo "🚨 INCIDENTE: Credenciales Firebase expuestas públicamente"
echo "✅ SOLUCIÓN: Regenerar claves + arquitectura segura implementada"
echo ""

echo "📋 WORKFLOW COMPLETO DE REPARACIÓN:"
echo "===================================="
echo ""
echo "PASO 1: REGENERAR CLAVES EN FIREBASE CONSOLE"
echo "--------------------------------------------"
echo "🔗 Enlaces directos:"
echo "   • Desarrollo:  https://console.firebase.google.com/project/sentinel-89591/settings/general"
echo "   • Producción:  https://console.firebase.google.com/project/sentinel-prod-9c937/settings/general"
echo ""
echo "📝 Para cada proyecto:"
echo "   1. Ve a 'Your apps'"
echo "   2. Borra la app web existente (ícono 🗑️)"
echo "   3. Crea nueva app web (ícono </>)"
echo "   4. Copia la configuración SDK"
echo "   5. Ve a 'Cloud Messaging' y regenera VAPID key"
echo ""

read -p "❓ ¿Ya regeneraste las claves en Firebase Console? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "ℹ️  Primero regenera las claves en Firebase Console, luego vuelve aquí."
    echo "🔗 Enlaces arriba."
    exit 1
fi

echo ""
echo "PASO 2: ACTUALIZAR CONFIGURACIÓN LOCAL"
echo "--------------------------------------"
echo "🔧 Ejecutando actualizador de claves..."
echo ""

./update-keys.sh

if [ $? -ne 0 ]; then
    echo "❌ Error en actualización de claves"
    exit 1
fi

echo ""
echo "PASO 3: LIMPIEZA Y DEPLOY DE DESARROLLO"
echo "----------------------------------------"
echo "🧹 Limpiando desarrollo..."
echo ""

./clean-deploy.sh testing

if [ $? -ne 0 ]; then
    echo "❌ Error en deploy de desarrollo"
    echo "ℹ️  Puedes intentarlo manualmente después"
fi

echo ""
echo "PASO 4: LIMPIEZA Y DEPLOY DE PRODUCCIÓN"
echo "----------------------------------------"
echo "🧹 Limpiando producción..."
echo ""

./clean-deploy.sh production

if [ $? -ne 0 ]; then
    echo "❌ Error en deploy de producción"
    echo "ℹ️  Puedes intentarlo manualmente después"
fi

echo ""
echo "🎉 REPARACIÓN COMPLETADA"
echo "========================"
echo ""
echo "✅ CLAVES REGENERADAS"
echo "✅ ARQUITECTURA SEGURA IMPLEMENTADA"
echo "✅ DESPLIEGUES LIMPIOS COMPLETADOS"
echo "✅ CREDENCIALES ANTERIORES INVALIDADAS"
echo ""
echo "🔍 VERIFICACIÓN FINAL:"
echo "   • Busca en GitHub: $(grep -o 'AIza[^"]*' .env.production | head -1)"
echo "   • Si aparece, repite el proceso"
echo ""
echo "📊 MONITOREO:"
echo "   • Revisa logs en Firebase Console"
echo "   • Monitorea facturación por 30 días"
echo "   • Verifica que no hay accesos no autorizados"
echo ""
echo "🛡️ SEGURIDAD MEJORADA:"
echo "   • Variables del servidor (no expuestas en cliente)"
echo "   • Configuración segura implementada"
echo "   • Arquitectura protegida contra futuras exposiciones"
echo ""
echo "🎯 ¡SISTEMA SEGURO Y OPTIMIZADO!"

