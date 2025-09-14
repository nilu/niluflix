import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { useMovieDetails, useDownloadMovie } from '../hooks/useMovies';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = id ? parseInt(id) : 0;
  
  const { data: movie, isLoading, error } = useMovieDetails(movieId);
  const downloadMovie = useDownloadMovie();

  const handleDownload = () => {
    if (movie) {
      downloadMovie.mutate({ id: movie.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg mb-2">Failed to load movie details</p>
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
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="relative z-10 h-full flex items-end p-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white mb-4">{movie.title}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-green-400 font-semibold">
                {movie.vote_average}/10
              </span>
              <span className="text-gray-300">{movie.release_date}</span>
              <span className="text-gray-300">{movie.runtime} min</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre: string) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm text-white"
                >
                  {genre}
                </span>
              ))}
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">{movie.overview}</p>
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
          <span>
            {movie.download_status === 'downloaded' ? 'Downloaded' : 'Download'}
          </span>
        </Button>
      </div>

      {/* Download Status */}
      {movie.download_status === 'downloading' && (
        <div className="bg-white/5 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Download Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Downloading...</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '45%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;
