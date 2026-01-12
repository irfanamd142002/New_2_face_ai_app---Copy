import React from 'react';

const ZeshtoPNGImage = ({ className = "", size = "large", variant = "default" }) => {
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20", 
    large: "w-28 h-28",
    xlarge: "w-36 h-36"
  };

  const isHeaderVariant = variant === "header";

  // Simple PNG-style logo as SVG data URL (green circle with tree design)
  const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#f0fdf4" />
          <stop offset="100%" stop-color="#dcfce7" />
        </radialGradient>
        <linearGradient id="tree" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#16a34a" />
          <stop offset="100%" stop-color="#15803d" />
        </linearGradient>
      </defs>
      
      <circle cx="100" cy="100" r="95" fill="url(#bg)" stroke="#16a34a" stroke-width="3"/>
      
      <rect x="95" y="120" width="10" height="40" fill="#92400e" rx="5"/>
      
      <circle cx="100" cy="100" r="35" fill="#22c55e"/>
      <circle cx="80" cy="85" r="20" fill="#16a34a"/>
      <circle cx="120" cy="85" r="20" fill="#16a34a"/>
      <circle cx="85" cy="115" r="18" fill="#15803d"/>
      <circle cx="115" cy="115" r="18" fill="#15803d"/>
      
      <circle cx="65" cy="70" r="8" fill="#84cc16"/>
      <circle cx="135" cy="70" r="8" fill="#84cc16"/>
      <circle cx="60" cy="95" r="6" fill="#65a30d"/>
      <circle cx="140" cy="95" r="6" fill="#65a30d"/>
      
      <text x="100" y="175" text-anchor="middle" fill="#15803d" font-size="16" font-weight="bold" font-family="Arial">ZESHTO</text>
      <text x="100" y="190" text-anchor="middle" fill="#16a34a" font-size="8" font-family="Arial">Natural Ayurvedic</text>
    </svg>`;
  
  const logoDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgContent);

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Animated Frame - Only for non-header variants */}
      {!isHeaderVariant && (
        <>
          {/* Rotating outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 animate-spin-slow opacity-80 shadow-lg"></div>
          {/* Counter-rotating inner ring */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-l from-teal-400 via-emerald-500 to-green-400 animate-spin-reverse opacity-70 shadow-md"></div>
          {/* Static decorative ring */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-300 to-emerald-600 opacity-60 shadow-sm"></div>
        </>
      )}
      
      {/* Logo Container */}
      <div className={`absolute ${isHeaderVariant ? 'inset-0' : 'inset-3'} rounded-full ${isHeaderVariant ? 'bg-white/20 backdrop-blur-sm border-2 border-white/40' : 'bg-white'} shadow-xl flex items-center justify-center overflow-hidden`}>
        {/* Logo Image */}
        <img 
          src={logoDataUrl}
          alt="Zeshto Logo" 
          className={`w-full h-full object-contain ${!isHeaderVariant ? 'animate-float p-1' : 'p-0.5'} ${isHeaderVariant ? 'filter brightness-0 invert' : ''}`}
        />
      </div>
      
      {/* Floating particles and sparkles - Only for non-header variants */}
      {!isHeaderVariant && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-3 left-6 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-float-1 shadow-sm"></div>
          <div className="absolute top-10 right-8 w-2 h-2 bg-green-400 rounded-full animate-float-2 shadow-sm"></div>
          <div className="absolute bottom-8 left-4 w-1 h-1 bg-teal-400 rounded-full animate-float-3 shadow-sm"></div>
          <div className="absolute bottom-4 right-6 w-1.5 h-1.5 bg-lime-400 rounded-full animate-float-1 shadow-sm"></div>
          <div className="absolute top-1/2 left-2 w-1 h-1 bg-green-500 rounded-full animate-float-2 shadow-sm"></div>
          <div className="absolute top-1/2 right-2 w-1 h-1 bg-emerald-500 rounded-full animate-float-3 shadow-sm"></div>
        </div>
      )}
      
      {/* Corner decorative elements for non-header variants */}
      {!isHeaderVariant && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-2 h-2 bg-gradient-to-bl from-emerald-400 to-teal-500 rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-gradient-to-tr from-teal-400 to-green-500 rounded-full opacity-70 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-tl from-lime-400 to-emerald-500 rounded-full opacity-70 animate-pulse"></div>
        </>
      )}
    </div>
  );
};

export default ZeshtoPNGImage;