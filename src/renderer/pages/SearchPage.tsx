import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchMovies } from '../hooks/useMovies';
import { useSearchTVShows } from '../hooks/useTVShows';
import ContentCard from '../components/content/ContentCard';
import Spinner from '../components/ui/Spinner';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'movie');

  // Search hooks
  const searchMovies = useSearchMovies(
    { query, page: 1 }, 
    query.length > 0 && (type === 'movie' || type === 'mixed')
  );
  
  const searchTVShows = useSearchTVShows(
    { query, page: 1 }, 
    query.length > 0 && (type === 'tv' || type === 'mixed')
  );

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

  // Get search results based on type
  const getSearchResults = () => {
    if (type === 'movie') {
      return searchMovies.data?.results || [];
    } else if (type === 'tv') {
      return searchTVShows.data?.results || [];
    } else if (type === 'mixed') {
      const movies = searchMovies.data?.results || [];
      const tvShows = searchTVShows.data?.results || [];
      return [...movies, ...tvShows].slice(0, 20); // Limit to 20 results
    }
    return [];
  };

  const isLoading = () => {
    if (type === 'movie') {
      return searchMovies.isLoading;
    } else if (type === 'tv') {
      return searchTVShows.isLoading;
    } else if (type === 'mixed') {
      return searchMovies.isLoading || searchTVShows.isLoading;
    }
    return false;
  };

  const hasError = () => {
    if (type === 'movie') {
      return searchMovies.error;
    } else if (type === 'tv') {
      return searchTVShows.error;
    } else if (type === 'mixed') {
      return searchMovies.error || searchTVShows.error;
    }
    return null;
  };

  const results = getSearchResults();
  const loading = isLoading();
  const error = hasError();

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Search Results for "{query}"
          </h2>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Search Error</h3>
              <p className="text-gray-300">
                Failed to search. Please try again.
              </p>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No Results Found</h3>
              <p className="text-gray-300">
                No {type === 'mixed' ? 'content' : type === 'movie' ? 'movies' : 'TV shows'} found for "{query}"
              </p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((item) => (
                <ContentCard
                  key={item.id}
                  content={{
                    id: item.id,
                    title: item.title || item.name,
                    poster_path: item.poster_path,
                    vote_average: item.vote_average,
                    release_date: item.release_date || item.first_air_date,
                    type: item.name ? 'tv' : 'movie',
                    download_status: item.download_status || 'not_downloaded',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
