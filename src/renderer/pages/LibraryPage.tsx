import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ContentRow from '../components/content/ContentRow';
import { useLibrarySync } from '../hooks/useLibrarySync';

const LibraryPage: React.FC = () => {
  const { syncLibrary, syncStatus } = useLibrarySync();

  // Auto-sync when library page is opened
  useEffect(() => {
    console.log('📚 Library page opened - triggering sync...');
    console.log('📚 Current sync status:', syncStatus);
    syncLibrary(false); // Don't force, just sync normally
  }, [syncLibrary]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-4">My Library</h1>
        <p className="text-gray-400 text-lg">
          Your personal collection of downloaded movies and TV shows
        </p>
        
        {/* Sync Status */}
        {syncStatus.isRunning && (
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-blue-300 text-sm">Syncing library...</span>
            </div>
          </div>
        )}
        
        {syncStatus.error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <span className="text-red-300 text-sm">Sync error: {syncStatus.error}</span>
          </div>
        )}
        
        {syncStatus.lastSync && !syncStatus.isRunning && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-between">
            <span className="text-green-300 text-sm">
              Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => syncLibrary(false)}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
              >
                Sync Again
              </button>
              <button
                onClick={() => syncLibrary(true)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
              >
                Force Sync
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content Rows */}
      <div className="space-y-12">
        <ContentRow
          title="Downloaded Movies"
          type="movie"
          category="downloaded"
        />
        
        <ContentRow
          title="Downloaded TV Shows"
          type="tv"
          category="downloaded"
          navigationState={{ fromLibrary: true }}
        />
      </div>
    </div>
  );
};

export default LibraryPage;
