import React from 'react';

const SimpleHomePage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        Welcome to NiluFlix
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">🎬 Movies</h2>
          <p className="text-gray-400">Browse and download the latest movies</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">📺 TV Shows</h2>
          <p className="text-gray-400">Watch your favorite TV series</p>
        </div>
        
        <div className="bg-white/5 rounded-lg p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">📚 Library</h2>
          <p className="text-gray-400">Access your downloaded content</p>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
        <h3 className="text-lg font-semibold text-green-400 mb-2">✅ React App Working!</h3>
        <p className="text-gray-300">The React app is now successfully running inside Electron.</p>
      </div>
    </div>
  );
};

export default SimpleHomePage;
