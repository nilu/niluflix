/**
 * Episode Repository
 * Handles all episode-related database operations
 */

const databaseManager = require('../connection');
const logger = require('../logger');

class EpisodeRepository {
  constructor() {
    this.db = databaseManager.getSQLite();
  }

  /**
   * Create a new episode
   */
  async create(episodeData) {
    try {
      const episode = await this.db.episode.create({
        data: episodeData
      });
      
      logger.database.query('CREATE episode', episodeData);
      return episode;
    } catch (error) {
      logger.database.error('create episode', error);
      throw error;
    }
  }

  /**
   * Create multiple episodes
   */
  async createMany(episodesData) {
    try {
      const episodes = await this.db.episode.createMany({
        data: episodesData
      });
      
      logger.database.query('CREATE many episodes', { count: episodesData.length });
      return episodes;
    } catch (error) {
      logger.database.error('create many episodes', error);
      throw error;
    }
  }

  /**
   * Find episode by ID
   */
  async findById(id) {
    try {
      const episode = await this.db.episode.findUnique({
        where: { id: parseInt(id) },
        include: {
          tvShow: true
        }
      });
      
      logger.database.query('FIND episode by id', { id });
      return episode;
    } catch (error) {
      logger.database.error('find episode by id', error);
      throw error;
    }
  }

  /**
   * Find episodes by TV show ID
   */
  async findByTVShowId(tvShowId) {
    try {
      const episodes = await this.db.episode.findMany({
        where: { tvShowId: parseInt(tvShowId) },
        orderBy: [
          { seasonNumber: 'asc' },
          { episodeNumber: 'asc' }
        ],
        include: {
          tvShow: true
        }
      });
      
      logger.database.query('FIND episodes by tv_show_id', { tvShowId });
      return episodes;
    } catch (error) {
      logger.database.error('find episodes by tv_show_id', error);
      throw error;
    }
  }

  /**
   * Find episodes by season
   */
  async findBySeason(tvShowId, seasonNumber) {
    try {
      const episodes = await this.db.episode.findMany({
        where: {
          tvShowId: parseInt(tvShowId),
          seasonNumber: parseInt(seasonNumber)
        },
        orderBy: {
          episodeNumber: 'asc'
        },
        include: {
          tvShow: true
        }
      });
      
      logger.database.query('FIND episodes by season', { tvShowId, seasonNumber });
      return episodes;
    } catch (error) {
      logger.database.error('find episodes by season', error);
      throw error;
    }
  }

  /**
   * Find specific episode
   */
  async findBySeasonAndEpisode(tvShowId, seasonNumber, episodeNumber) {
    try {
      const episode = await this.db.episode.findFirst({
        where: {
          tvShowId: parseInt(tvShowId),
          seasonNumber: parseInt(seasonNumber),
          episodeNumber: parseInt(episodeNumber)
        },
        include: {
          tvShow: true
        }
      });
      
      logger.database.query('FIND episode by season and episode', { tvShowId, seasonNumber, episodeNumber });
      return episode;
    } catch (error) {
      logger.database.error('find episode by season and episode', error);
      throw error;
    }
  }

  /**
   * Find downloaded episodes
   */
  async findDownloaded() {
    try {
      const episodes = await this.db.episode.findMany({
        where: {
          downloadStatus: 'downloaded'
        },
        orderBy: [
          { tvShow: { name: 'asc' } },
          { seasonNumber: 'asc' },
          { episodeNumber: 'asc' }
        ],
        include: {
          tvShow: true
        }
      });
      
      logger.database.query('FIND downloaded episodes');
      return episodes;
    } catch (error) {
      logger.database.error('find downloaded episodes', error);
      throw error;
    }
  }

  /**
   * Find episodes by download status
   */
  async findByDownloadStatus(status) {
    try {
      const episodes = await this.db.episode.findMany({
        where: {
          downloadStatus: status
        },
        orderBy: [
          { tvShow: { name: 'asc' } },
          { seasonNumber: 'asc' },
          { episodeNumber: 'asc' }
        ],
        include: {
          tvShow: true
        }
      });
      
      logger.database.query('FIND episodes by download status', { status });
      return episodes;
    } catch (error) {
      logger.database.error('find episodes by download status', error);
      throw error;
    }
  }

