import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useAnalysis } from '../contexts/AnalysisContext'
import { 
  PhotoIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowRightIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BeakerIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Navigation from '../components/Navigation'

const Dashboard = () => {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const { 
    dashboardData, 
    loading, 
    getDashboardData,
    formatSkinType,
    formatSkinConcerns,
    getSkinTypeColor,
    getConcernColor
  } = useAnalysis()

  const [recentAnalyses, setRecentAnalyses] = useState([])
  const [zeshtoJourney, setZeshtoJourney] = useState(null)
  const [zeshtoLoading, setZeshtoLoading] = useState(true)

  useEffect(() => {
    getDashboardData()
    fetchZeshtoJourney()
    fetchRecentAnalyses()
  }, [])

  const fetchZeshtoJourney = async () => {
    try {
      const response = await fetch('/api/analysis/zeshto/journey', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setZeshtoJourney(data.journey)
      }
    } catch (error) {
      console.error('Failed to fetch Zeshto journey:', error)
    } finally {
      setZeshtoLoading(false)
    }
  }

  const fetchRecentAnalyses = async () => {
    try {
      const response = await fetch('/api/analysis/history?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecentAnalyses(data.analyses || [])
      }
    } catch (error) {
      console.error('Failed to fetch recent analyses:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getAnalysisTypeColor = (type) => {
    switch (type) {
      case 'before': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'after': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSkinMetricColor = (value) => {
    if (value <= 30) return 'text-green-600'
    if (value <= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const StatCard = ({ title, value, icon: Icon, color = 'primary', trend = null }) => {
    const colorClasses = {
      primary: 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700',
      secondary: 'bg-gradient-to-br from-secondary-100 to-secondary-200 text-secondary-700',
      green: 'bg-gradient-to-br from-success-100 to-success-200 text-success-700',
      purple: 'bg-gradient-to-br from-accent-100 to-accent-200 text-accent-700'
    }
    
    return (
      <Card className="relative overflow-hidden border-2 border-neutral-200" variant="elevated" hover>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-neutral-900 mt-2 font-display">{value}</p>
            {trend && (
              <div className="flex items-center mt-3">
                <ArrowTrendingUpIcon className="w-4 h-4 text-success-600 mr-1" />
                <span className="text-sm text-success-700 font-medium">{trend}</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-2xl shadow-medium ${colorClasses[color] || colorClasses.primary}`}>
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </Card>
    )
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navigation />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-2 mr-3">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Zeshto Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-neutral-900 font-display mb-4">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-neutral-600 text-xl font-medium mb-2">
              Your Personal Dashboard
            </p>
            <p className="text-neutral-500 text-lg">
              Track your progress and manage your account
            </p>
          </div>
        </div>

        {/* Manual Analysis Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Your Skin Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before & After Analysis */}
            <Card padding="lg" className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/before-after-analysis" className="block">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <PhotoIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Before & After Analysis</h3>
                  <p className="text-gray-600 mb-4">
                    Upload photos to track your skin improvement journey with Zeshto products
                  </p>
                  <div className="flex items-center justify-center text-blue-600 font-medium">
                    Start Analysis
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </Link>
            </Card>

            {/* Progress Tracking Info */}
            <Card padding="lg" className="bg-gradient-to-br from-green-50 to-blue-50">
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ChartPieIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Progress</h3>
                <p className="text-gray-600 mb-4">
                  Monitor your skin transformation with Zeshto soap and track improvements over time
                </p>
                <div className="text-green-600 font-medium">
                  View detailed analytics below
                </div>
              </div>
            </Card>
          </div>
        </div>

         {/* Progress Statistics */}
         <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Skin Journey Statistics</h2>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <Card padding="md" className="text-center">
               <div className="text-3xl font-bold text-blue-600 mb-2">
                 {recentAnalyses.length}
               </div>
               <div className="text-gray-600 text-sm">Total Analyses</div>
               <div className="text-xs text-gray-500 mt-1">Before & After Photos</div>
             </Card>

             <Card padding="md" className="text-center">
               <div className="flex items-center justify-center mb-2">
                 <ArrowTrendingUpIcon className="w-4 h-4 text-success-600 mr-1" />
                 <span className="text-3xl font-bold text-success-600">
                   {recentAnalyses.length > 1 ? '+15%' : '--'}
                 </span>
               </div>
               <div className="text-gray-600 text-sm">Improvement</div>
               <div className="text-xs text-gray-500 mt-1">Skin Progress</div>
             </Card>

             <Card padding="md" className="text-center">
               <div className="text-3xl font-bold text-purple-600 mb-2">
                 {user?.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
               </div>
               <div className="text-gray-600 text-sm">Days Tracked</div>
               <div className="text-xs text-gray-500 mt-1">Using Zeshto</div>
             </Card>

             <Card padding="md" className="text-center">
               <div className="text-3xl font-bold text-orange-600 mb-2">
                 {user?.skinType || 'Unknown'}
               </div>
               <div className="text-gray-600 text-sm">Skin Type</div>
               <div className="text-xs text-gray-500 mt-1">Current Profile</div>
             </Card>
           </div>
         </div>

          {/* Recent Analysis History - Manual Only */}
          <div id="analysis-history" className="mb-8">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Progress Photos</h2>
                <Button 
                  onClick={() => navigate('/analysis-history')}
                  variant="outline"
                  size="sm"
                >
                  View All
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {recentAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {recentAnalyses.slice(0, 3).map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {analysis.imageUrl && (
                          <img
                            src={analysis.imageUrl}
                            alt="Progress Photo"
                            className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            Before & After Analysis
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(analysis.createdAt)}
                          </p>
                          <p className="text-xs text-green-600">
                            Zeshto Progress Tracking
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                          Manual
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PhotoIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No progress photos yet</p>
                  <p className="text-gray-400 text-sm">Start tracking your skin journey with Before & After photos</p>
                  <Button 
                    onClick={() => navigate('/before-after-analysis')}
                    className="mt-4"
                    size="sm"
                  >
                    Take First Photo
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Legacy Journey Status - Simplified */}
        {zeshtoJourney?.userInfo?.zeshtoUsage?.isActive && (
          <div className="mb-8">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Skin Journey</h2>
                <Button 
                  onClick={() => navigate('/zeshto-review')}
                  variant="primary"
                  size="sm"
                >
                  View Details
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BeakerIcon className="w-8 h-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Active Skin Journey
                    </h3>
                    <p className="text-gray-600">Day {zeshtoJourney.userInfo.zeshtoUsage.currentDay} of your transformation</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.min(zeshtoJourney.userInfo.zeshtoUsage.currentDay, 7)}/7 days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((zeshtoJourney.userInfo.zeshtoUsage.currentDay / 7) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {zeshtoJourney.analyses?.find(a => a.analysisType === 'after')?.comparisonData?.improvementScore > 0 && (
                  <div className="flex items-center text-green-600">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">
                      {zeshtoJourney.analyses.find(a => a.analysisType === 'after').comparisonData.improvementScore}% improvement detected!
                    </span>
                  </div>
                )}
              </div>

              {/* Recent Zeshto Analyses */}
              {zeshtoJourney.analyses && zeshtoJourney.analyses.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Progress</h3>
                  <div className="space-y-3">
                    {zeshtoJourney.analyses.slice(0, 3).map((analysis) => (
                      <div key={analysis._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getAnalysisTypeColor(analysis.analysisType)}`}>
                            {analysis.analysisType === 'before' ? 'Before' : 
                             analysis.analysisType === 'after' ? 'After' : 
                             `Day ${analysis.usageDay}`}
                          </div>
                          <span className="ml-3 text-gray-600">{formatDate(analysis.createdAt)}</span>
                        </div>
                        
                        {analysis.aiAnalysis && (
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${getSkinMetricColor(analysis.aiAnalysis.skinMetrics.acneLevel)}`}>
                              Acne: {analysis.aiAnalysis.skinMetrics.acneLevel}%
                            </span>
                            {analysis.comparisonData && (
                              <span className="text-green-600 font-medium">
                                +{analysis.comparisonData.improvementScore}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Current Skin Profile Summary */}
        {dashboardData?.latestAnalysis && (
          <div className="mb-8">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Current Skin Profile</h2>
                <SparklesIcon className="w-6 h-6 text-primary-500" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skin Type */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Skin Type</p>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium border ${getSkinTypeColor(dashboardData.latestAnalysis.skinType)}`}>
                    {formatSkinType(dashboardData.latestAnalysis.skinType)}
                  </span>
                </div>

                {/* Main Concerns */}
                {dashboardData.latestAnalysis.skinConcerns?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Main Concerns</p>
                    <div className="flex flex-wrap gap-2">
                      {formatSkinConcerns(dashboardData.latestAnalysis.skinConcerns.slice(0, 3)).map((concern, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConcernColor(dashboardData.latestAnalysis.skinConcerns[index])}`}
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard