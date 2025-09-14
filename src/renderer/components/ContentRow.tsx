import React from 'react';
import MovieCard from './MovieCard';

interface ContentItem {
  id: string;
  title: string;
  year: string;
  genre: string;
  rating: string;
  imageUrl?: string;
}

interface ContentRowProps {
  title: string;
  items: ContentItem[];
  isLarge?: boolean;
}

const ContentRow: React.FC<ContentRowProps> = ({ title, items, isLarge = false }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0">
            <MovieCard
              title={item.title}
              year={item.year}
              genre={item.genre}
              rating={item.rating}
              imageUrl={item.imageUrl}
              isLarge={isLarge}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentRow;
