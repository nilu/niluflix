import React from 'react';
import { motion } from 'framer-motion';
import ContentCard from './ContentCard';

interface ContentGridProps {
  type: 'movie' | 'tv' | 'mixed';
  category: 'trending' | 'popular' | 'downloaded' | 'search';
  title?: string;
  query?: string;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  type,
  category,
  title,
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
    {
      id: 6,
      title: 'Game of Thrones',
      poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      vote_average: 8.3,
      first_air_date: '2011-04-17',
      type: 'tv',
      download_status: 'not_downloaded',
    },
    {
      id: 7,
      title: 'Pulp Fiction',
      poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
      vote_average: 8.9,
      release_date: '1994-10-14',
      type: 'movie',
      download_status: 'not_downloaded',
    },
    {
      id: 8,
      title: 'The Office',
      poster_path: '/7DJKHzAi8T6nqkf1f8k81F4mN2.jpg',
      vote_average: 8.5,
      first_air_date: '2005-03-24',
      type: 'tv',
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
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredContent.map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContentCard content={content} />
          </motion.div>
        ))}
      </div>
      
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            {category === 'search' ? 'No results found' : 'No content available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContentGrid;
