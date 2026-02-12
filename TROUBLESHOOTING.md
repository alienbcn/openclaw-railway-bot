# 🚨 Solución Rápida - Bot no Responde

**Última actualización:** 11 de febrero de 2026

---

## ⚡ Solución Rápida (2 minutos)

### El bot no está configurado aún. Sigue estos pasos:

```bash
# 1. Ejecuta el diagnóstico
npm run diagnostic

# 2. Si faltan variables de entorno, edita .env
nano .env   # o tu editor favorito

# 3. Rellena las credenciales obligatorias:
#    - TELEGRAM_BOT_TOKEN (obtener en @BotFather)
#    - OPENROUTER_API_KEY (obtener en openrouter.ai/keys)

# 4. Compila (si no lo has hecho)
npm run build

# 5. Inicia el bot
npm run worker:dev
```

---

## 📋 Checklist de Verificación

- [ ] Archivo `.env` existe y está configurado
- [ ] `TELEGRAM_BOT_TOKEN` tiene un valor válido
- [ ] `OPENROUTER_API_KEY` tiene un valor válido
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto compilado (`npm run build`)

---

## 🔧 Problemas Corregidos

### ✅ Error de Importación de Módulos (RESUELTO)

**Antes:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../dist/config'
```

**Estado:** ✅ Corregido en el código fuente

---

## 🆘 Cómo Obtener las Credenciales

### 1. TELEGRAM_BOT_TOKEN

1. Abre Telegram
2. Busca [@BotFather](https://t.me/botfather)
3. Envía `/newbot`
4. Sigue las instrucciones
5. Copia el token que te da (ej: `123456789:ABCDEfg...`)

### 2. OPENROUTER_API_KEY

1. Ve a [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Crea una cuenta / inicia sesión
3. Genera una nueva API key
4. Copia la key (ej: `sk-or-v1-xxx...`)

### 3. SERPER_API_KEY (Opcional)

1. Ve a [https://serper.dev/](https://serper.dev/)
2. Crea una cuenta
3. Genera una API key
4. Copia la key

---

## 🧪 Verificar que el Bot Funciona

```bash
# Iniciar en modo desarrollo (con logs detallados)
npm run worker:dev
```

Deberías ver:
```
[INFO] ... - 🚀 Iniciando openclaw-railway-bot worker...
[INFO] ... - ✅ Configuración validada
[INFO] ... - ✅ Handlers de comandos registrados
🤖 Bot de Telegram iniciado...
[INFO] ... - ✅ Bot de Telegram iniciado correctamente
[INFO] ... - 🔄 Bot 24/7 activado. Escuchando mensajes...
```

---

## 💬 Probar el Bot

Una vez iniciado, ve a Telegram y:

1. Busca tu bot (el nombre que le diste en @BotFather)
2. Envía `/start`
3. Deberías recibir una respuesta de bienvenida

### Comandos disponibles:

- `/start` - Iniciar conversación
- `/help` - Ver ayuda
- `/status` - Ver estado del bot
- `/bitcoin` - Precio de Bitcoin (requiere SERPER_API_KEY)
- `/news` - Noticias de El País
- Cualquier mensaje de texto - Conversación con IA

---

## 🚀 Despliegue en Railway (Producción)

Una vez funcionando localmente:

1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno:
   ```
   TELEGRAM_BOT_TOKEN=tu_token
   OPENROUTER_API_KEY=tu_key
   NODE_ENV=production
   ```
4. El comando de inicio debería ser:
   ```
   npm run build && npm run worker
   ```

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para más detalles.

---

## 📖 Documentación Completa

- [DIAGNOSTIC_REPORT.md](DIAGNOSTIC_REPORT.md) - Reporte detallado de diagnóstico
- [QUICK_START.md](QUICK_START.md) - Guía de inicio rápido
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía de despliegue en Railway
- [SECRETS_SETUP.md](SECRETS_SETUP.md) - Configuración de secretos
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del proyecto

---

## 🐛 Problemas Comunes

### "Empty token!"
**Causa:** `TELEGRAM_BOT_TOKEN` no está configurado en `.env`  
**Solución:** Edita `.env` y agrega tu token de @BotFather

### "Cannot find module"
**Causa:** Proyecto no compilado  
**Solución:** `npm run build`

### "Module not found: '../config'"
**Causa:** Error de imports (ya corregido)  
**Solución:** El código ya está actualizado, solo haz `git pull` y `npm run build`

### Bot no responde en Telegram
**Causa:** Bot no está iniciado o credenciales incorrectas  
**Solución:** 
1. Verifica que el bot esté corriendo (`npm run worker:dev`)
2. Verifica el token con: `curl https://api.telegram.org/bot<TU_TOKEN>/getMe`
3. Revisa los logs para ver errores

---

## 🆘 Ayuda Adicional

Si sigues teniendo problemas:

1. Ejecuta el diagnóstico: `npm run diagnostic`
2. Revisa los logs detallados: `npm run worker:dev`
3. Lee el reporte completo: [DIAGNOSTIC_REPORT.md](DIAGNOSTIC_REPORT.md)
4. Verifica que tu token de Telegram sea válido
5. Verifica que tu API key de OpenRouter funcione

---

**¿Todo listo?** Ejecuta `npm run diagnostic` para verificar.
