# Guía de Configuración Railway - OpenClaw Bot 🚂

## ✅ Estado de la Configuración

### 1. Archivos de Configuración Verificados

#### `railway.json` ✅ CORRECTO
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**✅ Configuración correcta:**
- Comando de build: `npm install && npm run build`
- Comando de inicio: `npm start` (ejecuta `node dist/index.js`)
- Health check: `/health` en el puerto configurado
- Reinicio automático en caso de fallo

#### `nixpacks.toml` ✅ CORRECTO
```toml
providers = ["nodejs"]

[phases.setup]
nixPkgs = ["nodejs-18_x", "playwright-driver", "chromium"]

[phases.install]
cmds = [
  "npm ci",
  "npx playwright install --with-deps chromium"
]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

**✅ Configuración correcta:**
- Node.js 18.x instalado
- Playwright y Chromium configurados para navegación web
- Instalación de dependencias y build automáticos

---

## 🔌 Arquitectura: Polling vs Webhooks

### ⚡ Este Bot Usa POLLING (No Webhooks)

**¿Qué significa esto?**

El bot usa **polling** (escucha activa), lo que significa:

✅ **VENTAJAS:**
- ✅ No necesitas configurar webhooks en Telegram
- ✅ No necesitas exponer puertos públicos para Telegram
- ✅ No necesitas un dominio o URL pública
- ✅ Funciona detrás de firewalls y NAT sin problemas
- ✅ Más simple de configurar

📝 **IMPORTANTE:**
- El bot SE CONECTA activamente a Telegram para recibir mensajes
- Railway solo necesita el puerto 3000 para el health check (interno)
- El bot funciona 24/7 sin necesidad de webhooks

**Confirmación en el código (bot.ts línea 208):**
```typescript
await this.bot.launch();  // Usa polling por defecto en Telegraf
```

---

## 🚀 Pasos Exactos para Conectar en Railway

### Opción A: Despliegue desde GitHub (RECOMENDADO)

#### Paso 1: Acceder a Railway
1. Ve a [railway.app](https://railway.app)
2. Inicia sesión con tu cuenta (si no tienes, crea una)
3. Conecta tu cuenta de GitHub cuando te lo pida

#### Paso 2: Crear Nuevo Proyecto
1. Haz clic en **"New Project"** (botón azul en la esquina superior derecha)
2. Selecciona **"Deploy from GitHub repo"**
3. Si es la primera vez, Railway pedirá permisos para acceder a tus repositorios

#### Paso 3: Conectar el Repositorio Específico
1. En la lista, busca: **`alienbcn/openclaw-railway-bot`**
2. Si no aparece:
   - Haz clic en **"Configure GitHub App"**
   - Autoriza el acceso al repositorio específico
   - Vuelve a Railway y recarga la página
3. Selecciona **`alienbcn/openclaw-railway-bot`** de la lista
4. Haz clic en **"Deploy Now"**

#### Paso 4: Railway Detectará Automáticamente
Railway detectará:
- ✅ `railway.json` → Configuración de despliegue
- ✅ `nixpacks.toml` → Configuración de build
- ✅ `package.json` → Dependencias de Node.js

#### Paso 5: Configurar Variables de Entorno (CRÍTICO)
**ANTES de que el bot funcione, DEBES configurar estas variables:**

1. En el panel de Railway, haz clic en tu proyecto
2. Ve a la pestaña **"Variables"**
3. Agrega estas variables (botón "+ New Variable"):

**OBLIGATORIAS:**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx
```

**OPCIONALES (con valores por defecto):**
```env
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
LOG_LEVEL=info
PORT=3000
```

4. Haz clic en **"Add"** o **"Save"** después de cada variable

#### Paso 6: Despliegue Automático
1. Railway iniciará el despliegue automáticamente
2. Verás el progreso en la pestaña **"Deployments"**
3. El build tomará 2-5 minutos (incluye instalación de Playwright)

#### Paso 7: Verificar el Despliegue
1. Ve a la pestaña **"Logs"**
2. Busca estos mensajes:
   ```
   ✅ Starting OpenClaw Railway Bot...
   ✅ Configuration validated
   ✅ Health check server started
   ✅ Telegram bot started successfully
   ✅ OpenClaw Railway Bot is now running 24/7
   ```

### Opción B: Despliegue Manual con Railway CLI

Si prefieres usar la línea de comandos:

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. En el directorio del proyecto
cd openclaw-railway-bot

# 4. Vincular el proyecto
railway link

# 5. Configurar variables de entorno
railway variables set TELEGRAM_BOT_TOKEN="tu_token_aqui"
railway variables set OPENROUTER_API_KEY="tu_api_key_aqui"

# 6. Desplegar
railway up
```

---

## 🔧 Solución de Problemas Comunes

### Problema 1: "El despliegue automático no ha comenzado"

**Causa posible:** Railway no detectó el webhook de GitHub

**Solución:**
1. Ve a tu repositorio en GitHub
2. Settings → Webhooks
3. Verifica que existe un webhook de Railway
4. Si no existe:
   - En Railway: Settings → Integrations → GitHub
   - Reconecta el repositorio
5. Haz un push nuevo o dispara manualmente desde Railway:
   - Deployments → ⋯ (tres puntos) → Redeploy

### Problema 2: "Build Failed" o errores de instalación

**Verificar:**
```bash
# 1. Logs en Railway
# Busca errores de npm o Playwright

