// Módulo de persistencia con SQLite usando sql.js
// Almacena preferencias de usuarios y datos de mercado para retención y monetización

import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la base de datos
const DB_PATH = path.join(__dirname, "..", "..", "harrison.db");

let SQL: any = null;
let dbInstance: HarrisonDatabase | null = null;

export interface UserPreference {
  userId: string;
  key: string;
  value: string;
  updatedAt: Date;
}

export interface MarketData {
  id?: number;
  niche: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  trend: "rising" | "stable" | "declining";
  potentialRevenue: number;
  lastUpdated: Date;
  source: string;
}

export interface UserInteraction {
  id?: number;
  userId: string;
  action: string;
  data: string;
  timestamp: Date;
}

export class HarrisonDatabase {
  private db: SqlJsDatabase | null = null;
  private dbPath: string;

  constructor(dbPath: string = DB_PATH) {
    this.dbPath = dbPath;
  }

  /**
   * Inicializa la base de datos
   */
  async initialize(): Promise<void> {
    if (!SQL) {
      SQL = await initSqlJs();
    }

    // Cargar la BD existente o crear una nueva
    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(buffer);
    } else {
      this.db = new SQL.Database();
    }

    this.initializeTables();
  }

  /**
   * Inicializa las tablas de la base de datos
   */
  private initializeTables(): void {
    if (!this.db) return;

    // Tabla de preferencias de usuarios
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, key)
      )
    `);

    // Tabla de datos de mercado
    this.db.run(`
      CREATE TABLE IF NOT EXISTS market_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        niche TEXT NOT NULL,
        keyword TEXT NOT NULL,
        search_volume INTEGER DEFAULT 0,
        difficulty INTEGER DEFAULT 0,
        trend TEXT DEFAULT 'stable',
        potential_revenue REAL DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        source TEXT,
        UNIQUE(niche, keyword)
      )
    `);

    // Tabla de interacciones de usuarios
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de sesiones
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        context TEXT,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.save();
  }

  // ===== Preferencias de Usuario =====

  setUserPreference(userId: string, key: string, value: string): void {
    if (!this.db) return;

    this.db.run(
      `
      INSERT OR REPLACE INTO user_preferences (user_id, key, value, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [userId, key, value]
    );

    this.save();
  }

  getUserPreference(userId: string, key: string): string | null {
    if (!this.db) return null;

    const result = this.db.exec(
      `
      SELECT value FROM user_preferences
      WHERE user_id = ? AND key = ?
      `,
      [userId, key]
    );

    if (result.length > 0 && result[0].values.length > 0) {
      return result[0].values[0][0] as string;
    }
    return null;
  }

  getUserPreferences(userId: string): Record<string, string> {
    if (!this.db) return {};

    const result = this.db.exec(
      `
      SELECT key, value FROM user_preferences
      WHERE user_id = ?
      `,
      [userId]
    );

    const prefs: Record<string, string> = {};
    if (result.length > 0) {
      result[0].values.forEach((row: any[]) => {
        prefs[row[0] as string] = row[1] as string;
      });
    }
    return prefs;
  }

  deleteUserPreference(userId: string, key: string): void {
    if (!this.db) return;

    this.db.run(
      `
      DELETE FROM user_preferences
      WHERE user_id = ? AND key = ?
      `,
      [userId, key]
    );

    this.save();
  }

  // ===== Datos de Mercado =====

  addMarketData(data: MarketData): MarketData {
    if (!this.db) return data;

    this.db.run(
      `
      INSERT OR REPLACE INTO market_data 
      (niche, keyword, search_volume, difficulty, trend, potential_revenue, source, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        data.niche,
        data.keyword,
        data.searchVolume,
        data.difficulty,
        data.trend,
        data.potentialRevenue,
        data.source,
      ]
    );

    this.save();
    return { ...data, lastUpdated: new Date() };
  }

  getMarketData(niche: string, keyword: string): MarketData | null {
    if (!this.db) return null;

    const result = this.db.exec(
      `
      SELECT * FROM market_data
      WHERE niche = ? AND keyword = ?
      `,
      [niche, keyword]
    );

    if (result.length > 0 && result[0].values.length > 0) {
      return this.mapMarketData(result[0], 0);
    }
    return null;
  }

  getNicheMarketData(niche: string): MarketData[] {
    if (!this.db) return [];

    const result = this.db.exec(
      `
      SELECT * FROM market_data
      WHERE niche = ?
      ORDER BY potential_revenue DESC
      `,
      [niche]
    );

    if (result.length > 0) {
      return result[0].values.map((_: any, idx: number) => this.mapMarketData(result[0], idx));
    }
    return [];
  }

  getTrendingNiches(limit: number = 10): MarketData[] {
    if (!this.db) return [];

    const result = this.db.exec(
      `
      SELECT * FROM market_data
      WHERE trend = 'rising'
      ORDER BY potential_revenue DESC
      LIMIT ?
      `,
      [limit]
    );

    if (result.length > 0) {
      return result[0].values.map((_: any, idx: number) => this.mapMarketData(result[0], idx));
    }
    return [];
  }

  deleteMarketData(niche: string, keyword: string): void {
    if (!this.db) return;

    this.db.run(
      `
      DELETE FROM market_data
      WHERE niche = ? AND keyword = ?
      `,
      [niche, keyword]
    );

    this.save();
  }

  // ===== Interacciones de Usuario =====

  addUserInteraction(userId: string, action: string, data?: any): UserInteraction {
    if (!this.db)
      return {
        userId,
        action,
        data: JSON.stringify(data || {}),
        timestamp: new Date(),
      };

    this.db.run(
      `
      INSERT INTO user_interactions (user_id, action, data, timestamp)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [userId, action, JSON.stringify(data || {})]
    );

    this.save();

    return {
      userId,
      action,
      data: JSON.stringify(data),
      timestamp: new Date(),
    };
  }

  getUserInteractions(userId: string, limit: number = 50): UserInteraction[] {
    if (!this.db) return [];

    const result = this.db.exec(
      `
      SELECT * FROM user_interactions
      WHERE user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
      `,
      [userId, limit]
    );

    if (result.length > 0) {
      return result[0].values.map((_: any, idx: number) => this.mapUserInteraction(result[0], idx));
    }
    return [];
  }

  getRecentInteractions(hours: number = 24, limit: number = 100): any[] {
    if (!this.db) return [];

    const cutoffTime = new Date(Date.now() - hours * 3600000).toISOString();

    const result = this.db.exec(
      `
      SELECT * FROM user_interactions
      WHERE timestamp > ?
      ORDER BY timestamp DESC
      LIMIT ?
      `,
      [cutoffTime, limit]
    );

    if (result.length > 0) {
      return result[0].values.map((row: any) => ({
        id: row[0],
        user_id: row[1],
        action: row[2],
        data: row[3],
        timestamp: new Date(row[4] as string),
      }));
    }
    return [];
  }

  // ===== Sesiones =====

  createSession(userId: string, context?: any): { userId: string; context: any } {
    if (!this.db) return { userId, context: context || {} };

    this.db.run(
      `
      INSERT OR REPLACE INTO sessions (user_id, context, last_activity, created_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [userId, JSON.stringify(context || {})]
    );

    this.save();
    return { userId, context: context || {} };
  }

  getSession(userId: string): { context: any; lastActivity: Date } | null {
    if (!this.db) return null;

    const result = this.db.exec(
      `
      SELECT context, last_activity FROM sessions
      WHERE user_id = ?
      `,
      [userId]
    );

    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0];
      return {
        context: JSON.parse(row[0] as string),
        lastActivity: new Date(row[1] as string),
      };
    }
    return null;
  }

  updateSessionActivity(userId: string): void {
    if (!this.db) return;

    this.db.run(
      `
      UPDATE sessions
      SET last_activity = CURRENT_TIMESTAMP
      WHERE user_id = ?
      `,
      [userId]
    );

    this.save();
  }

  deleteSession(userId: string): void {
    if (!this.db) return;

    this.db.run(
      `
      DELETE FROM sessions
      WHERE user_id = ?
      `,
      [userId]
    );

    this.save();
  }

  // ===== Utilidades =====

  /**
   * Obtiene estadísticas generales
   */
  getStats(): {
    totalUsers: number;
    totalNiches: number;
    totalInteractions: number;
    trendingCount: number;
  } {
    if (!this.db) {
      return {
        totalUsers: 0,
        totalNiches: 0,
        totalInteractions: 0,
        trendingCount: 0,
      };
    }

    const users = this.db.exec(`SELECT COUNT(DISTINCT user_id) as count FROM user_preferences`);
    const niches = this.db.exec(`SELECT COUNT(DISTINCT niche) as count FROM market_data`);
    const interactions = this.db.exec(`SELECT COUNT(*) as count FROM user_interactions`);
    const trending = this.db.exec(`SELECT COUNT(*) as count FROM market_data WHERE trend = 'rising'`);

    return {
      totalUsers: users.length > 0 ? (users[0].values[0][0] as number) : 0,
      totalNiches: niches.length > 0 ? (niches[0].values[0][0] as number) : 0,
      totalInteractions: interactions.length > 0 ? (interactions[0].values[0][0] as number) : 0,
      trendingCount: trending.length > 0 ? (trending[0].values[0][0] as number) : 0,
    };
  }

  /**
   * Limpia datos antiguos
   */
  cleanup(daysOld: number = 30): void {
    if (!this.db) return;

    const cutoffTime = new Date(Date.now() - daysOld * 24 * 3600000).toISOString();

    this.db.run(
      `
      DELETE FROM user_interactions
      WHERE timestamp < ?
      `,
      [cutoffTime]
    );

    this.save();
  }

  /**
   * Guarda la base de datos al archivo
   */
  private save(): void {
    if (!this.db) return;

    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error("Error guardando base de datos:", error);
    }
  }

  /**
   * Cierra la conexión a la base de datos
   */
  close(): void {
    if (this.db) {
      this.save();
      this.db.close();
      this.db = null;
    }
  }

  // ===== Helpers =====

  private mapMarketData(result: any, rowIdx: number): MarketData {
    const row = result.values[rowIdx];
    return {
      id: row[0] as number,
      niche: row[1] as string,
      keyword: row[2] as string,
      searchVolume: row[3] as number,
      difficulty: row[4] as number,
      trend: row[5] as "rising" | "stable" | "declining",
      potentialRevenue: row[6] as number,
      lastUpdated: new Date(row[7] as string),
      source: row[8] as string,
    };
  }

  private mapUserInteraction(result: any, rowIdx: number): UserInteraction {
    const row = result.values[rowIdx];
    return {
      id: row[0] as number,
      userId: row[1] as string,
      action: row[2] as string,
      data: row[3] as string,
      timestamp: new Date(row[4] as string),
    };
  }
}

/**
 * Obtiene o crea la instancia global de la base de datos
 */
export async function getDatabase(): Promise<HarrisonDatabase> {
  if (!dbInstance) {
    dbInstance = new HarrisonDatabase();
    await dbInstance.initialize();
  }
  return dbInstance;
}

export default HarrisonDatabase;

