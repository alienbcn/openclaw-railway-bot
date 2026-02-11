import axios, { type AxiosInstance } from "axios";
import { config } from "../config.js";

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = config.gemini.apiKey;
    this.client = axios.create({
      baseURL: config.gemini.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private convertToGeminiFormat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    systemPrompt?: string
  ): { contents: GeminiMessage[]; systemInstruction?: { parts: Array<{ text: string }> } } {
    const contents: GeminiMessage[] = [];
    
    for (const msg of messages) {
      if (msg.role === "system") continue; // Se maneja por separado
      
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const systemInstruction = systemPrompt
      ? { parts: [{ text: systemPrompt }] }
      : undefined;

    return { contents, systemInstruction };
  }

  async generateResponse(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    systemPrompt?: string
  ): Promise<string> {
    try {
      console.log("[GEMINI] Iniciando generación de respuesta");
      console.log("[GEMINI] API Key presente:", !!this.apiKey, "Longitud:", this.apiKey?.length || 0);
      console.log("[GEMINI] Modelo:", config.gemini.model);
      console.log("[GEMINI] Mensajes a enviar:", messages.length);
      
      const { contents, systemInstruction } = this.convertToGeminiFormat(
        messages,
        systemPrompt
      );

      const url = `/v1beta/models/${config.gemini.model}:generateContent?key=${this.apiKey}`;
      console.log("[GEMINI] URL (sin key):", url.replace(/key=.+$/, 'key=***'));

      const requestBody: any = {
        contents,
        generationConfig: {
          temperature: config.gemini.temperature,
          topP: config.gemini.topP,
          maxOutputTokens: config.gemini.maxTokens,
        },
      };

      if (systemInstruction) {
        requestBody.systemInstruction = systemInstruction;
      }

      console.log("[GEMINI] Enviando petición a Gemini...");
      const response = await this.client.post<GeminiResponse>(url, requestBody);
      console.log("[GEMINI] Respuesta recibida. Status:", response.status);

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        console.error("[GEMINI] No se recibió contenido en la respuesta");
        console.error("[GEMINI] Respuesta completa:", JSON.stringify(response.data, null, 2));
        throw new Error("No response content from Gemini");
      }

      console.log("[GEMINI] Contenido generado exitosamente. Longitud:", content.length);
      return content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error al llamar a Gemini:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      } else {
        console.error("Error al llamar a Gemini:", error);
      }
      throw error;
    }
  }

  async generateResponseWithRetry(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
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
        await new Promise((resolve) =>
          setTimeout(resolve, config.bot.retryDelay * (i + 1))
        );
      }
    }

    throw lastError || new Error("Max retries exceeded");
  }
}

export const geminiClient = new GeminiClient();
