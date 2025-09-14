#!/usr/bin/env node

/**
 * Database Seeding Script
 * Seeds the database with initial data for development
 */

const { PrismaClient } = require('@prisma/client');

// Load environment variables
require('dotenv').config();

const prisma = new PrismaClient();

async function seedSettings() {
  console.log('⚙️  Seeding settings...');
  
  const settings = [
    { key: 'app_version', value: '1.0.0' },
    { key: 'app_name', value: 'NiluFlix' },
    { key: 'max_concurrent_downloads', value: '3' },
    { key: 'preferred_quality', value: '1080p' },
    { key: 'fallback_qualities', value: '["720p", "4K"]' },
    { key: 'download_path', value: process.env.MOVIES_DIR || '~/Movies/NiluFlix' },
    { key: 'auto_organize', value: 'true' },
    { key: 'auto_subtitles', value: 'true' },
    { key: 'min_seeders', value: '5' },
    { key: 'max_file_size_gb', value: '10' },
    { key: 'remote_access_enabled', value: 'false' },
    { key: 'remote_access_port', value: '3002' },
    { key: 'tmdb_language', value: 'en-US' },
    { key: 'tmdb_region', value: 'US' },
    { key: 'cache_ttl_hours', value: '24' },
    { key: 'log_level', value: 'info' },
    { key: 'debug_mode', value: 'false' }
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    });
  }

  console.log(`✅ Seeded ${settings.length} settings`);
}

async function seedSampleMovies() {
  console.log('🎬 Seeding sample movies...');
  
  const sampleMovies = [
    {
      tmdbId: 550,
      title: 'Fight Club',
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
      posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdropPath: '/87hTDiay2N2qWyX4Dx7d0T6bvlh.jpg',
      releaseDate: '1999-10-15',
      runtime: 139,
      voteAverage: 8.4,
      genres: '["Drama"]'
    },
    {
      tmdbId: 13,
      title: 'Forrest Gump',
      overview: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
      posterPath: '/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
      backdropPath: '/7c9UVPPiTPltouxRVY6N9uugaVA.jpg',
      releaseDate: '1994-06-23',
      runtime: 142,
      voteAverage: 8.5,
      genres: '["Comedy", "Drama", "Romance"]'
    },
    {
      tmdbId: 238,
      title: 'The Godfather',
      overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
      posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
      backdropPath: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
      releaseDate: '1972-03-14',
      runtime: 175,
      voteAverage: 8.7,
      genres: '["Drama", "Crime"]'
    }
  ];

  for (const movie of sampleMovies) {
    await prisma.movie.upsert({
      where: { tmdbId: movie.tmdbId },
      update: movie,
      create: movie
    });
  }

  console.log(`✅ Seeded ${sampleMovies.length} sample movies`);
}

async function seedSampleTVShows() {
  console.log('📺 Seeding sample TV shows...');
  
  const sampleTVShows = [
    {
      tmdbId: 1396,
      name: 'Breaking Bad',
      overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      posterPath: '/ggFHVNu6YYI5L9pJJJxYsnXrCgA.jpg',
      backdropPath: '/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
      firstAirDate: '2008-01-20',
      lastAirDate: '2013-09-29',
      numberOfSeasons: 5,
      numberOfEpisodes: 62,
      voteAverage: 8.9,
      genres: '["Crime", "Drama", "Thriller"]',
      status: 'Ended'
    },
    {
      tmdbId: 1399,
      name: 'Game of Thrones',
      overview: 'Seven noble families fight for control of the mythical land of Westeros.',
      posterPath: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      backdropPath: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
      firstAirDate: '2011-04-17',
      lastAirDate: '2019-05-19',
      numberOfSeasons: 8,
      numberOfEpisodes: 73,
      voteAverage: 8.2,
      genres: '["Action", "Adventure", "Drama", "Fantasy"]',
      status: 'Ended'
    }
  ];

  for (const tvShow of sampleTVShows) {
    await prisma.tvShow.upsert({
      where: { tmdbId: tvShow.tmdbId },
      update: tvShow,
      create: tvShow
    });
  }

  console.log(`✅ Seeded ${sampleTVShows.length} sample TV shows`);
}

