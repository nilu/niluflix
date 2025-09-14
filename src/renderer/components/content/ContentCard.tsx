import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon, ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ContentCardProps {
  content: {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    type: 'movie' | 'tv';
    download_status: 'not_downloaded' | 'downloading' | 'downloaded' | 'failed';
  };
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const releaseYear = content.release_date 
    ? new Date(content.release_date).getFullYear()
    : content.first_air_date 
    ? new Date(content.first_air_date).getFullYear()
    : '';

  const getDownloadIcon = () => {
    switch (content.download_status) {
      case 'downloading':
        return <ArrowDownTrayIcon className="w-4 h-4 text-blue-400" />;
      case 'downloaded':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <ArrowDownTrayIcon className="w-4 h-4 text-red-400" />;
      default:
        return <ArrowDownTrayIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDownloadStatus = () => {
    switch (content.download_status) {
      case 'downloading':
        return 'Downloading...';
      case 'downloaded':
        return 'Downloaded';
      case 'failed':
        return 'Failed';
      default:
        return 'Download';
    }
  };

  return (
    <motion.div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden p-0">
        {/* Poster */}
        <div className="relative aspect-[2/3] bg-gray-700 overflow-hidden">
          <img
            src={content.poster_url || `https://image.tmdb.org/t/p/w300${content.poster_path}`}
            alt={content.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              // Fallback to a placeholder if image fails to load
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0xNTAgMjAwTDEyMCAyMzBIMTgwTDE1MCAyMDBaIiBmaWxsPSIjNkI3MjgwIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action Buttons */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button size="sm" className="flex items-center space-x-1">
              <PlayIcon className="w-4 h-4" />
              <span>Play</span>
            </Button>
            
            <Button variant="secondary" size="sm" className="flex items-center space-x-1">
              <PlusIcon className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </motion.div>
          
          {/* Download Status */}
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1 bg-black/70 rounded px-2 py-1">
              {getDownloadIcon()}
              <span className="text-xs text-white">
                {getDownloadStatus()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content Info */}
        <div className="p-3">
          <Link
            to={`/${content.type}/${content.id}`}
            className="block hover:text-red-400 transition-colors"
          >
            <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2">
              {content.title}
            </h3>
          </Link>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{releaseYear}</span>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span>{content.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
          
          {/* Download Button */}
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              disabled={content.download_status === 'downloading'}
            >
              {getDownloadStatus()}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ContentCard;
