import React, { createContext, useContext, useReducer } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AnalysisContext = createContext()

// Analysis reducer
const analysisReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ANALYZING':
      return { ...state, analyzing: action.payload }
    case 'SET_CURRENT_ANALYSIS':
      return { ...state, currentAnalysis: action.payload, analyzing: false }
    case 'SET_ANALYSIS_HISTORY':
      return { ...state, analysisHistory: action.payload }
    case 'ADD_ANALYSIS':
      return { 
        ...state, 
        analysisHistory: [action.payload, ...state.analysisHistory],
        currentAnalysis: action.payload,
        analyzing: false
      }
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload, loading: false }
    case 'SET_COMPARISON':
      return { ...state, comparison: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, analyzing: false }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

const initialState = {
  currentAnalysis: null,
  analysisHistory: [],
  dashboardData: null,
  comparison: null,
  loading: false,
  analyzing: false,
  error: null
}

export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState)

  const analyzeWithAI = async (imageFile, isBaseline = false) => {
    try {
      dispatch({ type: 'SET_ANALYZING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const formData = new FormData()
      formData.append('faceImage', imageFile)
      if (isBaseline) {
        formData.append('isBaseline', 'true')
      }

      const response = await api.post('/analysis/ai-analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const analysis = response.data.analysis
      dispatch({ type: 'ADD_ANALYSIS', payload: analysis })

      toast.success('Face analysis completed successfully!')
      return { success: true, analysis }
    } catch (error) {
      const message = error.response?.data?.message || 'Face analysis failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const analyzeManually = async (analysisData) => {
    try {
      dispatch({ type: 'SET_ANALYZING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const response = await api.post('/analysis/manual-analysis', analysisData)
      const analysis = response.data.analysis

      dispatch({ type: 'ADD_ANALYSIS', payload: analysis })

      toast.success('Manual analysis saved successfully!')
      return { success: true, analysis }
    } catch (error) {
      const message = error.response?.data?.message || 'Manual analysis failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const getAnalysisHistory = async (page = 1, limit = 10) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await api.get(`/analysis/history?page=${page}&limit=${limit}`)
      dispatch({ type: 'SET_ANALYSIS_HISTORY', payload: response.data.analyses })

      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch analysis history'
      dispatch({ type: 'SET_ERROR', payload: message })
      return { success: false, error: message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const getDashboardData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await api.get('/user/dashboard')
      dispatch({ type: 'SET_DASHBOARD_DATA', payload: response.data.dashboard })

      return { success: true, data: response.data.dashboard }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch dashboard data'
      dispatch({ type: 'SET_ERROR', payload: message })
      return { success: false, error: message }
    }
  }

  const compareAnalyses = async (baselineId, currentId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await api.post(`/analysis/compare/${baselineId}/${currentId}`)
      dispatch({ type: 'SET_COMPARISON', payload: response.data.comparison })

      toast.success('Analysis comparison completed!')
      return { success: true, comparison: response.data.comparison }
    } catch (error) {
      const message = error.response?.data?.message || 'Comparison failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      toast.error(message)
      return { success: false, error: message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const clearCurrentAnalysis = () => {
    dispatch({ type: 'SET_CURRENT_ANALYSIS', payload: null })
  }

  const clearComparison = () => {
    dispatch({ type: 'SET_COMPARISON', payload: null })
  }

  // Helper function to format skin concerns for display
  const formatSkinConcerns = (concerns) => {
    const concernMap = {
      'acne_pimple': 'Acne/Pimples',
      'dark_spots_marks': 'Dark Spots/Marks',
      'acne_scars': 'Acne Scars',
      'pigmentation': 'Pigmentation',
      'dull_skin': 'Dull Skin',
      'under_eye_dark_circles': 'Under Eye Dark Circles',
      'anti_aging': 'Anti-Aging'
    }
    
    return concerns.map(concern => concernMap[concern] || concern)
  }

  // Helper function to format skin type for display
  const formatSkinType = (skinType) => {
    const typeMap = {
      'dry_skin': 'Dry Skin',
      'oily_skin': 'Oily Skin',
      'dull_skin': 'Dull Skin',
      'normal_skin': 'Normal Skin',
      'sensitive_skin': 'Sensitive Skin'
    }
    
    return typeMap[skinType] || skinType
  }

  // Helper function to get skin type color
  const getSkinTypeColor = (skinType) => {
    const colorMap = {
      'dry_skin': 'bg-blue-100 text-blue-800 border-blue-200',
      'oily_skin': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'dull_skin': 'bg-gray-100 text-gray-800 border-gray-200',
      'normal_skin': 'bg-green-100 text-green-800 border-green-200',
      'sensitive_skin': 'bg-pink-100 text-pink-800 border-pink-200'
    }
    
    return colorMap[skinType] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Helper function to get concern color
  const getConcernColor = (concern) => {
    const colorMap = {
      'acne_pimple': 'bg-red-100 text-red-800 border-red-200',
      'dark_spots_marks': 'bg-purple-100 text-purple-800 border-purple-200',
      'acne_scars': 'bg-orange-100 text-orange-800 border-orange-200',
      'pigmentation': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'dull_skin': 'bg-gray-100 text-gray-800 border-gray-200',
      'under_eye_dark_circles': 'bg-violet-100 text-violet-800 border-violet-200',
      'anti_aging': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
    
    return colorMap[concern] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const value = {
    ...state,
    analyzeWithAI,
    analyzeManually,
    getAnalysisHistory,
    getDashboardData,
    compareAnalyses,
    clearCurrentAnalysis,
    clearComparison,
    formatSkinConcerns,
    formatSkinType,
    getSkinTypeColor,
    getConcernColor
  }

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}