async function seedSampleEpisodes() {
  console.log('📝 Seeding sample episodes...');
  
  // Get Breaking Bad TV show ID
  const breakingBad = await prisma.tvShow.findUnique({
    where: { tmdbId: 1396 }
  });

  if (breakingBad) {
    const sampleEpisodes = [
      {
        tvShowId: breakingBad.id,
        tmdbEpisodeId: 62085,
        seasonNumber: 1,
        episodeNumber: 1,
        name: 'Pilot',
        overview: 'A high school chemistry teacher learns he has inoperable lung cancer.',
        airDate: '2008-01-20',
        runtime: 58,
        voteAverage: 8.0
      },
      {
        tvShowId: breakingBad.id,
        tmdbEpisodeId: 62086,
        seasonNumber: 1,
        episodeNumber: 2,
        name: 'Cat\'s in the Bag...',
        overview: 'Walter and Jesse try to dispose of the bodies.',
        airDate: '2008-01-27',
        runtime: 48,
        voteAverage: 7.8
      },
      {
        tvShowId: breakingBad.id,
        tmdbEpisodeId: 62087,
        seasonNumber: 1,
        episodeNumber: 3,
        name: '...And the Bag\'s in the River',
        overview: 'Walter and Jesse dispose of the body.',
        airDate: '2008-02-03',
        runtime: 48,
        voteAverage: 8.2
      }
    ];

    for (const episode of sampleEpisodes) {
      await prisma.episode.upsert({
        where: {
          tvShowId_seasonNumber_episodeNumber: {
            tvShowId: episode.tvShowId,
            seasonNumber: episode.seasonNumber,
            episodeNumber: episode.episodeNumber
          }
        },
        update: episode,
        create: episode
      });
    }

    console.log(`✅ Seeded ${sampleEpisodes.length} sample episodes for Breaking Bad`);
  }
}

async function seedDownloadHistory() {
  console.log('📊 Seeding download history...');
  
  // Get a sample movie
  const sampleMovie = await prisma.movie.findFirst();
  
  if (sampleMovie) {
    const historyEntries = [
      {
        contentType: 'movie',
        contentId: sampleMovie.id,
        title: sampleMovie.title,
        fileSize: 2147483648, // 2GB
        downloadTime: 3600, // 1 hour
        quality: '1080p',
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];

    for (const entry of historyEntries) {
      await prisma.downloadHistory.create({
        data: entry
      });
    }

    console.log(`✅ Seeded ${historyEntries.length} download history entries`);
  }
}

async function verifySeeding() {
  console.log('🔍 Verifying seeded data...');
  
  try {
    const movieCount = await prisma.movie.count();
    const tvShowCount = await prisma.tvShow.count();
    const episodeCount = await prisma.episode.count();
    const settingCount = await prisma.setting.count();
    const historyCount = await prisma.downloadHistory.count();
    
    console.log('📊 Database contents:');
    console.log(`   - Movies: ${movieCount}`);
    console.log(`   - TV Shows: ${tvShowCount}`);
    console.log(`   - Episodes: ${episodeCount}`);
    console.log(`   - Settings: ${settingCount}`);
    console.log(`   - Download History: ${historyCount}`);
    
    console.log('✅ Database verification completed');
  } catch (error) {
    console.error('❌ Error verifying seeded data:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    await seedSettings();
    console.log('');
    
    await seedSampleMovies();
    console.log('');
    
    await seedSampleTVShows();
    console.log('');
    
    await seedSampleEpisodes();
    console.log('');
    
    await seedDownloadHistory();
    console.log('');
    
    await verifySeeding();
    console.log('');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Browse the sample content in the app');
    console.log('3. Test download functionality');
    
  } catch (error) {
    console.error('\n💥 Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  main();
}

module.exports = {
  seedSettings,
  seedSampleMovies,
  seedSampleTVShows,
  seedSampleEpisodes,
  seedDownloadHistory,
  verifySeeding
};
