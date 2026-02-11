import { Context } from "grammy";
import { openRouterClient, type OpenRouterMessage } from "../llm/openrouter.js";
import { telegramBot } from "./bot.js";
import serperService from "../llm/serper.js";
// Playwright se importa solo cuando sea necesario (lazy loading)

const conversationContexts: Map<number, OpenRouterMessage[]> = new Map();

const SYSTEM_PROMPT = `Eres un asistente amable y útil. Responde de manera concisa y clara. 
Eres capaz de navegar por internet, analizar información y ayudar al usuario con sus preguntas.`;

export async function registerCommandHandlers(): Promise<void> {
  const bot = telegramBot.getBot();

  // Middleware para logging de todos los updates
  bot.use(async (ctx, next) => {
    const updateType = ctx.update.message?.text ? "text" : 
                       ctx.update.message?.photo ? "photo" : 
                       ctx.update.callback_query ? "callback" : "other";
    console.log(`[UPDATE] Tipo: ${updateType}, De: ${ctx.from?.id}, Username: @${ctx.from?.username || "unknown"}`);
    await next();
  });

  // /start
  bot.command("start", async (ctx) => {
    console.log(`[COMMAND] /start recibido de ${ctx.from?.id}`);
    conversationContexts.set(ctx.from?.id || 0, []);
    await ctx.reply(
      "¡Hola! 👋 Soy un bot de Telegram inteligente.\n\n" +
      "Puedo:\n" +
      "- 💬 Mantener conversaciones\n" +
      "- 🌐 Navegar por internet\n" +
      "- 📊 Analizar información\n\n" +
      "¿En qué puedo ayudarte?"
    );
  });

  // /help
  bot.command("help", async (ctx) => {
    await ctx.reply(
      "📚 Comandos disponibles:\n\n" +
      "/start - Iniciar conversación\n" +
      "/help - Ver esta ayuda\n" +
      "/clear - Limpiar historial de conversación\n" +
      "/status - Ver estado del bot\n" +
      "/bitcoin - Obtener precio actual de Bitcoin\n" +
      "/news - Obtener noticias principales de El País\n\n" +
      "También puedes escribir mensajes normales para conversar."
    );
  });

  // /clear
  bot.command("clear", async (ctx) => {
    conversationContexts.set(ctx.from?.id || 0, []);
    await ctx.reply("✨ Historial de conversación limpiado.");
  });

  // /status
  bot.command("status", async (ctx) => {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    await ctx.reply(
      `✅ Bot activo\n\n` +
      `⏱️ Uptime: ${uptimeHours}h ${uptimeMinutes}m\n` +
      `🤖 Version: 1.0.0\n` +
      `🚀 Despliegue: Railway`
    );
  });

  // /bitcoin - Obtener precio actual de Bitcoin usando Serper
  bot.command("bitcoin", async (ctx) => {
    try {
      await ctx.reply("⏳ Buscando precio de Bitcoin...");

      const bitcoinData = await serperService.getBitcoinPrice();

      const message =
        `💰 <b>Precio de Bitcoin</b>\n\n` +
        `${bitcoinData.price}\n\n` +
        `🔗 <a href="${bitcoinData.source}">Fuente</a>\n` +
        `⏰ ${new Date(bitcoinData.timestamp).toLocaleString("es-ES")}`;

      await ctx.reply(message, { parse_mode: "HTML" });
    } catch (error) {
      console.error("Error obteniendo precio de Bitcoin:", error);
      await ctx.reply(
        "❌ Error obteniendo el precio de Bitcoin. Asegúrate de que SERPER_API_KEY esté configurada."
      );
    }
  });

  // /news - Obtener noticias principales de El País usando Playwright
  bot.command("news", async (ctx) => {
    try {
      await ctx.reply("⏳ Extrayendo noticias de El País...");

      // Lazy loading de Playwright - se importa solo cuando es necesario
      const { playwrightMCP } = await import("../mcp/playwright.js");

      const newsData = await playwrightMCP.scrapeElPais();

      if (newsData.success) {
        const message =
          `📰 <b>Noticia Principal - El País</b>\n\n` +
          `${newsData.headline}\n\n` +
          `🔗 <a href="${newsData.url}">Leer más</a>\n` +
          `⏰ ${new Date(newsData.timestamp).toLocaleString("es-ES")}`;

        await ctx.reply(message, { parse_mode: "HTML" });
      } else {
        await ctx.reply(
          `❌ Error: ${newsData.headline}\n\nAsegúrate de tener acceso a internet y que Playwright esté correctamente instalado.`
        );
      }
    } catch (error) {
      console.error("Error obteniendo noticias:", error);
      await ctx.reply(
        "❌ Error extrayendo noticias. Verifica los logs para más detalles."
      );
    }
  });

  // Manejar mensajes de texto
  bot.on("message:text", async (ctx) => {
    try {
      console.log(`[HANDLER] Mensaje de texto recibido de ${ctx.from?.id}: ${ctx.message.text}`);
      const userId = ctx.from?.id || 0;
      const userMessage = ctx.message.text;

      // Obtener o crear contexto de conversación
      let messages = conversationContexts.get(userId) || [];

      // Agregar mensaje del usuario
      messages.push({
        role: "user",
        content: userMessage,
      });

      // Generar respuesta con OpenRouter
      const response = await openRouterClient.generateResponseWithRetry(
        messages.slice(-10), // Últimos 10 mensajes para contexto
        SYSTEM_PROMPT
      );

      // Agregar respuesta al historial
      messages.push({
        role: "assistant",
        content: response,
      });

      // Guardar contexto actualizado (máximo 50 mensajes)
      conversationContexts.set(userId, messages.slice(-50));

      // Dividir respuesta en bloques si es muy larga
      const chunks = response.match(/[\s\S]{1,4096}/g) || [response];
      for (const chunk of chunks) {
        await ctx.reply(chunk, { parse_mode: "HTML" });
      }
      console.log(`[HANDLER] Respuesta enviada exitosamente a ${userId}`);
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      await ctx.reply(
        "❌ Disculpa, hubo un error procesando tu mensaje. Por favor intenta de nuevo."
      );
    }
  });

  console.log("[HANDLERS] Todos los handlers registrados correctamente");
}
