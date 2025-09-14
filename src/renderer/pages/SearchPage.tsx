import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ContentGrid from '../components/content/ContentGrid';
import Spinner from '../components/ui/Spinner';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'movie');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsLoading(true);
      // TODO: Implement actual search
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          {type === 'movie' ? 'Movies' : 'TV Shows'}
        </h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${type === 'movie' ? 'movies' : 'TV shows'}...`}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </form>
        
        {/* Type Toggle */}
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={() => setType('movie')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              type === 'movie'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setType('tv')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              type === 'tv'
                ? 'bg-red-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            TV Shows
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="min-h-96">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : query ? (
          <ContentGrid
            type={type}
            category="search"
            query={query}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              Enter a search term to find {type === 'movie' ? 'movies' : 'TV shows'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
