#!/bin/bash

# Script de Verificación Pre-Deploy
# Ejecuta verificaciones básicas antes de hacer push

echo "🔍 Verificando proyecto..."

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ Falta: $1"
        exit 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
    else
        echo "❌ Falta: $1/"
        exit 1
    fi
}

echo ""
echo "📁 Estructura de archivos:"
check_file "package.json"
check_file "tsconfig.json"
check_file "railway.json"
check_file ".env.example"
check_file ".gitignore"
check_file "Dockerfile"
check_file "README.md"
check_file "DEPLOYMENT.md"
check_file "ARCHITECTURE.md"

echo ""
echo "📂 Directorios:"
check_dir "src"
check_dir "src/telegram"
check_dir "src/llm"
check_dir "src/mcp"
check_dir "src/api"

echo ""
echo "🔧 Compilación:"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Build falló"
    exit 1
fi

echo ""
echo "✨ Verificación completada. Listo para deploy!"
echo ""
echo "Próximos pasos:"
echo "1. Verifica git status: git status"
echo "2. Haz commit: git commit -m 'Initial commit: openclaw-railway-bot'"
echo "3. Push: git push origin main"
echo "4. Ahora configura variables de entorno en Railway"