# 2. Verificar package.json existe
# 3. Verificar que Node.js version es >= 18
```

**Solución común:**
- Asegúrate de que `nixpacks.toml` especifica `nodejs-18_x`
- Verifica que no hay errores de sintaxis en `package.json`

### Problema 3: Bot no responde en Telegram

**Verificar:**
1. Variables de entorno correctas:
   ```bash
   # En Railway → Variables
   # TELEGRAM_BOT_TOKEN debe tener el formato:
   # 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

2. Bot iniciado:
   ```bash
   # En Logs, busca:
   "Telegram bot started successfully"
   ```

3. Bot token válido:
   - Ve a @BotFather en Telegram
   - Envía `/mybots`
   - Selecciona tu bot
   - Regenera el token si es necesario

### Problema 4: Error de memoria o timeout

**Solución:**
1. En Railway → Settings → Resources
2. Aumenta la memoria (si estás en plan Pro)
3. O ajusta `PLAYWRIGHT_TIMEOUT`:
   ```env
   PLAYWRIGHT_TIMEOUT=60000  # 60 segundos
   ```

### Problema 5: Health check falla

**Verificar:**
```bash
# El servidor HTTP debe estar en el puerto correcto
# Logs debe mostrar:
"Health check server started"
```

**Solución:**
- Asegúrate de que `PORT=3000` está configurado
- El health check endpoint `/health` está en el código (index.ts)

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs en Tiempo Real
1. Railway Dashboard → Tu proyecto
2. Pestaña **"Logs"**
3. Filtra por nivel si es necesario

### Verificar Estado del Bot
En Telegram, envía a tu bot:
```
/status
```

Respuesta esperada:
```
📊 Bot Status

✅ Bot is online and operational
💬 Active conversations: X
🌐 Browser session: Active/Inactive
🤖 Model: anthropic/claude-3.5-sonnet
```

### Health Check Endpoint
Railway monitorea automáticamente:
```
GET https://tu-app.railway.app/health

Respuesta:
{
  "status": "ok",
  "timestamp": "2026-02-10T08:00:00.000Z"
}
```

---

## 💰 Costos Estimados

### Railway
- **Plan Hobby**: $5/mes (500 horas)
- **Plan Pro**: $20/mes (ilimitado)
- Primeras 500 horas/mes gratis

### OpenRouter (Claude 3.5 Sonnet)
- ~$3 por millón de tokens de entrada
- ~$15 por millón de tokens de salida
- Estimado mensual: $5-30 dependiendo del uso

### Total Estimado
- Uso ligero: ~$10/mes
- Uso medio: ~$25/mes
- Uso intensivo: $40+/mes

---

## 🔐 Mejores Prácticas de Seguridad

1. **Nunca commites el archivo `.env`**
   - Ya está en `.gitignore` ✅
   - Usa siempre variables de entorno en Railway

2. **Rota las API keys periódicamente**
   - OpenRouter: Regenera cada 30-90 días
   - Telegram: Regenera si sospechas compromiso

3. **Monitorea el uso**
   - OpenRouter Dashboard: Revisa consumo de tokens
   - Railway Dashboard: Revisa uso de recursos

4. **Mantén dependencias actualizadas**
   ```bash
   npm update
   npm audit fix
   ```

---

## 📞 Soporte Adicional

### Documentación Oficial
- **Railway**: https://docs.railway.app
- **Telegraf**: https://telegraf.js.org
- **OpenRouter**: https://openrouter.ai/docs
- **Playwright**: https://playwright.dev

### Comandos Útiles del Bot
```
/start     - Mensaje de bienvenida
/help      - Información de ayuda
/clear     - Limpiar historial de conversación
/browse    - Navegar a una URL
/screenshot - Captura de pantalla
/status    - Estado del bot
```

### Ejemplos de Uso
```
/browse https://example.com
¿Qué hay en esta página?
/screenshot
```

---

## ✅ Checklist de Despliegue

Usa esta lista para verificar que todo está configurado:

- [ ] Repositorio pusheado a GitHub
- [ ] Cuenta de Railway creada y vinculada a GitHub
- [ ] Proyecto creado en Railway desde el repositorio
- [ ] Variable `TELEGRAM_BOT_TOKEN` configurada
- [ ] Variable `OPENROUTER_API_KEY` configurada
- [ ] Despliegue completado sin errores
- [ ] Logs muestran "Bot is now running 24/7"
- [ ] Bot responde a `/start` en Telegram
- [ ] Bot responde a `/status` en Telegram
- [ ] Health check endpoint funciona

---

**¡Listo! Tu bot debería estar funcionando 24/7 en Railway! 🎉**

Si tienes problemas, revisa la sección de "Solución de Problemas" o verifica los logs en Railway.
