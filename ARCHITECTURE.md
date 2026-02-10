# Arquitectura del Proyecto

Documento detallado sobre la arquitectura y diseño de `openclaw-railway-bot`.

## Componentes Principales

```
┌─────────────────────────────────────────────┐
│         TELEGRAM BOT (grammy)               │
│  ┌───────────────────────────────────────┐  │
│  │ Commands: /start, /help, /clear, etc │  │
│  │ Message Handlers & Event Processing   │  │
│  └───────────────────────────────────────┘  │
└────────────────┬────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │  LLM Provider    │
        │  (OpenRouter)    │
        │  Claude 3 Haiku  │
        └────────┬─────────┘
                 │
┌────────────────▼────────────────────────────┐
│      Browser Automation (MCP Playwright)    │
│  ┌───────────────────────────────────────┐  │
│  │ Navigation, Data Extraction, Clicking │  │
│  │ HTML Parsing & DOM Manipulation       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Módulos por Función

### 1. Telegram Bot (`src/telegram/`)

**`bot.ts`**: Instancia principal del bot
- Utiliza `grammy` framework
- Gestiona conexión con API de Telegram
- Centro de "routing" de comandos

**`handlers.ts`**: Controladores de eventos
- `/start` - Inicializar
- `/help` - Mostrar help
- `/clear` - Limpiar conversación
- `/status` - Estado del bot
- 💬 Mensajes de texto → Procesamiento con LLM

### 2. LLM (`src/llm/`)

**`openrouter.ts`**: Cliente HTTP a OpenRouter
- Encapsula la API de OpenRouter
- Retry automático con backoff exponencial
- Conversación multi-turno (historial)
- Modelo: `anthropic/claude-3-haiku`

**Características:**
- Rate limiting
- Error handling
- Token counting para monitoreo

### 3. MCP Playwright (`src/mcp/`)

**`playwright.ts`**: Integración con navegador
- Navegar a URLs
- Extraer texto y HTML
- Hacer clicks en elementos
- Completar formularios

**Estado actual**: Framework preparado, implementación pendiente

### 4. API & Webhooks (`src/api/`)

**`webhooks.ts`**: Manejador de webhooks
- Cola asincrónica de webhooks
- Procesamiento no bloqueante
- Extendible para integraciones externas

### 5. Configuración (`src/config.ts`)

- Centraliza todas las variables de ambiente
- Validación de config al inicio
- Valores por defecto sensatos

## Flujo de Datos

### Cuando llega un mensaje de usuario:

```
1. Telegram API → Bot (webhook o polling)
                ↓
2. Handler procesa el mensaje
                ↓
3. Obtiene/crea contexto de conversación (store en memoria)
                ↓
4. Llama a OpenRouter con historial
                ↓
5. OpenRouter → Claude Haiku procesa
                ↓
6. Respuesta se agrega al historial
                ↓
7. Envía respuesta a usuario por Telegram
```

## Contexto de Conversación

Almacenamiento en memoria (Map):

```typescript
conversationContexts: Map<userId, Array<{
  role: "user" | "assistant",
  content: string
}>>
```

**Limpieza:**
- Máximo 50 mensajes por usuario
- Se usa `/clear` para borrar manual
- En futuro: TTL automático

## Performance & Optimizaciones

- **Batching**: Telegram solo permite cierta velocidad
- **Retry**: Automático con backoff
- **Timeouts**: 30s por defecto
- **Historial limitado**: Últimos 10 mensajes para contexto

## Escalabilidad Futura

### Database (No implementado aún)
- PostgreSQL para persistencia
- Redis para caché
- Guardar conversaciones

### Métricas
- Prometheus para monitoreo
- Logs estructurados JSON
- Alertas en Railway

## Variables de Entorno Utilizadas

| Variable | Usar en | Requerido |
|----------|---------|-----------|
| `TELEGRAM_BOT_TOKEN` | `telegram/bot.ts` | ✅ Sí |
| `OPENROUTER_API_KEY` | `llm/openrouter.ts` | ✅ Sí |
| `NODE_ENV` | `config.ts` | ❌ No |
| `LOG_LEVEL` | Futura implementación | ❌ No |
| `MCP_PLAYWRIGHT_BROWSER` | `mcp/playwright.ts` | ❌ No |

## Deployment Architecture

### Local Development
- Polling (encuestas) a Telegram
- Worker.ts en desarrollo
- Logs en consola

### Railway (Producción)
- Worker process (no web)
- Auto-restart on crash
- Environment variables via Railway
- Logs disponibles en dashboard

## Extensibilidad

### Agregar nuevo comando
1. Crear handler en `handlers.ts`
2. Registrar con `bot.command("nombre", handler)`

### Agregar nueva integración LLM
1. Crear cliente similar a `openrouter.ts`
2. Implementar interfaz `generateResponse()`
3. Usar en place de OpenRoute

### Agregar webhook externo
1. Crear handler en `api/webhooks.ts`
2. Registrar con `webhookManager.registerWebhook()`
3. Exponer HTTP endpoint (futuro)

## Seguridad

✅ Implementado:
- Validación de config al inicio
- HTTPS para comunicación (handled por librerías)
- Variables sensibles en `.env`

🔧 Por implementar:
- Rate limiting por usuario
- Validación de firmas de Telegram
- Encryption de contexto sensible
- Audit logging

## Monitoreo

**Health Check:**
- Bot hace ping cada 5 minutos (verificación interna)
- `/status` expone métrica de uptime

**Logs:**
- Console logs con timestamps
- Niveles: INFO, WARN, ERROR
- Por implementar: Structured logging

## Costos Esperados

**Sobre $17 USD de OpenRouter:**
- Input tokens: $0.08/1M
- Output tokens: $0.24/1M
- Claude 3 Haiku es el modelo más barato
- Estimado: Varias semanas de uso moderado
