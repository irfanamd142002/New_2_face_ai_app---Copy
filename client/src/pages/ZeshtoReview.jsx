import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Camera, 
  TrendingUp, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Eye,
  BarChart3,
  Zap,
  Target
} from 'lucide-react';

const ZeshtoReview = () => {
  const { user, token } = useAuth();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('progress');
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    console.log('🔐 Auth state:', { user: user ? 'Present' : 'Missing', token: token ? 'Present' : 'Missing' });
    if (token) {
      fetchZeshtoJourney();
    } else {
      console.warn('⚠️ No authentication token found - showing demo content');
      // Show demo content instead of error
      setJourney(getDemoJourney());
      setLoading(false);
    }
  }, [token]);

  const fetchZeshtoJourney = async () => {
    try {
      console.log('🔍 Fetching Zeshto journey...', { token: token ? 'Present' : 'Missing' });
      
      const response = await fetch('/api/analysis/zeshto/journey', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Journey data received:', data);
        setJourney(data.journey);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        setError(`Failed to fetch your Zeshto journey: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('🚨 Network error:', err);
      setError(`Network error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startZeshtoUsage = async (soapType) => {
    try {
      const response = await fetch('/api/analysis/zeshto/start-usage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          soapType,
          usageFrequency: 'twice_daily',
          notes: 'Starting my Zeshto journey!'
        })
      });

      if (response.ok) {
        fetchZeshtoJourney();
      } else {
        setError('Failed to start Zeshto usage tracking');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  const getDemoJourney = () => {
    return {
      userInfo: {
        zeshtoUsage: {
          isActive: true,
          soapType: 'Zeshto Radiance Restore',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          usageFrequency: 'twice_daily',
          notes: 'Demo journey - showing sample progress'
        }
      },
      analyses: [
        {
          _id: 'demo-before',
          usageDay: 0,
          analysisType: 'before',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          aiAnalysis: {
            skinMetrics: {
              acneLevel: 65,
              oiliness: 70,
              pigmentationLevel: 55,
              wrinkleLevel: 40,
              skinTexture: 60
            },
            skinType: 'Oily',
            skinConcerns: ['Acne', 'Oiliness', 'Pigmentation']
          }
        },
        {
          _id: 'demo-progress-3',
          usageDay: 3,
          analysisType: 'progress',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          aiAnalysis: {
            skinMetrics: {
              acneLevel: 50,
              oiliness: 55,
              pigmentationLevel: 45,
              wrinkleLevel: 38,
              skinTexture: 50
            },
            skinType: 'Combination',
            skinConcerns: ['Acne', 'Oiliness']
          },
          comparisonData: {
            improvementScore: 25,
            improvements: ['Reduced acne', 'Less oiliness', 'Better skin texture']
          }
        },
        {
          _id: 'demo-after',
          usageDay: 7,
          analysisType: 'after',
          createdAt: new Date().toISOString(),
          aiAnalysis: {
            skinMetrics: {
              acneLevel: 25,
              oiliness: 35,
              pigmentationLevel: 30,
              wrinkleLevel: 35,
              skinTexture: 35
            },
            skinType: 'Normal',
            skinConcerns: ['Minor pigmentation']
          },
          comparisonData: {
            improvementScore: 62,
            improvements: ['Significant acne reduction', 'Balanced oil production', 'Improved skin texture', 'Reduced pigmentation']
          }
        }
      ]
    };
  };

  const getSkinMetricColor = (value) => {
    if (value <= 30) return 'text-green-600';
    if (value <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementIcon = (score) => {
    if (score > 20) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (score > 0) return <TrendingUp className="w-5 h-5 text-yellow-600" />;
    return <TrendingUp className="w-5 h-5 text-red-600" />;
  };

  const formatDay = (day) => {
    if (day === 0) return 'Before';
    if (day >= 7) return 'After';
    return `Day ${day}`;
  };

  const AnalysisCard = ({ analysis, isSelected, onClick }) => (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onClick(analysis)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800">
          {formatDay(analysis.usageDay)}
        </span>
        <span className="text-sm text-gray-500">
          {new Date(analysis.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      {analysis.aiAnalysis && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Acne:</span>
            <span className={`ml-1 font-medium ${getSkinMetricColor(analysis.aiAnalysis.skinMetrics.acneLevel)}`}>
              {analysis.aiAnalysis.skinMetrics.acneLevel}%
            </span>
          </div>
          <div>
            <span className="text-gray-600">Oiliness:</span>
            <span className={`ml-1 font-medium ${getSkinMetricColor(analysis.aiAnalysis.skinMetrics.oiliness)}`}>
              {analysis.aiAnalysis.skinMetrics.oiliness}%
            </span>
          </div>
        </div>
      )}
      
      {analysis.comparisonData && (
        <div className="mt-2 flex items-center">
          {getImprovementIcon(analysis.comparisonData.improvementScore)}
          <span className="ml-1 text-sm font-medium">
            {analysis.comparisonData.improvementScore > 0 ? '+' : ''}
            {analysis.comparisonData.improvementScore}% improvement
          </span>
        </div>
      )}
    </div>
  );

  const UploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">
          Upload {uploadType === 'before' ? 'Before' : uploadType === 'after' ? 'After' : 'Progress'} Analysis
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usage Day
          </label>
          <input
            type="number"
            value={currentDay}
            onChange={(e) => setCurrentDay(e.target.value)}
            min={uploadType === 'before' ? 0 : uploadType === 'after' ? 7 : 1}
            max={uploadType === 'progress' ? 6 : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowUploadModal(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Handle upload logic here
              setShowUploadModal(false);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Upload Analysis
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your Zeshto journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // If user hasn't started Zeshto usage
  if (!journey?.userInfo?.zeshtoUsage?.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Start Your Zeshto Soap Journey
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Track your skin transformation with our 7-day before/after analysis system
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">How it works:</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Camera className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Day 0 - Before Photo</h3>
                      <p className="text-gray-600 text-sm">Take your initial photo and assessment</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-yellow-100 rounded-full p-2 mr-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Days 1-6 - Progress Tracking</h3>
                      <p className="text-gray-600 text-sm">Optional daily progress photos and notes</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Day 7+ - After Photo</h3>
                      <p className="text-gray-600 text-sm">See your transformation results</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Choose Your Zeshto Soap:</h2>
                <div className="space-y-3">
                  {['charcoal', 'turmeric', 'neem', 'aloe_vera', 'honey_oat'].map((soapType) => (
                    <button
                      key={soapType}
                      onClick={() => startZeshtoUsage(soapType)}
                      className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium capitalize">
                        {soapType.replace('_', ' ')} Soap
                      </div>
                      <div className="text-sm text-gray-600">
                        {soapType === 'charcoal' && 'Deep cleansing for oily skin'}
                        {soapType === 'turmeric' && 'Brightening and anti-inflammatory'}
                        {soapType === 'neem' && 'Antibacterial for acne-prone skin'}
                        {soapType === 'aloe_vera' && 'Soothing for sensitive skin'}
                        {soapType === 'honey_oat' && 'Moisturizing for dry skin'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const analyses = journey?.analyses || [];
  const beforeAnalysis = analyses.find(a => a.analysisType === 'before');
  const afterAnalysis = analyses.find(a => a.analysisType === 'after');
  const progressAnalyses = analyses.filter(a => a.analysisType === 'progress').sort((a, b) => a.usageDay - b.usageDay);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Demo Banner */}
        {!token && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-800 font-medium">
                Demo Mode: This is sample data showing how your Zeshto journey would look. 
                <a href="/login" className="text-blue-600 hover:underline ml-1">Login</a> to track your real progress.
              </span>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Zeshto Soap Journey
          </h1>
          <p className="text-lg text-gray-600">
            {journey.userInfo.zeshtoUsage.soapType.replace('_', ' ')} Soap - Day {journey.userInfo.zeshtoUsage.currentDay}
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{journey.userInfo.zeshtoUsage.currentDay}</div>
              <div className="text-sm text-gray-600">Days of Usage</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{analyses.length}</div>
              <div className="text-sm text-gray-600">Photos Taken</div>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {afterAnalysis?.comparisonData?.improvementScore || 0}%
              </div>
              <div className="text-sm text-gray-600">Improvement</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {journey.userInfo.isEligibleForAfter ? 'Ready' : 'In Progress'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </div>

        {/* Timeline and Analysis */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Timeline</h2>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 flex items-center"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Add Photo
                </button>
              </div>
              
              <div className="space-y-3">
                {beforeAnalysis && (
                  <AnalysisCard
                    analysis={beforeAnalysis}
                    isSelected={selectedAnalysis?._id === beforeAnalysis._id}
                    onClick={setSelectedAnalysis}
                  />
                )}
                
                {progressAnalyses.map((analysis) => (
                  <AnalysisCard
                    key={analysis._id}
                    analysis={analysis}
                    isSelected={selectedAnalysis?._id === analysis._id}
                    onClick={setSelectedAnalysis}
                  />
                ))}
                
                {afterAnalysis && (
                  <AnalysisCard
                    analysis={afterAnalysis}
                    isSelected={selectedAnalysis?._id === afterAnalysis._id}
                    onClick={setSelectedAnalysis}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="lg:col-span-2">
            {selectedAnalysis ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {formatDay(selectedAnalysis.usageDay)} Analysis
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(selectedAnalysis.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* AI Analysis Results */}
                {selectedAnalysis.aiAnalysis && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">AI Analysis Results</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Acne Level:</span>
                          <span className={`font-medium ${getSkinMetricColor(selectedAnalysis.aiAnalysis.skinMetrics.acneLevel)}`}>
                            {selectedAnalysis.aiAnalysis.skinMetrics.acneLevel}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Oiliness:</span>
                          <span className={`font-medium ${getSkinMetricColor(selectedAnalysis.aiAnalysis.skinMetrics.oiliness)}`}>
                            {selectedAnalysis.aiAnalysis.skinMetrics.oiliness}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pigmentation:</span>
                          <span className={`font-medium ${getSkinMetricColor(selectedAnalysis.aiAnalysis.skinMetrics.pigmentationLevel)}`}>
                            {selectedAnalysis.aiAnalysis.skinMetrics.pigmentationLevel}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dryness:</span>
                          <span className={`font-medium ${getSkinMetricColor(selectedAnalysis.aiAnalysis.skinMetrics.dryness)}`}>
                            {selectedAnalysis.aiAnalysis.skinMetrics.dryness}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-medium text-blue-600">
                            {selectedAnalysis.aiAnalysis.confidenceScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skin Type:</span>
                          <span className="font-medium capitalize">
                            {selectedAnalysis.aiAnalysis.skinProfile?.skinType?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Assessment */}
                {selectedAnalysis.manualAssessment && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Manual Assessment</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Overall Condition:</span>
                          <span className="font-medium capitalize">
                            {selectedAnalysis.manualAssessment.overallSkinCondition?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Acne Level:</span>
                          <span className="font-medium capitalize">
                            {selectedAnalysis.manualAssessment.acneLevel}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skin Texture:</span>
                          <span className="font-medium capitalize">
                            {selectedAnalysis.manualAssessment.skinTexture}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skin Tone:</span>
                          <span className="font-medium capitalize">
                            {selectedAnalysis.manualAssessment.skinTone?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Oiliness:</span>
                          <span className="font-medium capitalize">
                            {selectedAnalysis.manualAssessment.oiliness?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sensitivity:</span>
                          <span className="font-medium capitalize">
                            {selectedAnalysis.manualAssessment.sensitivity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedAnalysis.manualAssessment.notes && (
                      <div className="mt-4">
                        <span className="text-gray-600">Notes:</span>
                        <p className="mt-1 text-gray-800">{selectedAnalysis.manualAssessment.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Comparison Data */}
                {selectedAnalysis.comparisonData && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Improvement Analysis</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        {getImprovementIcon(selectedAnalysis.comparisonData.improvementScore)}
                        <span className="ml-2 font-semibold text-green-800">
                          Overall Improvement: {selectedAnalysis.comparisonData.improvementScore}%
                        </span>
                      </div>
                      
                      {selectedAnalysis.comparisonData.improvements && (
                        <div className="grid md:grid-cols-2 gap-2 mt-3">
                          {Object.entries(selectedAnalysis.comparisonData.improvements).map(([metric, improvement]) => (
                            <div key={metric} className="flex justify-between text-sm">
                              <span className="capitalize text-gray-700">{metric.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className={`font-medium ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {improvement > 0 ? '+' : ''}{improvement}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedAnalysis.metadata?.notes && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {selectedAnalysis.metadata.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select an Analysis
                </h3>
                <p className="text-gray-600">
                  Click on any analysis from the timeline to view detailed results
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Before/After Comparison */}
        {beforeAnalysis && afterAnalysis && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 text-center">Before & After Comparison</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">Before (Day 0)</h3>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Before Photo</p>
                </div>
                
                {beforeAnalysis.aiAnalysis && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Acne Level:</span>
                      <span className={getSkinMetricColor(beforeAnalysis.aiAnalysis.skinMetrics.acneLevel)}>
                        {beforeAnalysis.aiAnalysis.skinMetrics.acneLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oiliness:</span>
                      <span className={getSkinMetricColor(beforeAnalysis.aiAnalysis.skinMetrics.oiliness)}>
                        {beforeAnalysis.aiAnalysis.skinMetrics.oiliness}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pigmentation:</span>
                      <span className={getSkinMetricColor(beforeAnalysis.aiAnalysis.skinMetrics.pigmentationLevel)}>
                        {beforeAnalysis.aiAnalysis.skinMetrics.pigmentationLevel}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-medium mb-4">After (Day {afterAnalysis.usageDay})</h3>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">After Photo</p>
                </div>
                
                {afterAnalysis.aiAnalysis && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Acne Level:</span>
                      <span className={getSkinMetricColor(afterAnalysis.aiAnalysis.skinMetrics.acneLevel)}>
                        {afterAnalysis.aiAnalysis.skinMetrics.acneLevel}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Oiliness:</span>
                      <span className={getSkinMetricColor(afterAnalysis.aiAnalysis.skinMetrics.oiliness)}>
                        {afterAnalysis.aiAnalysis.skinMetrics.oiliness}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pigmentation:</span>
                      <span className={getSkinMetricColor(afterAnalysis.aiAnalysis.skinMetrics.pigmentationLevel)}>
                        {afterAnalysis.aiAnalysis.skinMetrics.pigmentationLevel}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {afterAnalysis.comparisonData && (
              <div className="mt-6 text-center">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 text-green-600 mr-2" />
                    <span className="text-lg font-semibold text-green-800">
                      Amazing Progress: {afterAnalysis.comparisonData.improvementScore}% Overall Improvement!
                    </span>
                  </div>
                  <p className="text-gray-700">
                    Your skin has shown significant improvement after using Zeshto {journey.userInfo.zeshtoUsage.soapType} soap for {afterAnalysis.usageDay} days.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
    </div>
  );
};

export default ZeshtoReview;