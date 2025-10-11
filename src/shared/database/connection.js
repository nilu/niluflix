/**
 * Database Connection Manager
 * Handles SQLite and Supabase database connections with error handling
 */

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

class DatabaseManager {
  constructor() {
    this.sqlite = null;
    this.supabase = null;
    this.isConnected = false;
  }

  /**
   * Initialize SQLite database connection
   */
  async connectSQLite() {
    try {
      this.sqlite = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty'
      });

      // Test the connection
      await this.sqlite.$connect();
      
      // Test a simple query to ensure the database is working
      await this.sqlite.$queryRaw`SELECT 1`;
      
      logger.info('✅ SQLite database connected successfully');
      return this.sqlite;
    } catch (error) {
      logger.error('❌ Failed to connect to SQLite database:', error);
      throw new Error(`SQLite connection failed: ${error.message}`);
    }
  }

  /**
   * Initialize Supabase database connection
   */
  async connectSupabase() {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        logger.warn('⚠️  Supabase credentials not provided. Skipping Supabase connection.');
        return null;
      }

      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false
          }
        }
      );

      // Test the connection
      const { data, error } = await this.supabase
        .from('remote_sessions')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      logger.info('✅ Supabase database connected successfully');
      return this.supabase;
    } catch (error) {
      logger.error('❌ Failed to connect to Supabase database:', error);
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
  }

  /**
   * Initialize all database connections
   */
  async connect() {
    try {
      await this.connectSQLite();
      
      // Try to connect to Supabase, but don't fail if it doesn't work
      try {
        await this.connectSupabase();
      } catch (supabaseError) {
        logger.warn('⚠️ Supabase connection failed, continuing with SQLite only:', supabaseError.message);
      }
      
      this.isConnected = true;
      logger.info('🎉 Database connections established');
    } catch (error) {
      logger.error('💥 Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Get SQLite client
   */
  getSQLite() {
    if (!this.sqlite) {
      throw new Error('SQLite database not connected. Call connect() first.');
    }
    return this.sqlite;
  }

  /**
   * Get Supabase client
   */
  getSupabase() {
    if (!this.supabase) {
      throw new Error('Supabase database not connected. Call connect() first.');
    }
    return this.supabase;
  }

  /**
   * Check if databases are connected
   */
  isHealthy() {
    return this.isConnected && this.sqlite !== null;
  }

  /**
   * Close all database connections
   */
  async disconnect() {
    try {
      if (this.sqlite) {
        await this.sqlite.$disconnect();
        this.sqlite = null;
        logger.info('✅ SQLite database disconnected');
      }

      if (this.supabase) {
        // Supabase client doesn't need explicit disconnection
        this.supabase = null;
        logger.info('✅ Supabase database disconnected');
      }

      this.isConnected = false;
      logger.info('🎉 All database connections closed');
    } catch (error) {
      logger.error('❌ Error disconnecting from databases:', error);
      throw error;
    }
  }

  /**
   * Execute a transaction with error handling
   */
  async transaction(callback) {
    if (!this.sqlite) {
      throw new Error('SQLite database not connected');
    }

    try {
      return await this.sqlite.$transaction(callback);
    } catch (error) {
      logger.error('❌ Database transaction failed:', error);
      throw error;
    }
  }

  /**
   * Health check for all databases
   */
  async healthCheck() {
    const health = {
      sqlite: false,
      supabase: false,
      overall: false
    };

    try {
      // Check SQLite
      if (this.sqlite) {
        await this.sqlite.$queryRaw`SELECT 1`;
        health.sqlite = true;
      }

      // Check Supabase
      if (this.supabase) {
        const { error } = await this.supabase
          .from('remote_sessions')
          .select('count')
          .limit(1);
        
        health.supabase = !error;
      } else {
        health.supabase = true; // Not required
      }

      health.overall = health.sqlite && health.supabase;
      
      return health;
    } catch (error) {
      logger.error('❌ Database health check failed:', error);
      return health;
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

module.exports = databaseManager;
