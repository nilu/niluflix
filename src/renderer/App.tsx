import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import HeroSection from './components/HeroSection';
import ContentRow from './components/ContentRow';

console.log('App.tsx loaded!');

// Enhanced HomePage with Netflix-style layout
const HomePage = () => {
  console.log('HomePage component is rendering!');
  // Sample data for content rows
  const trendingMovies = [
    { id: '1', title: 'The Dark Knight', year: '2008', genre: 'Action', rating: '9.0' },
    { id: '2', title: 'Inception', year: '2010', genre: 'Sci-Fi', rating: '8.8' },
    { id: '3', title: 'Pulp Fiction', year: '1994', genre: 'Crime', rating: '8.9' },
    { id: '4', title: 'The Godfather', year: '1972', genre: 'Drama', rating: '9.2' },
    { id: '5', title: 'Fight Club', year: '1999', genre: 'Drama', rating: '8.8' },
  ];

  const popularTVShows = [
    { id: '6', title: 'Breaking Bad', year: '2008-2013', genre: 'Drama', rating: '9.5' },
    { id: '7', title: 'Game of Thrones', year: '2011-2019', genre: 'Fantasy', rating: '9.3' },
    { id: '8', title: 'The Office', year: '2005-2013', genre: 'Comedy', rating: '8.9' },
    { id: '9', title: 'Stranger Things', year: '2016-2022', genre: 'Sci-Fi', rating: '8.7' },
    { id: '10', title: 'The Crown', year: '2016-2023', genre: 'Drama', rating: '8.6' },
  ];

  const recentlyAdded = [
    { id: '11', title: 'Oppenheimer', year: '2023', genre: 'Biography', rating: '8.5' },
    { id: '12', title: 'Barbie', year: '2023', genre: 'Comedy', rating: '7.0' },
    { id: '13', title: 'Top Gun: Maverick', year: '2022', genre: 'Action', rating: '8.3' },
    { id: '14', title: 'Dune', year: '2021', genre: 'Sci-Fi', rating: '8.0' },
    { id: '15', title: 'Spider-Man: No Way Home', year: '2021', genre: 'Action', rating: '8.2' },
  ];

  const myLibrary = [
    { id: '16', title: 'The Matrix', year: '1999', genre: 'Sci-Fi', rating: '8.7' },
    { id: '17', title: 'Interstellar', year: '2014', genre: 'Sci-Fi', rating: '8.6' },
    { id: '18', title: 'The Shawshank Redemption', year: '1994', genre: 'Drama', rating: '9.3' },
    { id: '19', title: 'Goodfellas', year: '1990', genre: 'Crime', rating: '8.7' },
    { id: '20', title: 'The Lord of the Rings', year: '2001-2003', genre: 'Fantasy', rating: '9.0' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="relative z-10 h-full flex items-center px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to NiluFlix
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Your personal streaming platform with unlimited movies and TV shows.
            </p>
            <div className="flex space-x-4">
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <span>▶</span>
                <span>Get Started</span>
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 text-white/20 text-6xl">🎬</div>
      </div>

      {/* Trending Movies */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">🔥 Trending Movies</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {trendingMovies.map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-2">🎬</div>
                <h3 className="text-white font-bold mb-1">{movie.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{movie.year} • {movie.genre}</p>
                <p className="text-yellow-400 text-sm">⭐ {movie.rating}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">▶</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular TV Shows */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">📺 Popular TV Shows</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {popularTVShows.map((show) => (
            <div
              key={show.id}
              className="flex-shrink-0 w-48 h-72 bg-gray-800 rounded-lg p-4 hover:scale-105 transition-transform cursor-pointer group"
            >
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-2">📺</div>
                <h3 className="text-white font-bold mb-1">{show.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{show.year} • {show.genre}</p>
                <p className="text-yellow-400 text-sm">⭐ {show.rating}</p>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">▶</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">📊 Your Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-500">0</div>
            <div className="text-gray-300 text-sm">Movies</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">0</div>
            <div className="text-gray-300 text-sm">TV Shows</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500">0</div>
            <div className="text-gray-300 text-sm">Hours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500">0</div>
            <div className="text-gray-300 text-sm">Downloads</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MoviesPage = () => (
  <div>
    <h1 className="text-4xl font-bold mb-6">🎬 Movies</h1>
    <p className="text-xl text-gray-300 mb-8">
      Discover amazing movies and build your collection
    </p>
    <div className="bg-gray-800 p-8 rounded-lg text-center">
      <p className="text-gray-400">Movie search and discovery coming soon...</p>
    </div>
  </div>
);

const TVShowsPage = () => (
  <div>
    <h1 className="text-4xl font-bold mb-6">📺 TV Shows</h1>
    <p className="text-xl text-gray-300 mb-8">
      Browse your favorite TV series and seasons
    </p>
    <div className="bg-gray-800 p-8 rounded-lg text-center">
      <p className="text-gray-400">TV show browser coming soon...</p>
    </div>
  </div>
);

const LibraryPage = () => (
  <div>
    <h1 className="text-4xl font-bold mb-6">📚 My Library</h1>
    <p className="text-xl text-gray-300 mb-8">
      Manage your personal media collection
    </p>
    <div className="bg-gray-800 p-8 rounded-lg text-center">
      <p className="text-gray-400">Library management coming soon...</p>
    </div>
  </div>
);

const DownloadsPage = () => (
  <div>
    <h1 className="text-4xl font-bold mb-6">⬇️ Downloads</h1>
    <p className="text-xl text-gray-300 mb-8">
      Monitor your download progress and queue
    </p>
    <div className="bg-gray-800 p-8 rounded-lg text-center">
      <p className="text-gray-400">Download manager coming soon...</p>
    </div>
  </div>
);

const SettingsPage = () => (
  <div>
    <h1 className="text-4xl font-bold mb-6">⚙️ Settings</h1>
    <p className="text-xl text-gray-300 mb-8">
      Configure your NiluFlix experience
    </p>
    <div className="bg-gray-800 p-8 rounded-lg text-center">
      <p className="text-gray-400">Settings panel coming soon...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  console.log('App component rendering...');
  
  React.useEffect(() => {
    console.log('App component mounted!');
  }, []);

  return (
    <Router>
      <MainLayout>
        <div className="p-4 bg-red-500 text-white mb-4">
          ROUTER DEBUG: Current URL should show content below this red box
        </div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVShowsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={
            <div className="p-6 bg-yellow-500 text-black">
              <h1 className="text-2xl font-bold">404 - Route Not Found</h1>
              <p>Current path doesn't match any route</p>
            </div>
          } />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
