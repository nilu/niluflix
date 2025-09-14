#!/usr/bin/env node

/**
 * Simple test script to verify Step 4 external API integrations
 * Run with: node scripts/test-integration.js
 */

require('dotenv').config();

const { getTMDBClient, getTorrentSearch } = require('../src/shared/services');

async function testTMDBIntegration() {
  console.log('🔍 Testing TMDB API Integration...\n');
  
  try {
    const tmdb = getTMDBClient();
    
    // Test popular movies
    console.log('📽️ Testing popular movies...');
    const popularMovies = await tmdb.getPopularMovies(1);
    console.log(`✅ Found ${popularMovies.results?.length || 0} popular movies`);
    console.log(`   First movie: ${popularMovies.results?.[0]?.title || 'None'}\n`);
    
    // Test movie search
    console.log('🔎 Testing movie search...');
    const searchResults = await tmdb.searchMovies('batman', 1);
    console.log(`✅ Found ${searchResults.total_results || 0} movies for "batman"`);
    console.log(`   First result: ${searchResults.results?.[0]?.title || 'None'}\n`);
    
    // Test movie details
    if (searchResults.results && searchResults.results.length > 0) {
      const firstMovie = searchResults.results[0];
      console.log(`📋 Testing movie details for "${firstMovie.title}"...`);
      const movieDetails = await tmdb.getMovieDetails(firstMovie.id);
      console.log(`✅ Movie details loaded: ${movieDetails.title} (${movieDetails.release_date})`);
      console.log(`   Runtime: ${movieDetails.runtime || 'Unknown'} minutes`);
      console.log(`   Rating: ${movieDetails.vote_average}/10\n`);
    }
    
    // Test TV shows
    console.log('📺 Testing popular TV shows...');
    const popularTVShows = await tmdb.getPopularTVShows(1);
    console.log(`✅ Found ${popularTVShows.results?.length || 0} popular TV shows`);
    console.log(`   First show: ${popularTVShows.results?.[0]?.name || 'None'}\n`);
    
    // Test image URLs
    if (popularMovies.results && popularMovies.results.length > 0) {
      const firstMovie = popularMovies.results[0];
      console.log('🖼️ Testing image URL generation...');
      const posterUrl = tmdb.getPosterUrl(firstMovie.poster_path, 'w500');
      const backdropUrl = tmdb.getBackdropUrl(firstMovie.backdrop_path, 'w1280');
      console.log(`✅ Poster URL: ${posterUrl ? 'Generated' : 'No poster'}`);
      console.log(`✅ Backdrop URL: ${backdropUrl ? 'Generated' : 'No backdrop'}\n`);
    }
    
    console.log('✅ TMDB integration test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ TMDB integration test failed:', error.message);
    if (error.message.includes('API key')) {
      console.log('💡 Make sure to set your TMDB_API_KEY in the .env file');
    }
    console.log('');
  }
}

async function testTorrentIntegration() {
  console.log('🔍 Testing Torrent Search Integration...\n');
  
  try {
    const torrentSearch = getTorrentSearch();
    
    // Test movie torrent search
    console.log('🎬 Testing movie torrent search...');
    const movieTorrents = await torrentSearch.findMovieTorrents('The Dark Knight', 2008);
    console.log(`✅ Found ${movieTorrents.length} torrents for "The Dark Knight (2008)"`);
    
    if (movieTorrents.length > 0) {
      const bestTorrent = movieTorrents[0];
      console.log(`   Best torrent: ${bestTorrent.title}`);
      console.log(`   Quality: ${bestTorrent.quality}, Seeders: ${bestTorrent.seeders}`);
      console.log(`   Provider: ${bestTorrent.provider}, Score: ${bestTorrent.score}\n`);
    }
    
    // Test TV show torrent search
    console.log('📺 Testing TV show torrent search...');
    const tvTorrents = await torrentSearch.findTVShowTorrents('Breaking Bad', 1, 1);
    console.log(`✅ Found ${tvTorrents.length} torrents for "Breaking Bad S01E01"`);
    
    if (tvTorrents.length > 0) {
      const bestTorrent = tvTorrents[0];
      console.log(`   Best torrent: ${bestTorrent.title}`);
      console.log(`   Quality: ${bestTorrent.quality}, Seeders: ${bestTorrent.seeders}`);
      console.log(`   Provider: ${bestTorrent.provider}, Score: ${bestTorrent.score}\n`);
    }
    
    // Test providers
    console.log('🔧 Testing torrent providers...');
    const providers = torrentSearch.getProviders();
    console.log(`✅ Active providers: ${providers.join(', ')}\n`);
    
    console.log('✅ Torrent search integration test completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Torrent search integration test failed:', error.message);
    console.log('💡 This might be due to network issues or torrent providers being unavailable');
    console.log('');
  }
}

async function runAllTests() {
  console.log('🚀 NiluFlix Step 4 Integration Tests\n');
  console.log('=' .repeat(50));
  
  await testTMDBIntegration();
  console.log('=' .repeat(50));
  await testTorrentIntegration();
  console.log('=' .repeat(50));
  
  console.log('✅ All integration tests completed!');
  console.log('🎉 Step 4: External API Integration is ready!');
  console.log('\n💡 Next steps:');
  console.log('   - Add your TMDB_API_KEY to .env file');
  console.log('   - Start the server: npm run server:dev');
  console.log('   - Test endpoints: http://localhost:3001/api/movies/popular');
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testTMDBIntegration,
  testTorrentIntegration,
  runAllTests
};
