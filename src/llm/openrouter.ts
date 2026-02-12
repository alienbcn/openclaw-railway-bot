import axios, { type AxiosInstance } from "axios";
import { config } from "../config.js";

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.openrouter.baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.openrouter.apiKey}`,
        "User-Agent": "openclaw-railway-bot/1.0.0 (Anthropic)",
      },
    });
  }

  async generateResponse(
    messages: OpenRouterMessage[],
    systemPrompt?: string
  ): Promise<string> {
    try {
      const allMessages = systemPrompt
        ? [{ role: "system" as const, content: systemPrompt }, ...messages]
        : messages;

      const response = await this.client.post<OpenRouterResponse>("/chat/completions", {
        model: config.openrouter.model,
        messages: allMessages,
        max_tokens: config.openrouter.maxTokens,
        temperature: 0.7,
        top_p: 0.95,
      });

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenRouter");
      }

      return content;
    } catch (error) {
      console.error("Error al llamar a OpenRouter:", error);
      throw error;
    }
  }

  async generateResponseWithRetry(
    messages: OpenRouterMessage[],
    systemPrompt?: string,
    maxRetries = config.bot.retryAttempts
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.generateResponse(messages, systemPrompt);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Intento ${i + 1}/${maxRetries} fallido. Reintentando...`);
        await new Promise((resolve) => setTimeout(resolve, config.bot.retryDelay));
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }
}

export const openRouterClient = new OpenRouterClient();
