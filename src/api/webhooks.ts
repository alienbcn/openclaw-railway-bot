/**
 * Manejador de Webhooks y APIs externas
 * Permite recibir y enviar datos a servicios externos
 */

export interface WebhookPayload {
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  signature?: string;
}

export interface WebhookHandler {
  path: string;
  handler: (payload: WebhookPayload) => Promise<void>;
}

export class WebhookManager {
  private handlers: Map<string, WebhookHandler> = new Map();
  private queue: WebhookPayload[] = [];
  private processing: boolean = false;

  registerWebhook(path: string, handler: (payload: WebhookPayload) => Promise<void>): void {
    this.handlers.set(path, { path, handler });
    console.log(`✅ Webhook registrado: ${path}`);
  }

  async handleWebhook(path: string, payload: any): Promise<void> {
    const handler = this.handlers.get(path);
    if (!handler) {
      console.warn(`⚠️ No handler encontrado para webhook: ${path}`);
      return;
    }

    const webhookPayload: WebhookPayload = {
      type: path,
      data: payload,
      timestamp: new Date(),
    };

    // Agregar a la cola para procesamiento asincrónico
    this.queue.push(webhookPayload);
    await this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const payload = this.queue.shift();
        if (!payload) break;

        const handler = this.handlers.get(payload.type);
        if (handler) {
          try {
            await handler.handler(payload);
          } catch (error) {
            console.error(`Error procesando webhook ${payload.type}:`, error);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  getHandlers(): Map<string, WebhookHandler> {
    return this.handlers;
  }
}

export const webhookManager = new WebhookManager();
