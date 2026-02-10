# Deployment Guide

## Quick Start: Railway Deployment

### Prerequisites
1. **GitHub Account** - Your repository is on GitHub
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Telegram Bot Token** - Get from [@BotFather](https://t.me/botfather)
4. **OpenRouter API Key** - Get from [openrouter.ai](https://openrouter.ai)

### Step-by-Step Railway Deployment

#### 1. Create Telegram Bot
```
1. Open Telegram and search for @BotFather
2. Send /newbot
3. Follow instructions to name your bot
4. Save the bot token (format: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz)
```

#### 2. Get OpenRouter API Key
```
1. Visit https://openrouter.ai
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Save the key (format: sk-or-v1-...)
```

#### 3. Deploy to Railway

**Option A: One-Click Deploy (Recommended)**
1. Click the "Deploy on Railway" button in README.md
2. Connect your GitHub account
3. Select this repository
4. Railway will automatically detect configuration

**Option B: Manual Deploy**
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `alienbcn/openclaw-railway-bot`
5. Railway will auto-detect settings

#### 4. Configure Environment Variables

In Railway dashboard, add these variables:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
LOG_LEVEL=info
PORT=3000
```

**Required:**
- `TELEGRAM_BOT_TOKEN`
- `OPENROUTER_API_KEY`

**Optional (defaults provided):**
- `OPENROUTER_MODEL`
- `PLAYWRIGHT_HEADLESS`
- `PLAYWRIGHT_TIMEOUT`
- `LOG_LEVEL`
- `PORT`

#### 5. Deploy
1. Click "Deploy" in Railway
2. Wait for build to complete (2-5 minutes)
3. Bot will start automatically
4. Check logs to verify bot is running

#### 6. Verify Deployment
1. Open Telegram
2. Search for your bot
3. Send `/start`
4. You should receive a welcome message

### Monitoring

**Health Check:**
- Railway automatically monitors `/health` endpoint
- Check dashboard for uptime status

**Logs:**
- View real-time logs in Railway dashboard
- Click on your deployment → "Logs" tab

**Status Check:**
- Send `/status` to your bot
- Shows active conversations and browser status

## Troubleshooting

### Bot Not Responding
```bash
# Check Railway logs for errors
# Verify environment variables are set correctly
# Ensure TELEGRAM_BOT_TOKEN is valid
# Test with /status command
```

### Build Failures
```bash
# Check Node.js version (should be 18+)
# Verify package.json is correct
# Check Railway build logs for specific errors
```

### Web Navigation Issues
```bash
# Verify Playwright is installed (check build logs)
# Increase PLAYWRIGHT_TIMEOUT if pages load slowly
# Check memory limits in Railway settings
```

### API Errors
```bash
# Verify OPENROUTER_API_KEY is valid
# Check OpenRouter account has credits
# Review rate limits on OpenRouter dashboard
```

## Local Development

### Setup
```bash
# Clone repository
git clone https://github.com/alienbcn/openclaw-railway-bot.git
cd openclaw-railway-bot

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with your tokens

# Run development server
npm run dev
```

### Build
```bash
npm run build
npm start
```

### Testing
```bash
# Test locally before deploying
npm run dev

# In Telegram, message your bot
# Try commands:
/start
/help
/browse https://example.com
/screenshot
/status
```

## Advanced Configuration

### Custom Model
Change the model in Railway environment variables:
```env
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
# or
OPENROUTER_MODEL=anthropic/claude-3-opus
# or
OPENROUTER_MODEL=openai/gpt-4
```

### Increase Memory (if needed)
In Railway:
1. Go to Settings → Resources
2. Increase memory allocation
3. Redeploy

### Enable Debug Logging
```env
LOG_LEVEL=debug
```

### Adjust Timeouts
```env
PLAYWRIGHT_TIMEOUT=60000  # 60 seconds for slow pages
```

## Costs

### Railway
- **Hobby Plan**: $5/month for 500 hours
- **Pro Plan**: $20/month unlimited
- First 500 hours free each month

### OpenRouter
- Pay-per-use based on model
- Claude 3.5 Sonnet: ~$3 per million input tokens
- Check [openrouter.ai/docs#models](https://openrouter.ai/docs#models) for pricing

### Estimated Monthly Cost
- Light usage (< 1000 messages): ~$5-10
- Medium usage (1000-5000 messages): ~$15-30
- Heavy usage (5000+ messages): $30+

## Security Best Practices

1. **Never commit .env file**
   - Already in .gitignore
   - Use Railway environment variables

2. **Rotate API keys periodically**
   - Generate new OpenRouter key monthly
   - Update in Railway dashboard

3. **Monitor usage**
   - Check OpenRouter dashboard for usage
   - Set up billing alerts

4. **Keep dependencies updated**
   ```bash
   npm update
   npm audit fix
   ```

## Support

### Documentation
- Telegraf: https://telegraf.js.org
- OpenRouter: https://openrouter.ai/docs
- Playwright: https://playwright.dev
- Railway: https://docs.railway.app

### Issues
Report issues at: https://github.com/alienbcn/openclaw-railway-bot/issues

---

**Happy Bot Building! 🤖**
