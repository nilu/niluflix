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
    filePath?: string;
  };
  onDownload?: (contentId: number, contentType: string, options?: any) => Promise<any>;
  onPause?: (contentId: number) => void;
  onResume?: (contentId: number) => void;
  onCancel?: (contentId: number) => void;
  onRetry?: (contentId: number) => void;
  navigationState?: any;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onDownload, 
  onPause, 
  onResume, 
  onCancel, 
  onRetry,
  navigationState
}) => {
  
  const [isHovered, setIsHovered] = React.useState(false);
  const { openModal, updateJobId } = useDownloadModal();
  
  console.log('🎬 ContentCard: Rendering for', content.title, 'with onDownload:', !!onDownload);
  
  const releaseYear = content.release_date 
    ? new Date(content.release_date).getFullYear()
    : content.first_air_date 
    ? new Date(content.first_air_date).getFullYear()
    : '';

  const handleDownload = async (contentId: number, options?: any) => {
    console.log('🎬 ContentCard: handleDownload called', { contentId, options, content: content.title });
    
    if (onDownload) {
      try {
        console.log('🎬 ContentCard: Opening modal with initial data');
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
              description: `Found "${content.title}" (${content.release_date ? new Date(content.release_date).getFullYear() : content.first_air_date ? new Date(content.first_air_date).getFullYear() : 'Unknown'})`,
              status: 'active' as const
            },
            {
              id: 'torrent_search',
              title: 'Searching for torrents',
              description: 'Finding available downloads...',
              status: 'pending' as const
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
            }
          ],
          currentStep: 'movie_details',
          progress: 0
        };
        
        console.log('🎬 ContentCard: Calling openModal with data:', initialData);
        openModal(initialData);
        console.log('🎬 ContentCard: Modal opened, calling onDownload');
        
        // Call the original download handler
        const result = await onDownload(contentId, content.type === 'tv' ? 'tv_show' : 'movie', options);
        console.log('🎬 ContentCard: onDownload result:', result);
        
        // Update jobId with real jobId from API response
        if (result && (result as any).data && (result as any).data.jobId) {
          console.log('🎬 ContentCard: Updating jobId to:', (result as any).data.jobId);
          updateJobId((result as any).data.jobId);
        }
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };



  return (
    <motion.div
      className="group relative w-40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/${content.type}/${content.id}`} state={navigationState} className="block">
        <Card className="overflow-hidden p-0 cursor-pointer">
          {/* Poster */}
          <div className="relative aspect-[3/4] bg-gray-700 overflow-hidden">
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
              className="absolute inset-0 flex items-center justify-center space-x-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button size="sm" className="flex items-center space-x-1 text-xs px-2 py-1">
                <PlayIcon className="w-3 h-3" />
                <span className="text-xs">Play</span>
              </Button>
              
              <Button variant="secondary" size="sm" className="flex items-center space-x-1 text-xs px-2 py-1">
                <PlusIcon className="w-3 h-3" />
                <span className="text-xs">Add</span>
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
          <div className="p-2">
            <h3 className="font-semibold text-white text-xs mb-1 line-clamp-2 hover:text-red-400 transition-colors">
              {content.title}
            </h3>
            
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="text-xs">{releaseYear}</span>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs">{content.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
      
      {/* Action Button - Outside the Link to prevent navigation conflicts */}
      <div className="mt-1 px-2">
        {/* Show Play button in library context for movies only, Download button elsewhere */}
        {navigationState?.fromLibrary && content.type === 'movie' ? (
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Debug: Log the content object to see what fields are available
              console.log('🎬 ContentCard: Full content object:', content);
              console.log('🎬 ContentCard: filePath field:', content.filePath);
              console.log('🎬 ContentCard: downloadStatus:', content.download_status);
              
              // Import video player service dynamically to avoid issues
              const { VideoPlayerService } = await import('../../services/videoPlayer');
              
              if (!content.filePath) {
                console.error('❌ ContentCard: No filePath found in content:', content);
                alert('Video file not found. Please re-download this content.');
                return;
              }
              
              console.log('🎬 ContentCard: Playing:', content.title, 'at', content.filePath);
              
              try {
                const result = await VideoPlayerService.playVideo(content.filePath);
                if (!result.success) {
                  alert(`Failed to play video: ${VideoPlayerService.getErrorMessage(result.error)}`);
                }
              } catch (error) {
                console.error('Play error:', error);
                alert(`Failed to play video: ${VideoPlayerService.getErrorMessage(error)}`);
              }
            }}
            className="w-full py-1.5 px-3 rounded text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center space-x-1"
          >
            <PlayIcon className="w-3 h-3" />
            <span>Play</span>
          </button>
        ) : navigationState?.fromLibrary && content.type === 'tv' ? (
          // No button for TV shows in library - they're already downloaded, just click to view episodes
          <div className="w-full py-1.5 px-3 rounded text-xs font-medium bg-gray-600 text-gray-300 text-center">
            View Episodes
          </div>
        ) : (
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
            className="w-full text-xs"
            showProgress={true}
          />
        )}
      </div>

    </motion.div>
  );
};

export default ContentCard;
