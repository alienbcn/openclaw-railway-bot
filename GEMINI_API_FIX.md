# Solución: GEMINI_API_KEY no detectada

## 🔍 Problema identificado

El bot responde con:
```
⚠️ Conversacion inteligente deshabilitada. Configura GEMINI_API_KEY para activarla.
```

Esto significa que **la variable de entorno `GEMINI_API_KEY` no está llegando al bot en Railway**.

## ✅ Solución paso a paso

### 1. Verificar variables en Railway

1. Ve a tu proyecto en Railway: https://railway.app/dashboard
2. Selecciona tu servicio (openclaw-railway-bot)
3. Ve a la pestaña **"Variables"**
4. **Verifica que exista una variable que se llame EXACTAMENTE:**
   ```
   GEMINI_API_KEY
   ```
   (Sin espacios, exactamente con mayúsculas y minúsculas)

### 2. Configurar correctamente la API Key

Si la variable no existe o está mal configurada:

1. Haz clic en **"+ New Variable"**
2. En el campo **Variable Name**, escribe exactamente:
   ```
   GEMINI_API_KEY
   ```
3. En el campo **Value**, pega tu API key de Gemini (debe empezar con `AIza...`)
4. Haz clic en **"Add"**

### 3. Hacer un redeploy

**IMPORTANTE**: Las variables de entorno solo se cargan al inicio del servicio.

1. Después de agregar/modificar la variable, ve a la pestaña **"Deployments"**
2. Haz clic en los tres puntos (...) del último deployment
3. Selecciona **"Redeploy"**
4. O simplemente haz un push a tu repositorio, lo cual activará un nuevo deployment

### 4. Verificar los logs

1. Ve a la pestaña **"Logs"** en Railway
2. Busca estas líneas al inicio:
   ```
   🔍 Validando configuración...
   ============================================================
   ✅ TELEGRAM_BOT_TOKEN: Configurado (longitud: XX)
   ✅ GEMINI_API_KEY: Configurado (longitud: XX)
   ```

Si ves:
```
❌ GEMINI_API_KEY: NO configurado
```

Entonces la variable NO está llegando al bot.

### 5. Script de diagnóstico (NUEVO)

También puedes ejecutar este comando en los logs de Railway para ver qué variables están disponibles:

```bash
./scripts/check-env.sh
```

Este script te mostrará:
- ✅ Qué variables están configuradas
- ❌ Qué variables faltan
- La longitud de cada valor (sin revelar el contenido)

## 🎯 Verificación rápida

Para verificar que todo funciona:

1. Envía un mensaje al bot: `/start`
2. Luego envía cualquier pregunta: `Hola, ¿cómo estás?`
3. Si funciona, el bot responderá normalmente
4. Si sigue fallando, revisa los logs como se indica arriba

## ⚠️ Errores comunes

1. **Espacios en el nombre de la variable**: 
   - ❌ `GEMINI_API_KEY ` (con espacio)
   - ❌ ` GEMINI_API_KEY` (con espacio)
   - ✅ `GEMINI_API_KEY` (sin espacios)

2. **Mayúsculas incorrectas**:
   - ❌ `gemini_api_key`
   - ❌ `Gemini_Api_Key`
   - ✅ `GEMINI_API_KEY`

3. **No hacer redeploy**: Railway necesita reiniciar el servicio para cargar las nuevas variables

4. **API Key inválida**: Verifica que tu API key esté activa en https://aistudio.google.com/app/apikey

## 📝 Nota sobre GitHub Secrets

Los **GitHub Secrets** son solo para GitHub Actions (CI/CD), **NO** se pasan automáticamente a Railway. 

Debes configurar las variables directamente en Railway como se explica arriba.

---

Si después de seguir estos pasos el problema persiste, envíame los logs completos del inicio del bot en Railway.
