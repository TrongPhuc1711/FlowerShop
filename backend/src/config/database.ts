import mysql from 'mysql2/promise';
import { env } from './env';

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
});

export const db = {
  query: async <T = any>(sql: string, params?: any[]): Promise<T> => {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  },

  queryOne: async <T = any>(sql: string, params?: any[]): Promise<T | null> => {
    const [rows] = await pool.execute(sql, params);
    const result = rows as any[];
    return result.length > 0 ? (result[0] as T) : null;
  },

  execute: async (sql: string, params?: any[]): Promise<mysql.ResultSetHeader> => {
    const [result] = await pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  },

  getConnection: () => pool.getConnection(),

  /** Run multiple queries inside a transaction */
  transaction: async <T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> => {
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      const result = await fn(conn);
      await conn.commit();
      return result;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  pool,
};

export default db;
