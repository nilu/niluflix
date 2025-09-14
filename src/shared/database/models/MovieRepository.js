/**
 * Movie Repository
 * Handles all movie-related database operations
 */

const databaseManager = require('../connection');
const logger = require('../logger');

class MovieRepository {
  constructor() {
    this.db = databaseManager.getSQLite();
  }

  /**
   * Create a new movie
   */
  async create(movieData) {
    try {
      const movie = await this.db.movie.create({
        data: movieData
      });
      
      logger.database.query('CREATE movie', movieData);
      return movie;
    } catch (error) {
      logger.database.error('create movie', error);
      throw error;
    }
  }

  /**
   * Find movie by ID
   */
  async findById(id) {
    try {
      const movie = await this.db.movie.findUnique({
        where: { id: parseInt(id) }
      });
      
      logger.database.query('FIND movie by id', { id });
      return movie;
    } catch (error) {
      logger.database.error('find movie by id', error);
      throw error;
    }
  }

  /**
   * Find movie by TMDB ID
   */
  async findByTmdbId(tmdbId) {
    try {
      const movie = await this.db.movie.findUnique({
        where: { tmdbId: parseInt(tmdbId) }
      });
      
      logger.database.query('FIND movie by tmdb_id', { tmdbId });
      return movie;
    } catch (error) {
      logger.database.error('find movie by tmdb_id', error);
      throw error;
    }
  }

  /**
   * Find all movies with pagination
   */
  async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        orderBy = 'createdAt',
        order = 'desc',
        downloadStatus,
        search
      } = options;

      const skip = (page - 1) * limit;
      const where = {};

      if (downloadStatus) {
        where.downloadStatus = downloadStatus;
      }

      if (search) {
        where.title = {
          contains: search,
          
        };
      }

      const [movies, total] = await Promise.all([
        this.db.movie.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [orderBy]: order }
        }),
        this.db.movie.count({ where })
      ]);

      logger.database.query('FIND all movies', { page, limit, where });
      
      return {
        movies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.database.error('find all movies', error);
      throw error;
    }
  }

  /**
   * Find popular movies
   */
  async findPopular(limit = 20) {
    try {
      const movies = await this.db.movie.findMany({
        where: {
          voteAverage: {
            gte: 7.0
          }
        },
        orderBy: {
          voteAverage: 'desc'
        },
        take: limit
      });

      logger.database.query('FIND popular movies', { limit });
      return movies;
    } catch (error) {
      logger.database.error('find popular movies', error);
      throw error;
    }
  }

  /**
   * Find trending movies (recent releases with high ratings)
   */
  async findTrending(limit = 20) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const movies = await this.db.movie.findMany({
        where: {
          releaseDate: {
            gte: thirtyDaysAgo.toISOString().split('T')[0]
          },
          voteAverage: {
            gte: 6.0
          }
        },
        orderBy: {
          voteAverage: 'desc'
        },
        take: limit
      });

      logger.database.query('FIND trending movies', { limit });
      return movies;
    } catch (error) {
      logger.database.error('find trending movies', error);
      throw error;
    }
  }

  /**
   * Search movies by title
   */
  async search(query, limit = 20) {
    try {
      const movies = await this.db.movie.findMany({
        where: {
          title: {
            contains: query
          }
        },
        orderBy: {
          voteAverage: 'desc'
        },
        take: limit
      });

      logger.database.query('SEARCH movies', { query, limit });
      return movies;
    } catch (error) {
      logger.database.error('search movies', error);
      throw error;
    }
  }

  /**
   * Update movie
   */
  async update(id, updateData) {
    try {
      const movie = await this.db.movie.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      logger.database.query('UPDATE movie', { id, updateData });
      return movie;
    } catch (error) {
      logger.database.error('update movie', error);
      throw error;
    }
  }

  /**
   * Update download status
   */
  async updateDownloadStatus(id, status, progress = 0) {
    try {
      const movie = await this.db.movie.update({
        where: { id: parseInt(id) },
        data: {
          downloadStatus: status,
          downloadProgress: progress,
          updatedAt: new Date()
        }
      });

      logger.database.query('UPDATE movie download status', { id, status, progress });
      return movie;
    } catch (error) {
      logger.database.error('update movie download status', error);
      throw error;
    }
  }

  /**
   * Find downloaded movies
   */
  async findDownloaded() {
    try {
      const movies = await this.db.movie.findMany({
        where: {
          downloadStatus: 'downloaded'
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      logger.database.query('FIND downloaded movies');
      return movies;
    } catch (error) {
      logger.database.error('find downloaded movies', error);
      throw error;
    }
  }

  /**
   * Delete movie
   */
  async delete(id) {
    try {
      const movie = await this.db.movie.delete({
        where: { id: parseInt(id) }
      });

      logger.database.query('DELETE movie', { id });
      return movie;
    } catch (error) {
      logger.database.error('delete movie', error);
      throw error;
    }
  }

  /**
   * Get movie statistics
   */
  async getStatistics() {
    try {
      const [
        total,
        downloaded,
        downloading,
        notDownloaded
      ] = await Promise.all([
        this.db.movie.count(),
        this.db.movie.count({ where: { downloadStatus: 'downloaded' } }),
        this.db.movie.count({ where: { downloadStatus: 'downloading' } }),
        this.db.movie.count({ where: { downloadStatus: 'not_downloaded' } })
      ]);

      const stats = {
        total,
        downloaded,
        downloading,
        notDownloaded,
        downloadPercentage: total > 0 ? Math.round((downloaded / total) * 100) : 0
      };

      logger.database.query('GET movie statistics');
      return stats;
    } catch (error) {
      logger.database.error('get movie statistics', error);
      throw error;
    }
  }
}

module.exports = MovieRepository;
