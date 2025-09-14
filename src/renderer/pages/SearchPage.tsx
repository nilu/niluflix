import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ContentRow from '../components/content/ContentRow';

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
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
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
        <div>
          <ContentRow
            title={`Search Results for "${query}"`}
            type={type as 'movie' | 'tv' | 'mixed'}
            category="search"
            query={query}
          />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
