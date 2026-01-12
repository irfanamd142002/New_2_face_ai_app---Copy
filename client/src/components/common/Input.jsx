import React, { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  placeholder = '', 
  icon = null,
  iconPosition = 'left',
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
  
  const stateClasses = error 
    ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:ring-red-500' 
    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400'

  const iconClasses = icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : ''

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0' : 'right-0'} flex items-center ${iconPosition === 'left' ? 'pl-3' : 'pr-3'} pointer-events-none`}>
            <span className={`text-gray-400 ${error ? 'text-red-400' : ''}`}>
              {icon}
            </span>
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${iconClasses}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input