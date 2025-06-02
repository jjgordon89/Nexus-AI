/**
 * Database client for NexusAI
 * 
 * This module provides a client for interacting with the libSQL database.
 * It includes functions for connecting to the database, creating tables,
 * and performing CRUD operations.
 */

import { createClient } from '@libsql/client';
import { nanoid } from 'nanoid';
import { SQL_CREATE_TABLES } from './schema';

/**
 * Configuration options for the database client
 */
interface DBConfig {
  url?: string;
  authToken?: string;
  syncUrl?: string;
  inMemory?: boolean;
}

/**
 * Default configuration for local development
 */
const DEFAULT_CONFIG: DBConfig = {
  inMemory: true,
};

/**
 * Database client class for managing the connection and operations
 */
class DBClient {
  private static instance: DBClient;
  private client;
  private isInitialized = false;

  private constructor(config: DBConfig = DEFAULT_CONFIG) {
    // Create a client with the provided configuration or default to in-memory
    this.client = createClient({
      url: config.url || 'file:nexusai.db',
      authToken: config.authToken,
      syncUrl: config.syncUrl,
      // Use in-memory database for local development or testing
      ...(config.inMemory ? { url: ':memory:' } : {}),
    });
  }

  /**
   * Get the singleton instance of the database client
   */
  public static getInstance(config?: DBConfig): DBClient {
    if (!DBClient.instance) {
      DBClient.instance = new DBClient(config);
    }
    return DBClient.instance;
  }

  /**
   * Initialize the database schema
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing database...');
      
      // Create tables if they don't exist
      await this.client.execute(SQL_CREATE_TABLES);
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Perform a database query
   */
  public async query(sql: string, params: any[] = []): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const result = await this.client.execute({
        sql,
        args: params,
      });
      
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Insert a record into a table
   */
  public async insert(table: string, data: Record<string, any>): Promise<string> {
    const id = data.id || nanoid();
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    
    const sql = `INSERT INTO ${table} (id, ${columns}) VALUES (?, ${placeholders})`;
    
    await this.query(sql, [id, ...values]);
    
    return id;
  }

  /**
   * Update a record in a table
   */
  public async update(table: string, id: string, data: Record<string, any>): Promise<void> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    
    await this.query(sql, [...values, id]);
  }

  /**
   * Delete a record from a table
   */
  public async delete(table: string, id: string): Promise<void> {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    await this.query(sql, [id]);
  }

  /**
   * Find records by a field value
   */
  public async findBy(table: string, field: string, value: any): Promise<any[]> {
    const sql = `SELECT * FROM ${table} WHERE ${field} = ?`;
    const result = await this.query(sql, [value]);
    return result.rows;
  }

  /**
   * Find a record by ID
   */
  public async findById(table: string, id: string): Promise<any | null> {
    const sql = `SELECT * FROM ${table} WHERE id = ?`;
    const result = await this.query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find all records in a table
   */
  public async findAll(table: string): Promise<any[]> {
    const sql = `SELECT * FROM ${table}`;
    const result = await this.query(sql);
    return result.rows;
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    try {
      // This method doesn't exist in libSQL yet, but adding for future-proofing
      // this.client.close && await this.client.close();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}

// Export a singleton instance
export const db = DBClient.getInstance();