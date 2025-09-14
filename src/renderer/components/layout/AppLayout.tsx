import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchClick = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus the input when opening
      setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) input.focus();
      }, 100);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="bg-black/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-2xl font-bold text-white">NILUFLIX</span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Movies</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">TV Shows</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">My Library</a>
          </nav>
          
          {/* Search and User */}
          <div className="flex items-center space-x-4">
            {/* Search Input */}
            {isSearchOpen && (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  id="search-input"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search movies, TV shows..."
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 w-64"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            )}
            
            {/* Search Button */}
            <button 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={handleSearchClick}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Sidebar = () => (
  <div className="flex flex-col w-64 bg-black/20 backdrop-blur-sm border-r border-white/10">
    <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 mb-8">
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <span className="ml-2 text-xl font-bold text-white">NILUFLIX</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-colors">
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </a>
        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-colors">
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v22a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zM7 4H5a1 1 0 00-1 1v14a1 1 0 001 1h2M7 4v16" />
          </svg>
          Movies
        </a>
        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-colors">
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          TV Shows
        </a>
        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-colors">
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          My Library
        </a>
        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-colors">
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Downloads
        </a>
      </nav>
      
      {/* Settings */}
      <div className="flex-shrink-0 px-2 py-4 border-t border-white/10">
        <a href="#" className="group flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-white/10 hover:text-white transition-colors">
          <svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </a>
      </div>
    </div>
  </div>
);

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-4">{children}</div>
      </div>
    </div>
  );
};

export default AppLayout;
