#!/bin/bash

# Script para Railway: Verificar y eliminar webhook antes de iniciar el bot
# Este script se ejecuta automáticamente antes de iniciar el worker

echo "======================================"
echo "🚀 Pre-inicio: Limpieza de Webhook"
echo "======================================"

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ ERROR: TELEGRAM_BOT_TOKEN no está configurado"
    exit 1
fi

echo "✅ Token encontrado"

# Obtener información del webhook
echo "Verificando webhook..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")

# Extraer URL del webhook (si existe)
HAS_WEBHOOK=$(echo "$WEBHOOK_INFO" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

if [ -n "$HAS_WEBHOOK" ] && [ "$HAS_WEBHOOK" != "" ]; then
    echo "⚠️  Webhook detectado: $HAS_WEBHOOK"
    echo "🔧 Eliminando webhook para usar polling..."
    
    DELETE_RESULT=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true")
    
    if echo "$DELETE_RESULT" | grep -q '"ok":true'; then
        echo "✅ Webhook eliminado exitosamente"
    else
        echo "⚠️  Advertencia: No se pudo eliminar el webhook"
        echo "$DELETE_RESULT"
    fi
else
    echo "✅ No hay webhook configurado"
fi

echo "======================================"
echo ""
