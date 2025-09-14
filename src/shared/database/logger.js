/**
 * Database Logger
 * Centralized logging for database operations
 */

const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
require('fs').mkdirSync(logDir, { recursive: true });

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'niluflix-database' },
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// If we're not in production, log to the console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Add database-specific logging methods
logger.database = {
  query: (query, params, duration) => {
    if (process.env.DEBUG_DATABASE_QUERIES === 'true') {
      logger.debug('Database Query', {
        query: query.replace(/\s+/g, ' ').trim(),
        params,
        duration: `${duration}ms`
      });
    }
  },

  error: (operation, error) => {
    logger.error('Database Error', {
      operation,
      error: error.message,
      stack: error.stack
    });
  },

  transaction: (operation, success) => {
    logger.info('Database Transaction', {
      operation,
      success
    });
  }
};

module.exports = logger;
