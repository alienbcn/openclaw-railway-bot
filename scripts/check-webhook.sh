#!/bin/bash

# Script para verificar y limpiar webhooks de Telegram
# Esto es importante porque un webhook activo impide que funcione el polling

echo "======================================"
echo "🔍 Verificación de Webhooks de Telegram"
echo "======================================"
echo ""

# Verificar que existe el token
if [ ! -f ".env" ]; then
    echo "❌ No se encontró archivo .env"
    echo "   Crea el archivo .env con TELEGRAM_BOT_TOKEN"
    exit 1
fi

# Cargar token
source .env

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN no está configurado en .env"
    exit 1
fi

echo "✅ Token encontrado: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo ""

# Verificar información del bot
echo "1. Verificando información del bot..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe")
echo "$BOT_INFO" | jq '.' 2>/dev/null || echo "$BOT_INFO"
echo ""

# Verificar webhook actual
echo "2. Verificando webhook configurado..."
WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")
echo "$WEBHOOK_INFO" | jq '.' 2>/dev/null || echo "$WEBHOOK_INFO"
echo ""

# Verificar si hay webhook activo
HAS_WEBHOOK=$(echo "$WEBHOOK_INFO" | jq -r '.result.url // empty' 2>/dev/null)

if [ -n "$HAS_WEBHOOK" ] && [ "$HAS_WEBHOOK" != "null" ] && [ "$HAS_WEBHOOK" != "" ]; then
    echo "⚠️  WEBHOOK ACTIVO DETECTADO: $HAS_WEBHOOK"
    echo ""
    echo "   Esto impide que el bot use polling (long polling)."
    echo ""
    read -p "   ¿Deseas eliminar el webhook? (s/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[SsYy]$ ]]; then
        echo ""
        echo "3. Eliminando webhook..."
        DELETE_RESULT=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true")
        echo "$DELETE_RESULT" | jq '.' 2>/dev/null || echo "$DELETE_RESULT"
        echo ""
        
        # Verificar que se eliminó
        echo "4. Verificando eliminación..."
        WEBHOOK_INFO_AFTER=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo")
        echo "$WEBHOOK_INFO_AFTER" | jq '.' 2>/dev/null || echo "$WEBHOOK_INFO_AFTER"
        echo ""
        
        echo "✅ Webhook eliminado. Ahora el bot puede usar polling."
    else
        echo ""
        echo "⚠️  Webhook NO eliminado. El bot NO funcionará con polling."
        echo "   Para que funcione en Railway necesitas:"
        echo "   1. Eliminar el webhook manualmente"
        echo "   2. O configurar el bot para usar webhooks correctamente"
    fi
else
    echo "✅ No hay webhook configurado. El bot puede usar polling correctamente."
fi

echo ""
echo "======================================"
echo "✅ Verificación completada"
echo "======================================"
echo ""
echo "Comandos útiles:"
echo ""
echo "Ver info del bot:"
echo "  curl https://api.telegram.org/bot\$TELEGRAM_BOT_TOKEN/getMe"
echo ""
echo "Ver webhook:"
echo "  curl https://api.telegram.org/bot\$TELEGRAM_BOT_TOKEN/getWebhookInfo"
echo ""
echo "Eliminar webhook:"
echo "  curl https://api.telegram.org/bot\$TELEGRAM_BOT_TOKEN/deleteWebhook?drop_pending_updates=true"
echo ""
