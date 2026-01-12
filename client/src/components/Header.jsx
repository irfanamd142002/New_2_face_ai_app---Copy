import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Star, Sparkles, User, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ currentPage = 'manual' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // Determine current page from prop first, then URL as fallback
  const getCurrentPage = () => {
    // Always use the currentPage prop if provided
    if (currentPage) {
      return currentPage;
    }
    
    // Fallback to URL-based detection if no prop provided
    if (location.pathname.includes('ai-analysis')) return 'ai';
    if (location.pathname.includes('review')) return 'review';
    if (location.pathname.includes('manual-analysis')) return 'manual';
    
    // Default to manual if no specific page detected
    return 'manual';
  };

  const activePage = getCurrentPage();

  const navItems = [
    {
      id: 'manual',
      label: 'Manual Analysis',
      icon: User,
      description: 'Personalized skin analysis',
      active: activePage === 'manual',
      path: '/manual-analysis'
    },
    {
      id: 'ai',
      label: 'AI Analysis',
      icon: Brain,
      description: 'AI-powered skin detection',
      active: activePage === 'ai',
      path: '/ai-analysis'
    },
    {
      id: 'review',
      label: 'Review',
      icon: Star,
      description: user ? 'Your analysis history' : 'Login to view history',
      active: activePage === 'review',
      path: user ? '/dashboard' : '/login',
      requiresAuth: true
    }
  ];

  const handleNavigation = (item) => {
    if (!item.path) {
      return;
    }
    
    // Special handling for Review card
    if (item.id === 'review') {
      if (user && token) {
        // User is logged in, navigate to dashboard and scroll to analysis history
        navigate('/dashboard');
        // Use setTimeout to ensure navigation completes before scrolling
        setTimeout(() => {
          const element = document.getElementById('analysis-history');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else {
        // User is not logged in, navigate to login page
        navigate('/login');
      }
      return;
    }
    
    // Handle manual and AI analysis navigation
    navigate(item.path);
  };

  return (
    <header className="bg-gradient-to-r from-black via-gray-900 to-black shadow-2xl relative overflow-hidden">
      {/* Shining overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-300/10 to-transparent animate-ping"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Brand Section */}
        <div className="flex items-center justify-center py-8 border-b border-yellow-400/30">
          <div className="text-center">
            <h1 className="text-6xl font-extrabold tracking-tight drop-shadow-2xl relative">
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent animate-pulse font-bold">
                Zeshto
              </span>
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent animate-pulse font-bold ml-2">
                Skin
              </span>
              <span className="bg-gradient-to-r from-green-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent animate-pulse font-bold ml-2">
                Care
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-blue-200 to-green-200 bg-clip-text text-transparent animate-ping opacity-50"></div>
            </h1>
            <div className="mt-3 flex items-center justify-center space-x-2">
              <div className="h-1 w-8 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              <p className="text-2xl font-bold tracking-wide bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                Natural • Ayurvedic • Effective
              </p>
              <div className="h-1 w-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
            </div>
            <div className="mt-2 flex justify-center space-x-1">
              <Sparkles className="h-6 w-6 text-pink-300 animate-bounce drop-shadow-lg shadow-pink-300/50" />
              <Sparkles className="h-4 w-4 text-blue-300 animate-pulse drop-shadow-lg shadow-blue-300/50" />
              <Sparkles className="h-5 w-5 text-green-300 animate-bounce drop-shadow-lg shadow-green-300/50" style={{animationDelay: '0.5s'}} />
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="py-6">
          <div className="flex justify-center space-x-3 sm:space-x-4">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigation(item);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                  className={`
                    relative group flex flex-col items-center px-6 py-5 rounded-2xl transition-all duration-500 ease-in-out transform min-w-[140px] sm:min-w-[160px]
                    bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white border-2 border-yellow-400/30 shadow-xl shadow-black/50
                    hover:scale-105 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20 cursor-pointer
                    ${item.active 
                      ? 'ring-2 ring-yellow-400 ring-opacity-50 border-yellow-400 shadow-yellow-400/30' 
                      : ''
                    }
                    ${item.id === 'review' && !user ? 'border-blue-400/50 hover:border-blue-400' : ''}
                  `}
                  type="button"
                >
                  {/* Animated background glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-yellow-400/10 to-yellow-400/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col items-center space-y-3 transition-all duration-300">
                    <div className={`p-3 rounded-full transition-all duration-300 group-hover:scale-110 ${item.active ? 'bg-yellow-400/30 shadow-lg shadow-yellow-400/50' : 'bg-yellow-400/15 group-hover:bg-yellow-400/25'}`}>
                      <IconComponent className={`h-7 w-7 transition-all duration-300 ${item.active ? 'text-yellow-400 drop-shadow-lg' : 'text-yellow-300 group-hover:text-yellow-400'}`} />
                    </div>
                    <span className={`font-bold text-lg transition-all duration-300 ${item.active ? 'text-yellow-100 drop-shadow-sm' : 'text-white group-hover:text-yellow-100'}`}>
                      {item.label}
                    </span>
                    <span className={`text-sm font-medium text-center leading-tight transition-all duration-300 ${item.active ? 'text-yellow-200' : 'text-gray-300 group-hover:text-yellow-200'}`}>
                      {item.description}
                    </span>
                  </div>
                  
                  {/* Login Required Badge */}
                  {item.id === 'review' && !user && (
                    <span className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg shadow-blue-400/50 animate-pulse transition-all duration-300">
                      Login
                    </span>
                  )}
                  
                  {/* Active State Indicator */}
                  {item.active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-ping pointer-events-none"></div>
                  )}
                  
                  {/* Pulse effect for active button */}
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent rounded-2xl animate-pulse pointer-events-none"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;