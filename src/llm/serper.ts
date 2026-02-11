// Módulo para integración con Serper API
// Proporciona búsqueda de Google en tiempo real para investigar nichos y tendencias

import axios, { AxiosInstance } from "axios";
import { config } from "../config.js";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

export interface SerperSearchResponse {
  searchParameters: {
    q: string;
    type: string;
    engine: string;
  };
  organic?: Array<{
    position: number;
    title: string;
    link: string;
    snippet: string;
    date?: string;
  }>;
  answerBox?: {
    title?: string;
    answer?: string;
    source?: string;
  };
  knowledgeGraph?: {
    title: string;
    type: string;
    description: string;
    imageUrl?: string;
  };
  relatedSearches?: Array<{
    query: string;
  }>;
}

export class SerperService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.serper.apiKey;

    this.client = axios.create({
      baseURL: config.serper.baseURL,
      headers: {
        "X-API-KEY": this.apiKey,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
  }

  /**
   * Busca información sobre nichos y tendencias
   */
  async searchNiche(query: string): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn("SERPER_API_KEY no está configurada");
      return [];
    }

    try {
      const response = await this.client.post<SerperSearchResponse>(
        config.serper.searchEndpoint,
        {
          q: query,
          gl: "es",
          hl: "es",
          num: 10,
        }
      );

      return this.parseResults(response.data);
    } catch (error) {
      console.error("Error en búsqueda de Serper:", error);
      throw error;
    }
  }

  /**
   * Busca el precio actual de Bitcoin
   */
  async getBitcoinPrice(): Promise<{
    price: string;
    source: string;
    timestamp: string;
  }> {
    if (!this.apiKey) {
      throw new Error("SERPER_API_KEY no está configurada");
    }

    try {
      const results = await this.searchNiche("precio Bitcoin hoy USD");
      
      if (!results || results.length === 0) {
        throw new Error("No se encontraron resultados para Bitcoin");
      }

      const firstResult = results[0];
      
      return {
        price: firstResult.snippet,
        source: firstResult.link,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error obteniendo precio de Bitcoin:", error);
      throw error;
    }
  }

  /**
   * Busca con parámetros personalizados
   */
  async searchAdvanced(
    query: string,
    options?: {
      location?: string;
      language?: string;
      numResults?: number;
      type?: "search" | "news" | "images";
    }
  ): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn("SERPER_API_KEY no está configurada");
      return [];
    }

    try {
      const response = await this.client.post<SerperSearchResponse>(
        config.serper.searchEndpoint,
        {
          q: query,
          gl: options?.location || "es",
          hl: options?.language || "es",
          num: options?.numResults || 10,
          type: options?.type || "search",
        }
      );

      return this.parseResults(response.data);
    } catch (error) {
      console.error("Error en búsqueda avanzada de Serper:", error);
      throw error;
    }
  }

  /**
   * Obtiene noticias sobre un tema (tendencias)
   */
  async getTrendingNews(topic: string): Promise<SearchResult[]> {
    return this.searchAdvanced(topic, {
      type: "news",
      numResults: 10,
    });
  }

  /**
   * Busca oportunidades de nicho específicas
   */
  async findNicheOpportunities(keyword: string): Promise<{
    trending: SearchResult[];
    relatedQuestions: string[];
    answerBox?: string;
  }> {
    if (!this.apiKey) {
      console.warn("SERPER_API_KEY no está configurada");
      return {
        trending: [],
        relatedQuestions: [],
      };
    }

    try {
      const response = await this.client.post<SerperSearchResponse>(
        config.serper.searchEndpoint,
        {
          q: keyword,
          gl: "es",
          hl: "es",
          num: 10,
        }
      );

      const results = this.parseResults(response.data);
      const relatedQuestions = response.data.relatedSearches?.map(
        (r) => r.query
      ) || [
        "Cómo comenzar en " + keyword,
        "Tendencias en " + keyword,
        "Oportunidades de " + keyword,
      ];

      return {
        trending: results,
        relatedQuestions,
        answerBox: response.data.answerBox?.answer,
      };
    } catch (error) {
      console.error("Error buscando oportunidades de nicho:", error);
      throw error;
    }
  }

  /**
   * Parsea los resultados de búsqueda de Serper a nuestro formato
   */
  private parseResults(data: SerperSearchResponse): SearchResult[] {
    if (!data.organic) {
      return [];
    }

    return data.organic.map((result) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      date: result.date,
    }));
  }

  /**
   * Comprueba si la API está funcionando
   */
  async healthCheck(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      await this.searchNiche("test");
      return true;
    } catch {
      return false;
    }
  }
}

export default new SerperService();
