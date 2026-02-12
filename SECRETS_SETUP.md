# Configuración de GitHub Secrets

Este documento explica cómo configurar los secretos necesarios para que el bot funcione correctamente.

## Pasos para Configurar Secrets

### 1. Acceder a Configuración de Seguridad

1. Ve a tu repositorio en GitHub: `https://github.com/alienbcn/openclaw-railway-bot`
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, ve a **Secrets and variables** → **Actions**

### 2. Agregar Secretos

Haz clic en **New repository secret** para cada uno:

#### Secret 1: TELEGRAM_BOT_TOKEN

- **Name**: `TELEGRAM_BOT_TOKEN`
- **Value**: Tu token de @BotFather en Telegram
  - Ve a Telegram y habla con [@BotFather](https://t.me/botfather)
  - Crea un nuevo bot con `/newbot`
  - Copia el token (ej: `123456789:ABCDEfghijklmnopqrstuvwxyz`)

#### Secret 2: OPENROUTER_API_KEY

- **Name**: `OPENROUTER_API_KEY`
- **Value**: Tu API key de OpenRouter
  - Ve a [openrouter.ai](https://openrouter.ai/keys)
  - Genera una nueva API key
  - Copia y pega aquí

#### Secret 3: BRAVE_API_KEY

- **Name**: `BRAVE_API_KEY`
- **Value**: Tu API key de Brave Search
  - Ve a [brave.com/search/api](https://brave.com/search/api/)
  - Genera una API key (plan Data for Search)
  - Copia y pega aquí

#### Secret 4: RAILWAY_TOKEN (Opcional para auto-deploy)

- **Name**: `RAILWAY_TOKEN`
- **Value**: Tu token de Railway (si quieres CI/CD automático)
  - Ve a [railway.app](https://railway.app)
  - Ve a **Account** → **Tokens**
  - Crea un nuevo token
  - Copia y pega aquí

### 3. Verificar que están configurados

Después de agregar los secrets:

1. Vuelve a **Settings** → **Secrets and variables** → **Actions**
2. Deberías ver los secretos listados (sin mostrar los valores reales)

## Configuración en Railway

Una vez que hayas creado el repositorio en GitHub:

1. Ve a [railway.app](https://railway.app)
2. Haz clic en **+ New Project**
3. Selecciona **Deploy from GitHub repo**
4. Busca y selecciona `openclaw-railway-bot`
5. Railway detectará que es Node.js

### Agregue Variables de Entorno en Railway

Después de que Railway haya detectado el proyecto:

1. En Railway, ve a tu servicio
2. Haz clic en **Variables**
3. Agrega manualmente (o coloca en `.env`):

```
TELEGRAM_BOT_TOKEN=tu_token_aqui
OPENROUTER_API_KEY=tu_api_key_aqui
BRAVE_API_KEY=tu_brave_key_aqui
OPENCLAW_ENABLED=true
OPENCLAW_CONFIG_PATH=openclaw.json
NODE_ENV=production
```

### Configura el Start Command

En **Settings** → **Deploy**, en el campo **Start Command**:

```bash
npm run build && npm run worker
```

### Deshabilita la exposición de puerto (importante)

En **Settings** → **Public Networking**, **NO** habilites un puerto público.
El worker process no necesita un puerto HTTP.

## Lista de Verificación

- [ ] TELEGRAM_BOT_TOKEN configurado en GitHub Secrets
- [ ] OPENROUTER_API_KEY configurado en GitHub Secrets
- [ ] Repositorio conectado a Railway
- [ ] Variables de entorno configuradas en Railway
- [ ] Start Command configurado en Railway
- [ ] Puerto público deshabilitado en Railway

## Verificación del Despliegue

Una vez todo esté configurado:

1. Push a main: `git push origin main`
2. Railway detectará el cambio y desplegará automáticamente
3. En Telegram, envía `/status` a tu bot
4. Deberías recibir respuesta: "✅ Bot activo"

## Troubleshooting

### El bot no responde

1. Verifica en Railway → **Logs**
2. Asegúrate que el TELEGRAM_BOT_TOKEN es correcto
3. Intenta reiniciar el servicio en Railway

### Error de OpenRouter

1. Verifica la API key en openrouter.ai
2. Comprueba que tengas saldo disponible ($17)
3. Mira los logs en Railway para errores específicos

### Railway no despliega automáticamente

1. Verifica que el repositorio esté conectado correctamente
2. Haz clic en **Deploy** → **Trigger Deploy** para forzar un despliegue
3. Verifica que el `.github/workflows/build.yml` esté presente
