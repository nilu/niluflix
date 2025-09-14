import React from 'react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';
import { useMovieGenres, useMoviesByGenre } from '../../hooks/useMovies';
import { useTVGenres, useTVShowsByGenre } from '../../hooks/useTVShows';
import Spinner from '../ui/Spinner';

interface GenreContentRowProps {
  title: string;
  type: 'movie' | 'tv' | 'mixed';
  genreName: string;
  genreId: number;
}

const GenreContentRow: React.FC<GenreContentRowProps> = ({
  title,
  type,
  genreName,
  genreId,
}) => {
  const shouldFetchMovies = type === 'movie' || type === 'mixed';
  const shouldFetchTVShows = type === 'tv' || type === 'mixed';

  const { data: movies, isLoading: moviesLoading, error: moviesError } = useMoviesByGenre(
    genreId, 
    1, 
    shouldFetchMovies
  );
  const { data: tvShows, isLoading: tvShowsLoading, error: tvShowsError } = useTVShowsByGenre(
    genreId, 
    1, 
    shouldFetchTVShows
  );

  // Combine content based on type
  const getContent = () => {
    if (type === 'movie') {
      return { data: movies, loading: moviesLoading, error: moviesError };
    }
    if (type === 'tv') {
      return { data: tvShows, loading: tvShowsLoading, error: tvShowsError };
    }
    // Mixed - combine both
    const movieResults = movies?.results || [];
    const tvResults = tvShows?.results || [];
    const combined = [
      ...movieResults.map(m => ({ ...m, type: 'movie' as const })),
      ...tvResults.map(t => ({ ...t, type: 'tv' as const, title: t.name, release_date: t.first_air_date }))
    ];
    return { 
      data: { results: combined }, 
      loading: moviesLoading || tvShowsLoading, 
      error: moviesError || tvShowsError 
    };
  };

  const { data, loading, error } = getContent();
  const content = data?.results || [];

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-red-400">Failed to load {genreName} content. Please try again.</p>
          <p className="text-red-300 text-sm mt-2">{error.message || String(error)}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!content || content.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex items-center justify-center py-8">
          <p className="text-gray-400">No {genreName} content available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
          {content.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0"
            >
              <ContentCard content={{
                id: item.id,
                title: item.title || item.name,
                poster_path: item.poster_path,
                vote_average: item.vote_average,
                release_date: item.release_date || item.first_air_date,
                type: item.type || (item.name ? 'tv' : 'movie'),
                download_status: item.download_status || 'not_downloaded',
              }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreContentRow;
