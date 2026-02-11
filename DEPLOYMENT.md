# Guía de Despliegue en Railway

Este documento explica cómo desplegar y mantener el bot en Railway.

## Conceptos Clave

### Worker Process vs Web Service
- **Web Service**: Requiere un puerto HTTP, se reinicia por timeout después de inactividad
- **Worker Process**: No requiere puerto, corre continuamente sin timeouts
- **Nuestro Bot**: Worker process para garantizar disponibilidad 24/7

## Pasos de Despliegue

### 1. Preparación del Repositorio

```bash
# Asegúrate de que todo está commiteado
git status
git add .
git commit -m "Initial commit: openclaw-railway-bot"
git push origin main
```

### 2. Configuración en Railway

1. Ve a [railway.app](https://railway.app)
2. Conecta tu GitHub
3. Selecciona el repositorio `openclaw-railway-bot`
4. Railway detectará automáticamente que es un proyecto Node.js

### 3. Configurar Variables de Entorno

En el dashboard de Railway, agrega los siguientes secretos:

```
TELEGRAM_BOT_TOKEN=tu_token_del_bot
OPENROUTER_API_KEY=tu_api_key
BRAVE_API_KEY=tu_brave_key
OPENCLAW_ENABLED=true
OPENCLAW_CONFIG_PATH=openclaw.json
NODE_ENV=production
```

### 4. Configurar como Worker Process

En Railway, sigue estos pasos:

1. Ve a Settings del servicio
2. En "Deploy" → "Start Command", asegúrate de que esté:
   ```
   npm run build && npm run worker
   ```

3. En "Public Networking", **DESHABILITA** el puerto (no necesitamos web)

### 5. Monitoreo

Railway monitorea automáticamente:
- Logs en tiempo real
- Uptime/Downtime
- Reinicio automático si se cae

## Verificación

Una vez desplegado, verifica que el bot esté activo:

1. En Telegram, envía `/status` a tu bot
2. Deberías recibir un mensaje con:
   - Estado: ✅ Bot activo
   - Uptime
   - Versión
   - Despliegue: Railway

## Gestión de Actualización

### Nuevas versiones

```bash
# Haz cambios localmente
git add .
git commit -m "Feature: nueva funcionalidad"
git push origin main
```

Railway detectará automáticamente el cambio y desplegará la nueva versión.

### Rollback (en caso de emergencia)

En el dashboard de Railway, puedes ver el historial de deployments y revertir a versiones anteriores.

## Troubleshooting

### El bot no responde

1. Verifica los logs en Railway
2. Asegúrate de que `TELEGRAM_BOT_TOKEN` y `OPENROUTER_API_KEY` estén configurados
3. Verifica que Railway no haya pausado el servicio por inactividad

### Errores de OpenRouter

1. Verifica que `OPENROUTER_API_KEY` sea válido
2. Comprueba el saldo en [openrouter.ai](https://openrouter.ai)
3. Verifica los logs para ver el error específico

### Alto uso de CPU/Memoria

1. Revisa los logs para ver qué consumo anormal ocurre
2. Optimiza las consultas a OpenRouter
3. Limita el historial de conversaciones a los últimos 10 mensajes

## Escalabilidad Futura

Si es necesario escalar:

1. Railway permite múltiples réplicas
2. Para ello, módulo en `railway.json`:
   ```json
   {
     "deploy": {
       "numReplicas": 2
     }
   }
   ```

## Costos

- **Railway**: Primer tier libre (está incluido)
- **OpenRouter**: $0.08/1M input tokens (con $17 iniciales)
- **Telegram**: Gratuito

Con un uso moderado, los $17 iniciales pueden durar varias semanas.
