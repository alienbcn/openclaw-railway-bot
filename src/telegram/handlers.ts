import { Context } from "grammy";
import { openRouterClient, type OpenRouterMessage } from "../llm/openrouter.js";
import { telegramBot } from "./bot.js";

const conversationContexts: Map<number, OpenRouterMessage[]> = new Map();

const SYSTEM_PROMPT = `Eres un asistente amable y útil. Responde de manera concisa y clara. 
Eres capaz de navegar por internet, analizar información y ayudar al usuario con sus preguntas.`;

export async function registerCommandHandlers(): Promise<void> {
  const bot = telegramBot.getBot();

  // /start
  bot.command("start", async (ctx) => {
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
      "/status - Ver estado del bot\n\n" +
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

  // Manejar mensajes de texto
  bot.on("message:text", async (ctx) => {
    try {
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
    } catch (error) {
      console.error("Error procesando mensaje:", error);
      await ctx.reply(
        "❌ Disculpa, hubo un error procesando tu mensaje. Por favor intenta de nuevo."
      );
    }
  });

  // Manejar otros tipos de mensajes
  bot.on("message", async (ctx) => {
    await ctx.reply("ℹ️ Solo puedo procesar mensajes de texto por ahora.");
  });
}
