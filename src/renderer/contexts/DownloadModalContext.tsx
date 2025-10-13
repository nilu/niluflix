import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface DownloadStatusStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export interface DownloadStatusData {
  jobId: string;
  movie?: {
    id: number;
    title: string;
    poster_path: string;
    release_date?: string;
  };
  tvShow?: {
    id: number;
    name: string;
    poster_path: string;
    first_air_date?: string;
  };
  episode?: {
    tvId: number;
    seasonNumber: number;
    episodeNumber: number;
    showName: string;
  };
  steps: DownloadStatusStep[];
  currentStep: string;
  progress: number;
  downloadSpeed?: number;
  eta?: number;
  fileSize?: number;
  downloadedSize?: number;
  searchCount?: number; // Number of torrents found so far
  torrentInfo?: {
    title: string;
    seeders: number;
    quality: string;
    size: string;
    provider: string;
  };
  alternativeTorrents?: Array<{
    title: string;
    seeders: number;
    quality: string;
    size: string;
    provider: string;
  }>;
}

interface DownloadModalContextType {
  isOpen: boolean;
  downloadData: DownloadStatusData | null;
  openModal: (data: DownloadStatusData) => void;
  closeModal: () => void;
  updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'error', description?: string) => void;
  updateProgress: (progress: number, downloadSpeed?: number, eta?: number, downloadedSize?: number, fileSize?: number) => void;
  updateSearchCount: (count: number) => void;
  updateCurrentStep: (stepId: string) => void;
  updateStepDescription: (stepId: string, description: string) => void;
}

const DownloadModalContext = createContext<DownloadModalContextType | undefined>(undefined);

export const useDownloadModal = () => {
  const context = useContext(DownloadModalContext);
  if (!context) {
    throw new Error('useDownloadModal must be used within a DownloadModalProvider');
  }
  return context;
};

interface DownloadModalProviderProps {
  children: ReactNode;
}

export const DownloadModalProvider: React.FC<DownloadModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadData, setDownloadData] = useState<DownloadStatusData | null>(null);

  const openModal = useCallback((data: DownloadStatusData) => {
    console.log('🎬 DownloadModalContext: openModal called with data:', data);
    setDownloadData(data);
    setIsOpen(true);
    console.log('🎬 DownloadModalContext: Modal state updated - isOpen: true');
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setDownloadData(null);
  }, []);

  const updateStep = useCallback((stepId: string, status: 'pending' | 'active' | 'completed' | 'error', description?: string) => {
    setDownloadData(prevData => {
      if (!prevData) return null;

      const newSteps = prevData.steps.map(step =>
        step.id === stepId ? { ...step, status, description: description || step.description } : step
      );

      return {
        ...prevData,
        steps: newSteps,
        currentStep: status === 'active' ? stepId : prevData.currentStep
      };
    });
  }, []);

  const updateProgress = useCallback((newProgress: number, newDownloadSpeed?: number, newEta?: number, newDownloadedSize?: number, newFileSize?: number) => {
    setDownloadData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        progress: newProgress,
        downloadSpeed: newDownloadSpeed,
        eta: newEta,
        downloadedSize: newDownloadedSize,
        fileSize: newFileSize
      };
    });
  }, []);

  const updateSearchCount = useCallback((count: number) => {
    setDownloadData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        searchCount: count
      };
    });
  }, []);

  const updateCurrentStep = useCallback((stepId: string) => {
    setDownloadData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        currentStep: stepId
      };
    });
  }, []);

  const updateStepDescription = useCallback((stepId: string, description: string) => {
    setDownloadData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        steps: prevData.steps.map(step =>
          step.id === stepId ? { ...step, description } : step
        )
      };
    });
  }, []);

  return (
    <DownloadModalContext.Provider value={{
      isOpen,
      downloadData,
      openModal,
      closeModal,
      updateStep,
      updateProgress,
      updateSearchCount,
      updateCurrentStep,
      updateStepDescription
    }}>
      {children}
    </DownloadModalContext.Provider>
  );
};
