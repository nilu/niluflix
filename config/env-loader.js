const dotenv = require('dotenv');
const path = require('path');

/**
 * Load environment variables based on NODE_ENV
 * Priority: .env.local > .env.[environment] > .env
 */
function loadEnvironment() {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const rootDir = path.resolve(__dirname, '..');

  // Load in priority order
  const envFiles = [
    `.env.${NODE_ENV}.local`,
    `.env.local`,
    `.env.${NODE_ENV}`,
    '.env',
  ];

  envFiles.forEach(file => {
    const filePath = path.join(rootDir, file);
    try {
      const result = dotenv.config({ path: filePath });
      if (!result.error) {
        console.log(`✅ Loaded environment from: ${file}`);
      }
    } catch (error) {
      // Silently ignore missing files
    }
  });

  // Validate required environment variables
  validateEnvironment();
}

/**
 * Validate that required environment variables are present
 */
function validateEnvironment() {
  const required = {
    development: [
      // No required vars for development
    ],
    production: [
      'TMDB_API_KEY',
      'JWT_SECRET',
      'ENCRYPTION_KEY',
    ],
  };

  const NODE_ENV = process.env.NODE_ENV || 'development';
  const requiredVars = required[NODE_ENV] || [];

  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    
    if (NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode with missing variables');
    }
  }
}

/**
 * Get environment-specific configuration
 */
function getEnvironmentConfig() {
  const NODE_ENV = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      enableDevTools: true,
      enableHotReload: true,
      verboseLogging: true,
      mockExternalApis: false,
    },
    production: {
      enableDevTools: false,
      enableHotReload: false,
      verboseLogging: false,
      mockExternalApis: false,
    },
    test: {
      enableDevTools: false,
      enableHotReload: false,
      verboseLogging: false,
      mockExternalApis: true,
    },
  };

  return configs[NODE_ENV] || configs.development;
}

module.exports = {
  loadEnvironment,
  validateEnvironment,
  getEnvironmentConfig,
};
