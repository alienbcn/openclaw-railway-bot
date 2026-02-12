#!/bin/bash
# Script para verificar variables de entorno críticas

echo "🔍 Verificando variables de entorno críticas..."
echo ""

check_var() {
  local var_name=$1
  if [ -z "${!var_name}" ]; then
    echo "❌ $var_name: NO configurada"
    return 1
  else
    local value="${!var_name}"
    local length=${#value}
    echo "✅ $var_name: Configurada (longitud: $length caracteres)"
    return 0
  fi
}

# Verificar variables críticas
check_var "TELEGRAM_BOT_TOKEN"
check_var "GEMINI_API_KEY"
check_var "SERPER_API_KEY"
check_var "OPENROUTER_API_KEY"

echo ""
echo "🌍 Variables de entorno disponibles (nombres solamente):"
env | cut -d= -f1 | sort

echo ""
echo "📋 NODE_ENV: ${NODE_ENV:-'no configurado'}"
echo "📋 RAILWAY_STATIC_URL: ${RAILWAY_STATIC_URL:-'no configurado'}"
