import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'movie');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Update URL with new search params
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('q', query);
      newSearchParams.set('type', type);
      window.location.hash = `#/search?${newSearchParams.toString()}`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Search</h1>
        <p className="text-gray-400 text-lg mb-8">
          Find your favorite movies and TV shows
        </p>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies, TV shows..."
              className="w-full px-6 py-4 pl-14 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Type Toggle */}
          <div className="flex justify-center mt-4 space-x-4">
            <button
              type="button"
              onClick={() => setType('movie')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                type === 'movie'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Movies
            </button>
            <button
              type="button"
              onClick={() => setType('tv')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                type === 'tv'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              TV Shows
            </button>
            <button
              type="button"
              onClick={() => setType('mixed')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                type === 'mixed'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {query && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            Search Results for "{query}"
          </h2>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-400 mb-2">🔍 Search Working!</h3>
            <p className="text-gray-300 mb-2">
              You searched for: <span className="font-semibold text-white">"{query}"</span>
            </p>
            <p className="text-gray-300 mb-2">
              Type: <span className="font-semibold text-white">{type}</span>
            </p>
            <p className="text-gray-300">
              Next step: Connect to TMDB API to show actual search results
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
