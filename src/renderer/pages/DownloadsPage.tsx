import React from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import DownloadQueue from '../components/downloads/DownloadQueue';
import { useActiveDownloads, useDownloadHistory, useCancelDownload } from '../hooks/useDownloads';
import Spinner from '../components/ui/Spinner';

const DownloadsPage: React.FC = () => {
  const { data: activeDownloads, isLoading: activeLoading, error: activeError } = useActiveDownloads();
  const { data: downloadHistory, isLoading: historyLoading, error: historyError } = useDownloadHistory();
  const cancelDownload = useCancelDownload();

  const handleCancelDownload = (id: string) => {
    cancelDownload.mutate(id);
  };

  const handlePauseDownload = (id: string) => {
    // TODO: Implement pause functionality
    console.log('Pause download:', id);
  };

  const handleResumeDownload = (id: string) => {
    // TODO: Implement resume functionality
    console.log('Resume download:', id);
  };

  const handleRetryDownload = (id: string) => {
    // TODO: Implement retry functionality
    console.log('Retry download:', id);
  };

  const handleRemoveDownload = (id: string) => {
    // TODO: Implement remove functionality
    console.log('Remove download:', id);
  };

  const handleClearCompleted = () => {
    // TODO: Implement clear completed functionality
    console.log('Clear completed downloads');
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

      {/* Download Queue */}
      <DownloadQueue
        downloads={allDownloads}
        isLoading={activeLoading || historyLoading}
        onPause={handlePauseDownload}
        onResume={handleResumeDownload}
        onCancel={handleCancelDownload}
        onRetry={handleRetryDownload}
        onRemove={handleRemoveDownload}
        onClearCompleted={handleClearCompleted}
        showCompleted={true}
        maxHeight="600px"
      />
    </div>
  );
};

export default DownloadsPage;
