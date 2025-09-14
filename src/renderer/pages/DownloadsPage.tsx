import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';

const DownloadsPage: React.FC = () => {
  // Mock data - TODO: Replace with real data from API
  const downloads = [
    {
      id: 1,
      title: 'The Dark Knight',
      type: 'movie',
      status: 'downloading',
      progress: 65,
      speed: '2.5 MB/s',
      eta: '15 min',
      size: '4.2 GB',
      poster: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    },
    {
      id: 2,
      title: 'Breaking Bad S01E01',
      type: 'episode',
      status: 'completed',
      progress: 100,
      speed: '0 MB/s',
      eta: '0 min',
      size: '1.8 GB',
      poster: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    },
    {
      id: 3,
      title: 'Inception',
      type: 'movie',
      status: 'failed',
      progress: 0,
      speed: '0 MB/s',
      eta: '0 min',
      size: '3.7 GB',
      poster: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    },
    {
      id: 4,
      title: 'Stranger Things S04E01',
      type: 'episode',
      status: 'queued',
      progress: 0,
      speed: '0 MB/s',
      eta: '0 min',
      size: '2.1 GB',
      poster: '/49WJfeN0moxb9IPfGn9AIqMGskD.jpg',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'downloading':
        return <ArrowDownTrayIcon className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'queued':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'downloading':
        return 'text-blue-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'queued':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">Downloads</h1>
        <p className="text-gray-400 text-lg">
          Manage your active and completed downloads
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {downloads.filter(d => d.status === 'downloading').length}
          </div>
          <div className="text-gray-400">Active Downloads</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {downloads.filter(d => d.status === 'completed').length}
          </div>
          <div className="text-gray-400">Completed</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {downloads.filter(d => d.status === 'queued').length}
          </div>
          <div className="text-gray-400">Queued</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {downloads.filter(d => d.status === 'failed').length}
          </div>
          <div className="text-gray-400">Failed</div>
        </Card>
      </div>

      {/* Download List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Download Queue</h2>
        
        {downloads.map((download) => (
          <Card key={download.id} className="p-6">
            <div className="flex items-center space-x-4">
              {/* Poster */}
              <div className="w-16 h-24 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={`https://image.tmdb.org/t/p/w200${download.poster}`}
                  alt={download.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(download.status)}
                  <h3 className="text-lg font-semibold text-white truncate">
                    {download.title}
                  </h3>
                  <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                    {download.type}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                  <span>{download.size}</span>
                  {download.status === 'downloading' && (
                    <>
                      <span>{download.speed}</span>
                      <span>{download.eta} remaining</span>
                    </>
                  )}
                </div>
                
                {/* Progress Bar */}
                {download.status === 'downloading' && (
                  <ProgressBar
                    progress={download.progress}
                    className="mb-3"
                  />
                )}
                
                {/* Status */}
                <div className={`text-sm font-medium ${getStatusColor(download.status)}`}>
                  {download.status.charAt(0).toUpperCase() + download.status.slice(1)}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-2">
                {download.status === 'downloading' && (
                  <Button variant="outline" size="sm">
                    Pause
                  </Button>
                )}
                {download.status === 'queued' && (
                  <Button variant="outline" size="sm">
                    Start
                  </Button>
                )}
                {download.status === 'failed' && (
                  <Button variant="outline" size="sm">
                    Retry
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DownloadsPage;
