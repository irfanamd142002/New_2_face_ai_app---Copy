import React from 'react';

const ZeshtoSimpleLogo = ({ size = 'medium', variant = 'default', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10';
      case 'medium':
        return 'w-14 h-14';
      case 'large':
        return 'w-20 h-20';
      case 'xlarge':
        return 'w-28 h-28';
      default:
        return 'w-14 h-14';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-xl';
      case 'medium':
        return 'text-2xl';
      case 'large':
        return 'text-3xl';
      case 'xlarge':
        return 'text-4xl';
      default:
        return 'text-2xl';
    }
  };

  const getTaglineSize = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'medium':
        return 'text-sm';
      case 'large':
        return 'text-base';
      case 'xlarge':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  const isHeader = variant === 'header';

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Logo Icon */}
      <div className={`${getSizeClasses()} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle
            cx="60"
            cy="60"
            r="58"
            fill="url(#outerGradient)"
            stroke="url(#borderGradient)"
            strokeWidth="2"
          />
          
          {/* Inner Circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="url(#innerGradient)"
            opacity="0.9"
          />
          
          {/* Botanical Elements - Main Leaf */}
          <path
            d="M60 25 C45 30, 42 50, 60 55 C78 50, 75 30, 60 25 Z"
            fill="url(#leafMainGradient)"
            stroke="#1e3a1a"
            strokeWidth="1.5"
          />
          
          {/* Side Leaves */}
          <path
            d="M35 45 C30 48, 32 58, 40 60 C48 58, 46 48, 35 45 Z"
            fill="url(#leafSideGradient)"
            stroke="#1e3a1a"
            strokeWidth="1"
            opacity="0.8"
          />
          <path
            d="M85 45 C90 48, 88 58, 80 60 C72 58, 74 48, 85 45 Z"
            fill="url(#leafSideGradient)"
            stroke="#1e3a1a"
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* Leaf Details */}
          <path
            d="M60 30 L60 50 M52 35 L60 42 M68 35 L60 42 M52 45 L60 48 M68 45 L60 48"
            stroke="#1e3a1a"
            strokeWidth="1.2"
            fill="none"
            opacity="0.7"
          />
          
          {/* Golden Accents */}
          <circle cx="60" cy="40" r="2.5" fill="url(#goldGradient)" />
          <circle cx="45" cy="52" r="1.5" fill="url(#goldGradient)" opacity="0.8" />
          <circle cx="75" cy="52" r="1.5" fill="url(#goldGradient)" opacity="0.8" />
          
          {/* Decorative Dots */}
          <circle cx="40" cy="35" r="1.5" fill="#10b981" opacity="0.6" />
          <circle cx="80" cy="35" r="1.5" fill="#10b981" opacity="0.6" />
          <circle cx="35" cy="75" r="1.2" fill="#fbbf24" opacity="0.7" />
          <circle cx="85" cy="75" r="1.2" fill="#fbbf24" opacity="0.7" />
          
          {/* Bottom Flourish */}
          <path
            d="M45 75 Q60 85 75 75"
            stroke="url(#flourishGradient)"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="outerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdf4" />
              <stop offset="50%" stopColor="#dcfce7" />
              <stop offset="100%" stopColor="#bbf7d0" />
            </linearGradient>
            <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ecfdf5" />
              <stop offset="100%" stopColor="#d1fae5" />
            </linearGradient>
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="leafMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="leafSideGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="flourishGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Glow Effect for non-header variants */}
        {!isHeader && (
          <div className="absolute inset-0 rounded-full bg-emerald-300 opacity-25 blur-lg animate-pulse"></div>
        )}
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className={`font-bold ${getTextSize()} ${isHeader 
          ? 'text-white drop-shadow-lg' 
          : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 bg-clip-text text-transparent'
        } tracking-wide`}>
          ZESHTO
        </div>
        <div className={`h-1 ${isHeader 
          ? 'bg-gradient-to-r from-white/80 via-emerald-100 to-white/80' 
          : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600'
        } rounded-full shadow-sm`}></div>
        <div className={`${getTaglineSize()} ${isHeader 
          ? 'text-emerald-50 font-bold' 
          : 'text-emerald-600 font-semibold'
        } mt-1 tracking-wider ${isHeader ? 'drop-shadow-md' : ''}`}>
          NATURAL SKINCARE
        </div>
        {!isHeader && (
          <div className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-emerald-500 font-medium italic mt-0.5`}>
            Ayurvedic Heritage
          </div>
        )}
      </div>
    </div>
  );
};

export default ZeshtoSimpleLogo;