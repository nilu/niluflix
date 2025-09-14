import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownTrayIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { useActiveDownloads, useDownloadHistory, useCancelDownload } from '../hooks/useDownloads';
import Spinner from '../components/ui/Spinner';

const DownloadsPage: React.FC = () => {
  const { data: activeDownloads, isLoading: activeLoading, error: activeError } = useActiveDownloads();
  const { data: downloadHistory, isLoading: historyLoading, error: historyError } = useDownloadHistory();
  const cancelDownload = useCancelDownload();

  const handleCancelDownload = (id: string) => {
    cancelDownload.mutate(id);
  };

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

  // Show loading state
  if (activeLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error state
  if (activeError || historyError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 text-lg mb-2">Failed to load downloads</p>
        <p className="text-gray-400">Please try again later</p>
      </div>
    );
  }

  const activeDownloadsList = activeDownloads || [];
  const historyList = downloadHistory || [];
  const allDownloads = [...activeDownloadsList, ...historyList];

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
            {activeDownloadsList.filter(d => d.status === 'downloading').length}
          </div>
          <div className="text-gray-400">Active Downloads</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {historyList.filter(d => d.status === 'completed').length}
          </div>
          <div className="text-gray-400">Completed</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {activeDownloadsList.filter(d => d.status === 'queued').length}
          </div>
          <div className="text-gray-400">Queued</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {allDownloads.filter(d => d.status === 'failed').length}
          </div>
          <div className="text-gray-400">Failed</div>
        </Card>
      </div>

      {/* Active Downloads */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Active Downloads</h2>
        {activeDownloadsList.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-400 text-lg">No active downloads</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeDownloadsList.map((download) => (
              <motion.div
                key={download.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Poster */}
                    <div className="w-16 h-24 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {download.poster && (
                        <img
                          src={download.poster}
                          alt={download.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {download.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(download.status)}
                          <span className={`text-sm font-medium ${getStatusColor(download.status)}`}>
                            {download.status.charAt(0).toUpperCase() + download.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        <span className="capitalize">{download.type}</span>
                        {download.size && <span>{download.size}</span>}
                        {download.speed && <span>{download.speed}</span>}
                        {download.eta && <span>{download.eta}</span>}
                      </div>
                      
                      {/* Progress Bar */}
                      {download.status === 'downloading' && (
                        <div className="space-y-2">
                          <ProgressBar
                            value={download.progress || 0}
                            max={100}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{download.progress || 0}%</span>
                            <span>{download.eta || 'Calculating...'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      {download.status === 'downloading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelDownload(download.id)}
                        >
                          Pause
                        </Button>
                      )}
                      {download.status === 'queued' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelDownload(download.id)}
                        >
                          Cancel
                        </Button>
                      )}
                      {download.status === 'failed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelDownload(download.id)}
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Download History */}
      {historyList.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Download History</h2>
          <div className="grid gap-4">
            {historyList.map((download) => (
              <motion.div
                key={download.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Poster */}
                    <div className="w-12 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {download.poster && (
                        <img
                          src={download.poster}
                          alt={download.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white truncate">
                          {download.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(download.status)}
                          <span className={`text-xs font-medium ${getStatusColor(download.status)}`}>
                            {download.status.charAt(0).toUpperCase() + download.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                        <span className="capitalize">{download.type}</span>
                        {download.size && <span>{download.size}</span>}
                        {download.completedAt && (
                          <span>Completed {new Date(download.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadsPage;
