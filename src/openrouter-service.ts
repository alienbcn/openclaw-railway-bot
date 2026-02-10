import Anthropic from '@anthropic-ai/sdk';
import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { CONSTANTS } from './constants.js';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationContext {
  messages: Message[];
  userId: number;
  chatId: number;
}

export class OpenRouterService {
  private client: Anthropic;
  private conversations: Map<number, Message[]> = new Map();

  constructor() {
    this.client = new Anthropic({
      apiKey: CONFIG.openRouter.apiKey,
      baseURL: CONFIG.openRouter.baseURL,
    });
  }

  getConversation(chatId: number): Message[] {
    if (!this.conversations.has(chatId)) {
      this.conversations.set(chatId, []);
    }
    return this.conversations.get(chatId)!;
  }

  addMessage(chatId: number, role: 'user' | 'assistant', content: string): void {
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

      logger.info({ chatId, messageCount: conversation.length }, 'Sending message to Claude');

      const messages: Anthropic.MessageParam[] = conversation.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await this.client.messages.create({
        model: CONFIG.openRouter.model,
        max_tokens: 4096,
        system: systemPrompt || this.getDefaultSystemPrompt(),
        messages,
      });

      const assistantMessage = response.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      this.addMessage(chatId, 'assistant', assistantMessage);

      logger.info({ chatId, responseLength: assistantMessage.length }, 'Received response from Claude');

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
