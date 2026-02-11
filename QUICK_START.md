# Quick Start Guide

Guía rápida para poner en marcha el bot de Telegram.

## 🚀 Setup en 5 minutos

### 1. Clonar y instalar
```bash
git clone https://github.com/alienbcn/openclaw-railway-bot.git
cd openclaw-railway-bot
npm install
```

### 2. Crear archivo .env
```bash
cp .env.example .env
# Edita .env y agrega:
# TELEGRAM_BOT_TOKEN=tu_token
# OPENROUTER_API_KEY=tu_api_key
# BRAVE_API_KEY=tu_brave_key
# OPENCLAW_ENABLED=true
# OPENCLAW_CONFIG_PATH=openclaw.json
```

### 3. Compilar y prueba local
```bash
npm run build
npm run dev  # Para desarrollo
```

### 4. Desplegar en Railway
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Luego:
1. Ve a [railway.app](https://railway.app)
2. Conecta GitHub y selecciona `openclaw-railway-bot`
3. Configura variables de entorno (TELEGRAM_BOT_TOKEN, OPENROUTER_API_KEY)
4. Railway desplegará automáticamente

## 📋 Checklist

- [ ] Token de @BotFather obtenido
- [ ] API key de OpenRouter obtenida
- [ ] `.env` configurado localmente
- [ ] Compilación exitosa (`npm run build`)
- [ ] Repositorio en GitHub creado
- [ ] GitHub Secrets configurados
- [ ] Railway conectada
- [ ] Primer deploy completado

## 🔧 Comandos Útiles

```bash
npm run dev          # Desarrollo en tiempo real
npm run build        # Compilar TypeScript
npm run typecheck    # Verificar tipos
npm run worker       # Ejecutar worker (Railway)
npm run worker:dev   # Desarrollo del worker
```

## 🤖 Prueba el Bot

Una vez desplegado en Railway:

1. Abre Telegram
2. Busca y selecciona tu bot
3. Escribe `/start`
4. El bot debería responder

## 📊 Monitoreo

Para verificar el estado del bot:

```bash
# En Telegram, envía:
/status
```

El bot responderá con:
- Estado actual
- Tiempo activo (uptime)
- Versión
- Plataforma de despliegue

## ⚠️ Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| Bot no responde | Verifica variables de entorno en Railway |
| No hay busqueda web | Revisa BRAVE_API_KEY y OPENCLAW_ENABLED |
| Error de OpenRouter | Comprueba saldo en openrouter.ai |
| Build falla | Ejecuta `npm install` nuevamente |
| TypeScript errors | Ejecuta `npm run typecheck` |

## 📚 Documentación Completa

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Despliegue en detail
- [SECRETS_SETUP.md](./SECRETS_SETUP.md) - Variables de entorno
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guía de desarrollo
- [README.md](./README.md) - Descripción general

## 🆘 Soporte

Para problemas:

1. Revisa los logs en Railway
2. Verifica configuración en SECRETS_SETUP.md
3. Abre un issue en GitHub

---

**¡Eso es! Tu bot debería estar corriendo 24/7 en Railway.**
