// Tipos generales de la aplicación

export interface BotConfig {
  telegram: {
    token: string;
    apiUrl: string;
  };
  openrouter: {
    apiKey: string;
    baseURL: string;
    model: string;
    maxTokens: number;
  };
  railway: {
    staticUrl: string;
    nodeEnv: string;
  };
  mcp: {
    playwright: {
      headless: boolean;
      browser: "chromium" | "brave" | "firefox" | "webkit";
    };
  };
  openclaw: {
    enabled: boolean;
    configPath: string;
    binPath: string;
    agentId: string;
    thinking: string;
    timeoutSeconds: number;
  };
  bot: {
    logLevel: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

export interface Message {
  id: string;
  userId: number;
  text: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  userId: number;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  createdAt: Date;
  lastMessageAt: Date;
}

export interface LLMResponse {
  content: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  timestamp: Date;
}

export type Logger = {
  info: (msg: string, data?: any) => void;
  warn: (msg: string, data?: any) => void;
  error: (msg: string, error?: Error) => void;
  debug: (msg: string, data?: any) => void;
};
