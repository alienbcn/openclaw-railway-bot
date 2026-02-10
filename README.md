# OpenClaw Railway Bot 🤖

Enterprise-grade Telegram Bot running 24/7, powered by **OpenClaw**, **OpenRouter (Claude 3.5 Sonnet)**, and **MCP Playwright** for autonomous web navigation. Optimized for Railway deployment.

## ✨ Features

- 🤖 **Intelligent Conversations**: Powered by Claude 3.5 Sonnet via OpenRouter
- 🌐 **Autonomous Web Navigation**: Built-in Playwright integration for web browsing
- 💬 **Multi-turn Context**: Maintains conversation history for contextual responses
- 📸 **Screenshot Capability**: Capture and share web page screenshots
- 🚀 **Railway Optimized**: Zero-config deployment on Railway
- 📊 **Health Monitoring**: Built-in health check endpoint
- 🔒 **Enterprise-grade**: Proper error handling, logging, and process management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenRouter API Key (from [OpenRouter](https://openrouter.ai/))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/alienbcn/openclaw-railway-bot.git
   cd openclaw-railway-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install chromium
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your tokens
   ```

5. **Run in development mode**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Configuration

Create a `.env` file with the following variables:

```env
# Required
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
LOG_LEVEL=info
PORT=3000
```

## 🚂 Railway Deployment

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Manual Deployment

1. **Create a new project on Railway**

2. **Connect your GitHub repository**

3. **Add environment variables**:
   - `TELEGRAM_BOT_TOKEN`
   - `OPENROUTER_API_KEY`
   - Other optional variables as needed

4. **Deploy**
   - Railway will automatically detect the configuration and deploy
   - The bot will start running 24/7

## 📱 Bot Commands

- `/start` - Show welcome message
- `/help` - Display help information
- `/clear` - Clear conversation history
- `/browse <url>` - Navigate to a website
- `/screenshot` - Take screenshot of current page
- `/status` - Show bot status

## 💡 Usage Examples

### Basic Conversation
```
You: Hello!
Bot: Hello! How can I assist you today?
```

### Web Navigation
```
You: /browse https://example.com
Bot: 🌐 Navigating to https://example.com...
Bot: ✅ Page Title: Example Domain
     Page loaded successfully. Ready for further actions.

You: What's on this page?
Bot: [Provides summary of the page content]
```

### Screenshot
```
You: /screenshot
Bot: 📸 Taking screenshot...
Bot: [Sends screenshot image]
```

## 🏗️ Architecture

```
src/
├── index.ts              # Application entry point
├── config.ts             # Configuration management
├── logger.ts             # Logging setup
├── bot.ts                # Telegram bot implementation
├── openrouter-service.ts # Claude/OpenRouter integration
└── playwright-service.ts # Web navigation service
```

## 🔍 Key Technologies

- **Telegraf**: Modern Telegram Bot framework
- **Anthropic SDK**: Claude 3.5 Sonnet integration via OpenRouter
- **Playwright**: Reliable web automation
- **TypeScript**: Type-safe development
- **Pino**: Fast, structured logging
- **Railway**: Zero-config deployment platform

## 🛡️ Security Features

- Environment-based configuration
- Secure token management
- Rate limiting ready
- Error boundary protection
- Graceful shutdown handling

## 📊 Monitoring

The bot includes a health check endpoint at `/health` that returns:

```json
{
  "status": "ok",
  "timestamp": "2026-02-10T07:32:54.949Z"
}
```

Railway automatically monitors this endpoint for uptime tracking.

## 🐛 Troubleshooting

### Bot not responding
- Check `TELEGRAM_BOT_TOKEN` is correct
- Verify bot is running: `/status` command
- Check Railway logs for errors

### Web navigation issues
- Ensure Playwright browsers are installed
- Check `PLAYWRIGHT_HEADLESS` setting
- Verify sufficient memory on Railway

### API errors
- Verify `OPENROUTER_API_KEY` is valid
- Check OpenRouter account credits
- Review rate limits

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenClaw for the autonomous agent framework
- OpenRouter for providing access to Claude 3.5
- Playwright for reliable web automation
- Railway for seamless deployment

---

**Built with ❤️ for 24/7 autonomous operations** 
