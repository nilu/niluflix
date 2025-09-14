/**
 * TV Show Repository
 * Handles all TV show-related database operations
 */

const databaseManager = require('../connection');
const logger = require('../logger');

class TVShowRepository {
  constructor() {
    this.db = databaseManager.getSQLite();
  }

  /**
   * Create a new TV show
   */
  async create(tvShowData) {
    try {
      const tvShow = await this.db.tVShow.create({
        data: tvShowData
      });
      
      logger.database.query('CREATE tv_show', tvShowData);
      return tvShow;
    } catch (error) {
      logger.database.error('create tv_show', error);
      throw error;
    }
  }

  /**
   * Find TV show by ID
   */
  async findById(id) {
    try {
      const tvShow = await this.db.tVShow.findUnique({
        where: { id: parseInt(id) },
        include: {
          episodes: {
            orderBy: [
              { seasonNumber: 'asc' },
              { episodeNumber: 'asc' }
            ]
          }
        }
      });
      
      logger.database.query('FIND tv_show by id', { id });
      return tvShow;
    } catch (error) {
      logger.database.error('find tv_show by id', error);
      throw error;
    }
  }

  /**
   * Find TV show by TMDB ID
   */
  async findByTmdbId(tmdbId) {
    try {
      const tvShow = await this.db.tVShow.findUnique({
        where: { tmdbId: parseInt(tmdbId) },
        include: {
          episodes: {
            orderBy: [
              { seasonNumber: 'asc' },
              { episodeNumber: 'asc' }
            ]
          }
        }
      });
      
      logger.database.query('FIND tv_show by tmdb_id', { tmdbId });
      return tvShow;
    } catch (error) {
      logger.database.error('find tv_show by tmdb_id', error);
      throw error;
    }
  }

  /**
   * Find all TV shows with pagination
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        orderBy = 'createdAt',
        order = 'desc',
        search
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      if (search) {
        where.name = {
          contains: search,
          
        };
      }

      const [tvShows, total] = await Promise.all([
        this.db.tVShow.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: order },
          include: {
            episodes: {
              where: { downloadStatus: 'downloaded' },
              select: { id: true, seasonNumber: true, episodeNumber: true }
            }
          }
        }),
        this.db.tVShow.count({ where })
      ]);

      logger.database.query('FIND all tv_shows', { page, limit, where });
      
      return {
        tvShows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.database.error('find all tv_shows', error);
      throw error;
    }
  }

  /**
   * Find popular TV shows
   */
  async findPopular(limit = 20) {
    try {
      const tvShows = await this.db.tVShow.findMany({
        where: {
          voteAverage: {
            gte: 7.0
          }
        },
        orderBy: {
          voteAverage: 'desc'
        },
        take: limit,
        include: {
          episodes: {
            where: { downloadStatus: 'downloaded' },
            select: { id: true, seasonNumber: true, episodeNumber: true }
          }
        }
      });

      logger.database.query('FIND popular tv_shows', { limit });
      return tvShows;
    } catch (error) {
      logger.database.error('find popular tv_shows', error);
      throw error;
    }
  }

  /**
   * Find trending TV shows (recent releases with high ratings)
   */
  async findTrending(limit = 20) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const tvShows = await this.db.tVShow.findMany({
        where: {
          firstAirDate: {
            gte: thirtyDaysAgo.toISOString().split('T')[0]
          },
          voteAverage: {
            gte: 6.0
          }
        },
        orderBy: {
          voteAverage: 'desc'
        },
        take: limit,
        include: {
          episodes: {
            where: { downloadStatus: 'downloaded' },
            select: { id: true, seasonNumber: true, episodeNumber: true }
          }
        }
      });

      logger.database.query('FIND trending tv_shows', { limit });
      return tvShows;
    } catch (error) {
      logger.database.error('find trending tv_shows', error);
      throw error;
    }
  }

  /**
   * Search TV shows by name
   */
  async search(query, limit = 20) {
    try {
      const tvShows = await this.db.tVShow.findMany({
        where: {
          name: {
            contains: query,
            
          }
        },
        orderBy: {
          voteAverage: 'desc'
        },
        take: limit,
        include: {
          episodes: {
            where: { downloadStatus: 'downloaded' },
            select: { id: true, seasonNumber: true, episodeNumber: true }
          }
        }
      });

      logger.database.query('SEARCH tv_shows', { query, limit });
      return tvShows;
    } catch (error) {
      logger.database.error('search tv_shows', error);
      throw error;
    }
  }

  /**
   * Update TV show
   */
  async update(id, updateData) {
    try {
      const tvShow = await this.db.tVShow.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.database.query('UPDATE tv_show', { id, updateData });
      return tvShow;
    } catch (error) {
      logger.database.error('update tv_show', error);
      throw error;
    }
  }

  /**
   * Find downloaded TV shows
   */
  async findDownloaded() {
    try {
      const tvShows = await this.db.tVShow.findMany({
        where: {
          episodes: {
            some: {
              downloadStatus: 'downloaded'
            }
          }
        },
        include: {
          episodes: {
            where: { downloadStatus: 'downloaded' },
            orderBy: [
              { seasonNumber: 'asc' },
              { episodeNumber: 'asc' }
            ]
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      logger.database.query('FIND downloaded tv_shows');
      return tvShows;
    } catch (error) {
      logger.database.error('find downloaded tv_shows', error);
      throw error;
    }
  }

  /**
   * Get TV show statistics
   */
  async getStatistics() {
    try {
      const [
        total,
        withDownloadedEpisodes,
        totalEpisodes,
        downloadedEpisodes
      ] = await Promise.all([
        this.db.tVShow.count(),
        this.db.tVShow.count({
          where: {
            episodes: {
              some: {
                downloadStatus: 'downloaded'
              }
            }
          }
        }),
        this.db.episode.count(),
        this.db.episode.count({
          where: { downloadStatus: 'downloaded' }
        })
      ]);

      const stats = {
        total,
        withDownloadedEpisodes,
        totalEpisodes,
        downloadedEpisodes,
        downloadPercentage: totalEpisodes > 0 ? Math.round((downloadedEpisodes / totalEpisodes) * 100) : 0
      };

      logger.database.query('GET tv_show statistics');
      return stats;
    } catch (error) {
      logger.database.error('get tv_show statistics', error);
      throw error;
    }
  }

  /**
   * Delete TV show and all its episodes
   */
  async delete(id) {
    try {
      const tvShow = await this.db.tVShow.delete({
        where: { id: parseInt(id) }
      });

      logger.database.query('DELETE tv_show', { id });
      return tvShow;
    } catch (error) {
      logger.database.error('delete tv_show', error);
      throw error;
    }
  }
}

module.exports = TVShowRepository;
