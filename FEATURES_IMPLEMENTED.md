# Características Implementadas - Serper + Playwright

## Resumen
Se han implementado dos funcionalidades principales en el bot de Telegram:

### 1. **Búsqueda de Bitcoin con Serper** (`/bitcoin`)
- Archivo: [src/llm/serper.ts](src/llm/serper.ts)
- Función: `getBitcoinPrice()`
- Requiere: `SERPER_API_KEY` configurada en variables de entorno
- Respuesta: Precio actual de Bitcoin + fuente + timestamp

### 2. **Scraping de Noticias con Playwright** (`/news`)
- Archivo: [src/mcp/playwright.ts](src/mcp/playwright.ts)
- Función: `scrapeElPais()`
- Usa: Chromium con `--no-sandbox` (compatible con Railway/Docker)
- Respuesta: Titular principal de El País + fuente + timestamp

### 3. **Integración en Bot de Telegram**
- Archivo: [src/telegram/handlers.ts](src/telegram/handlers.ts)
- Nuevos comandos: `/bitcoin` y `/news`
- Ambos incluyen manejo de errores y mensajes descriptivos

## Cambios Realizados

### 📦 package.json
```diff
+ "playwright": "^1.40.0"
```

### ⚙️ tsconfig.json
```diff
- "lib": ["ES2020"],
+ "lib": ["ES2020", "DOM"],
```

### 🔍 src/llm/serper.ts
```typescript
async getBitcoinPrice(): Promise<{
  price: string;
  source: string;
  timestamp: string;
}> { ... }
```

### 🎭 src/mcp/playwright.ts
```typescript
// Inicialización con argumentos railway-safe
const browserArgs = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

// Scraping de El País
async scrapeElPais(): Promise<{ ... }>
```

### 🤖 src/telegram/handlers.ts
```typescript
// Nuevo comando /bitcoin
bot.command("bitcoin", async (ctx) => { ... });

// Nuevo comando /news
bot.command("news", async (ctx) => { ... });
```

## Variables de Entorno Requeridas

### En Railway o .env local:
```bash
TELEGRAM_BOT_TOKEN=tu_token_aqui
OPENROUTER_API_KEY=tu_api_key
SERPER_API_KEY=tu_serper_key  # IMPORTANTE para /bitcoin
```

## Cómo Ejecutar

### Desarrollo Local
```bash
npm install              # Instala Playwright
npm run typecheck        # Verifica tipos
npm run build           # Compila TypeScript
npm run dev             # Ejecuta en modo watch
```

### En Producción (Railway)
```bash
npm install
npm run build
npm start
```

## Comandos del Bot

| Comando | Función |
|---------|---------|
| `/start` | Inicia conversación |
| `/help` | Muestra comandos disponibles |
| `/bitcoin` | Obtiene precio de Bitcoin en USD |
| `/news` | Extrae noticia principal de El País |
| `/status` | Estado del bot (uptime) |
| `/clear` | Limpia historial de conversación |

## Notas de Railway

- **Dockerfile** ya incluye instalación de dependencias del sistema
- **`--no-sandbox`**: Requerido en contenedores Linux sin privilegios
- **Memory**: Playwright usa ~150MB por instancia abierta
- **Timeout**: Configurado a 30s para navegación web

## Pruebas

Una vez ejecutando el bot:
```bash
# En Telegram
/bitcoin  # Debería devolver precio actual
/news     # Debería devolver titular de El País
```

## Troubleshooting

### Error: "SERPER_API_KEY no está configurada"
→ Verificar variable en Railway o .env local

### Error: "Browser no inicializado"
→ Asegurar que `npm install playwright` se ejecutó

### Error: "Cannot find module 'playwright'"
→ Ejecutar: `npm install playwright`

## Archivos Modificados

1. ✅ [package.json](package.json)
2. ✅ [tsconfig.json](tsconfig.json)
3. ✅ [src/llm/serper.ts](src/llm/serper.ts)
4. ✅ [src/mcp/playwright.ts](src/mcp/playwright.ts)
5. ✅ [src/telegram/handlers.ts](src/telegram/handlers.ts)

---

**Fecha de implementación**: February 10, 2026
**Estado**: ✅ Compilando correctamente, listo para ejecutar
