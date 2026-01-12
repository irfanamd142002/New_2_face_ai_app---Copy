import React from 'react'

const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  hover = false,
  gradient = false,
  variant = 'default',
  ...props 
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300'
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-soft',
    md: 'shadow-medium',
    lg: 'shadow-strong',
    xl: 'shadow-xl'
  }
  
  const variantClasses = {
    default: 'card',
    elevated: 'card-elevated',
    primary: 'card-primary',
    glass: 'glass-effect'
  }
  
  const hoverClasses = hover ? 'hover:shadow-strong hover:-translate-y-1 cursor-pointer transform' : ''
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-neutral-50' : ''

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hoverClasses}
        ${gradientClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card