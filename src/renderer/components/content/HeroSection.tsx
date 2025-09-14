import React from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const HeroSection: React.FC = () => {
  // Mock featured content - TODO: Replace with real data from API
  const featuredContent = {
    title: 'The Dark Knight',
    overview: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    backdrop_path: '/hqkIcbrOHL86UncnHIsHVcVmzue.jpg',
    release_date: '2008-07-18',
    vote_average: 8.5,
    genres: ['Action', 'Crime', 'Drama'],
    download_status: 'not_downloaded',
  };

  return (
    <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${featuredContent.backdrop_path})`,
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
            <span className="text-green-400 font-semibold">
              {featuredContent.vote_average}/10
            </span>
            <span className="text-gray-300">{featuredContent.release_date}</span>
          </motion.div>
          
          <motion.div
            className="flex flex-wrap gap-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {featuredContent.genres.map((genre) => (
              <span
                key={genre}
                className="px-3 py-1 bg-white/20 rounded-full text-sm text-white"
              >
                {genre}
              </span>
            ))}
          </motion.div>
          
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
