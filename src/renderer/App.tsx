import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';

console.log('App.tsx loaded!');

// Enhanced pages with better content
const HomePage = () => (
  <div>
    <h1 className="text-4xl font-bold mb-6">Welcome to NiluFlix</h1>
    <p className="text-xl text-gray-300 mb-8">
      Your personal streaming platform with unlimited content
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">🎬 Movies</h3>
        <p className="text-gray-300">Discover and download your favorite films</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">📺 TV Shows</h3>
        <p className="text-gray-300">Binge-watch entire series at your pace</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">📚 My Library</h3>
        <p className="text-gray-300">Manage your personal media collection</p>
      </div>
    </div>
  </div>
);

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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TVShowsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
