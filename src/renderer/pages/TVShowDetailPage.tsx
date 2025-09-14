import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import DownloadButton from '../components/downloads/DownloadButton';
import SeasonEpisodeSelector from '../components/downloads/SeasonEpisodeSelector';
import { useTVShowDetails, useDownloadTVShow, useDownloadEpisode } from '../hooks/useTVShows';

const TVShowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tvId = id ? parseInt(id) : 0;
  
  const { data: show, isLoading, error } = useTVShowDetails(tvId);
  const downloadTVShow = useDownloadTVShow();
  const downloadEpisode = useDownloadEpisode();
  
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<{ [seasonNumber: number]: number[] }>({});

  const handleDownloadAll = () => {
    if (show) {
      downloadTVShow.mutate({ id: show.id, seasons: selectedSeasons });
    }
  };

  const handleSeasonToggle = (seasonNumber: number) => {
    setSelectedSeasons(prev => 
      prev.includes(seasonNumber) 
        ? prev.filter(s => s !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  const handleEpisodeToggle = (seasonNumber: number, episodeNumber: number) => {
    setSelectedEpisodes(prev => {
      const seasonEpisodes = prev[seasonNumber] || [];
      const isSelected = seasonEpisodes.includes(episodeNumber);
      
      return {
        ...prev,
        [seasonNumber]: isSelected
          ? seasonEpisodes.filter(ep => ep !== episodeNumber)
          : [...seasonEpisodes, episodeNumber]
      };
    });
  };

  const handleDownloadSeason = (seasonNumber: number) => {
    if (show) {
      downloadTVShow.mutate({ id: show.id, seasons: [seasonNumber] });
    }
  };

  const handleDownloadEpisode = (seasonNumber: number, episodeNumber: number) => {
    if (show) {
      downloadEpisode.mutate({ 
        tvId: show.id, 
        seasonNumber, 
        episodeNumber 
      });
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
      {/* Hero Section */}
      <div className="relative h-96 rounded-lg overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${show.backdrop_path})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="relative z-10 h-full flex items-end p-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">{show.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-green-400 font-semibold">
                {show.vote_average}/10
              </span>
              <span className="text-gray-300">{show.first_air_date}</span>
              <span className="text-gray-300">{show.number_of_seasons} seasons</span>
              <span className="text-gray-300">{show.number_of_episodes} episodes</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm text-white"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">{show.overview}</p>
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
        
        <DownloadButton
          contentId={show.id}
          contentType="tv_show"
          title={show.name}
          downloadStatus={show.download_status}
          onDownload={handleDownloadAll}
          size="lg"
          variant="outline"
        />
      </div>

      {/* Season & Episode Selector */}
      <SeasonEpisodeSelector
        seasons={show.seasons || []}
        selectedSeasons={selectedSeasons}
        selectedEpisodes={selectedEpisodes}
        onSeasonToggle={handleSeasonToggle}
        onEpisodeToggle={handleEpisodeToggle}
        onDownloadSeason={handleDownloadSeason}
        onDownloadEpisode={handleDownloadEpisode}
        onDownloadAll={handleDownloadAll}
      />
    </div>
  );
};

export default TVShowDetailPage;
