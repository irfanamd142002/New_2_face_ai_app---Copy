import React from 'react';

const ZeshtoLogo = ({ className = "", size = "large", variant = "default" }) => {
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-20 h-20", 
    large: "w-28 h-28",
    xlarge: "w-36 h-36"
  };

  const isHeaderVariant = variant === "header";

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Animated Frame - Only for non-header variants */}
      {!isHeaderVariant && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 animate-spin-slow opacity-75"></div>
          <div className="absolute inset-1 rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-400 animate-spin-reverse opacity-60"></div>
        </>
      )}
      
      {/* Logo Background */}
      <div className={`absolute ${isHeaderVariant ? 'inset-0' : 'inset-2'} rounded-full ${isHeaderVariant ? 'bg-white/20 backdrop-blur-sm' : 'bg-white'} shadow-lg`}></div>
      
      {/* Logo Container */}
      <div className={`relative ${isHeaderVariant ? 'inset-1' : 'inset-3'} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 200 200" 
          className={`w-full h-full ${!isHeaderVariant ? 'animate-float' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Circle */}
          <circle 
            cx="100" 
            cy="100" 
            r="90" 
            fill="none" 
            stroke={isHeaderVariant ? "#ffffff" : "#16a34a"}
            strokeWidth="4"
            className={!isHeaderVariant ? "animate-pulse-slow" : ""}
          />
          
          {/* Tree Trunk */}
          <rect 
            x="95" 
            y="120" 
            width="10" 
            height="40" 
            fill={isHeaderVariant ? "#ffffff" : "#92400e"}
            rx="5"
            className={!isHeaderVariant ? "animate-sway" : ""}
          />
          
          {/* Tree Crown - Main Circle */}
          <circle 
            cx="100" 
            cy="100" 
            r="35" 
            fill={isHeaderVariant ? "#ffffff" : "#22c55e"}
            className={!isHeaderVariant ? "animate-grow" : ""}
          />
          
          {/* Tree Crown - Side Circles */}
          <circle 
            cx="75" 
            cy="90" 
            r="20" 
            fill={isHeaderVariant ? "#ffffff" : "#16a34a"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          <circle 
            cx="125" 
            cy="90" 
            r="20" 
            fill={isHeaderVariant ? "#ffffff" : "#16a34a"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          <circle 
            cx="85" 
            cy="115" 
            r="15" 
            fill={isHeaderVariant ? "#ffffff" : "#15803d"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          <circle 
            cx="115" 
            cy="115" 
            r="15" 
            fill={isHeaderVariant ? "#ffffff" : "#15803d"}
            className={!isHeaderVariant ? "animate-flutter" : ""}
          />
          
          {/* Small decorative leaves */}
          <circle cx="70" cy="75" r="8" fill={isHeaderVariant ? "#ffffff" : "#84cc16"} />
          <circle cx="130" cy="75" r="8" fill={isHeaderVariant ? "#ffffff" : "#84cc16"} />
          <circle cx="60" cy="100" r="6" fill={isHeaderVariant ? "#ffffff" : "#65a30d"} />
          <circle cx="140" cy="100" r="6" fill={isHeaderVariant ? "#ffffff" : "#65a30d"} />
          
          {/* ZESHTO Text */}
          <text 
            x="100" 
            y="185" 
            textAnchor="middle" 
            className={`text-xs font-bold ${isHeaderVariant ? 'fill-white' : 'fill-green-800'} ${!isHeaderVariant ? 'animate-glow' : ''}`}
            fontSize="14"
          >
            ZESHTO
          </text>
        </svg>
      </div>
      
      {/* Floating particles - Only for non-header variants */}
      {!isHeaderVariant && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 w-1 h-1 bg-green-400 rounded-full animate-float-1"></div>
          <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-float-2"></div>
          <div className="absolute bottom-6 left-2 w-1 h-1 bg-teal-400 rounded-full animate-float-3"></div>
          <div className="absolute bottom-2 right-4 w-1.5 h-1.5 bg-green-500 rounded-full animate-float-1"></div>
        </div>
      )}
    </div>
  );
};

export default ZeshtoLogo;