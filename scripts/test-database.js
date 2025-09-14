#!/usr/bin/env node

/**
 * Database Test Script
 * Tests all database operations and connections
 */

const database = require('../src/shared/database');
const logger = require('../src/shared/database/logger');

async function testDatabaseConnection() {
  console.log('🔌 Testing database connections...');
  
  try {
    await database.initialize();
    const health = await database.healthCheck();
    
    console.log('📊 Database Health Check:');
    console.log(`   - SQLite: ${health.sqlite ? '✅' : '❌'}`);
    console.log(`   - Supabase: ${health.supabase ? '✅' : '❌'}`);
    console.log(`   - Overall: ${health.overall ? '✅' : '❌'}`);
    
    return health.overall;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

async function testMovieRepository() {
  console.log('\n🎬 Testing Movie Repository...');
  
  try {
    const movieRepo = database.getRepository('movies');
    
    // Test creating a movie
    const testMovie = {
      tmdbId: Math.floor(Math.random() * 1000000) + 100000, // Random unique ID
      title: 'Test Movie',
      overview: 'A test movie for database testing',
      posterPath: '/test-poster.jpg',
      releaseDate: '2024-01-01',
      runtime: 120,
      voteAverage: 8.5,
      genres: '["Action", "Drama"]'
    };
    
    const createdMovie = await movieRepo.create(testMovie);
    console.log('✅ Movie created:', createdMovie.title);
    
    // Test finding by ID
    const foundMovie = await movieRepo.findById(createdMovie.id);
    console.log('✅ Movie found by ID:', foundMovie.title);
    
    // Test finding by TMDB ID
    const foundByTmdb = await movieRepo.findByTmdbId(testMovie.tmdbId);
    console.log('✅ Movie found by TMDB ID:', foundByTmdb.title);
    
    // Test updating
    const updatedMovie = await movieRepo.update(createdMovie.id, {
      title: 'Updated Test Movie',
      voteAverage: 9.0
    });
    console.log('✅ Movie updated:', updatedMovie.title);
    
    // Test statistics
    const stats = await movieRepo.getStatistics();
    console.log('✅ Movie statistics:', stats);
    
    // Test search
    const searchResults = await movieRepo.search('Test');
    console.log('✅ Movie search results:', searchResults.length);
    
    // Clean up
    await movieRepo.delete(createdMovie.id);
    console.log('✅ Test movie deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Movie repository test failed:', error.message);
    return false;
  }
}

async function testTVShowRepository() {
  console.log('\n📺 Testing TV Show Repository...');
  
  try {
    const tvShowRepo = database.getRepository('tvShows');
    
    // Test creating a TV show
    const testTVShow = {
      tmdbId: Math.floor(Math.random() * 1000000) + 200000, // Random unique ID
      name: 'Test TV Show',
      overview: 'A test TV show for database testing',
      posterPath: '/test-tv-poster.jpg',
      firstAirDate: '2024-01-01',
      numberOfSeasons: 1,
      numberOfEpisodes: 10,
      voteAverage: 8.0,
      genres: '["Drama", "Comedy"]',
      status: 'Ended'
    };
    
    const createdTVShow = await tvShowRepo.create(testTVShow);
    console.log('✅ TV Show created:', createdTVShow.name);
    
    // Test finding by ID
    const foundTVShow = await tvShowRepo.findById(createdTVShow.id);
    console.log('✅ TV Show found by ID:', foundTVShow.name);
    
    // Test statistics
    const stats = await tvShowRepo.getStatistics();
    console.log('✅ TV Show statistics:', stats);
    
    // Clean up
    await tvShowRepo.delete(createdTVShow.id);
    console.log('✅ Test TV show deleted');
    
    return true;
  } catch (error) {
    console.error('❌ TV Show repository test failed:', error.message);
    return false;
  }
}

async function testEpisodeRepository() {
  console.log('\n📝 Testing Episode Repository...');
  
  try {
    const episodeRepo = database.getRepository('episodes');
    const tvShowRepo = database.getRepository('tvShows');
    
    // Create a test TV show first
    const testTVShow = {
      tmdbId: Math.floor(Math.random() * 1000000) + 300000, // Random unique ID
      name: 'Test TV Show for Episodes',
      overview: 'A test TV show for episode testing',
      firstAirDate: '2024-01-01',
      numberOfSeasons: 1,
      numberOfEpisodes: 2,
      voteAverage: 8.0,
      status: 'Ended'
    };
    
    const createdTVShow = await tvShowRepo.create(testTVShow);
    
    // Test creating episodes
    const testEpisodes = [
      {
        tvShowId: createdTVShow.id,
        seasonNumber: 1,
        episodeNumber: 1,
        name: 'Episode 1',
        overview: 'First episode',
        airDate: '2024-01-01',
        runtime: 45
      },
      {
        tvShowId: createdTVShow.id,
        seasonNumber: 1,
        episodeNumber: 2,
        name: 'Episode 2',
        overview: 'Second episode',
        airDate: '2024-01-08',
        runtime: 45
      }
    ];
    
    const createdEpisodes = await episodeRepo.createMany(testEpisodes);
    console.log('✅ Episodes created:', createdEpisodes.count);
    
    // Test finding episodes by TV show
    const episodes = await episodeRepo.findByTVShowId(createdTVShow.id);
    console.log('✅ Episodes found by TV show:', episodes.length);
    
    // Test finding by season
    const seasonEpisodes = await episodeRepo.findBySeason(createdTVShow.id, 1);
    console.log('✅ Episodes found by season:', seasonEpisodes.length);
    
    // Test statistics
    const stats = await episodeRepo.getStatisticsForTVShow(createdTVShow.id);
    console.log('✅ Episode statistics:', stats);
    
    // Clean up
    await tvShowRepo.delete(createdTVShow.id);
    console.log('✅ Test TV show and episodes deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Episode repository test failed:', error.message);
    return false;
  }
}

async function testDownloadQueueRepository() {
  console.log('\n📥 Testing Download Queue Repository...');
  
  try {
    const queueRepo = database.getRepository('downloadQueue');
    
    // Test adding to queue
    const testQueueItem = {
      contentType: 'movie',
      contentId: 1,
      torrentMagnet: 'magnet:?xt=urn:btih:test',
      torrentName: 'Test Movie 1080p',
      priority: 1
    };
    
    const createdItem = await queueRepo.addToQueue(testQueueItem);
    console.log('✅ Item added to queue:', createdItem.id);
    
    // Test getting queue items
    const queueItems = await queueRepo.getAll();
    console.log('✅ Queue items retrieved:', queueItems.length);
    
    // Test updating status
    await queueRepo.updateStatus(createdItem.id, 'downloading', 50);
    console.log('✅ Queue item status updated');
    
    // Test statistics
    const stats = await queueRepo.getStatistics();
    console.log('✅ Queue statistics:', stats);
    
    // Clean up
    await queueRepo.remove(createdItem.id);
    console.log('✅ Test queue item removed');
    
    return true;
  } catch (error) {
    console.error('❌ Download queue repository test failed:', error.message);
    return false;
  }
}

async function testSettingsRepository() {
  console.log('\n⚙️  Testing Settings Repository...');
  
  try {
    const settingsRepo = database.getRepository('settings');
    
    // Test setting a value
    await settingsRepo.set('test_setting', 'test_value');
    console.log('✅ Setting created');
    
    // Test getting a value
    const value = await settingsRepo.get('test_setting');
    console.log('✅ Setting retrieved:', value);
    
    // Test getting all settings
    const allSettings = await settingsRepo.getAll();
    console.log('✅ All settings retrieved:', Object.keys(allSettings).length);
    
    // Test app configuration
    const appConfig = await settingsRepo.getAppConfig();
    console.log('✅ App configuration retrieved:', Object.keys(appConfig).length);
    
    // Test download settings
    const downloadSettings = await settingsRepo.getDownloadSettings();
    console.log('✅ Download settings retrieved:', Object.keys(downloadSettings).length);
    
    // Clean up
    await settingsRepo.delete('test_setting');
    console.log('✅ Test setting deleted');
    
    return true;
  } catch (error) {
    console.error('❌ Settings repository test failed:', error.message);
    return false;
  }
}

async function testTransaction() {
  console.log('\n🔄 Testing Database Transaction...');
  
  try {
    const result = await database.transaction(async (tx) => {
      // Create a movie and add it to download queue in a transaction
      const movie = await tx.movie.create({
        data: {
          tmdbId: Math.floor(Math.random() * 1000000) + 400000, // Random unique ID
          title: 'Transaction Test Movie',
          overview: 'A movie created in a transaction',
          releaseDate: '2024-01-01',
          voteAverage: 8.0
        }
      });
      
      const queueItem = await tx.downloadQueue.create({
        data: {
          contentType: 'movie',
          contentId: movie.id,
          torrentMagnet: 'magnet:?xt=urn:btih:transaction-test',
          torrentName: 'Transaction Test Movie 1080p'
        }
      });
      
      return { movie, queueItem };
    });
    
    console.log('✅ Transaction completed successfully');
    console.log('   - Movie created:', result.movie.title);
    console.log('   - Queue item created:', result.queueItem.id);
    
    // Clean up
    const movieRepo = database.getRepository('movies');
    const queueRepo = database.getRepository('downloadQueue');
    
    await queueRepo.remove(result.queueItem.id);
    await movieRepo.delete(result.movie.id);
    console.log('✅ Transaction test data cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Transaction test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Starting NiluFlix Database Tests...\n');
  
  const tests = [
    { name: 'Database Connection', fn: testDatabaseConnection },
    { name: 'Movie Repository', fn: testMovieRepository },
    { name: 'TV Show Repository', fn: testTVShowRepository },
    { name: 'Episode Repository', fn: testEpisodeRepository },
    { name: 'Download Queue Repository', fn: testDownloadQueueRepository },
    { name: 'Settings Repository', fn: testSettingsRepository },
    { name: 'Database Transaction', fn: testTransaction }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      results.push({ name: test.name, success: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  let passed = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
    if (result.success) passed++;
  });
  
  console.log(`\n🎯 Overall: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('🎉 All database tests passed! Database is ready for use.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
  
  // Close database connections
  try {
    await database.close();
    console.log('\n✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error.message);
  }
  
  process.exit(passed === results.length ? 0 : 1);
}

// Run the tests
if (require.main === module) {
  main();
}

module.exports = {
  testDatabaseConnection,
  testMovieRepository,
  testTVShowRepository,
  testEpisodeRepository,
  testDownloadQueueRepository,
  testSettingsRepository,
  testTransaction
};
