import React from 'react'

const Logo = ({ size = 'md', showIcon = false, className = '' }) => {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      <span className={`${sizes[size]} font-bold bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent tracking-tight`}>
        Gestionar
      </span>
    </div>
  )
}

export default Logo
