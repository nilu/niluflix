/**
 * Test script to demonstrate file organization with proper titles
 * This shows how the enhanced file organizer will name files correctly
 */

const { FileOrganizer } = require('./dist/shared/services/file-organizer');

async function testFileOrganization() {
  console.log('🎬 Testing File Organization with Proper Titles\n');
  
  const organizer = new FileOrganizer();
  
  // Test movie content
  const movieContent = {
    tmdbId: 155,
    title: 'The Dark Knight',
    type: 'movie',
    year: 2008,
    overview: 'Batman faces the Joker in this epic crime thriller'
  };
  
  // Test TV show content
  const tvContent = {
    tmdbId: 1396,
    title: 'Breaking Bad',
    type: 'episode',
    year: 2008,
    seasonNumber: 1,
    episodeNumber: 1,
    tvShowName: 'Breaking Bad'
  };
  
  console.log('📁 Movie Organization:');
  console.log(`Original torrent file: "Dark.Knight.2008.1080p.BluRay.x264-GROUP.mkv"`);
  console.log(`Organized filename: "${organizer.generateFilename(movieContent, 'Dark.Knight.2008.1080p.BluRay.x264-GROUP.mkv', false)}"`);
  console.log(`Target directory: "${organizer.getMoviePath({ title: movieContent.title, releaseDate: movieContent.year.toString() })}"`);
  
  console.log('\n📺 TV Show Organization:');
  console.log(`Original torrent file: "Breaking.Bad.S01E01.1080p.WEB-DL.mkv"`);
  console.log(`Organized filename: "${organizer.generateFilename(tvContent, 'Breaking.Bad.S01E01.1080p.WEB-DL.mkv', false)}"`);
  console.log(`Target directory: "${organizer.getTVShowPath({ name: tvContent.tvShowName }, tvContent.seasonNumber, tvContent.episodeNumber)}"`);
  
  console.log('\n✅ File organization will now use proper titles instead of torrent names!');
  console.log('🎯 This ensures you can always identify what movie/TV show each file contains.');
}

// Run the test
testFileOrganization().catch(console.error);
