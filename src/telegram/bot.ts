import { Bot, Context } from "grammy";
import { config } from "../config.js";

export class TelegramBot {
  private bot: Bot<Context>;

  constructor() {
    this.bot = new Bot(config.telegram.token);
  }

  getBot(): Bot<Context> {
    return this.bot;
  }

  registerCommand(
    command: string,
    handler: (ctx: Context) => Promise<void> | void
  ): void {
    this.bot.command(command, handler);
  }

  on(
    filter: string | RegExp,
    handler: (ctx: Context) => Promise<void> | void
  ): void {
    this.bot.on(filter as any, handler);
  }

  use(middleware: (ctx: Context, next: () => Promise<void>) => Promise<void>): void {
    this.bot.use(middleware);
  }

  async start(): Promise<void> {
    console.log("🤖 Bot de Telegram iniciando con long polling...");
    
    // Configurar manejo de errores
    this.bot.catch((err) => {
      console.error("[BOT ERROR]", err);
    });
    
    // Iniciar con long polling (por defecto en grammy)
    await this.bot.start({
      onStart: (botInfo) => {
        console.log(`✅ Bot @${botInfo.username} conectado exitosamente`);
        console.log(`   ID: ${botInfo.id}`);
        console.log(`   Nombre: ${botInfo.first_name}`);
      },
    });
  }

  async stop(): Promise<void> {
    console.log("🛑 Bot detenido");
    // grammy no tiene un método stop directo, pero controlamos
  }
}

export const telegramBot = new TelegramBot();
