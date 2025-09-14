/**
 * Download Queue Repository
 * Handles all download queue-related database operations
 */

const databaseManager = require('../connection');
const logger = require('../logger');

class DownloadQueueRepository {
  constructor() {
    this.db = databaseManager.getSQLite();
  }

  /**
   * Add item to download queue
   */
  async addToQueue(queueData) {
    try {
      const queueItem = await this.db.downloadQueue.create({
        data: queueData
      });
      
      logger.database.query('ADD to download queue', queueData);
      return queueItem;
    } catch (error) {
      logger.database.error('add to download queue', error);
      throw error;
    }
  }

  /**
   * Get all items in queue
   */
  async getAll() {
    try {
      const queueItems = await this.db.downloadQueue.findMany({
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      });
      
      logger.database.query('GET all download queue items');
      return queueItems;
    } catch (error) {
      logger.database.error('get all download queue items', error);
      throw error;
    }
  }

  /**
   * Get items by status
   */
  async getByStatus(status) {
    try {
      const queueItems = await this.db.downloadQueue.findMany({
        where: { status },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      });
      
      logger.database.query('GET download queue items by status', { status });
      return queueItems;
    } catch (error) {
      logger.database.error('get download queue items by status', error);
      throw error;
    }
  }

  /**
   * Get next item to process
   */
  async getNext() {
    try {
      const queueItem = await this.db.downloadQueue.findFirst({
        where: { status: 'queued' },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ]
      });
      
      logger.database.query('GET next download queue item');
      return queueItem;
    } catch (error) {
      logger.database.error('get next download queue item', error);
      throw error;
    }
  }

  /**
   * Update queue item status
   */
  async updateStatus(id, status, progress = null) {
    try {
      const updateData = {
        status
      };

      if (progress !== null) {
        updateData.progress = progress;
      }

      if (status === 'downloading' && !updateData.startedAt) {
        updateData.startedAt = new Date();
      }

      if (status === 'completed' || status === 'failed') {
        updateData.completedAt = new Date();
      }

      const queueItem = await this.db.downloadQueue.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.database.query('UPDATE download queue status', { id, status, progress });
      return queueItem;
    } catch (error) {
      logger.database.error('update download queue status', error);
      throw error;
    }
  }

  /**
   * Update queue item progress
   */
  async updateProgress(id, progress, downloadSpeed = null, eta = null) {
    try {
      const updateData = {
        progress
      };

      if (downloadSpeed !== null) {
        updateData.downloadSpeed = downloadSpeed;
      }

      if (eta !== null) {
        updateData.eta = eta;
      }

      const queueItem = await this.db.downloadQueue.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.database.query('UPDATE download queue progress', { id, progress, downloadSpeed, eta });
      return queueItem;
    } catch (error) {
      logger.database.error('update download queue progress', error);
      throw error;
    }
  }

  /**
   * Remove item from queue
   */
  async remove(id) {
    try {
      const queueItem = await this.db.downloadQueue.delete({
        where: { id: parseInt(id) }
      });

      logger.database.query('REMOVE from download queue', { id });
      return queueItem;
    } catch (error) {
      logger.database.error('remove from download queue', error);
      throw error;
    }
  }

  /**
   * Clear completed items
   */
  async clearCompleted() {
    try {
      const result = await this.db.downloadQueue.deleteMany({
        where: { status: 'completed' }
      });

      logger.database.query('CLEAR completed download queue items', { count: result.count });
      return result;
    } catch (error) {
      logger.database.error('clear completed download queue items', error);
      throw error;
    }
  }

  /**
   * Clear failed items
   */
  async clearFailed() {
    try {
      const result = await this.db.downloadQueue.deleteMany({
        where: { status: 'failed' }
      });

      logger.database.query('CLEAR failed download queue items', { count: result.count });
      return result;
    } catch (error) {
      logger.database.error('clear failed download queue items', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getStatistics() {
    try {
      const [
        total,
        queued,
        downloading,
        completed,
        failed
      ] = await Promise.all([
        this.db.downloadQueue.count(),
        this.db.downloadQueue.count({ where: { status: 'queued' } }),
        this.db.downloadQueue.count({ where: { status: 'downloading' } }),
        this.db.downloadQueue.count({ where: { status: 'completed' } }),
        this.db.downloadQueue.count({ where: { status: 'failed' } })
      ]);

      const stats = {
        total,
        queued,
        downloading,
        completed,
        failed,
        active: queued + downloading
      };

      logger.database.query('GET download queue statistics');
      return stats;
    } catch (error) {
      logger.database.error('get download queue statistics', error);
      throw error;
    }
  }

  /**
   * Get active downloads (downloading status)
   */
  async getActiveDownloads() {
    try {
      const activeDownloads = await this.db.downloadQueue.findMany({
        where: { status: 'downloading' },
        orderBy: [
          { priority: 'desc' },
          { startedAt: 'asc' }
        ]
      });
      
      logger.database.query('GET active downloads');
      return activeDownloads;
    } catch (error) {
      logger.database.error('get active downloads', error);
      throw error;
    }
  }

  /**
   * Pause all downloads
   */
  async pauseAll() {
    try {
      const result = await this.db.downloadQueue.updateMany({
        where: { status: 'downloading' },
        data: { status: 'paused' }
      });

      logger.database.query('PAUSE all downloads', { count: result.count });
      return result;
    } catch (error) {
      logger.database.error('pause all downloads', error);
      throw error;
    }
  }

  /**
   * Resume all paused downloads
   */
  async resumeAll() {
    try {
      const result = await this.db.downloadQueue.updateMany({
        where: { status: 'paused' },
        data: { status: 'queued' }
      });

      logger.database.query('RESUME all downloads', { count: result.count });
      return result;
    } catch (error) {
      logger.database.error('resume all downloads', error);
      throw error;
    }
  }

  /**
   * Get download history
   */
  async getHistory(limit = 50) {
    try {
      const history = await this.db.downloadHistory.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      logger.database.query('GET download history', { limit });
      return history;
    } catch (error) {
      logger.database.error('get download history', error);
      throw error;
    }
  }

  /**
   * Add to download history
   */
  async addToHistory(historyData) {
    try {
      const historyItem = await this.db.downloadHistory.create({
        data: historyData
      });
      
      logger.database.query('ADD to download history', historyData);
      return historyItem;
    } catch (error) {
      logger.database.error('add to download history', error);
      throw error;
    }
  }
}

module.exports = DownloadQueueRepository;
