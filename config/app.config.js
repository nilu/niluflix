const path = require('path');
const os = require('os');

module.exports = {
  // App Information
  app: {
    name: 'NiluFlix',
    version: '1.0.0',
    description: 'Beautiful streaming platform interface with torrenting',
  },

  // Server Configuration
  server: {
    port: process.env.DESKTOP_APP_PORT || 3001,
    host: process.env.DESKTOP_APP_HOST || 'localhost',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
  },

  // Database Configuration
  database: {
    sqlite: {
      path: process.env.SQLITE_DB_PATH || path.join(__dirname, '../database/niluflix.db'),
      options: {
        verbose: process.env.NODE_ENV === 'development',
      },
    },
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
    },
  },

  // File System Configuration
  paths: {
    movies: process.env.MOVIES_DIR || path.join(os.homedir(), 'Movies', 'NiluFlix'),
    downloads: process.env.DOWNLOADS_DIR || path.join(os.homedir(), 'Movies', 'NiluFlix', 'Downloads'),
    metadata: process.env.METADATA_DIR || path.join(os.homedir(), 'Movies', 'NiluFlix', '.metadata'),
    temp: path.join(os.tmpdir(), 'niluflix'),
  },

  // External APIs
  apis: {
    tmdb: {
      apiKey: process.env.TMDB_API_KEY,
      baseUrl: 'https://api.themoviedb.org/3',
      imageBaseUrl: 'https://image.tmdb.org/t/p',
      language: 'en-US',
      region: 'US',
      rateLimitRpm: 40, // requests per minute
    },
    openSubtitles: {
      baseUrl: process.env.OPENSUBTITLES_BASE_URL || 'https://opensubtitles.com/api',
      userAgent: 'NiluFlix v1.0',
    },
  },

  // Torrent Configuration
  torrent: {
    // Client Detection Priority
    clientPriority: ['transmission', 'qbittorrent'],
    
    // Transmission Settings
    transmission: {
      host: process.env.TRANSMISSION_HOST || 'localhost',
      port: parseInt(process.env.TRANSMISSION_PORT) || 9091,
      username: process.env.TRANSMISSION_USERNAME || '',
      password: process.env.TRANSMISSION_PASSWORD || '',
      ssl: false,
      url: '/transmission/rpc',
    },
    
    // qBittorrent Settings
    qbittorrent: {
      host: process.env.QBITTORRENT_HOST || 'localhost',
      port: parseInt(process.env.QBITTORRENT_PORT) || 8080,
      username: process.env.QBITTORRENT_USERNAME || 'admin',
      password: process.env.QBITTORRENT_PASSWORD || 'adminadmin',
    },

    // Download Settings
    maxConnections: 200,
    maxDownloads: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS) || 3,
    uploadLimit: parseInt(process.env.MAX_UPLOAD_SPEED) || 0, // KB/s, 0 = unlimited
    downloadLimit: parseInt(process.env.MAX_DOWNLOAD_SPEED) || 0, // KB/s, 0 = unlimited
  },

  // Quality Preferences
  quality: {
    preferred: ['1080p', '720p', '4K'],
    minSeeders: 5,
    maxFileSize: 10 * 1024 * 1024 * 1024, // 10GB
    blacklistedWords: ['cam', 'ts', 'tc', 'workprint', 'screener'],
    preferredGroups: ['RARBG', 'YTS', 'ETRG', 'x264', 'BluRay'],
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key-change-in-production',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Caching
  cache: {
    ttlHours: parseInt(process.env.CACHE_TTL_HOURS) || 24,
    maxSizeMB: parseInt(process.env.CACHE_MAX_SIZE_MB) || 100,
    cleanupIntervalHours: 6,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: path.join(__dirname, '../logs/app.log'),
    maxSize: '10m',
    maxFiles: 5,
    format: 'combined',
  },

  // Development Settings
  development: {
    debugTorrentClient: process.env.DEBUG_TORRENT_CLIENT === 'true',
    debugApiCalls: process.env.DEBUG_API_CALLS === 'true',
    debugDatabaseQueries: process.env.DEBUG_DATABASE_QUERIES === 'true',
    enableHotReload: true,
    mockExternalApis: false,
  },

  // Remote Access
  remoteAccess: {
    enabled: process.env.REMOTE_ACCESS_ENABLED === 'true',
    port: parseInt(process.env.REMOTE_ACCESS_PORT) || 3002,
    domain: process.env.REMOTE_ACCESS_DOMAIN || 'localhost',
    allowedOrigins: ['http://localhost:3000', 'https://niluflix.vercel.app'],
  },

  // Notifications (Optional)
  notifications: {
    email: {
      enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    push: {
      enabled: !!process.env.FCM_SERVER_KEY,
      fcmServerKey: process.env.FCM_SERVER_KEY,
    },
  },
};
