#!/usr/bin/env node

/**
 * Memory Optimization Script
 * Applies memory optimizations to reduce Niluflix memory usage
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting memory optimization...');

// 1. Update package.json to include garbage collection flag
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add memory optimization scripts
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

packageJson.scripts['start:optimized'] = 'node --expose-gc --max-old-space-size=2048 dist/main/main.js';
packageJson.scripts['dev:optimized'] = 'node --expose-gc --max-old-space-size=2048 --inspect src/main/main.js';

// Add memory monitoring
packageJson.scripts['memory:check'] = 'node scripts/check-memory.js';

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with memory optimization scripts');

// 2. Create memory check script
const memoryCheckScript = `#!/usr/bin/env node

const MemoryManager = require('../src/shared/services/memory-manager').default;

const memoryManager = MemoryManager.getInstance();
const stats = memoryManager.getMemoryStats();

console.log('📊 Memory Usage:');
console.log(\`   Total: \${stats.total}MB\`);
console.log(\`   Used: \${stats.used}MB (\${stats.percentage}%)\`);
console.log(\`   Heap: \${stats.heapUsed}MB/\${stats.heapTotal}MB\`);
console.log(\`   External: \${stats.external}MB\`);

const warning = memoryManager.getMemoryWarning();
if (warning) {
  console.log('⚠️', warning);
} else {
  console.log('✅ Memory usage is normal');
}
`;

fs.writeFileSync(path.join(__dirname, 'check-memory.js'), memoryCheckScript);
console.log('✅ Created memory check script');

// 3. Update webpack config for memory optimization
const webpackConfigPath = path.join(__dirname, '../config/webpack.config.js');
if (fs.existsSync(webpackConfigPath)) {
  let webpackConfig = fs.readFileSync(webpackConfigPath, 'utf8');
  
  // Add memory optimization to webpack config
  if (!webpackConfig.includes('maxAssetSize')) {
    webpackConfig = webpackConfig.replace(
      /performance:\s*{/,
      `performance: {
        maxAssetSize: 1000000, // 1MB
        maxEntrypointSize: 1000000, // 1MB
        hints: 'warning',`
    );
    
    fs.writeFileSync(webpackConfigPath, webpackConfig);
    console.log('✅ Updated webpack config for memory optimization');
  }
}

// 4. Create .env optimization
const envPath = path.join(__dirname, '../.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Add memory optimization environment variables
const memoryOptimizations = `
# Memory Optimization Settings
NODE_OPTIONS=--expose-gc --max-old-space-size=2048
CACHE_MAX_SIZE_MB=50
CACHE_TTL_HOURS=2
MAX_CONCURRENT_DOWNLOADS=2
`;

if (!envContent.includes('NODE_OPTIONS')) {
  fs.appendFileSync(envPath, memoryOptimizations);
  console.log('✅ Added memory optimization to .env');
}

console.log('🎉 Memory optimization completed!');
console.log('');
console.log('📋 Next steps:');
console.log('1. Run: npm run memory:check');
console.log('2. Use: npm run start:optimized (for production)');
console.log('3. Use: npm run dev:optimized (for development)');
console.log('4. Monitor memory usage regularly');