  /**
   * Update episode
   */
  async update(id, updateData) {
    try {
      const episode = await this.db.episode.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.database.query('UPDATE episode', { id, updateData });
      return episode;
    } catch (error) {
      logger.database.error('update episode', error);
      throw error;
    }
  }

  /**
   * Update download status
   */
  async updateDownloadStatus(id, status, progress = 0) {
    try {
      const episode = await this.db.episode.update({
        where: { id: parseInt(id) },
        data: {
          downloadStatus: status,
          downloadProgress: progress,
          updatedAt: new Date()
        }
      });

      logger.database.query('UPDATE episode download status', { id, status, progress });
      return episode;
    } catch (error) {
      logger.database.error('update episode download status', error);
      throw error;
    }
  }

  /**
   * Update multiple episodes download status
   */
  async updateMultipleDownloadStatus(episodeIds, status, progress = 0) {
    try {
      const result = await this.db.episode.updateMany({
        where: {
          id: {
            in: episodeIds.map(id => parseInt(id))
          }
        },
        data: {
          downloadStatus: status,
          downloadProgress: progress,
          updatedAt: new Date()
        }
      });

      logger.database.query('UPDATE multiple episodes download status', { episodeIds, status, progress });
      return result;
    } catch (error) {
      logger.database.error('update multiple episodes download status', error);
      throw error;
    }
  }

  /**
   * Get episode statistics for a TV show
   */
  async getStatisticsForTVShow(tvShowId) {
    try {
      const [
        total,
        downloaded,
        downloading,
        notDownloaded
      ] = await Promise.all([
        this.db.episode.count({
          where: { tvShowId: parseInt(tvShowId) }
        }),
        this.db.episode.count({
          where: {
            tvShowId: parseInt(tvShowId),
            downloadStatus: 'downloaded'
          }
        }),
        this.db.episode.count({
          where: {
            tvShowId: parseInt(tvShowId),
            downloadStatus: 'downloading'
          }
        }),
        this.db.episode.count({
          where: {
            tvShowId: parseInt(tvShowId),
            downloadStatus: 'not_downloaded'
          }
        })
      ]);

      const stats = {
        total,
        downloaded,
        downloading,
        notDownloaded,
        downloadPercentage: total > 0 ? Math.round((downloaded / total) * 100) : 0
      };

      logger.database.query('GET episode statistics for tv_show', { tvShowId });
      return stats;
    } catch (error) {
      logger.database.error('get episode statistics for tv_show', error);
      throw error;
    }
  }

  /**
   * Get overall episode statistics
   */
  async getStatistics() {
    try {
      const [
        total,
        downloaded,
        downloading,
        notDownloaded
      ] = await Promise.all([
        this.db.episode.count(),
        this.db.episode.count({ where: { downloadStatus: 'downloaded' } }),
        this.db.episode.count({ where: { downloadStatus: 'downloading' } }),
        this.db.episode.count({ where: { downloadStatus: 'not_downloaded' } })
      ]);

      const stats = {
        total,
        downloaded,
        downloading,
        notDownloaded,
        downloadPercentage: total > 0 ? Math.round((downloaded / total) * 100) : 0
      };

      logger.database.query('GET episode statistics');
      return stats;
    } catch (error) {
      logger.database.error('get episode statistics', error);
      throw error;
    }
  }

  /**
   * Delete episode
   */
  async delete(id) {
    try {
      const episode = await this.db.episode.delete({
        where: { id: parseInt(id) }
      });

      logger.database.query('DELETE episode', { id });
      return episode;
    } catch (error) {
      logger.database.error('delete episode', error);
      throw error;
    }
  }

  /**
   * Delete all episodes for a TV show
   */
  async deleteByTVShowId(tvShowId) {
    try {
      const result = await this.db.episode.deleteMany({
        where: { tvShowId: parseInt(tvShowId) }
      });

      logger.database.query('DELETE episodes by tv_show_id', { tvShowId });
      return result;
    } catch (error) {
      logger.database.error('delete episodes by tv_show_id', error);
      throw error;
    }
  }
}

module.exports = EpisodeRepository;
