import { useState, useCallback, useRef } from 'react';
import skinAnalysisService from '../services/skinAnalysisService';

// Custom hook for managing skin analysis operations
export const useSkinAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const fileInputRef = useRef(null);

  // Initialize the skin analysis service
  const initializeService = useCallback(async () => {
    try {
      const success = await skinAnalysisService.initialize();
      setIsInitialized(success);
      return success;
    } catch (err) {
      setError('Failed to initialize skin analysis service');
      return false;
    }
  }, []);

  // Analyze an image file
  const analyzeImage = useCallback(async (imageFile) => {
    if (!imageFile) {
      setError('Please select an image file');
      return null;
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return null;
    }

    // Validate file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select a file under 10MB');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Initialize service if not already done
      if (!isInitialized) {
        await initializeService();
      }

      const result = await skinAnalysisService.analyzeImage(imageFile);
      setAnalysisResult(result);
      
      // Update history
      const updatedHistory = skinAnalysisService.getAnalysisHistory();
      setHistory(updatedHistory);
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to analyze image. Please try again.';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [isInitialized, initializeService]);

  // Handle file input change
  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      await analyzeImage(file);
    }
  }, [analyzeImage]);

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Clear current analysis result
  const clearResult = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
  }, []);

  // Clear analysis history
  const clearHistory = useCallback(() => {
    skinAnalysisService.clearHistory();
    setHistory([]);
  }, []);

  // Get analysis summary for display
  const getAnalysisSummary = useCallback((result = analysisResult) => {
    if (!result) return null;

    const { skinAnalysis, faceDetected, confidence } = result;
    if (!skinAnalysis) return null;

    return {
      skinType: skinAnalysis.skinType?.type || 'unknown',
      skinTypeConfidence: skinAnalysis.skinType?.confidence || 0,
      mainConcerns: skinAnalysis.skinConcerns?.slice(0, 3) || [],
      skinTone: skinAnalysis.skinTone?.tone || 'unknown',
      faceDetected,
      overallConfidence: confidence,
      recommendationCount: result.recommendations?.length || 0
    };
  }, [analysisResult]);

  // Get formatted recommendations
  const getRecommendations = useCallback((result = analysisResult) => {
    if (!result?.recommendations?.products) return [];

    return result.recommendations.products.map(rec => ({
      ...rec,
      product: rec.name,
      reason: rec.reasons?.join(', ') || 'Recommended for your skin type',
      id: rec.id || `${rec.category}-${rec.name.replace(/\s+/g, '-').toLowerCase()}`
    }));
  }, [analysisResult]);

  // Get skin concerns with severity levels
  const getSkinConcerns = useCallback((result = analysisResult) => {
    if (!result?.skinAnalysis?.skinConcerns) return [];

    return result.skinAnalysis.skinConcerns.map(concern => ({
      ...concern,
      severityLevel: concern.severity > 0.7 ? 'high' : 
                   concern.severity > 0.4 ? 'medium' : 'low',
      severityPercentage: Math.round(concern.severity * 100)
    }));
  }, [analysisResult]);

  // Check if analysis shows good skin health
  const isHealthySkin = useCallback((result = analysisResult) => {
    if (!result?.skinAnalysis) return false;

    const concerns = result.skinAnalysis.skinConcerns || [];
    const highSeverityConcerns = concerns.filter(c => c.severity > 0.5);
    
    return highSeverityConcerns.length === 0 && result.confidence > 0.7;
  }, [analysisResult]);

  // Get routine suggestions based on analysis
  const getRoutineSuggestions = useCallback(() => {
    if (!analysisResult || !analysisResult.recommendations || !analysisResult.recommendations.routine) {
      return { 
        morning: { title: 'Morning Routine', description: '', steps: [] }, 
        evening: { title: 'Evening Routine', description: '', steps: [] },
        weekly: { title: 'Weekly Treatments', description: '', treatments: [] }
      };
    }
    
    return analysisResult.recommendations.routine;
  }, [analysisResult]);

  return {
    // State
    isAnalyzing,
    analysisResult,
    error,
    history,
    isInitialized,
    
    // Actions
    analyzeImage,
    handleFileSelect,
    triggerFileInput,
    clearResult,
    clearHistory,
    initializeService,
    
    // Computed values
    getAnalysisSummary,
    getRecommendations,
    getSkinConcerns,
    isHealthySkin,
    getRoutineSuggestions,
    
    // Refs
    fileInputRef
  };
};