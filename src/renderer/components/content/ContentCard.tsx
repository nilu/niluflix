import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon } from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import DownloadButton from '../downloads/DownloadButton';
import { useDownloadModal } from '../../contexts/DownloadModalContext';

interface ContentCardProps {
  content: {
    id: number;
    title: string;
    poster_path: string;
    poster_url?: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    type: 'movie' | 'tv';
    download_status?: 'not_downloaded' | 'downloading' | 'downloaded' | 'failed';
    download_progress?: number;
  };
  onDownload?: (contentId: number, contentType: string, options?: any) => void;
  onPause?: (contentId: number) => void;
  onResume?: (contentId: number) => void;
  onCancel?: (contentId: number) => void;
  onRetry?: (contentId: number) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onDownload, 
  onPause, 
  onResume, 
  onCancel, 
  onRetry 
}) => {
  
  const [isHovered, setIsHovered] = React.useState(false);
  const { openModal } = useDownloadModal();
  
  const releaseYear = content.release_date 
    ? new Date(content.release_date).getFullYear()
    : content.first_air_date 
    ? new Date(content.first_air_date).getFullYear()
    : '';

  const handleDownload = async (contentId: number, options?: any) => {
    if (onDownload) {
      try {
        // Open modal immediately with initial state
        const initialData = {
          jobId: `temp_${Date.now()}`,
          movie: {
            id: contentId,
            title: content.title,
            poster_path: content.poster_path,
            release_date: content.release_date || content.first_air_date
          },
          steps: [
            {
              id: 'movie_details',
              title: 'Getting movie details',
              description: 'Fetching movie information...',
              status: 'completed' as const
            },
            {
              id: 'torrent_search',
              title: 'Searching for torrents',
              description: 'Finding available downloads...',
              status: 'active' as const
            },
            {
              id: 'queue_add',
              title: 'Adding to download queue',
              description: 'Preparing download...',
              status: 'pending' as const
            },
            {
              id: 'torrent_start',
              title: 'Starting torrent download',
              description: 'Connecting to peers...',
              status: 'pending' as const
            },
            {
              id: 'downloading',
              title: 'Downloading',
              description: 'Download in progress...',
              status: 'pending' as const
            },
            {
              id: 'organizing',
              title: 'Organizing files',
              description: 'Moving files to organized structure',
              status: 'pending' as const
            },
            {
              id: 'completed',
              title: 'Download complete',
              description: 'Ready to watch!',
              status: 'pending' as const
            }
          ],
          currentStep: 'torrent_search',
          progress: 0
        };
        
        openModal(initialData);
        
        // Call the original download handler
        const result = await onDownload(contentId, content.type === 'tv' ? 'tv_show' : 'movie', options);
        
        // Update modal with real data from API response
        if (result && typeof result === 'object' && 'data' in result && result.data && typeof result.data === 'object' && 'steps' in result.data) {
          openModal(result.data as any);
        }
      } catch (error) {
        console.error('Download failed:', error);
      }
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
      <Link to={`/${content.type}/${content.id}`} className="block">
        <Card className="overflow-hidden p-0 cursor-pointer">
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
            {content.download_status && content.download_status !== 'not_downloaded' && (
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-1 bg-black/70 rounded px-2 py-1">
                  <span className="text-xs text-white">
                    {content.download_status === 'downloading' ? 
                      `${Math.round(content.download_progress || 0)}%` :
                      content.download_status.charAt(0).toUpperCase() + content.download_status.slice(1)
                    }
                  </span>
                </div>
              </div>
            )}
            
            {/* Download Progress Bar */}
            {content.download_status === 'downloading' && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                <div className="w-full bg-gray-600 rounded-full h-1">
                  <div 
                    className="bg-red-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${content.download_progress || 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Content Info */}
          <div className="p-3">
            <h3 className="font-semibold text-white text-sm mb-1 line-clamp-2 hover:text-red-400 transition-colors">
              {content.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{releaseYear}</span>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span>{content.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
      
      {/* Download Button - Outside the Link to prevent navigation conflicts */}
      <div className="mt-2 px-3">
        <DownloadButton
          contentId={content.id}
          contentType={content.type === 'tv' ? 'tv_show' : 'movie'}
          title={content.title}
          downloadStatus={content.download_status}
          progress={content.download_progress}
          onDownload={handleDownload}
          onPause={onPause}
          onResume={onResume}
          onCancel={onCancel}
          onRetry={onRetry}
          size="sm"
          variant="ghost"
          className="w-full"
          showProgress={true}
        />
      </div>

    </motion.div>
  );
};

export default ContentCard;
