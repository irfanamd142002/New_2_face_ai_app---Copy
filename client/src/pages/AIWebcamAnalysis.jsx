import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  VideoCameraIcon, 
  StopIcon, 
  CameraIcon,
  SparklesIcon,
  CalendarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import toast from 'react-hot-toast';
import CameraTroubleshoot from '../components/CameraTroubleshoot';
import aiSkinAnalysisService from '../services/aiSkinAnalysisService';

const AIWebcamAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [aiServiceReady, setAiServiceReady] = useState(false);
  const [initializingAI, setInitializingAI] = useState(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  // Initialize AI service on component mount
  useEffect(() => {
    console.log('AIWebcamAnalysis component mounted');
    console.log('User:', user);
    initializeAIService();
    loadAnalysisHistory();
    checkCameraCapabilities(); // Run diagnostic check on mount
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log('Component state changed:', {
      isStreaming,
      isAnalyzing,
      permissionDenied,
      aiServiceReady,
      initializingAI
    });
  }, [isStreaming, isAnalyzing, permissionDenied, aiServiceReady, initializingAI]);

  // Force stop all camera streams
  const forceStopAllCameraStreams = async () => {
    console.log('Attempting to force stop all camera streams...');
    
    try {
      // Stop our own stream first
      if (streamRef.current) {
        console.log('Stopping current stream tracks...');
        streamRef.current.getTracks().forEach(track => {
          console.log(`Stopping track: ${track.kind}, state: ${track.readyState}`);
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Clear video element
      if (videoRef.current) {
        console.log('Clearing video element...');
        videoRef.current.srcObject = null;
        videoRef.current.load(); // Force reload to clear any cached stream
      }
      
      // Reset all states
      setIsStreaming(false);
      setPermissionDenied(false);
      setCurrentAnalysis(null);
      
      // Stop real-time analysis
      stopRealTimeAnalysis();
      
      // Try to get a fresh stream and immediately stop it to force release any locks
      try {
        console.log('Attempting to acquire and release camera to clear locks...');
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach(track => {
          console.log(`Releasing temporary track: ${track.kind}`);
          track.stop();
        });
        console.log('Camera lock cleared successfully');
      } catch (lockError) {
        console.log('Could not acquire temporary stream (expected if camera is locked):', lockError.message);
      }
      
      // Check available devices
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log(`Found ${videoDevices.length} video devices available`);
      }
      
      toast.success('Camera reset completed. Please close any other applications using the camera (Zoom, Teams, Skype) and try again.');
      
    } catch (error) {
      console.error('Error during camera reset:', error);
      toast.error('Camera reset failed. Please manually close other applications using the camera.');
    }
  };

  // Check camera permissions and capabilities
  const checkCameraCapabilities = async () => {
    console.log('=== Camera Capabilities Check ===');
    console.log('User Agent:', navigator.userAgent);
    console.log('Protocol:', location.protocol);
    console.log('Host:', location.host);
    console.log('Secure Context:', window.isSecureContext);
    console.log('MediaDevices supported:', !!navigator.mediaDevices);
    console.log('getUserMedia supported:', !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    
    if (navigator.mediaDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Total devices:', devices.length);
        console.log('Video devices:', videoDevices.length);
        videoDevices.forEach((device, index) => {
          console.log(`Video device ${index + 1}:`, device.label || 'Unknown device');
        });
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    }

    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        console.log('Camera permission state:', result.state);
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    } else {
      console.log('Permissions API not available');
    }
    console.log('=== End Camera Capabilities Check ===');
  };

  const initializeAIService = async () => {
    setInitializingAI(true);
    try {
      await aiSkinAnalysisService.initialize();
      setAiServiceReady(true);
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      toast.error('AI service initialization failed');
    } finally {
      setInitializingAI(false);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      const response = await fetch('/api/analysis/webcam-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data.analyses || []);
      }
    } catch (error) {
      console.error('Failed to load analysis history:', error);
    }
  };

  const startRealTimeAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    
    analysisIntervalRef.current = setInterval(async () => {
      if (videoRef.current && aiServiceReady && videoRef.current.readyState === 4) {
        try {
          const analysis = await aiSkinAnalysisService.analyzeFrame(videoRef.current);
          setRealTimeAnalysis(analysis);
        } catch (error) {
          console.error('Real-time analysis error:', error);
          // Don't show error toast for real-time analysis failures
        }
      }
    }, 2000); // Analyze every 2 seconds
  };

  const stopRealTimeAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  // Complete camera initialization with reset
  const initializeCamera = async () => {
    console.log('=== Starting Complete Camera Initialization ===');
    
    // First, force stop any existing streams
    await forceStopAllCameraStreams();
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Now start fresh
    return startWebcam();
  };

  const startWebcam = async () => {
    console.log('startWebcam function called');
    setPermissionDenied(false);
    setCurrentAnalysis(null);

    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'Camera access is not supported in this browser';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      console.log('Requesting camera access...');
      
      // Try different camera configurations
      const constraints = [
        { video: { facingMode: 'user' } },
        { video: true },
        { video: { width: 640, height: 480 } }
      ];

      let stream = null;
      let lastError = null;

      for (const constraint of constraints) {
        try {
          console.log('Trying constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          break;
        } catch (err) {
          console.log('Constraint failed:', constraint, err.message);
          lastError = err;
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('Failed to access camera with any configuration');
      }

      console.log('Camera access granted, stream:', stream);
      console.log('Video ref current:', videoRef.current);
      
      // Wait for video element to be available with retry mechanism
      let retryCount = 0;
      const maxRetries = 20; // Increased retries
      
      console.log('Checking video element availability...');
      while (!videoRef.current && retryCount < maxRetries) {
        console.log(`Waiting for video element... attempt ${retryCount + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 150));
        retryCount++;
      }
      
      if (!videoRef.current) {
        console.error('Video element not found after retries. DOM state:', {
          videoRefExists: !!videoRef,
          videoRefCurrent: !!videoRef.current,
          documentReady: document.readyState
        });
        throw new Error('Video element not available - please refresh the page and try again');
      }
      
      console.log('Video element found successfully, checking readiness...');
      
      // Ensure video element is ready
      const video = videoRef.current;
      if (!video.paused) {
        video.pause();
      }
      
      // Clear any existing stream
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
      }
      
      console.log('Assigning new stream to video element...');
      video.srcObject = stream;
      streamRef.current = stream;
      
      // Wait for the video to load
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          reject(new Error('Video loading timeout'));
        }, 5000);
        
        const onLoadedMetadata = () => {
          console.log('Video metadata loaded successfully');
          clearTimeout(timeoutId);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = (e) => {
          console.error('Video loading error:', e);
          clearTimeout(timeoutId);
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          reject(new Error(`Video load error: ${e.message || 'Unknown error'}`));
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('error', onError);
        
        // Force video to load
        video.load();
        
        // If metadata is already loaded, resolve immediately
        if (video.readyState >= 1) {
          onLoadedMetadata();
        }
      });
      
      setIsStreaming(true);
      setPermissionDenied(false);
      console.log('Camera started successfully');
      toast.success('Camera started successfully!');
      
      // Start real-time analysis if enabled and AI service is ready
      if (isRealTimeEnabled && aiServiceReady) {
        startRealTimeAnalysis();
      }
    } catch (error) {
      console.error('Camera error:', error);
      setPermissionDenied(true);
      
      let errorMessage = 'Camera access failed';
      let isConflictError = false;
      
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings and refresh the page.';
          break;
        case 'NotFoundError':
          errorMessage = 'No camera found. Please connect a camera and try again.';
          break;
        case 'NotReadableError':
          errorMessage = 'Camera is already in use by another application. Please close other apps using the camera (like Zoom, Teams, Skype) and try again.';
          isConflictError = true;
          break;
        case 'OverconstrainedError':
          errorMessage = 'Camera constraints cannot be satisfied. Your camera may not support the required settings.';
          break;
        case 'SecurityError':
          errorMessage = 'Camera access blocked due to security restrictions. Make sure you\'re using HTTPS.';
          break;
        case 'AbortError':
          errorMessage = 'Camera access was aborted. This may happen if another application is using the camera.';
          isConflictError = true;
          break;
        default:
          if (error.message.includes('in use') || error.message.includes('busy') || error.message.includes('conflict')) {
            errorMessage = `Camera conflict detected: ${error.message}. Please close other applications using the camera.`;
            isConflictError = true;
          } else {
            errorMessage = `Camera error: ${error.message}`;
          }
      }
      
      toast.error(errorMessage);
      
      // If it's a conflict error, suggest using the force stop function
      if (isConflictError) {
        setTimeout(() => {
          toast.info('Try using the "Force Stop Camera" button below if the issue persists.');
        }, 2000);
      }
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    toast.success('Camera stopped');
  };

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const handleCapture = async () => {
    if (!aiServiceReady) {
      toast.error('AI service not ready. Please wait...');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Use AI service for capture and analysis
      const result = await aiSkinAnalysisService.captureAndAnalyze(videoRef.current);
      
      if (!result.success) {
        toast.error(result.error || 'Analysis failed');
        return;
      }
      
      setCapturedImage(result.imageDataUrl);
      
      // Perform full analysis with backend
      await performAnalysis(result.imageDataUrl, result);
      
    } catch (error) {
      console.error('Capture error:', error);
      toast.error('Failed to capture and analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performAnalysis = async (imageDataUrl, aiResults = null) => {
    if (!imageDataUrl) {
      toast.error('No image to analyze');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'webcam-capture.jpg');
      formData.append('analysisType', 'webcam_ai');
      formData.append('timestamp', new Date().toISOString());
      
      // Include AI analysis results if available
      if (aiResults) {
        formData.append('aiAnalysis', JSON.stringify({
          faceDetected: aiResults.faceDetected,
          confidence: aiResults.confidence,
          faceBox: aiResults.faceBox,
          skinMetrics: aiResults.skinMetrics,
          timestamp: aiResults.timestamp
        }));
      }

      // Send to backend for analysis
      const analysisResponse = await fetch('/api/analysis/webcam-ai', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const analysisData = await analysisResponse.json();

      if (analysisResponse.ok) {
        setAnalysisResult(analysisData);
        setCurrentAnalysis(analysisData);
        await loadAnalysisHistory(); // Refresh history
        toast.success('Analysis completed successfully!');
      } else {
        throw new Error(analysisData.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const compareWithPrevious = () => {
    if (analysisHistory.length === 0) {
      toast.error('No previous analysis found for comparison');
      return;
    }

    const previousAnalysis = analysisHistory[0]; // Most recent previous analysis
    const current = currentAnalysis;

    if (!current) {
      toast.error('No current analysis to compare');
      return;
    }

    // Calculate improvements/changes
    const comparison = {
      skinHealth: {
        previous: previousAnalysis.skinHealth || 0,
        current: current.skinHealth || 0,
        change: (current.skinHealth || 0) - (previousAnalysis.skinHealth || 0)
      },
      acneScore: {
        previous: previousAnalysis.acneScore || 0,
        current: current.acneScore || 0,
        change: (previousAnalysis.acneScore || 0) - (current.acneScore || 0) // Lower is better for acne
      },
      wrinkleScore: {
        previous: previousAnalysis.wrinkleScore || 0,
        current: current.wrinkleScore || 0,
        change: (previousAnalysis.wrinkleScore || 0) - (current.wrinkleScore || 0) // Lower is better for wrinkles
      },
      daysBetween: Math.floor((new Date(current.createdAt) - new Date(previousAnalysis.createdAt)) / (1000 * 60 * 60 * 24))
    };

    setAnalysisResult({
      ...current,
      comparison
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
      aiSkinAnalysisService.dispose();
    };
  }, []);

  // Real-time analysis effect
  useEffect(() => {
    if (isRealTimeEnabled && isStreaming && aiServiceReady && videoRef.current) {
      startRealTimeAnalysis();
    } else {
      stopRealTimeAnalysis();
    }
    
    return () => stopRealTimeAnalysis();
  }, [isRealTimeEnabled, isStreaming, aiServiceReady]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="sm"
            className="mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">AI Webcam Analysis</h1>
          <p className="text-gray-600 mt-2">
            Real-time AI skin analysis with historical tracking and comparison
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Area */}
          <div className="lg:col-span-2">
            {/* Camera Section */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Camera Feed</h3>
                
                <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                  {/* Always render video element to ensure ref is available */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
                    onLoadedMetadata={() => console.log('Video metadata loaded')}
                    onError={(e) => console.error('Video error:', e)}
                    onCanPlay={() => console.log('Video can play')}
                  />
                  
                  {permissionDenied && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center max-w-md mx-auto px-4">
                        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                        <p className="text-lg mb-2">Camera Access Issue</p>
                        <p className="text-sm text-gray-300 mb-4">
                          Camera may be in use by another application (Zoom, Teams, Skype) or permission was denied.
                        </p>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={initializeCamera} 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Reset & Try Camera
                          </Button>
                          <Button onClick={() => window.location.reload()} size="sm">
                            Refresh Page
                          </Button>
                          <Button 
                            onClick={forceStopAllCameraStreams} 
                            variant="outline" 
                            size="sm"
                            className="text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            Force Stop Camera
                          </Button>
                          <Button 
                            onClick={() => setShowTroubleshoot(true)} 
                            variant="outline" 
                            size="sm"
                            className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black"
                          >
                            Get Help
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {!isStreaming && !permissionDenied && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <div className="text-center">
                        <VideoCameraIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg mb-4">Camera Not Started</p>
                        <Button onClick={() => {
                          console.log('Start Camera button clicked');
                          initializeCamera();
                        }}>
                          <VideoCameraIcon className="w-4 h-4 mr-2" />
                          Start Camera
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {!isStreaming ? (
                    <Button onClick={() => {
                      console.log('Start Camera button (controls) clicked');
                      initializeCamera();
                    }} className="flex-1" disabled={initializingAI}>
                      <VideoCameraIcon className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopWebcam} variant="outline" className="flex-1">
                        <StopIcon className="w-4 h-4 mr-2" />
                        Stop Camera
                      </Button>
                      <Button 
                        onClick={handleCapture} 
                        disabled={isAnalyzing || !aiServiceReady}
                        className="flex-1"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <CameraIcon className="w-4 h-4 mr-2" />
                            Capture & Analyze
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                        variant={isRealTimeEnabled ? "primary" : "outline"}
                        disabled={!aiServiceReady}
                        className="flex-1"
                      >
                        {isRealTimeEnabled ? (
                          <>
                            <EyeSlashIcon className="w-4 h-4 mr-2" />
                            Stop Real-time
                          </>
                        ) : (
                          <>
                            <EyeIcon className="w-4 h-4 mr-2" />
                            Real-time Analysis
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {/* AI Service Status */}
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        aiServiceReady ? 'bg-green-500' : initializingAI ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium">AI Service:</span>
                      <span className={
                        aiServiceReady ? 'text-green-600' : initializingAI ? 'text-yellow-600' : 'text-red-600'
                      }>
                        {aiServiceReady ? 'Ready' : initializingAI ? 'Initializing...' : 'Not Ready'}
                      </span>
                      {isRealTimeEnabled && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-blue-600">Real-time Analysis Active</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={checkCameraCapabilities} 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                      >
                        Run Diagnostics
                      </Button>
                      <Button 
                        onClick={forceStopAllCameraStreams} 
                        variant="outline" 
                        size="sm"
                        className="text-xs text-red-600 border-red-300 hover:bg-red-50"
                      >
                        Force Stop Camera
                      </Button>
                    </div>
                  </div>
                  {realTimeAnalysis && (
                    <div className="mt-2 text-xs text-gray-600">
                      Last real-time scan: {realTimeAnalysis.confidence ? `${(realTimeAnalysis.confidence * 100).toFixed(1)}% confidence` : 'Processing...'}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Analysis Results</h3>
                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                  </div>

                  {capturedImage && (
                    <div className="mb-6">
                      <img
                        src={capturedImage}
                        alt="Captured for analysis"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.skinHealth || 'N/A'}%
                      </div>
                      <div className="text-sm text-gray-600">Skin Health Score</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.acneScore || 'N/A'}%
                      </div>
                      <div className="text-sm text-gray-600">Acne Score</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.wrinkleScore || 'N/A'}%
                      </div>
                      <div className="text-sm text-gray-600">Wrinkle Score</div>
                    </div>
                  </div>

                  {/* Real-time Analysis Display */}
                   {realTimeAnalysis && isRealTimeEnabled && (
                     <div className="border-t pt-4 mb-4">
                       <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                         <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                         Real-time Analysis
                       </h4>
                       
                       {realTimeAnalysis.success ? (
                         <>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                             <div className="text-center p-3 bg-blue-50 rounded-lg">
                               <div className="text-lg font-bold text-blue-600">
                                 {realTimeAnalysis.skinMetrics?.overallHealth ? 
                                   `${realTimeAnalysis.skinMetrics.overallHealth.toFixed(0)}%` : 'N/A'}
                               </div>
                               <div className="text-xs text-gray-600">Overall Health</div>
                             </div>
                             <div className="text-center p-3 bg-green-50 rounded-lg">
                               <div className="text-lg font-bold text-green-600">
                                 {realTimeAnalysis.faceDetected ? 'Detected' : 'No Face'}
                               </div>
                               <div className="text-xs text-gray-600">Face Detection</div>
                             </div>
                             <div className="text-center p-3 bg-purple-50 rounded-lg">
                               <div className="text-lg font-bold text-purple-600">
                                 {realTimeAnalysis.confidence ? `${(realTimeAnalysis.confidence * 100).toFixed(0)}%` : 'N/A'}
                               </div>
                               <div className="text-xs text-gray-600">Confidence</div>
                             </div>
                           </div>
                           
                           {realTimeAnalysis.skinMetrics && (
                             <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                               <div className="bg-orange-50 p-2 rounded text-center">
                                 <div className="font-semibold text-orange-600">
                                   {realTimeAnalysis.skinMetrics.oiliness?.toFixed(0) || 'N/A'}%
                                 </div>
                                 <div className="text-xs text-gray-600">Oiliness</div>
                               </div>
                               <div className="bg-blue-50 p-2 rounded text-center">
                                 <div className="font-semibold text-blue-600">
                                   {realTimeAnalysis.skinMetrics.dryness?.toFixed(0) || 'N/A'}%
                                 </div>
                                 <div className="text-xs text-gray-600">Dryness</div>
                               </div>
                               <div className="bg-red-50 p-2 rounded text-center">
                                 <div className="font-semibold text-red-600">
                                   {realTimeAnalysis.skinMetrics.acneLevel?.toFixed(0) || 'N/A'}%
                                 </div>
                                 <div className="text-xs text-gray-600">Acne</div>
                               </div>
                               <div className="bg-yellow-50 p-2 rounded text-center">
                                 <div className="font-semibold text-yellow-600">
                                   {realTimeAnalysis.skinMetrics.pigmentationLevel?.toFixed(0) || 'N/A'}%
                                 </div>
                                 <div className="text-xs text-gray-600">Pigmentation</div>
                               </div>
                               <div className="bg-gray-50 p-2 rounded text-center">
                                 <div className="font-semibold text-gray-600">
                                   {realTimeAnalysis.skinMetrics.wrinkleLevel?.toFixed(0) || 'N/A'}%
                                 </div>
                                 <div className="text-xs text-gray-600">Wrinkles</div>
                               </div>
                             </div>
                           )}
                         </>
                       ) : (
                         <div className="text-center p-4 bg-yellow-50 rounded-lg">
                           <div className="text-yellow-600 font-medium">
                             {realTimeAnalysis.error || 'Analyzing...'}
                           </div>
                         </div>
                       )}
                     </div>
                   )}

                  {analysisResult.comparison && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Comparison with Previous Analysis ({analysisResult.comparison.daysBetween} days ago)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${analysisResult.comparison.skinHealth.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysisResult.comparison.skinHealth.change >= 0 ? '+' : ''}{analysisResult.comparison.skinHealth.change.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Skin Health Change</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${analysisResult.comparison.acneScore.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysisResult.comparison.acneScore.change >= 0 ? '+' : ''}{analysisResult.comparison.acneScore.change.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Acne Improvement</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${analysisResult.comparison.wrinkleScore.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysisResult.comparison.wrinkleScore.change >= 0 ? '+' : ''}{analysisResult.comparison.wrinkleScore.change.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Wrinkle Improvement</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysisHistory.length > 0 && !analysisResult.comparison && (
                    <div className="border-t pt-4">
                      <Button onClick={compareWithPrevious} variant="outline" size="sm">
                        <ChartBarIcon className="w-4 h-4 mr-2" />
                        Compare with Previous
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Analysis History */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis History</h3>
                
                {analysisHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No previous analyses</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Start your first analysis to begin tracking
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analysisHistory.slice(0, 5).map((analysis, index) => (
                      <div key={analysis._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Analysis #{analysisHistory.length - index}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(analysis.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="font-semibold text-blue-600">
                              {analysis.skinHealth || 'N/A'}%
                            </div>
                            <div className="text-gray-500">Health</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-green-600">
                              {analysis.acneScore || 'N/A'}%
                            </div>
                            <div className="text-gray-500">Acne</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-purple-600">
                              {analysis.wrinkleScore || 'N/A'}%
                            </div>
                            <div className="text-gray-500">Wrinkles</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {analysisHistory.length > 5 && (
                      <Button variant="ghost" size="sm" className="w-full">
                        View All History
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Camera Troubleshoot Modal */}
        {showTroubleshoot && (
          <CameraTroubleshoot onClose={() => setShowTroubleshoot(false)} />
        )}
      </div>
    </div>
  );
};

export default AIWebcamAnalysis;