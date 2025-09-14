import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/movies', label: 'Movies', icon: '🎬' },
    { path: '/tv', label: 'TV Shows', icon: '📺' },
    { path: '/library', label: 'My Library', icon: '📚' },
    { path: '/downloads', label: 'Downloads', icon: '⬇️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-700 min-h-screen">
      <div className="p-6">
        {/* Logo removed to avoid duplication with header */}

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Quick Stats</h3>
          <div className="space-y-1 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>Movies:</span>
              <span className="text-green-400">0</span>
            </div>
            <div className="flex justify-between">
              <span>TV Shows:</span>
              <span className="text-green-400">0</span>
            </div>
            <div className="flex justify-between">
              <span>Downloads:</span>
              <span className="text-yellow-400">0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
