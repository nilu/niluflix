import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import AppLayout from './components/layout/AppLayout';
import NotificationManager from './components/downloads/NotificationManager';
import { DownloadModalProvider, useDownloadModal } from './contexts/DownloadModalContext';
import DownloadStatusModal from './components/downloads/DownloadStatusModal';
import { useDownloadProgressSSE } from './hooks/useDownloadProgressSSE';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import TVShowsPage from './pages/TVShowsPage';
import MovieDetailPage from './pages/MovieDetailPage';
import TVShowDetailPage from './pages/TVShowDetailPage';
import LibraryPage from './pages/LibraryPage';
import DownloadsPage from './pages/DownloadsPage';
import SearchPage from './pages/SearchPage';

// Create a client with memory optimization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes (reduced from 5)
      cacheTime: 5 * 60 * 1000, // 5 minutes cache time
      retry: 1, // Reduced retries
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
  // Add garbage collection
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query error:', error);
    },
  }),
});

// Component that renders the global download modal
const GlobalDownloadModal: React.FC = () => {
  const { isOpen, downloadData, closeModal } = useDownloadModal();
  
  // Start polling for download progress when modal is open and has a jobId
  useDownloadProgressSSE(downloadData?.jobId || null);

  console.log('🎬 GlobalDownloadModal: Rendering with isOpen:', isOpen, 'downloadData:', downloadData);

  const handleViewDownloads = () => {
    closeModal();
    // Navigate to downloads page
    window.location.hash = '#/downloads';
  };

  if (!downloadData) {
    console.log('🎬 GlobalDownloadModal: No downloadData, returning null');
    return null;
  }

  return (
    <DownloadStatusModal
      isOpen={isOpen}
      movie={downloadData.movie}
      tvShow={downloadData.tvShow}
      episode={downloadData.episode}
      steps={downloadData.steps}
      currentStep={downloadData.currentStep}
      progress={downloadData.progress}
      downloadSpeed={downloadData.downloadSpeed}
      eta={downloadData.eta}
      fileSize={downloadData.fileSize}
      downloadedSize={downloadData.downloadedSize}
      searchCount={downloadData.searchCount}
      message={downloadData.message}
      onClose={closeModal}
      onViewDownloads={handleViewDownloads}
    />
  );
};

const App: React.FC = () => {
  React.useEffect(() => {
    // App initialized
    console.log('NiluFlix App initialized');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DownloadModalProvider>
        <NotificationManager>
          <Router>
            <AppLayout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/movies" element={<MoviesPage />} />
                <Route path="/tv" element={<TVShowsPage />} />
                <Route path="/movie/:id" element={<MovieDetailPage />} />
                <Route path="/tv/:id" element={<TVShowDetailPage />} />
                <Route path="/library" element={<LibraryPage />} />
                <Route path="/downloads" element={<DownloadsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="*" element={
                  <div className="p-6 bg-yellow-500 text-black">
                    <h1 className="text-2xl font-bold">404 - Route Not Found</h1>
                    <p>Current path doesn't match any route</p>
                  </div>
                } />
              </Routes>
              <GlobalDownloadModal />
            </AppLayout>
          </Router>
        </NotificationManager>
      </DownloadModalProvider>
    </QueryClientProvider>
  );
};

export default App;
