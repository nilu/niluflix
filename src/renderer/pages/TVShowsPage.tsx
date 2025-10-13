import React, { useState, useEffect } from 'react';
import ContentRow from '../components/content/ContentRow';
import Spinner from '../components/ui/Spinner';
import { ApiHealthChecker } from '../utils/apiHealth';

const TVShowsPage: React.FC = () => {
  const [isApiReady, setIsApiReady] = useState(false);
  const [isCheckingApi, setIsCheckingApi] = useState(true);

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        setIsCheckingApi(true);
        const isHealthy = await ApiHealthChecker.waitForApi(10000); // 10 second timeout
        setIsApiReady(isHealthy);
      } catch (error) {
        console.error('API health check failed:', error);
        setIsApiReady(false);
      } finally {
        setIsCheckingApi(false);
      }
    };

    checkApiHealth();
  }, []);

  if (isCheckingApi) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-white mt-4">Connecting to API server...</p>
        </div>
      </div>
    );
  }

  if (!isApiReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">API Server Unavailable</h1>
          <p className="text-gray-400 mb-4">Unable to connect to the backend server.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">TV Shows</h1>
          <p className="text-gray-400">Discover the latest and greatest TV shows</p>
        </div>

        {/* Content Rows - TV Shows Only */}
        <div className="space-y-8 py-8">
          {/* Trending TV Shows */}
          <ContentRow
            title="Trending TV Shows"
            type="tv"
            category="trending"
          />

          {/* Popular TV Shows */}
          <ContentRow
            title="Popular TV Shows"
            type="tv"
            category="popular"
          />

          {/* Downloaded TV Shows */}
          <ContentRow
            title="My Downloaded TV Shows"
            type="tv"
            category="downloaded"
            navigationState={{ fromLibrary: true }}
          />
        </div>
      </div>
    </div>
  );
};

export default TVShowsPage;
