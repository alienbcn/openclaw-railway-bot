# 🚀 Instrucciones Para Railway - ACCIÓN INMEDIATA

## ⚡ Problema Identificado

Tu bot está corriendo en Railway pero **un webhook activo** impide que reciba mensajes de Telegram.

---

## ✅ SOLUCIÓN EN 3 PASOS

### 📍 Paso 1: Eliminar el Webhook (CRÍTICO)

Ejecuta este comando (reemplaza `TU_TOKEN` con tu token real de Telegram):

```bash
curl "https://api.telegram.org/botTU_TOKEN/deleteWebhook?drop_pending_updates=true"
```

**Debes ver:**
```json
{"ok":true,"result":true,"description":"Webhook was deleted"}
```

✅ Si ves esto, el webhook fue eliminado.

---

### 📍 Paso 2: Actualizar el Código en Railway

Railway debe detectar los nuevos cambios automáticamente cuando hagas push:

```bash
git add .
git commit -m "Fix: Eliminar webhook automáticamente y corregir handlers"
git push origin main
```

Railway empezará a desplegar automáticamente.

---

### 📍 Paso 3: Verificar el Comando de Inicio

1. Ve a tu proyecto en **Railway**
2. Haz clic en tu servicio
3. Ve a **Settings** → **Deploy**
4. En **"Start Command"** debe estar:

```bash
npm run build && npm run worker
```

✅ Este comando ahora elimina el webhook automáticamente antes de iniciar.

---

## 🔍 Verificar que Funciona

### En Railway → Deployments → Logs

Busca estas líneas **en orden**:

```
======================================
🚀 Pre-inicio: Limpieza de Webhook
======================================
✅ Token encontrado
Verificando webhook...
✅ No hay webhook configurado
======================================

[INFO] 2026-02-11T... - 🚀 Iniciando openclaw-railway-bot worker...
[INFO] 2026-02-11T... - ✅ Configuración validada
[HANDLERS] Todos los handlers registrados correctamente
🤖 Bot de Telegram iniciando con long polling...
✅ Bot @tu_bot_username conectado exitosamente
   ID: 123456789
   Nombre: Tu Bot Name
[INFO] 2026-02-11T... - ✅ Bot de Telegram iniciado correctamente
[INFO] 2026-02-11T... - 🔄 Bot 24/7 activado. Escuchando mensajes...
```

**Puntos clave a verificar:**

✅ `✅ Token encontrado`  
✅ `✅ No hay webhook configurado` o `✅ Webhook eliminado exitosamente`  
✅ `🤖 Bot de Telegram iniciando con long polling...`  
✅ `✅ Bot @tu_bot_username conectado exitosamente`  
✅ **NO debe haber líneas con `[ERROR]`**

---

## 💬 Probar en Telegram

1. Abre **Telegram**
2. Busca tu bot  
3. Envía: `/start`

**Debes recibir:**
```
¡Hola! 👋 Soy un bot de Telegram inteligente.

Puedo:
- 💬 Mantener conversaciones
- 🌐 Navegar por internet
- 📊 Analizar información

¿En qué puedo ayudarte?
```

Si recibes este mensaje → **✅ PROBLEMA RESUELTO**

---

## ⚠️ Si NO Recibes Respuesta

### Opción A: Forzar Restart en Railway

1. Ve a **Deployments**
2. Click en los 3 puntos `...`
3. **Restart**
4. Espera 30-60 segundos
5. Prueba de nuevo en Telegram

### Opción B: Verificar Webhook de Nuevo

```bash
# Ver si todavía hay webhook
curl https://api.telegram.org/botTU_TOKEN/getWebhookInfo
```

Debe mostrar: `"url": ""`

Si muestra una URL, elimínalo de nuevo:
```bash
curl "https://api.telegram.org/botTU_TOKEN/deleteWebhook?drop_pending_updates=true"
```

Luego reinicia en Railway.

### Opción C: Verificar Variables de Entorno

En Railway → Settings → Variables:

✅ `TELEGRAM_BOT_TOKEN` = tu token completo (ej: `123456:ABC...`)  
✅ `OPENROUTER_API_KEY` = tu API key de OpenRouter  
✅ `NODE_ENV` = `production`

**Si cambiaste algo, Railway redesplegará automáticamente.**

---

## 🐛 Debug Avanzado

### Ver Updates Pendientes

```bash
# Ver si Telegram tiene updates pendientes
curl https://api.telegram.org/botTU_TOKEN/getUpdates
```

Si ves mensajes viejos aquí, significa que no se están procesando.

**Limpiarlos:**
```bash
curl "https://api.telegram.org/botTU_TOKEN/deleteWebhook?drop_pending_updates=true"
```

### Verificar que el Token es Correcto

```bash
curl https://api.telegram.org/botTU_TOKEN/getMe
```

Debe responder con info de tu bot. Si da error 401/404 → token incorrecto.

---

## 📋 Checklist Final

- [ ] Webhook eliminado (curl getWebhookInfo muestra `"url": ""`)
- [ ] Código actualizado en GitHub (git push)
- [ ] Railway desplegó nuevos cambios
- [ ] Comando inicio: `npm run build && npm run worker`
- [ ] Logs muestran "Bot @username conectado exitosamente"
- [ ] **NO** hay líneas [ERROR] en logs
- [ ] `/start` en Telegram recibe respuesta

---

## 🎯 Cambios Clave en Este Deploy

### 1. Auto-limpieza de Webhook
El bot ahora elimina webhooks automáticamente al iniciar.

### 2. Logs Detallados
Verás cada update, comando y mensaje procesado.

### 3. Handler Corregido  
Eliminado bug que capturaba todos los mensajes.

### 4. Info de Conexión
Muestra username y ID del bot al conectar.

---

## 📞 Ayuda

Si después de seguir TODOS estos pasos el bot sigue sin responder:

1. Copia los logs COMPLETOS de Railway
2. Ejecuta estos comandos y guarda la salida:
   ```bash
   curl https://api.telegram.org/botTU_TOKEN/getMe
   curl https://api.telegram.org/botTU_TOKEN/getWebhookInfo
   curl https://api.telegram.org/botTU_TOKEN/getUpdates
   ```
3. Revisa [WEBHOOK_ISSUE.md](WEBHOOK_ISSUE.md) para más detalles

---

## ✨ Resultado Esperado

Después de estos pasos, tu bot debe:

✅ Responder a `/start` inmediatamente  
✅ Responder a `/help`, `/status`, etc.  
✅ Mantener conversaciones con mensajes de texto  
✅ Funcionar 24/7 sin interrupciones  

**El problema principal era el webhook. Con las correcciones aplicadas, debería funcionar perfectamente.**

---

**Última actualización:** 11 de febrero de 2026  
**Archivos modificados:** 4 (handlers, bot, package.json, + 4 nuevos scripts/docs)
