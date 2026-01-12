import React from 'react';

const ZeshtoImageLogo = ({ className = "", size = "large", variant = "default" }) => {
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
          src="/assets/images/zeshto-logo.svg" 
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

export default ZeshtoImageLogo;