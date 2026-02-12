#!/bin/bash

# Script de diagnóstico para openclaw-railway-bot
# Verifica que todo esté configurado correctamente

echo "======================================"
echo "🔍 DIAGNÓSTICO DEL BOT DE TELEGRAM"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de problemas
PROBLEMS=0

# 1. Verificar archivo .env
echo "1. Verificando archivo .env..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
    
    # Verificar variables obligatorias
    echo ""
    echo "   Verificando variables obligatorias:"
    
    if grep -q "^TELEGRAM_BOT_TOKEN=.\+" .env 2>/dev/null; then
        echo -e "   ${GREEN}✅ TELEGRAM_BOT_TOKEN configurado${NC}"
    else
        echo -e "   ${RED}❌ TELEGRAM_BOT_TOKEN no configurado${NC}"
        PROBLEMS=$((PROBLEMS + 1))
    fi
    
    if grep -q "^OPENROUTER_API_KEY=.\+" .env 2>/dev/null; then
        echo -e "   ${GREEN}✅ OPENROUTER_API_KEY configurado${NC}"
    else
        echo -e "   ${RED}❌ OPENROUTER_API_KEY no configurado${NC}"
        PROBLEMS=$((PROBLEMS + 1))
    fi
    
    if grep -q "^SERPER_API_KEY=.\+" .env 2>/dev/null; then
        echo -e "   ${GREEN}✅ SERPER_API_KEY configurado (opcional)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  SERPER_API_KEY no configurado (opcional - para búsquedas)${NC}"
    fi
else
    echo -e "${RED}❌ Archivo .env no existe${NC}"
    echo -e "${YELLOW}   Ejecuta: cp .env.example .env${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""

# 2. Verificar node_modules
echo "2. Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
else
    echo -e "${RED}❌ Dependencias no instaladas${NC}"
    echo -e "${YELLOW}   Ejecuta: npm install${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""

# 3. Verificar compilación
echo "3. Verificando compilación..."
if [ -d "dist" ]; then
    if [ -f "dist/worker.js" ]; then
        echo -e "${GREEN}✅ Proyecto compilado correctamente${NC}"
    else
        echo -e "${YELLOW}⚠️  Proyecto no compilado completamente${NC}"
        echo -e "${YELLOW}   Ejecuta: npm run build${NC}"
        PROBLEMS=$((PROBLEMS + 1))
    fi
else
    echo -e "${RED}❌ Proyecto no compilado${NC}"
    echo -e "${YELLOW}   Ejecuta: npm run build${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""

# 4. Verificar Node.js
echo "4. Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
    
    # Verificar versión mínima (18.0.0)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo -e "   ${GREEN}✅ Versión compatible (≥18.0.0)${NC}"
    else
        echo -e "   ${RED}❌ Versión incompatible (requiere ≥18.0.0)${NC}"
        PROBLEMS=$((PROBLEMS + 1))
    fi
else
    echo -e "${RED}❌ Node.js no instalado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""

# 5. Verificar TypeScript
echo "5. Verificando TypeScript..."
if npm list typescript &> /dev/null; then
    TS_VERSION=$(npm list typescript --depth=0 | grep typescript | cut -d'@' -f2)
    echo -e "${GREEN}✅ TypeScript instalado: $TS_VERSION${NC}"
else
    echo -e "${RED}❌ TypeScript no instalado${NC}"
    PROBLEMS=$((PROBLEMS + 1))
fi

echo ""

# 6. Test de conexión API (opcional, solo si hay variables)
echo "6. Verificando conectividad..."
if [ -f ".env" ] && grep -q "^TELEGRAM_BOT_TOKEN=.\+" .env 2>/dev/null; then
    echo "   Verificando Telegram API..."
    
    # Cargar variable de entorno
    export $(grep "^TELEGRAM_BOT_TOKEN=" .env | xargs)
    
    # Test simple de API (solo verifica formato, no hace llamada real)
    if [[ $TELEGRAM_BOT_TOKEN =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]]; then
        echo -e "   ${GREEN}✅ Token de Telegram tiene formato válido${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Token de Telegram puede tener formato inválido${NC}"
    fi
else
    echo -e "   ${YELLOW}⚠️  No se puede verificar (falta configuración)${NC}"
fi

echo ""
echo "======================================"

# Resumen final
if [ $PROBLEMS -eq 0 ]; then
    echo -e "${GREEN}✅ TODO LISTO - No se encontraron problemas${NC}"
    echo ""
    echo "Para iniciar el bot:"
    echo "  npm run worker:dev   (desarrollo con watch)"
    echo "  npm run worker       (producción)"
else
    echo -e "${RED}❌ SE ENCONTRARON $PROBLEMS PROBLEMA(S)${NC}"
    echo ""
    echo "Revisa los mensajes anteriores y corrige los errores."
    echo "Documentación: DIAGNOSTIC_REPORT.md"
fi

echo "======================================"
