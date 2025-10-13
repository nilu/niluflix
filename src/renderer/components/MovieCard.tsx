import React from 'react';

interface MovieCardProps {
  title: string;
  year: string;
  genre: string;
  rating: string;
  imageUrl?: string;
  isLarge?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ 
  title, 
  year, 
  genre, 
  rating, 
  imageUrl, 
  isLarge = false 
}) => {
  return (
    <div className={`relative group cursor-pointer transition-transform duration-300 hover:scale-105 ${
      isLarge ? 'w-48 h-72' : 'w-40 h-60'
    }`}>
      {/* Movie Poster */}
      <div className={`w-full h-full bg-gray-800 rounded-lg overflow-hidden ${
        isLarge ? 'shadow-2xl' : 'shadow-lg'
      }`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-white font-semibold text-sm">{title}</div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay on Hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 rounded-lg flex items-end">
        <div className="p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-sm mb-1">{title}</h3>
          <p className="text-xs text-gray-300 mb-1">{year} • {genre}</p>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400 text-xs">⭐</span>
            <span className="text-xs font-medium">{rating}</span>
          </div>
        </div>
      </div>

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200">
          <svg className="w-4 h-4 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
