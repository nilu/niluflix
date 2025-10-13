import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon, ArrowDownTrayIcon, ArrowLeftIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import FilterToggle from '../components/ui/FilterToggle';
import { useTVShowDetails, useDownloadTVShow, useTVShowSeason, useDownloadEpisode, useTVShowEpisodes } from '../hooks/useTVShows';
import { useDownloadModal } from '../contexts/DownloadModalContext';

// Season selector dropdown component
const SeasonSelector: React.FC<{
  selectedSeason: number;
  totalSeasons: number;
  onSeasonChange: (season: number) => void;
}> = ({ selectedSeason, totalSeasons, onSeasonChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.season-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative season-selector">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[120px] justify-between"
      >
        <span>Season {selectedSeason}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((season) => (
            <button
              key={season}
              onClick={() => {
                onSeasonChange(season);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                season === selectedSeason ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
            >
              Season {season}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Season component to display individual season with episodes
const SeasonComponent: React.FC<{ 
  tvId: number; 
  seasonNumber: number; 
  showName: string; 
  showPosterPath?: string;
  showDownloadedOnly?: boolean;
  isSelected?: boolean;
}> = ({ 
  tvId, 
  seasonNumber, 
  showName,
  showPosterPath,
  showDownloadedOnly = false,
  isSelected = false
}) => {
  const { data: season, isLoading, error } = useTVShowSeason(tvId, seasonNumber, isSelected);
  const { data: downloadedEpisodes } = useTVShowEpisodes(tvId, seasonNumber, true, isSelected);
  const downloadEpisode = useDownloadEpisode();
  const { openModal } = useDownloadModal();

  // Debug logging
  console.log('🎬 SeasonComponent Debug:', {
    tvId,
    seasonNumber,
    showDownloadedOnly,
    downloadedEpisodes: downloadedEpisodes?.episodes?.length || 0,
    seasonEpisodes: season?.episodes?.length || 0
  });

  const handleEpisodeDownload = async (episodeNumber: number, episodeName: string) => {
    console.log('🎬 Episode download clicked!', { tvId, seasonNumber, episodeNumber });
    
    // Open modal immediately with step 1
    const initialData = {
      jobId: `temp_${Date.now()}`,
      tvShow: {
        id: tvId,
        name: showName,
        poster_path: showPosterPath || '',
        first_air_date: '' // We'll get this from the server response
      },
      episode: {
        tvId,
        seasonNumber,
        episodeNumber,
        showName
      },
      steps: [
        {
          id: 'episode_details',
          title: 'Getting episode details',
          description: `Found "${episodeName}" (S${seasonNumber.toString().padStart(2, '0')}E${episodeNumber.toString().padStart(2, '0')})`,
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
      currentStep: 'episode_details',
      progress: 0
    };
    
    console.log('🎬 TVShowDetailPage: Opening modal immediately');
    openModal(initialData);
    
    // Start the download in the background
    try {
      const result = await downloadEpisode.mutateAsync({
        tvId,
        seasonNumber,
        episodeNumber,
        quality: 'auto'
      });
      console.log('🎬 TVShowDetailPage: Download result', result);
      
      // Update modal with real data from server (including real jobId)
      if (result && result.data) {
        console.log('🎬 TVShowDetailPage: Updating modal with real jobId');
        openModal(result.data);
      }
    } catch (error) {
      console.error('Episode download failed:', error);
      // Update modal to show error
      // TODO: Add error handling to modal
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Season {seasonNumber}</h3>
          <Button variant="outline" size="sm">
            Download Season
          </Button>
        </div>
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
        </div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="bg-white/5 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Season {seasonNumber}</h3>
          <Button variant="outline" size="sm">
            Download Season
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">Failed to load season details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Season {seasonNumber}</h3>
          {season.overview && (
            <p className="text-sm text-gray-300 mt-1">{season.overview}</p>
          )}
        </div>
        <Button variant="outline" size="sm">
          Download Season
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(() => {
          // Get episodes to display
          let episodesToShow = season.episodes || [];
          
          // If showing downloaded only, filter episodes
          if (showDownloadedOnly && downloadedEpisodes?.episodes) {
            const downloadedEpisodeNumbers = new Set(
              downloadedEpisodes.episodes.map((ep: any) => ep.episodeNumber)
            );
            episodesToShow = episodesToShow.filter((episode: any) => 
              downloadedEpisodeNumbers.has(episode.episode_number)
            );
          }
          
          return episodesToShow.length > 0 ? episodesToShow.map((episode: any) => {
            // Check if this episode is downloaded
            const isDownloaded = downloadedEpisodes?.episodes?.some(
              (downloadedEp: any) => downloadedEp.episodeNumber === episode.episode_number
            );
            
            return (
              <div key={episode.episode_number} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">
                    Episode {episode.episode_number}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isDownloaded && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                        Downloaded
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {episode.runtime ? `${episode.runtime} min` : 'N/A'}
                    </span>
                  </div>
                </div>
                <h4 className="text-sm text-gray-300 mb-2 line-clamp-2">
                  {episode.name || `Episode ${episode.episode_number}`}
                </h4>
                <p className="text-xs text-gray-400 mb-3 line-clamp-3">
                  {episode.overview || 'No description available'}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">
                    {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'TBA'}
                  </span>
                  <span className="text-xs text-yellow-400">
                    ★ {episode.vote_average ? episode.vote_average.toFixed(1) : 'N/A'}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
              className="w-full"
              onClick={() => handleEpisodeDownload(episode.episode_number, episode.name || `Episode ${episode.episode_number}`)}
              disabled={downloadEpisode.isPending}
            >
              {downloadEpisode.isPending ? 'Downloading...' : 'Download'}
            </Button>
          </div>
            );
          }) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-400">
                {showDownloadedOnly ? 'No downloaded episodes available for this season.' : 'No episodes available for this season.'}
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const TVShowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tvId = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: show, isLoading, error } = useTVShowDetails(tvId);
  const downloadTVShow = useDownloadTVShow();
  
  // Filter state
  const [showDownloadedOnly, setShowDownloadedOnly] = useState(false);
  
  // Season selection state
  const [selectedSeason, setSelectedSeason] = useState(1);
  
  // Set default filter based on navigation source
  useEffect(() => {
    // If coming from library page, default to showing downloaded episodes only
    if (location.state?.fromLibrary) {
      setShowDownloadedOnly(true);
    }
  }, [location.state]);

  // Auto-select season with latest downloaded episode when downloaded filter is on
  useEffect(() => {
    if (showDownloadedOnly && tvId > 0) {
      // Fetch all downloaded episodes to find the latest season
      fetch(`http://localhost:3001/api/tv/${tvId}/episodes?downloaded_only=true`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data.episodes.length > 0) {
            // Find the season with the latest downloaded episode
            const latestEpisode = data.data.episodes.reduce((latest: any, episode: any) => {
              const latestDate = new Date(latest.updatedAt || latest.createdAt);
              const currentDate = new Date(episode.updatedAt || episode.createdAt);
              
              // If dates are equal, prefer higher season/episode number
              if (currentDate.getTime() === latestDate.getTime()) {
                if (episode.seasonNumber > latest.seasonNumber) return episode;
                if (episode.seasonNumber === latest.seasonNumber && episode.episodeNumber > latest.episodeNumber) return episode;
                return latest;
              }
              
              return currentDate > latestDate ? episode : latest;
            });
            
            console.log('🎯 Auto-selecting season with latest downloaded episode:', latestEpisode.seasonNumber);
            setSelectedSeason(latestEpisode.seasonNumber);
          }
        })
        .catch(error => {
          console.error('Failed to fetch downloaded episodes for auto-season selection:', error);
        });
    }
  }, [showDownloadedOnly, tvId]);

  // Debug logging
  console.log('🎬 TVShowDetailPage Debug:', {
    tvId,
    showDownloadedOnly,
    fromLibrary: location.state?.fromLibrary
  });

  const handleDownload = () => {
    if (show) {
      downloadTVShow.mutate({ id: show.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg mb-2">Failed to load TV show details</p>
        <p className="text-gray-400">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-300 hover:text-white"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: show.backdrop_path
              ? `url(https://image.tmdb.org/t/p/original${show.backdrop_path})`
              : show.poster_path
              ? `url(https://image.tmdb.org/t/p/original${show.poster_path})` // Fallback to poster
              : 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="relative z-10 h-full flex items-end p-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">{show.name || 'Unknown Title'}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-green-400 font-semibold">
                {show.vote_average ? show.vote_average.toFixed(1) : 'N/A'}/10
              </span>
              <span className="text-gray-300">{show.first_air_date || 'Release date unknown'}</span>
              <span className="text-gray-300">{show.number_of_seasons || 0} seasons</span>
              <span className="text-gray-300">{show.number_of_episodes || 0} episodes</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres && show.genres.length > 0 ? show.genres.map((genre: any, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm text-white"
                >
                  {typeof genre === 'string' ? genre : genre.name || genre.id || 'Unknown'}
                </span>
              )) : (
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                  No genres available
                </span>
              )}
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              {show.overview || 'No overview available for this TV show.'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
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
          <span>Download All Seasons</span>
        </Button>
      </div>

      {/* Seasons */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">Seasons</h2>
            <SeasonSelector
              selectedSeason={selectedSeason}
              totalSeasons={show.number_of_seasons || 0}
              onSeasonChange={setSelectedSeason}
            />
          </div>
          <div className="flex items-center space-x-4">
            <FilterToggle
              label="Show downloaded episodes only"
              checked={showDownloadedOnly}
              onChange={setShowDownloadedOnly}
              className="flex items-center space-x-2"
            />
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <FunnelIcon className="w-4 h-4" />
              <span>Filter</span>
            </div>
          </div>
        </div>
        <SeasonComponent
          key={selectedSeason}
          tvId={show.id}
          seasonNumber={selectedSeason}
          showName={show.name || 'TV Show'}
          showPosterPath={show.poster_path}
          showDownloadedOnly={showDownloadedOnly}
          isSelected={true}
        />
      </div>
    </div>
  );
};

export default TVShowDetailPage;
