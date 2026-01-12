import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Set up api interceptors
  useEffect(() => {
    // Request interceptor to add token
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token expiration
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && state.token) {
          logout()
          toast.error('Session expired. Please login again.')
        }
        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [state.token])

  const loadUser = useCallback(async () => {
    try {
      const response = await api.get('/user/profile')
      dispatch({ type: 'SET_USER', payload: response.data.user })
    } catch (error) {
      console.error('Load user error:', error)
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }, [])

  // Load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        await loadUser()
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
    
    initializeAuth()
  }, [loadUser])

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data

      localStorage.setItem('token', token)
      dispatch({ type: 'SET_TOKEN', payload: token })
      dispatch({ type: 'SET_USER', payload: user })

      toast.success(`Welcome back, ${user.firstName}!`)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data

      localStorage.setItem('token', token)
      dispatch({ type: 'SET_TOKEN', payload: token })
      dispatch({ type: 'SET_USER', payload: user })

      toast.success(`Welcome to Zeshto, ${user.firstName}!`)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const forgotPassword = async (email) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      await api.post('/auth/forgot-password', { email })
      
      toast.success('Password reset email sent successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const resetPassword = async (token, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      await api.post(`/auth/reset-password/${token}`, { password })
      
      toast.success('Password reset successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateProfile = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await api.put('/user/profile', userData)
      dispatch({ type: 'SET_USER', payload: response.data.user })
      
      toast.success('Profile updated successfully')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const uploadProfileImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await api.post('/user/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Update user with new profile image
      dispatch({ type: 'SET_USER', payload: { ...state.user, profileImage: response.data.profileImage } })
      
      toast.success('Profile image updated successfully')
      return { success: true, imageUrl: response.data.profileImage }
    } catch (error) {
      const message = error.response?.data?.message || 'Image upload failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    uploadProfileImage,
    loadUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}