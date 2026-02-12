import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { CONSTANTS } from './constants.js';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationContext {
  messages: Message[];
  userId: number;
  chatId: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterService {
  private conversations: Map<number, Message[]> = new Map();

  constructor() {
    // No need for client initialization with fetch
  }

  getConversation(chatId: number): Message[] {
    if (!this.conversations.has(chatId)) {
      this.conversations.set(chatId, []);
    }
    return this.conversations.get(chatId)!;
  }

  addMessage(chatId: number, role: 'user' | 'assistant' | 'system', content: string): void {
    const conversation = this.getConversation(chatId);
    conversation.push({ role, content });

    // Keep only last N messages to manage context size
    if (conversation.length > CONSTANTS.MAX_CONVERSATION_MESSAGES) {
      this.conversations.set(chatId, conversation.slice(-CONSTANTS.MAX_CONVERSATION_MESSAGES));
    }
  }

  clearConversation(chatId: number): void {
    this.conversations.delete(chatId);
    logger.info({ chatId }, 'Conversation cleared');
  }

  async chat(chatId: number, userMessage: string, systemPrompt?: string): Promise<string> {
    try {
      this.addMessage(chatId, 'user', userMessage);
      const conversation = this.getConversation(chatId);

      logger.info({ chatId, messageCount: conversation.length }, 'Sending message to OpenRouter');

      // Prepare messages in OpenRouter format
      const messages: Message[] = [];
      
      // Add system message if provided
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt,
        });
      } else {
        messages.push({
          role: 'system',
          content: this.getDefaultSystemPrompt(),
        });
      }

      // Add conversation history
      messages.push(...conversation);

      const response = await fetch(`${CONFIG.openRouter.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CONFIG.openRouter.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/alienbcn/openclaw-railway-bot',
          'X-Title': 'OpenClaw Railway Bot',
        },
        body: JSON.stringify({
          model: CONFIG.openRouter.model,
          messages: messages,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error({ status: response.status, error: errorData }, 'OpenRouter API error');
        throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as OpenRouterResponse;
      const assistantMessage = data.choices?.[0]?.message?.content || 'No response from AI';

      this.addMessage(chatId, 'assistant', assistantMessage);

      logger.info({ chatId, responseLength: assistantMessage.length }, 'Received response from OpenRouter');

      return assistantMessage;
    } catch (error) {
      logger.error({ error, chatId }, 'Chat request failed');
      throw error;
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are an enterprise-grade AI assistant with autonomous web navigation capabilities. 
You can help users with:
- General questions and conversations
- Web navigation and browsing (when asked to visit websites)
- Information extraction from web pages
- Multi-turn complex tasks

You are powered by Claude 3.5 Sonnet and have access to Playwright for web automation.
Be helpful, accurate, and professional in your responses.

Note: When viewing web pages, you receive the first ${CONSTANTS.PAGE_TEXT_LIMIT} characters of the page content.`;
  }

  getConversationCount(): number {
    return this.conversations.size;
  }
}
