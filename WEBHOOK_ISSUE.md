# ⚠️ PROBLEMA CRÍTICO: Bot no responde en Telegram

## 🔥 Causa Más Común: WEBHOOK ACTIVO

Si tu bot **NO RESPONDE** en Telegram pero Railway muestra que está "funcionando", el problema más probable es un **webhook activo** que impide el polling.

---

## 🔍 Diagnóstico Rápido

### En tu máquina local (con .env configurado):

```bash
npm run check-webhook
```

### Manualmente con curl:

```bash
# Reemplaza TU_TOKEN con tu token real
curl https://api.telegram.org/botTU_TOKEN/getWebhookInfo
```

Si ves algo como esto:
```json
{
  "ok": true,
  "result": {
    "url": "https://alguna-url.com/webhook",  ← ⚠️ PROBLEMA!
    ...
  }
}
```

**¡Tienes un webhook activo!** Esto impide que el bot use polling.

---

## ✅ Solución Inmediata

### Opción 1: Usar el script (Local)

```bash
npm run check-webhook
```

Sigue las instrucciones en pantalla para eliminar el webhook.

### Opción 2: Manual con curl

```bash
# Eliminar webhook y actualizar pendientes
curl "https://api.telegram.org/botTU_TOKEN/deleteWebhook?drop_pending_updates=true"
```

Deberías recibir:
```json
{"ok": true, "result": true, "description": "Webhook was deleted"}
```

### Opción 3: En Railway (Automático)

El bot ahora ejecuta automáticamente `scripts/pre-start.sh` que:
1. Verifica si hay webhook
2. Lo elimina si existe
3. Inicia el bot con polling

**Comando de inicio en Railway debe ser:**
```bash
npm run build && npm run worker
```

---

## 🤔 ¿Por Qué Sucede Esto?

1. **Configuración previa de webhook**: Si antes usaste el bot con webhooks
2. **Otro servicio**: Si otro servicio configuró un webhook
3. **Tests**: Al probar configuraciones de webhook

### Diferencia entre Webhook y Polling

| Método | Cómo funciona | Cuándo usar |
|--------|---------------|-------------|
| **Polling** | Bot consulta a Telegram constantemente | Railway, servidores sin dominio |
| **Webhook** | Telegram envía updates a tu URL | Producción con dominio HTTPS |

**Railway sin dominio = DEBES usar POLLING**

---

## 📊 Verificar que el Bot Funciona

Después de eliminar el webhook:

1. **Reinicia el servicio en Railway**
   - Ve a tu proyecto en Railway
   - Click en "Deploy" → "Restart"

2. **Revisa los logs en Railway**
   Deberías ver:
   ```
   [INFO] ... - 🚀 Iniciando openclaw-railway-bot worker...
   [INFO] ... - ✅ Configuración validada
   🤖 Bot de Telegram iniciando con long polling...
   ✅ Bot @tu_bot_username conectado exitosamente
      ID: 123456789
      Nombre: Tu Bot
   [INFO] ... - ✅ Bot de Telegram iniciado correctamente
   ```

3. **Prueba en Telegram**
   - Abre Telegram
   - Busca tu bot
   - Envía `/start`
   - **Deberías recibir respuesta inmediata**

---

## 🐛 Otros Problemas Comunes

### Bot no responde después de eliminar webhook

**Posibles causas:**

1. **Token incorrecto en Railway**
   - Verifica: Settings → Variables → TELEGRAM_BOT_TOKEN
   - Debe ser exactamente el token de @BotFather

2. **Bot no reiniciado**
   - Railway no siempre reinicia automáticamente
   - Fuerza un restart manual

3. **Logs en Railway muestran errores**
   - Ve a Deployments → Logs
   - Busca líneas con [ERROR]

4. **Token de otro bot**
   - Verifica que el token corresponde al bot correcto
   - Usa: `curl https://api.telegram.org/bot<TOKEN>/getMe`

---

## 🔧 Correcciones Aplicadas

### 1. ✅ Handler de mensajes corregido

**Problema anterior:**
```typescript
bot.on("message:text", async (ctx) => { /* ... */ });
bot.on("message", async (ctx) => { /* ← Esto capturaba TODOS los mensajes */ });
```

**Solución:**
- Eliminado el handler genérico `bot.on("message")` que interceptaba todo
- Solo queda `bot.on("message:text")` para mensajes de texto

### 2. ✅ Logs detallados agregados

Ahora verás en Railway:
```
[UPDATE] Tipo: text, De: 123456789, Username: @usuario
[COMMAND] /start recibido de 123456789
[HANDLER] Mensaje de texto recibido de 123456789: hola
[HANDLER] Respuesta enviada exitosamente a 123456789
```

### 3. ✅ Información de bot al iniciar

Ahora muestra:
```
✅ Bot @tu_bot_username conectado exitosamente
   ID: 123456789
   Nombre: Tu Bot
```

### 4. ✅ Pre-start script automático

El comando `npm run worker` ahora:
1. Ejecuta `pre-start.sh` (elimina webhook si existe)
2. Inicia el bot con polling

---

## 📚 Comandos Útiles

```bash
# Verificar webhook (local)
npm run check-webhook

# Ver información del bot
curl https://api.telegram.org/bot<TOKEN>/getMe

# Ver webhook actual
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Eliminar webhook
curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook?drop_pending_updates=true"

# Ver updates pendientes (debug)
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

---

## ✅ Checklist Final

- [ ] Webhook eliminado (`npm run check-webhook` o curl)
- [ ] Variables de entorno correctas en Railway
- [ ] Comando de inicio: `npm run build && npm run worker`
- [ ] Servicio reiniciado en Railway
- [ ] Logs muestran "Bot @username conectado exitosamente"
- [ ] `/start` en Telegram recibe respuesta

---

## 🆘 Si Aún No Funciona

1. **Ejecuta localmente primero:**
   ```bash
   # Asegúrate de tener .env configurado
   npm run build
   npm run worker
   ```

2. **Si funciona local pero no en Railway:**
   - Revisa las variables de entorno en Railway
   - Compara con tu .env local
   - Verifica que el token es EXACTAMENTE el mismo

3. **Contacta con los logs:**
   - Copia los logs completos de Railway
   - Busca líneas con [ERROR] o [WARN]
   - Busca "Bot @username conectado exitosamente"

---

**TL;DR:** El webhook activo impide el polling. Ejecuta `npm run check-webhook` y elimina el webhook. Luego reinicia en Railway.
