import React from 'react';

const ZeshtoPNGLogo = ({ className = "", size = "large", variant = "default" }) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24", 
    large: "w-32 h-32",
    xlarge: "w-40 h-40"
  };

  const isHeaderVariant = variant === "header";

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Outer Decorative Frame */}
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
      
      {/* Main Logo Background */}
      <div className={`absolute ${isHeaderVariant ? 'inset-0' : 'inset-3'} rounded-full ${isHeaderVariant ? 'bg-white/25 backdrop-blur-sm border-2 border-white/40' : 'bg-white'} shadow-xl`}></div>
      
      {/* Logo Content */}
      <div className={`relative ${isHeaderVariant ? 'inset-1' : 'inset-4'} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 240 240" 
          className={`w-full h-full ${!isHeaderVariant ? 'animate-float' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Circle with Gradient */}
          <defs>
            <radialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={isHeaderVariant ? "#ffffff" : "#f0fdf4"} />
              <stop offset="100%" stopColor={isHeaderVariant ? "#ffffff" : "#dcfce7"} />
            </radialGradient>
            <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isHeaderVariant ? "#ffffff" : "#16a34a"} />
              <stop offset="100%" stopColor={isHeaderVariant ? "#ffffff" : "#15803d"} />
            </linearGradient>
            <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isHeaderVariant ? "#ffffff" : "#92400e"} />
              <stop offset="100%" stopColor={isHeaderVariant ? "#ffffff" : "#78350f"} />
            </linearGradient>
          </defs>
          
          {/* Outer decorative circle */}
          <circle 
            cx="120" 
            cy="120" 
            r="110" 
            fill="none" 
            stroke={isHeaderVariant ? "#ffffff" : "url(#treeGradient)"}
            strokeWidth="3"
            strokeDasharray="5,3"
            className={!isHeaderVariant ? "animate-pulse-slow" : ""}
          />
          
          {/* Inner circle background */}
          <circle 
            cx="120" 
            cy="120" 
            r="95" 
            fill="url(#bgGradient)"
            stroke={isHeaderVariant ? "#ffffff" : "#16a34a"}
            strokeWidth="2"
          />
          
          {/* Tree Trunk */}
          <rect 
            x="115" 
            y="140" 
            width="10" 
            height="50" 
            fill="url(#trunkGradient)"
            rx="5"
            className={!isHeaderVariant ? "animate-sway" : ""}
          />
          
          {/* Main Tree Crown */}
          <circle 
            cx="120" 
            cy="120" 
            r="40" 
            fill={isHeaderVariant ? "#ffffff" : "#22c55e"}
            className={!isHeaderVariant ? "animate-grow" : ""}
          />
          
          {/* Tree Crown Layers */}
          <circle 
            cx="90" 
            cy="105" 
            r="25" 
            fill={isHeaderVariant ? "#ffffff" : "#16a34a"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          <circle 
            cx="150" 
            cy="105" 
            r="25" 
            fill={isHeaderVariant ? "#ffffff" : "#16a34a"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          <circle 
            cx="100" 
            cy="135" 
            r="20" 
            fill={isHeaderVariant ? "#ffffff" : "#15803d"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          <circle 
            cx="140" 
            cy="135" 
            r="20" 
            fill={isHeaderVariant ? "#ffffff" : "#15803d"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          
          {/* Small decorative leaves */}
          <circle cx="75" cy="85" r="10" fill={isHeaderVariant ? "#ffffff" : "#84cc16"} />
          <circle cx="165" cy="85" r="10" fill={isHeaderVariant ? "#ffffff" : "#84cc16"} />
          <circle cx="65" cy="115" r="8" fill={isHeaderVariant ? "#ffffff" : "#65a30d"} />
          <circle cx="175" cy="115" r="8" fill={isHeaderVariant ? "#ffffff" : "#65a30d"} />
          <circle cx="80" cy="150" r="6" fill={isHeaderVariant ? "#ffffff" : "#4d7c0f"} />
          <circle cx="160" cy="150" r="6" fill={isHeaderVariant ? "#ffffff" : "#4d7c0f"} />
          
          {/* Additional decorative elements */}
          <circle cx="120" cy="80" r="12" fill={isHeaderVariant ? "#ffffff" : "#22c55e"} />
          <circle cx="105" cy="95" r="8" fill={isHeaderVariant ? "#ffffff" : "#16a34a"} />
          <circle cx="135" cy="95" r="8" fill={isHeaderVariant ? "#ffffff" : "#16a34a"} />
          
          {/* ZESHTO Text */}
          <text 
            x="120" 
            y="215" 
            textAnchor="middle" 
            className={`font-bold ${isHeaderVariant ? 'fill-white' : 'fill-green-900'} ${!isHeaderVariant ? 'animate-glow' : ''}`}
            fontSize="18"
            fontFamily="Arial, sans-serif"
          >
            ZESHTO
          </text>
          
          {/* Subtitle */}
          <text 
            x="120" 
            y="230" 
            textAnchor="middle" 
            className={`${isHeaderVariant ? 'fill-white' : 'fill-green-700'}`}
            fontSize="8"
            fontFamily="Arial, sans-serif"
          >
            Natural • Ayurvedic
          </text>
        </svg>
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

export default ZeshtoPNGLogo;