/**
 * Database Module
 * Centralized database access and management
 */

const databaseManager = require('./connection');
const MovieRepository = require('./models/MovieRepository');
const TVShowRepository = require('./models/TVShowRepository');
const EpisodeRepository = require('./models/EpisodeRepository');
const DownloadQueueRepository = require('./models/DownloadQueueRepository');
const SettingsRepository = require('./models/SettingsRepository');

class Database {
  constructor() {
    this.connected = false;
    this.repositories = {};
  }

  /**
   * Initialize database connections and repositories
   */
  async initialize() {
    try {
      // Connect to databases
      await databaseManager.connect();
      
      // Initialize repositories
      this.repositories = {
        movies: new MovieRepository(),
        tvShows: new TVShowRepository(),
        episodes: new EpisodeRepository(),
        downloadQueue: new DownloadQueueRepository(),
        settings: new SettingsRepository()
      };

      this.connected = true;
      
      console.log('✅ Database module initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database module:', error);
      throw error;
    }
  }

  /**
   * Get repository by name
   */
  getRepository(name) {
    if (!this.connected) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    if (!this.repositories[name]) {
      throw new Error(`Repository '${name}' not found. Available repositories: ${Object.keys(this.repositories).join(', ')}`);
    }
    
    return this.repositories[name];
  }

  /**
   * Get all repositories
   */
  getRepositories() {
    if (!this.connected) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return this.repositories;
  }

  /**
   * Check if database is healthy
   */
  async healthCheck() {
    try {
      return await databaseManager.healthCheck();
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return {
        sqlite: false,
        supabase: false,
        overall: false
      };
    }
  }

  /**
   * Close database connections
   */
  async close() {
    try {
      await databaseManager.disconnect();
      this.connected = false;
      this.repositories = {};
      console.log('✅ Database connections closed');
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction(callback) {
    if (!this.connected) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return await databaseManager.transaction(callback);
  }

  /**
   * Get direct database access (for advanced operations)
   */
  getSQLite() {
    if (!this.connected) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return databaseManager.getSQLite();
  }

  getSupabase() {
    if (!this.connected) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return databaseManager.getSupabase();
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;
