import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

console.log('App.tsx loaded!');

// Simple test pages for navigation
const HomePage = () => (
  <div className="p-5">
    <h2 className="text-2xl font-bold mb-4">🏠 Home Page</h2>
    <p>Welcome to NiluFlix! Browse your favorite movies and TV shows.</p>
  </div>
);

const MoviesPage = () => (
  <div className="p-5">
    <h2 className="text-2xl font-bold mb-4">🎬 Movies</h2>
    <p>Discover amazing movies here.</p>
  </div>
);

const TVShowsPage = () => (
  <div className="p-5">
    <h2 className="text-2xl font-bold mb-4">📺 TV Shows</h2>
    <p>Browse your favorite TV series.</p>
  </div>
);

const App: React.FC = () => {
  console.log('App component rendering...');
  
  React.useEffect(() => {
    console.log('App component mounted!');
  }, []);

  return (
    <Router>
      <div className="bg-black text-white min-h-screen">
        {/* Header with Navigation */}
        <header className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-red-600 text-3xl font-bold">NILUFLIX</h1>
            
            <nav className="flex space-x-6">
              <Link to="/" className="text-white hover:text-red-500 transition-colors">Home</Link>
              <Link to="/movies" className="text-white hover:text-red-500 transition-colors">Movies</Link>
              <Link to="/tv" className="text-white hover:text-red-500 transition-colors">TV Shows</Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/tv" element={<TVShowsPage />} />
          </Routes>
        </main>

        {/* Status Check */}
        <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 p-3 rounded-lg text-sm">
          <h3 className="text-green-400 font-semibold mb-1">✅ Status</h3>
          <p>✅ React Router working</p>
          <p>✅ Tailwind v4.1 PostCSS</p>
        </div>
      </div>
    </Router>
  );
};

export default App;
