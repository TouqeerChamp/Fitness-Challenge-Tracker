import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, BarChart3, Trophy, LogOut, Home } from 'lucide-react';

interface NavbarProps {
  onLogout?: () => void;
  showLogout?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLogout, showLogout = true }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Fitness Tracker
              </h1>
              <p className="text-xs text-gray-400 -mt-0.5">Achieve More</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navLinks.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive(path)
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{label}</span>
                {isActive(path) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30" />
                )}
              </Link>
            ))}

            {/* Logout Button */}
            {showLogout && onLogout && (
              <button
                onClick={onLogout}
                className="ml-2 flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-red-500/20 hover:border-red-500/40"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
