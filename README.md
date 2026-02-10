# openclaw-railway-bot

Bot de Telegram persistente (24/7) desplegado en Railway, utilizando OpenClaw como framework y OpenRouter como motor de LLM.

## Características

- 🤖 Bot de Telegram con inteligencia artificial
- 🚀 Despliegue en Railway (worker process, 24/7)
- 🧠 Powered by OpenRouter + Claude 3 Haiku
- 🎯 Framework OpenClaw de Anthropic
- 🌐 MCP Playwright para navegación web autónoma
- 🔌 Webhooks y APIs externas
- 📦 Tipo: Escaneo, Análisis e Integración

## Requisitos Previos

- Node.js >= 18.0.0
- npm o yarn
- Github account
- Railway account
- Variables de entorno configuradas

## Variables de Entorno Requeridas

```
TELEGRAM_BOT_TOKEN=tu_token_aqui
OPENROUTER_API_KEY=tu_clave_aqui
NODE_ENV=production
```

**✅ Validado:** Todo configurado para Railway deployment

## Instalación

```bash
git clone https://github.com/alienbcn/openclaw-railway-bot.git
cd openclaw-railway-bot
npm install
```

## Desarrollo

```bash
npm run dev        # Bot en tiempo real
npm run worker:dev # Worker process
```

## Despliegue

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
📦 openclaw-railway-bot
├── src/
│   ├── index.ts              # Punto de entrada principal
│   ├── worker.ts             # Worker process para Railway
│   ├── config.ts             # Configuración del bot
│   ├── telegram/
│   │   ├── bot.ts            # Instancia del bot
│   │   ├── handlers.ts       # Handlers de mensajes
│   │   └── commands.ts       # Comandos del bot
│   ├── llm/
│   │   ├── openrouter.ts     # Cliente OpenRouter
│   │   └── models.ts         # Definición de modelos
│   ├── mcp/
│   │   ├── playwright.ts     # MCP Playwright integration
│   │   └── tools.ts          # Herramientas disponibles
│   ├── api/
│   │   ├── webhooks.ts       # Manejadores de webhooks
│   │   ├── handlers.ts       # Controladores HTTP
│   │   └── middleware.ts     # Middleware
│   └── utils/
│       ├── logger.ts         # Sistema de logs
│       └── types.ts          # Tipos TypeScript
├── .env.example
├── package.json
├── tsconfig.json
├── railway.json
└── README.md
```

## Configuración en Railway

El bot está configurado como **worker process** (no web) para garantizar:
- ✅ Disponibilidad 24/7 sin timeouts
- ✅ Autogestión del ciclo de vida
- ✅ Sin reinicio manual requerido

## Desarrollo Activo

Este proyecto está en desarrollo activo. Los cambios se despliegan automáticamente en Railway.

## Licencia

MIT

## Soporte

Para soporte, reporta issues en GitHub.
