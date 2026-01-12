import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar />
      <main className="flex-1 relative">
        <Outlet />
      </main>
      
      {/* Enhanced Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-300/30 to-secondary-300/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-300/30 to-accent-300/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-accent-200/20 to-primary-200/20 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}

export default Layout