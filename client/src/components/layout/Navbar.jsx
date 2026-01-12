import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  UserCircleIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  CameraIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import Button from '../common/Button'
import CartIcon from '../cart/CartIcon'
import ShoppingCart from '../cart/ShoppingCart'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Face Analysis', href: '/analysis', icon: CameraIcon },
    { name: 'Enhanced AI', href: '/enhanced-analysis', icon: CpuChipIcon },
    { name: 'Progress', href: '/progress', icon: ChartBarIcon },
    { name: 'Products', href: '/products', icon: ShoppingBagIcon }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-strong border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-strong transition-all duration-200 group-hover:scale-105">
              <CameraIcon className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">
                SkinCare AI
              </h1>
              <p className="text-xs text-neutral-600 font-medium">Powered by Zeshto</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105
                    ${isActive(item.href) 
                      ? 'nav-link-active shadow-soft' 
                      : 'nav-link'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <CartIcon onClick={() => setIsCartOpen(true)} />
            
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-neutral-600 font-medium">{user.email}</p>
                </div>
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary-300 shadow-soft"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-neutral-500" />
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Logout
            </Button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 transform hover:scale-105"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4 bg-white/95 backdrop-blur-md animate-slide-down">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105 mx-2
                      ${isActive(item.href) 
                        ? 'nav-link-active shadow-soft' 
                        : 'nav-link'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="border-t border-neutral-200 pt-4 mt-4">
                {user && (
                  <div className="flex items-center space-x-3 px-4 py-2 mx-2 rounded-lg bg-neutral-50">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary-300 shadow-soft"
                      />
                    ) : (
                      <UserCircleIcon className="w-10 h-10 text-neutral-500" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-neutral-600 font-medium">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
                  fullWidth
                  className="mt-3 mx-4"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Shopping Cart */}
      <ShoppingCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </nav>
  )
}

export default Navbar