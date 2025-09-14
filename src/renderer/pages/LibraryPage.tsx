import React from 'react';
import { motion } from 'framer-motion';
import ContentGrid from '../components/content/ContentGrid';

const LibraryPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">My Library</h1>
        <p className="text-gray-400 text-lg">
          Your downloaded movies and TV shows
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-4 border-b border-white/10">
        <button className="px-4 py-2 text-red-400 border-b-2 border-red-400 font-medium">
          All
        </button>
        <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
          Movies
        </button>
        <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
          TV Shows
        </button>
        <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
          Recently Added
        </button>
      </div>

      {/* Content Grid */}
      <ContentGrid
        type="mixed"
        category="downloaded"
        title="Downloaded Content"
      />
    </div>
  );
};

export default LibraryPage;
