import React from 'react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';
import { usePopularMovies, useTrendingMovies, useDownloadedMovies, useSearchMovies, useMoviesByGenre, useDownloadMovie } from '../../hooks/useMovies';
import { usePopularTVShows, useTrendingTVShows, useDownloadedTVShows, useSearchTVShows, useTVShowsByGenre, useDownloadTVShow } from '../../hooks/useTVShows';
import Spinner from '../ui/Spinner';

interface ContentRowProps {
  title: string;
  type: 'movie' | 'tv' | 'mixed';
  category: 'trending' | 'popular' | 'downloaded' | 'search' | 'genre';
  query?: string;
  genreId?: number;
  navigationState?: any;
}

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  type,
  category,
  query,
  genreId,
  navigationState,
}) => {
  // Download mutations
  const downloadMovie = useDownloadMovie();
  const downloadTVShow = useDownloadTVShow();

  // Download handlers
  const handleDownload = async (contentId: number, contentType: string, options?: any) => {
    console.log('🎬 ContentRow: handleDownload called', { contentId, contentType, options });
    
    if (contentType === 'movie') {
      console.log('🎬 ContentRow: Calling downloadMovie.mutateAsync');
      const result = await downloadMovie.mutateAsync({ id: contentId, quality: options?.quality });
      console.log('🎬 ContentRow: downloadMovie result', result);
      return result;
    } else if (contentType === 'tv_show') {
      console.log('🎬 ContentRow: Calling downloadTVShow.mutateAsync');
      const result = await downloadTVShow.mutateAsync({ id: contentId, seasons: options?.seasons, quality: options?.quality });
      console.log('🎬 ContentRow: downloadTVShow result', result);
      return result;
    }
  };

  // Get download status for content
  const getDownloadStatus = (content: any) => {
    // This will be populated by the API response
    return content.download_status || 'not_downloaded';
  };

  const getDownloadProgress = (content: any) => {
    return content.download_progress || 0;
  };

  const handlePause = (contentId: number) => {
    // TODO: Implement pause functionality
    console.log('Pause download:', contentId);
  };

  const handleResume = (contentId: number) => {
    // TODO: Implement resume functionality
    console.log('Resume download:', contentId);
  };

  const handleCancel = (contentId: number) => {
    // TODO: Implement cancel functionality
    console.log('Cancel download:', contentId);
  };

  const handleRetry = (contentId: number) => {
    // TODO: Implement retry functionality
    console.log('Retry download:', contentId);
  };

  // Conditionally fetch data based on what's actually needed
  const shouldFetchPopularMovies = category === 'popular' && type === 'movie';
  const shouldFetchTrendingMovies = category === 'trending' && type === 'movie';
  const shouldFetchPopularTVShows = category === 'popular' && type === 'tv';
  const shouldFetchTrendingTVShows = category === 'trending' && type === 'tv';
  const shouldFetchDownloadedMovies = category === 'downloaded' && (type === 'movie' || type === 'mixed');
  const shouldFetchDownloadedTVShows = category === 'downloaded' && (type === 'tv' || type === 'mixed');
  const shouldFetchSearchMovies = category === 'search' && type === 'movie' && !!query;
  const shouldFetchSearchTVShows = category === 'search' && type === 'tv' && !!query;
  const shouldFetchGenreMovies = category === 'genre' && type === 'movie' && !!genreId;
  const shouldFetchGenreTVShows = category === 'genre' && type === 'tv' && !!genreId;

  const { data: popularMovies, isLoading: popularMoviesLoading, error: popularMoviesError } = usePopularMovies(1);
  const { data: trendingMovies, isLoading: trendingMoviesLoading, error: trendingMoviesError } = useTrendingMovies('day', 1);
  const { data: popularTVShows, isLoading: popularTVShowsLoading, error: popularTVShowsError } = usePopularTVShows(1);
  const { data: trendingTVShows, isLoading: trendingTVShowsLoading, error: trendingTVShowsError } = useTrendingTVShows('day', 1);
  
  // Only call downloaded hooks when needed
  const { data: downloadedMovies, isLoading: downloadedMoviesLoading, error: downloadedMoviesError } = useDownloadedMovies(1, 20, shouldFetchDownloadedMovies);
  const { data: downloadedTVShows, isLoading: downloadedTVShowsLoading, error: downloadedTVShowsError } = useDownloadedTVShows(1, 20, shouldFetchDownloadedTVShows);
  
  // Search queries
  const { data: searchMovies, isLoading: searchMoviesLoading, error: searchMoviesError } = useSearchMovies(
    { query: query || '', page: 1 }, 
    shouldFetchSearchMovies
  );
  const { data: searchTVShows, isLoading: searchTVShowsLoading, error: searchTVShowsError } = useSearchTVShows(
    { query: query || '', page: 1 }, 
    shouldFetchSearchTVShows
  );

  // Genre queries
  const { data: genreMovies, isLoading: genreMoviesLoading, error: genreMoviesError } = useMoviesByGenre(
    genreId || 0, 
    1, 
    shouldFetchGenreMovies
  );
  const { data: genreTVShows, isLoading: genreTVShowsLoading, error: genreTVShowsError } = useTVShowsByGenre(
    genreId || 0, 
    1, 
    shouldFetchGenreTVShows
  );

  // Determine which data to use
  const getContentData = () => {
    if (category === 'search') {
      if (type === 'movie') return { data: searchMovies, loading: searchMoviesLoading, error: searchMoviesError };
      if (type === 'tv') return { data: searchTVShows, loading: searchTVShowsLoading, error: searchTVShowsError };
      // Mixed search - combine both
      const movies = searchMovies?.results || [];
      const tvShows = searchTVShows?.results || [];
      const combined = [...movies.map(m => ({ ...m, type: 'movie' as const })), ...tvShows.map(t => ({ ...t, type: 'tv' as const, title: t.name, release_date: t.first_air_date }))];
      return { 
        data: { results: combined }, 
        loading: searchMoviesLoading || searchTVShowsLoading, 
        error: searchMoviesError || searchTVShowsError 
      };
    }
    
    if (category === 'downloaded') {
      if (type === 'movie') return { data: downloadedMovies, loading: downloadedMoviesLoading, error: downloadedMoviesError };
      if (type === 'tv') return { data: downloadedTVShows, loading: downloadedTVShowsLoading, error: downloadedTVShowsError };
      // Mixed downloaded - combine both
      const movies = downloadedMovies?.results || [];
      const tvShows = downloadedTVShows?.results || [];
      const combined = [...movies.map(m => ({ ...m, type: 'movie' as const })), ...tvShows.map(t => ({ ...t, type: 'tv' as const, title: t.name, release_date: t.first_air_date }))];
      return { 
        data: { results: combined }, 
        loading: downloadedMoviesLoading || downloadedTVShowsLoading, 
        error: downloadedMoviesError || downloadedTVShowsError 
      };
    }
    
    if (category === 'popular') {
      if (type === 'movie') return { data: popularMovies, loading: popularMoviesLoading, error: popularMoviesError };
      if (type === 'tv') return { data: popularTVShows, loading: popularTVShowsLoading, error: popularTVShowsError };
      // Mixed popular - combine both
      const movies = popularMovies?.results || [];
      const tvShows = popularTVShows?.results || [];
      const combined = [...movies.map(m => ({ ...m, type: 'movie' as const })), ...tvShows.map(t => ({ ...t, type: 'tv' as const, title: t.name, release_date: t.first_air_date }))];
      return { 
        data: { results: combined }, 
        loading: popularMoviesLoading || popularTVShowsLoading, 
        error: popularMoviesError || popularTVShowsError 
      };
    }
    
    if (category === 'trending') {
      if (type === 'movie') return { data: trendingMovies, loading: trendingMoviesLoading, error: trendingMoviesError };
      if (type === 'tv') return { data: trendingTVShows, loading: trendingTVShowsLoading, error: trendingTVShowsError };
      // Mixed trending - combine both
      const movies = trendingMovies?.results || [];
      const tvShows = trendingTVShows?.results || [];
      const combined = [...movies.map(m => ({ ...m, type: 'movie' as const })), ...tvShows.map(t => ({ ...t, type: 'tv' as const, title: t.name, release_date: t.first_air_date }))];
      return { 
        data: { results: combined }, 
        loading: trendingMoviesLoading || trendingTVShowsLoading, 
        error: trendingMoviesError || trendingTVShowsError 
      };
    }
    
    if (category === 'genre') {
      if (type === 'movie') return { data: genreMovies, loading: genreMoviesLoading, error: genreMoviesError };
      if (type === 'tv') return { data: genreTVShows, loading: genreTVShowsLoading, error: genreTVShowsError };
      // Mixed genre - combine both
      const movies = genreMovies?.results || [];
      const tvShows = genreTVShows?.results || [];
      const combined = [...movies.map(m => ({ ...m, type: 'movie' as const })), ...tvShows.map(t => ({ ...t, type: 'tv' as const, title: t.name, release_date: t.first_air_date }))];
      return { 
        data: { results: combined }, 
        loading: genreMoviesLoading || genreTVShowsLoading, 
        error: genreMoviesError || genreTVShowsError 
      };
    }
    
    return { data: null, loading: false, error: null };
  };

  const { data, loading, error } = getContentData();
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
          <p className="text-red-400">Failed to load content. Please try again.</p>
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
          <p className="text-gray-400">No content available.</p>
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
              <ContentCard 
                content={{
                  id: item.id,
                  title: item.title || item.name,
                  poster_path: item.poster_path,
                  poster_url: item.poster_url,
                  vote_average: item.vote_average,
                  release_date: item.release_date || item.first_air_date,
                  type: item.type || (item.name ? 'tv' : 'movie'),
                  download_status: item.download_status || 'not_downloaded',
                  download_progress: item.download_progress,
                }}
                onDownload={(contentId, options) => handleDownload(contentId, item.type || (item.name ? 'tv_show' : 'movie'), options)}
                onPause={handlePause}
                onResume={handleResume}
                onCancel={handleCancel}
                onRetry={handleRetry}
                navigationState={navigationState}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentRow;
