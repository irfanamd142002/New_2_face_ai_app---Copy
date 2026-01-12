import React from 'react'

const LoadingSpinner = ({ size = 'md', color = 'primary', text = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'border-primary-600',
    secondary: 'border-secondary-600',
    white: 'border-white',
    gray: 'border-gray-600'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        <div 
          className={`
            ${sizeClasses[size]} 
            border-4 border-gray-200 rounded-full animate-spin
          `}
        >
          <div 
            className={`
              ${sizeClasses[size]} 
              border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin
            `}
          />
        </div>
      </div>
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner