import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useTVShowDetails, useDownloadTVShow } from '../hooks/useTVShows';

const TVShowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tvId = id ? parseInt(id) : 0;
  
  const { data: show, isLoading, error } = useTVShowDetails(tvId);
  const downloadTVShow = useDownloadTVShow();

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
        
        <Button variant="outline" size="lg" className="flex items-center space-x-2">
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span>Download All Seasons</span>
        </Button>
      </div>

      {/* Seasons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Seasons</h2>
        {Array.from({ length: show.number_of_seasons }, (_, i) => i + 1).map((season) => (
          <div key={season} className="bg-white/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Season {season}</h3>
              <Button variant="outline" size="sm">
                Download Season
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((episode) => (
                <div key={episode} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Episode {episode}</span>
                    <span className="text-xs text-gray-400">42 min</span>
                  </div>
                  <h4 className="text-sm text-gray-300 mb-2">
                    Episode Title {episode}
                  </h4>
                  <Button variant="ghost" size="sm" className="w-full">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVShowDetailPage;
