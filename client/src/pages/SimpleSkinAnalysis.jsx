import React, { useState } from 'react';
import { 
  User, AlertCircle, Sparkles, CheckCircle, RotateCcw, Zap,
  Droplets, Sun, Snowflake, Flame, Wind, Shield, Clock, Eye, Moon,
  // Beautiful icons for skin concerns
  Zap as AcneIcon, Target, Palette, EyeOff, Timer, Activity,
  Stethoscope, Wrench, Brush, Gem, Star, Flower2, 
  // Additional icons for all skin concerns
  Crosshair, Waves, Sparkle, Feather, Baby,
  // Product icon
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import zeshtoDataService from '../services/zeshtoDataService';
import Header from '../components/Header';

const SimpleSkinAnalysis = () => {
  const [skinType, setSkinType] = useState('');
  const [skinIssue, setSkinIssue] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get options from the data service
  const skinTypes = zeshtoDataService.getAvailableSkinTypes();
  const skinIssues = zeshtoDataService.getAvailableSkinIssues();

  // Icon mapping for skin types
  const skinTypeIcons = {
    'oily': { icon: Droplets, color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
    'dry': { icon: Sun, color: 'from-orange-500 to-yellow-500', bgColor: 'from-orange-50 to-yellow-50' },
    'normal': { icon: Snowflake, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50' },
    'combination': { icon: Wind, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
    'sensitive': { icon: Shield, color: 'from-red-500 to-rose-500', bgColor: 'from-red-50 to-rose-50' }
  };

  // Beautiful icon mapping for skin issues with enhanced gradients (matching data service values)
  const skinIssueIcons = {
    'acne_pimple': { 
      icon: Zap, 
      color: 'from-red-500 via-rose-500 to-pink-500', 
      bgColor: 'from-red-50 via-rose-50 to-pink-50',
      shadowColor: 'shadow-red-200'
    },
    'dark_spots_marks': { 
      icon: Target, 
      color: 'from-amber-500 via-orange-500 to-red-500', 
      bgColor: 'from-amber-50 via-orange-50 to-red-50',
      shadowColor: 'shadow-amber-200'
    },
    'acne_scars': { 
      icon: Activity, 
      color: 'from-purple-500 via-violet-500 to-indigo-500', 
      bgColor: 'from-purple-50 via-violet-50 to-indigo-50',
      shadowColor: 'shadow-purple-200'
    },
    'pigmentation': { 
      icon: Crosshair, 
      color: 'from-orange-500 via-amber-500 to-yellow-500', 
      bgColor: 'from-orange-50 via-amber-50 to-yellow-50',
      shadowColor: 'shadow-orange-200'
    },
    'dullness': { 
      icon: Gem, 
      color: 'from-yellow-400 via-amber-500 to-orange-500', 
      bgColor: 'from-yellow-50 via-amber-50 to-orange-50',
      shadowColor: 'shadow-yellow-200'
    },
    'wrinkles': { 
      icon: Timer, 
      color: 'from-emerald-500 via-teal-500 to-cyan-500', 
      bgColor: 'from-emerald-50 via-teal-50 to-cyan-50',
      shadowColor: 'shadow-emerald-200'
    },
    'sensitivity': { 
      icon: Feather, 
      color: 'from-pink-500 via-rose-500 to-red-500', 
      bgColor: 'from-pink-50 via-rose-50 to-red-50',
      shadowColor: 'shadow-pink-200'
    },
    'under_eye_circles': { 
      icon: EyeOff, 
      color: 'from-slate-500 via-gray-600 to-zinc-600', 
      bgColor: 'from-slate-50 via-gray-50 to-zinc-50',
      shadowColor: 'shadow-slate-200'
    }
  };

  const handleAnalyze = async () => {
    if (!skinType || !skinIssue) {
      toast.error('Please select both skin type and skin issue', {
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA'
        }
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis time for better UX
    setTimeout(() => {
      const rec = zeshtoDataService.getRecommendation(skinType, skinIssue);
      setRecommendation(rec);
      setIsAnalyzing(false);
      toast.success('Analysis completed successfully!', {
        style: {
          background: '#F0FDF4',
          color: '#16A34A',
          border: '1px solid #BBF7D0'
        }
      });
    }, 1500);
  };

  const handleGoToProduct = () => {
    if (!recommendation) {
      toast.error('Please complete analysis first');
      return;
    }
    
    // Placeholder for future ecommerce integration
    toast.success('Redirecting to product page...', {
      style: {
        background: '#F0FDF4',
        color: '#16A34A',
        border: '1px solid #BBF7D0'
      }
    });
    
    // TODO: Navigate to product page when ecommerce is integrated
    console.log('Navigate to product page for:', recommendation.recommendedSoap);
  };

  const handleReset = () => {
    setSkinType('');
    setSkinIssue('');
    setRecommendation(null);
    toast.success('Form reset successfully');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header currentPage="manual" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-700 bg-clip-text text-transparent mb-4">
            Manual Skin Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get personalized Zeshto soap recommendations based on your unique skin profile
          </p>
        </div>

        {/* Selection Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          {/* Skin Type Selection */}
          <div className="mb-12">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">What's your skin type?</h3>
                <p className="text-gray-600">Choose the option that best describes your skin</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {skinTypes.map((type) => {
                const iconData = skinTypeIcons[type.value] || { icon: User, color: 'from-gray-500 to-gray-600', bgColor: 'from-gray-50 to-gray-100' };
                const IconComponent = iconData.icon;
                
                return (
                  <button
                    key={type.value}
                    onClick={() => setSkinType(type.value)}
                    className={`
                      group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                      ${skinType === type.value 
                        ? `border-transparent bg-gradient-to-br ${iconData.bgColor} shadow-lg ring-2 ring-offset-2 ring-blue-400` 
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`
                        p-4 rounded-xl mb-3 transition-all duration-300
                        ${skinType === type.value 
                          ? `bg-gradient-to-r ${iconData.color} shadow-lg` 
                          : `bg-gradient-to-r ${iconData.color} opacity-70 group-hover:opacity-100`
                        }
                      `}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <span className={`
                        font-semibold text-sm transition-colors duration-300
                        ${skinType === type.value ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-800'}
                      `}>
                        {type.label}
                      </span>
                    </div>
                    
                    {skinType === type.value && (
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Issue Selection */}
          <div className="mb-8">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">What's your main skin concern?</h3>
                <p className="text-gray-600">Select your primary skin issue to address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skinIssues.map((issue) => {
                const iconData = skinIssueIcons[issue.value] || { icon: AlertCircle, color: 'from-gray-500 to-gray-600', bgColor: 'from-gray-50 to-gray-100' };
                const IconComponent = iconData.icon;
                
                return (
                  <button
                    key={issue.value}
                    onClick={() => setSkinIssue(issue.value)}
                    className={`
                      group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                      ${skinIssue === issue.value 
                        ? `border-transparent bg-gradient-to-br ${iconData.bgColor} shadow-lg ring-2 ring-offset-2 ring-purple-400` 
                        : 'border-gray-200 hover:border-purple-300 bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50'
                      }
                    `}
                  >
                    <div className="flex items-center text-left">
                      <div className={`
                        p-3 rounded-xl mr-4 transition-all duration-300
                        ${skinIssue === issue.value 
                          ? `bg-gradient-to-r ${iconData.color} shadow-lg ${iconData.shadowColor} shadow-lg` 
                          : `bg-gradient-to-r ${iconData.color} opacity-70 group-hover:opacity-100 group-hover:shadow-md group-hover:${iconData.shadowColor}`
                        }
                      `}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <span className={`
                        font-semibold text-sm transition-colors duration-300
                        ${skinIssue === issue.value ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-800'}
                      `}>
                        {issue.label}
                      </span>
                    </div>
                    
                    {skinIssue === issue.value && (
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!skinType || !skinIssue || isAnalyzing}
              className={`
                py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100
                ${(!skinType || !skinIssue || isAnalyzing)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Get Recommendation
                </div>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Recommendation Display */}
        {recommendation && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mr-4">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Your Personalized Recommendation</h3>
                <p className="text-gray-600">Based on your skin profile analysis</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2 text-lg">Skin Issue</h4>
                <p className="text-emerald-700 text-lg">{recommendation.skinIssue}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 text-lg">Skin Type</h4>
                <p className="text-blue-700 text-lg">{recommendation.skinDetail}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 mb-6">
              <h4 className="font-bold text-purple-800 mb-3 text-lg">Recommended Zeshto Soap</h4>
              <p className="text-purple-700 font-bold text-2xl mb-3">{recommendation.recommendedSoap}</p>
              {recommendation.ingredients && (
                <p className="text-purple-600 text-sm bg-white/50 px-4 py-2 rounded-full inline-block">
                  Key Ingredients: {recommendation.ingredients}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 mb-6">
              <h4 className="font-bold text-amber-800 mb-3 text-lg">Why This Zeshto Soap Recommended</h4>
              <p className="text-amber-700 leading-relaxed text-lg">{recommendation.explanation}</p>
            </div>

            <button
              onClick={handleGoToProduct}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 font-bold text-lg flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Go to Product
            </button>
          </div>
        )}

        {/* Empty State for Recommendation */}
        {!recommendation && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8">
            <div className="text-center py-16">
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-8 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">Ready for Analysis</h4>
              <p className="text-gray-500 text-lg">Select your skin type and concern to get personalized recommendations</p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default SimpleSkinAnalysis;