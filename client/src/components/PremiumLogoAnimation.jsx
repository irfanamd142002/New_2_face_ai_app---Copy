import React, { useState, useEffect } from 'react';

const PremiumLogoAnimation = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Gentle fade-in animation on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`
        ${className}
        transition-all duration-1000 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{
        animation: isVisible ? 'gentleFloat 6s ease-in-out infinite' : 'none'
      }}
    >
      {children}
      
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1);
          }
          50% { 
            transform: translateY(-2px) scale(1.01);
          }
        }
        
        @keyframes subtleGlow {
          0%, 100% { 
            filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.1));
          }
          50% { 
            filter: drop-shadow(0 6px 12px rgba(16, 185, 129, 0.15));
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumLogoAnimation;