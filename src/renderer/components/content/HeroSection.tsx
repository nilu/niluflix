import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { useTrendingMovies } from '../../hooks/useMovies';
import Spinner from '../ui/Spinner';

const HeroSection: React.FC = () => {
  // Fetch trending movies to get featured content
  const { data: trendingMovies, isLoading, error } = useTrendingMovies('day', 1);
  
  // Use the first trending movie as featured content
  const featuredContent = trendingMovies?.results?.[0];

  // Show loading state
  if (isLoading) {
    return (
      <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (error || !featuredContent) {
    return (
      <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Failed to load featured content</p>
          <p className="text-gray-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${featuredContent.backdrop_url || `https://image.tmdb.org/t/p/original${featuredContent.backdrop_path}`})`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center p-8">
        <div className="max-w-2xl">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {featuredContent.title}
          </motion.h1>
          
          <motion.div
            className="flex items-center space-x-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-yellow-400 text-lg font-semibold">
              ★ {featuredContent.vote_average?.toFixed(1)}
            </span>
            <span className="text-white text-lg">
              {featuredContent.release_date ? new Date(featuredContent.release_date).getFullYear() : ''}
            </span>
          </motion.div>
          
          {featuredContent.genres && (
            <motion.div
              className="flex flex-wrap gap-2 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {featuredContent.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm text-white"
                >
                  {genre}
                </span>
              ))}
            </motion.div>
          )}
          
          <motion.p
            className="text-gray-300 text-lg leading-relaxed mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {featuredContent.overview}
          </motion.p>
          
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button size="lg" className="flex items-center space-x-2">
              <PlayIcon className="w-5 h-5" />
              <span>Play</span>
            </Button>
            
            <Button variant="secondary" size="lg" className="flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>Add to Library</span>
            </Button>
            
            <Button variant="outline" size="lg" className="flex items-center space-x-2">
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>
                {featuredContent.download_status === 'downloaded' ? 'Downloaded' : 'Download'}
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
