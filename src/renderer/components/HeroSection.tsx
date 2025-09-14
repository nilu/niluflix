import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="px-8 max-w-2xl">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to NiluFlix
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Your personal streaming platform with unlimited movies and TV shows. 
            Discover, download, and enjoy your favorite content.
          </p>
          <div className="flex space-x-4">
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Get Started</span>
            </button>
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Learn More</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 right-4 text-white opacity-20">
        <div className="text-6xl">🎬</div>
      </div>
      <div className="absolute bottom-4 left-4 text-white opacity-20">
        <div className="text-4xl">📺</div>
      </div>
    </div>
  );
};

export default HeroSection;
