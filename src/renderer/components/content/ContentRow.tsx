import React from 'react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';

interface ContentRowProps {
  title: string;
  type: 'movie' | 'tv' | 'mixed';
  category: 'trending' | 'popular' | 'downloaded' | 'search';
  query?: string;
}

const ContentRow: React.FC<ContentRowProps> = ({
  title,
  type,
  category,
  query,
}) => {
  // Mock data - TODO: Replace with real data from API
  const mockContent = [
    {
      id: 1,
      title: 'The Dark Knight',
      poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      vote_average: 8.5,
      release_date: '2008-07-18',
      type: 'movie',
      download_status: 'not_downloaded',
    },
    {
      id: 2,
      title: 'Inception',
      poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
      vote_average: 8.8,
      release_date: '2010-07-16',
      type: 'movie',
      download_status: 'downloading',
    },
    {
      id: 3,
      title: 'Breaking Bad',
      poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      vote_average: 8.9,
      first_air_date: '2008-01-20',
      type: 'tv',
      download_status: 'downloaded',
    },
    {
      id: 4,
      title: 'Stranger Things',
      poster_path: '/49WJfeN0moxb9IPfGn9AIqMGskD.jpg',
      vote_average: 8.7,
      first_air_date: '2016-07-15',
      type: 'tv',
      download_status: 'not_downloaded',
    },
    {
      id: 5,
      title: 'The Matrix',
      poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
      vote_average: 8.7,
      release_date: '1999-03-30',
      type: 'movie',
      download_status: 'downloaded',
    },
  ];

  const filteredContent = mockContent.filter((item) => {
    if (type !== 'mixed' && item.type !== type) return false;
    if (category === 'downloaded' && item.download_status !== 'downloaded') return false;
    if (category === 'search' && query && !item.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4">
          {filteredContent.map((content, index) => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0"
            >
              <ContentCard content={content} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentRow;
