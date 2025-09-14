import React from 'react';
import { motion } from 'framer-motion';
import ContentRow from '../components/content/ContentRow';

const LibraryPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">My Library</h1>
        <p className="text-gray-400 text-lg">
          Your personal collection of downloaded movies and TV shows
        </p>
      </div>

      {/* Content Rows */}
      <div className="space-y-12">
        <ContentRow
          title="Downloaded Movies"
          type="movie"
          category="downloaded"
        />
        
        <ContentRow
          title="Downloaded TV Shows"
          type="tv"
          category="downloaded"
        />
      </div>
    </div>
  );
};

export default LibraryPage;
