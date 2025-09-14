/**
 * Settings Repository
 * Handles all settings-related database operations
 */

const databaseManager = require('../connection');
const logger = require('../logger');

class SettingsRepository {
  constructor() {
    this.db = databaseManager.getSQLite();
  }

  /**
   * Get all settings
   */
  async getAll() {
    try {
      const settings = await this.db.setting.findMany({
        orderBy: { key: 'asc' }
      });
      
      // Convert to object format
      const settingsObj = {};
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value;
      });
      
      logger.database.query('GET all settings');
      return settingsObj;
    } catch (error) {
      logger.database.error('get all settings', error);
      throw error;
    }
  }

  /**
   * Get setting by key
   */
  async get(key) {
    try {
      const setting = await this.db.setting.findUnique({
        where: { key }
      });
      
      logger.database.query('GET setting by key', { key });
      return setting ? setting.value : null;
    } catch (error) {
      logger.database.error('get setting by key', error);
      throw error;
    }
  }

  /**
   * Set setting value
   */
  async set(key, value) {
    try {
      const setting = await this.db.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
      
      logger.database.query('SET setting', { key, value });
      return setting;
    } catch (error) {
      logger.database.error('set setting', error);
      throw error;
    }
  }

  /**
   * Set multiple settings
   */
  async setMultiple(settings) {
    try {
      const promises = Object.entries(settings).map(([key, value]) =>
        this.db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      );

      await Promise.all(promises);
      
      logger.database.query('SET multiple settings', { count: Object.keys(settings).length });
      return true;
    } catch (error) {
      logger.database.error('set multiple settings', error);
      throw error;
    }
  }

  /**
   * Delete setting
   */
  async delete(key) {
    try {
      const setting = await this.db.setting.delete({
        where: { key }
      });
      
      logger.database.query('DELETE setting', { key });
      return setting;
    } catch (error) {
      logger.database.error('delete setting', error);
      throw error;
    }
  }

  /**
   * Get app configuration
   */
  async getAppConfig() {
    try {
      const configKeys = [
        'app_version',
        'app_name',
        'max_concurrent_downloads',
        'preferred_quality',
        'fallback_qualities',
        'download_path',
        'auto_organize',
        'auto_subtitles',
        'min_seeders',
        'max_file_size_gb',
        'remote_access_enabled',
        'remote_access_port',
        'tmdb_language',
        'tmdb_region',
        'cache_ttl_hours',
        'log_level',
        'debug_mode'
      ];

      const settings = await this.db.setting.findMany({
        where: {
          key: {
            in: configKeys
          }
        }
      });

      const config = {};
      settings.forEach(setting => {
        let value = setting.value;
        
        // Parse JSON values
        if (setting.key === 'fallback_qualities') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = ['720p', '4K'];
          }
        }
        
        // Parse boolean values
        if (['auto_organize', 'auto_subtitles', 'remote_access_enabled', 'debug_mode'].includes(setting.key)) {
          value = value === 'true';
        }
        
        // Parse number values
        if (['max_concurrent_downloads', 'min_seeders', 'max_file_size_gb', 'remote_access_port', 'cache_ttl_hours'].includes(setting.key)) {
          value = parseInt(value);
        }

        config[setting.key] = value;
      });

      logger.database.query('GET app configuration');
      return config;
    } catch (error) {
      logger.database.error('get app configuration', error);
      throw error;
    }
  }

  /**
   * Update app configuration
   */
  async updateAppConfig(config) {
    try {
      const settingsToUpdate = {};
      
      Object.entries(config).forEach(([key, value]) => {
        // Convert values to strings for storage
        if (typeof value === 'object') {
          settingsToUpdate[key] = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          settingsToUpdate[key] = value.toString();
        } else {
          settingsToUpdate[key] = value.toString();
        }
      });

      await this.setMultiple(settingsToUpdate);
      
      logger.database.query('UPDATE app configuration', { keys: Object.keys(config) });
      return true;
    } catch (error) {
      logger.database.error('update app configuration', error);
      throw error;
    }
  }

  /**
   * Reset to default settings
   */
  async resetToDefaults() {
    try {
      const defaultSettings = [
        { key: 'app_version', value: '1.0.0' },
        { key: 'app_name', value: 'NiluFlix' },
        { key: 'max_concurrent_downloads', value: '3' },
        { key: 'preferred_quality', value: '1080p' },
        { key: 'fallback_qualities', value: '["720p", "4K"]' },
        { key: 'download_path', value: process.env.MOVIES_DIR || '~/Movies/NiluFlix' },
        { key: 'auto_organize', value: 'true' },
        { key: 'auto_subtitles', value: 'true' },
        { key: 'min_seeders', value: '5' },
        { key: 'max_file_size_gb', value: '10' },
        { key: 'remote_access_enabled', value: 'false' },
        { key: 'remote_access_port', value: '3002' },
        { key: 'tmdb_language', value: 'en-US' },
        { key: 'tmdb_region', value: 'US' },
        { key: 'cache_ttl_hours', value: '24' },
        { key: 'log_level', value: 'info' },
        { key: 'debug_mode', value: 'false' }
      ];

      for (const setting of defaultSettings) {
        await this.db.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: setting
        });
      }

      logger.database.query('RESET to default settings');
      return true;
    } catch (error) {
      logger.database.error('reset to default settings', error);
      throw error;
    }
  }

  /**
   * Get download settings
   */
  async getDownloadSettings() {
    try {
      const downloadKeys = [
        'max_concurrent_downloads',
        'preferred_quality',
        'fallback_qualities',
        'download_path',
        'auto_organize',
        'auto_subtitles',
        'min_seeders',
        'max_file_size_gb'
      ];

      const settings = await this.db.setting.findMany({
        where: {
          key: {
            in: downloadKeys
          }
        }
      });

      const downloadSettings = {};
      settings.forEach(setting => {
        let value = setting.value;
        
        if (setting.key === 'fallback_qualities') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = ['720p', '4K'];
          }
        }
        
        if (['auto_organize', 'auto_subtitles'].includes(setting.key)) {
          value = value === 'true';
        }
        
        if (['max_concurrent_downloads', 'min_seeders', 'max_file_size_gb'].includes(setting.key)) {
          value = parseInt(value);
        }

        downloadSettings[setting.key] = value;
      });

      logger.database.query('GET download settings');
      return downloadSettings;
    } catch (error) {
      logger.database.error('get download settings', error);
      throw error;
    }
  }

  /**
   * Get remote access settings
   */
  async getRemoteAccessSettings() {
    try {
      const remoteKeys = [
        'remote_access_enabled',
        'remote_access_port'
      ];

      const settings = await this.db.setting.findMany({
        where: {
          key: {
            in: remoteKeys
          }
        }
      });

      const remoteSettings = {};
      settings.forEach(setting => {
        let value = setting.value;
        
        if (setting.key === 'remote_access_enabled') {
          value = value === 'true';
        }
        
        if (setting.key === 'remote_access_port') {
          value = parseInt(value);
        }

        remoteSettings[setting.key] = value;
      });

      logger.database.query('GET remote access settings');
      return remoteSettings;
    } catch (error) {
      logger.database.error('get remote access settings', error);
      throw error;
    }
  }
}

module.exports = SettingsRepository;
