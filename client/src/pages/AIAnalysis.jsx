import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, CameraOff, Play, Square, RotateCcw, ShoppingBag, 
  Sparkles, CheckCircle, AlertCircle, Loader2, 
  Eye, Brain, Zap, Target, Activity, Crosshair, 
  Gem, Timer, Feather, EyeOff, User, UserCheck, UserX
} from 'lucide-react';
import toast from 'react-hot-toast';
import zeshtoDataService from '../services/zeshtoDataService';
import faceDetectionService from '../services/faceDetectionService';
import Header from '../components/Header';
import Disclaimer from '../components/common/Disclaimer';

const AIAnalysis = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsSectionRef = useRef(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  // Face detection states
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceConfidence, setFaceConfidence] = useState(0);
  const [faceQuality, setFaceQuality] = useState(0);
  const [isInitializingFaceDetection, setIsInitializingFaceDetection] = useState(false);
  
  // Enhanced UX states
  const [showAnalysisPrompt, setShowAnalysisPrompt] = useState(false);
  const [isReadyForAnalysis, setIsReadyForAnalysis] = useState(false);
  
  // Debugging states
  const [webcamDebugInfo, setWebcamDebugInfo] = useState('');

  // Monitor face detection status for analysis readiness
  useEffect(() => {
    const isReady = faceDetected && faceConfidence >= 0.7 && faceQuality >= 0.6;
    setIsReadyForAnalysis(isReady);
    
    // Show analysis prompt when face is first detected and ready
    if (isReady && !showAnalysisPrompt && isWebcamActive && !analysisResult) {
      setShowAnalysisPrompt(true);
      
      // Gentle notification to encourage analysis
      toast.success('✨ Perfect! Your face is detected. Ready to analyze your skin?', {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '500'
        },
        icon: '🎯'
      });
    }
    
    // Hide prompt if face is no longer ready
    if (!isReady && showAnalysisPrompt) {
      setShowAnalysisPrompt(false);
    }
  }, [faceDetected, faceConfidence, faceQuality, isWebcamActive, analysisResult, showAnalysisPrompt]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      if (isWebcamActive) {
        stopWebcam();
      }
      faceDetectionService.dispose();
    };
  }, []);

  // Start webcam with face detection
  const startWebcam = async () => {
    try {
      console.log('Starting webcam initialization...');
      setIsInitializingFaceDetection(true);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }
      
      console.log('Requesting webcam access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      console.log('Webcam stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to load and play
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded, starting playback...');
          
          try {
            await videoRef.current.play();
            console.log('Video playback started successfully');
            
            setIsWebcamActive(true);
            
            toast.success('Webcam activated successfully!', {
              style: {
                background: '#F0FDF4',
                color: '#16A34A',
                border: '1px solid #BBF7D0'
              }
            });
            
            // Initialize face detection after webcam is working
            setTimeout(async () => {
              try {
                console.log('Initializing face detection...');
                const initialized = await faceDetectionService.initialize();
                if (!initialized) {
                  throw new Error('Failed to initialize face detection model');
                }
                
                // Start face detection with unified callback
                await faceDetectionService.startDetection(
                  videoRef.current,
                  (detectionResult) => {
                    // Update face detection state
                    setFaceDetected(detectionResult.faceDetected);
                    setFaceConfidence(detectionResult.confidence);
                    setFaceQuality(detectionResult.quality);
                    
                    // Log detection results for debugging
                    if (detectionResult.faceDetected) {
                      console.log(`Face detected - Confidence: ${(detectionResult.confidence * 100).toFixed(1)}%, Quality: ${(detectionResult.quality * 100).toFixed(1)}%`);
                    }
                  }
                );
                
                setIsInitializingFaceDetection(false);
                
                toast.success('Face detection activated!', {
                  style: {
                    background: '#F0FDF4',
                    color: '#16A34A',
                    border: '1px solid #BBF7D0'
                  }
                });
              } catch (faceDetectionError) {
                console.error('Face detection initialization failed:', faceDetectionError);
                setIsInitializingFaceDetection(false);
                
                toast.warning('Webcam working, but face detection unavailable', {
                  style: {
                    background: '#FFFBEB',
                    color: '#D97706',
                    border: '1px solid #FED7AA'
                  }
                });
              }
            }, 1000); // Wait 1 second for video to stabilize
            
          } catch (playError) {
            console.error('Video play failed:', playError);
            setIsWebcamActive(true); // Still mark as active even if autoplay fails
            setIsInitializingFaceDetection(false);
            
            toast.warning('Webcam activated (click video to start)', {
              style: {
                background: '#FFFBEB',
                color: '#D97706',
                border: '1px solid #FED7AA'
              }
            });
          }
        };
        
        // Handle video errors
        videoRef.current.onerror = (error) => {
          console.error('Video element error:', error);
          setIsInitializingFaceDetection(false);
          toast.error('Video playback error', {
            style: {
              background: '#FEF2F2',
              color: '#DC2626',
              border: '1px solid #FECACA'
            }
          });
        };
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setIsInitializingFaceDetection(false);
      
      let errorMessage = 'Unable to access webcam. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      
      toast.error(errorMessage, {
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA'
        },
        duration: 5000
      });
    }
  };

  // Stop webcam and face detection
  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsWebcamActive(false);
      
      // Stop face detection
      faceDetectionService.stopDetection();
      
      // Reset face detection states
      setFaceDetected(false);
      setFaceConfidence(0);
      setFaceQuality(0);
      setIsInitializingFaceDetection(false);
      
      toast.success('Webcam and face detection stopped');
    }
  };

  // Test webcam access
  const testWebcam = async () => {
    try {
      setWebcamDebugInfo('Testing webcam access...');
      
      // Check browser support
      if (!navigator.mediaDevices) {
        setWebcamDebugInfo('❌ navigator.mediaDevices not supported');
        return;
      }
      
      if (!navigator.mediaDevices.getUserMedia) {
        setWebcamDebugInfo('❌ getUserMedia not supported');
        return;
      }
      
      setWebcamDebugInfo('✅ Browser supports webcam API');
      
      // Test basic webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setWebcamDebugInfo('✅ Webcam access granted');
      
      // Test video constraints
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const settings = tracks[0].getSettings();
        setWebcamDebugInfo(`✅ Video track: ${settings.width}x${settings.height}`);
      }
      
      // Clean up test stream
      stream.getTracks().forEach(track => track.stop());
      
      toast.success('Webcam test successful!');
    } catch (error) {
      console.error('Webcam test failed:', error);
      setWebcamDebugInfo(`❌ Error: ${error.name} - ${error.message}`);
      toast.error(`Webcam test failed: ${error.name}`);
    }
  };

  // Capture image from webcam
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageData);
      
      toast.success('Image captured successfully!');
      return imageData;
    }
    return null;
  };

  // Simulate AI skin analysis (in real implementation, this would use actual AI models)
  // const performAIAnalysis = async () => {
  //   if (!isWebcamActive) {
  //     toast.error('Please start the webcam first');
  //     return;
  //   }

  //   // Check if face is detected with sufficient quality
  //   if (!faceDetected) {
  //     toast.error('No face detected! Please position your face in front of the camera.', {
  //       style: {
  //         background: '#FEF2F2',
  //         color: '#DC2626',
  //         border: '1px solid #FECACA'
  //       }
  //     });
  //     return;
  //   }

  //   if (faceConfidence < 0.7) {
  //     toast.error(`Face detection confidence too low (${(faceConfidence * 100).toFixed(1)}%). Please ensure good lighting and clear face visibility.`, {
  //       style: {
  //         background: '#FEF2F2',
  //         color: '#DC2626',
  //         border: '1px solid #FECACA'
  //       }
  //     });
  //     return;
  //   }

  //   if (faceQuality < 0.6) {
  //     toast.error('Face quality insufficient for analysis. Please position your face properly and ensure good lighting.', {
  //       style: {
  //         background: '#FEF2F2',
  //         color: '#DC2626',
  //         border: '1px solid #FECACA'
  //       }
  //     });
  //     return;
  //   }

  //   setIsAnalyzing(true);
  //   setShowAnalysisPrompt(false); // Hide the prompt when analysis starts
    
  //   // Capture image for analysis
  //   const imageData = captureImage();
  //   if (!imageData) {
  //     setIsAnalyzing(false);
  //     return;
  //   }

  //   try {
  //     // Simulate AI processing time
  //     await new Promise(resolve => setTimeout(resolve, 3000));
      
  //     // Simulate AI analysis results (in real implementation, this would be actual AI detection)
  //     const mockAnalysisResults = [
  //       { skinType: 'oily', skinIssue: 'acne_pimple', confidence: 0.92 },
  //       { skinType: 'dry', skinIssue: 'dullness', confidence: 0.88 },
  //       { skinType: 'combination', skinIssue: 'dark_spots_marks', confidence: 0.85 },
  //       { skinType: 'sensitive', skinIssue: 'sensitivity', confidence: 0.90 },
  //       { skinType: 'normal', skinIssue: 'under_eye_circles', confidence: 0.87 }
  //     ];
      
  //     // Randomly select one result for demo
  //     const randomResult = mockAnalysisResults[Math.floor(Math.random() * mockAnalysisResults.length)];
      
  //     setAnalysisResult({
  //       skinType: randomResult.skinType,
  //       skinIssue: randomResult.skinIssue,
  //       confidence: randomResult.confidence,
  //       detectedFeatures: [
  //         'Face detected successfully',
  //         'Skin texture analyzed',
  //         'Color tone evaluated',
  //         'Pore visibility assessed'
  //       ]
  //     });

  //     // Get recommendation based on AI analysis
  //     const rec = zeshtoDataService.getRecommendation(randomResult.skinType, randomResult.skinIssue);
  //     setRecommendation(rec);

  //     setIsAnalyzing(false);
      
  //     // Automatically stop webcam after successful analysis
  //     stopWebcam();
      
  //     // Smooth scroll to results section after a brief delay
  //     setTimeout(() => {
  //       resultsSectionRef.current?.scrollIntoView({
  //         behavior: 'smooth',
  //         block: 'start'
  //       });
  //     }, 500);
      
  //     toast.success('AI Analysis completed successfully! Webcam stopped.', {
  //       style: {
  //         background: '#F0FDF4',
  //         color: '#16A34A',
  //         border: '1px solid #BBF7D0'
  //       }
  //     });

  //   } catch (error) {
  //     console.error('Analysis error:', error);
  //     setIsAnalyzing(false);
  //     toast.error('Analysis failed. Please try again.');
  //   }
  // };

  const performAIAnalysis = async () => {
  if (!isWebcamActive) {
    toast.error('Please start the webcam first');
    return;
  }

  if (!faceDetected) {
    toast.error('No face detected! Please position your face in front of the camera.');
    return;
  }

  if (faceConfidence < 0.7) {
    toast.error(`Face detection confidence too low (${(faceConfidence * 100).toFixed(1)}%).`);
    return;
  }

  if (faceQuality < 0.6) {
    toast.error('Face quality insufficient for analysis.');
    return;
  }

  setIsAnalyzing(true);
  setShowAnalysisPrompt(false);

  const imageData = captureImage();
  if (!imageData) {
    setIsAnalyzing(false);
    toast.error('Failed to capture image');
    return;
  }

  try {
    const blob = await fetch(imageData).then(res => res.blob());

    const formData = new FormData();
    formData.append('image', blob, 'face.jpg');

    const response = await fetch(import.meta.env.VITE_BACKEND_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const data = await response.json();

    if (
      typeof data.skinType !== 'string' ||
      typeof data.skinIssue !== 'string' ||
      typeof data.confidence !== 'number'
    ) {
      throw new Error('Invalid AI response');
    }

    let skinIssue = data.skinIssue;
    let confidence = data.confidence;

    if (skinIssue === 'none' && confidence < 0.8) {
      skinIssue = 'dullness';
      confidence = 0.6;
    }

    setAnalysisResult({
      skinType: data.skinType,
      skinIssue,
      confidence,
      detectedFeatures: data.detectedFeatures || []
    });

    const rec = zeshtoDataService.getRecommendation(
      data.skinType,
      skinIssue
    );
    setRecommendation(rec);

    stopWebcam();

    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 500);

    toast.success('AI Analysis completed successfully!');

  } catch (error) {
    console.error('Analysis error:', error);
    toast.error('AI analysis failed. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};



  // Handle Go to Product
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

  // Reset analysis
  const resetAnalysis = () => {
    setAnalysisResult(null);
    setRecommendation(null);
    setCapturedImage(null);
    toast.success('Analysis reset successfully');
  };

  // Get skin concern icon
  const getSkinConcernIcon = (concern) => {
    const iconMap = {
      'acne_pimple': Zap,
      'dark_spots_marks': Target,
      'acne_scars': Activity,
      'pigmentation': Crosshair,
      'dullness': Gem,
      'wrinkles': Timer,
      'sensitivity': Feather,
      'under_eye_circles': EyeOff
    };
    return iconMap[concern] || AlertCircle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header currentPage="ai" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-700 bg-clip-text text-transparent mb-4">
            AI Skin Analysis
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Advanced AI-powered skin analysis using your webcam for personalized Zeshto soap recommendations
          </p>
        </div>



        {/* Webcam Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Webcam Analysis</h3>
              <p className="text-gray-600">Position your face in the camera for AI skin analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Webcam Preview */}
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover cursor-pointer"
                  style={{ transform: 'scaleX(-1)' }} // Mirror effect
                  onClick={() => {
                    if (videoRef.current && videoRef.current.paused) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                />
                {!isWebcamActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Webcam Preview</p>
                      <p className="text-sm opacity-75">Click "Start Webcam" to begin</p>
                    </div>
                  </div>
                )}
                
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin" />
                      <p className="text-lg font-semibold">Analyzing your skin...</p>
                      <p className="text-sm opacity-75">Please hold still</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Webcam Controls */}
              <div className="flex gap-3 justify-center flex-wrap">
                {!isWebcamActive ? (
                  <>
                    <button
                      onClick={startWebcam}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      <Camera className="h-5 w-5" />
                      Start Webcam
                    </button>
                    
                    <button
                      onClick={testWebcam}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      <Activity className="h-5 w-5" />
                      Test Webcam
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={stopWebcam}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      <CameraOff className="h-5 w-5" />
                      Stop Webcam
                    </button>
                    
                    <button
                      onClick={performAIAnalysis}
                      disabled={isAnalyzing || !isReadyForAnalysis}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transform transition-all duration-300 shadow-lg relative overflow-hidden ${
                        isAnalyzing 
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                          : isReadyForAnalysis
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 hover:scale-105 animate-pulse'
                            : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {/* Animated background for ready state */}
                      {isReadyForAnalysis && !isAnalyzing && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
                      )}
                      
                      {isAnalyzing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isReadyForAnalysis ? (
                        <Sparkles className="h-5 w-5 animate-bounce" />
                      ) : (
                        <Brain className="h-5 w-5" />
                      )}
                      
                      {isAnalyzing 
                        ? 'Analyzing Your Skin...' 
                        : isReadyForAnalysis 
                          ? '✨ Analyze My Skin Now!' 
                          : 'Position Face to Analyze'
                      }
                    </button>
                  </>
                )}
              </div>

              {/* Webcam Debug Info */}
              {webcamDebugInfo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Webcam Diagnostics
                  </h4>
                  <p className="text-sm text-blue-700 font-mono">{webcamDebugInfo}</p>
                </div>
              )}

              {/* Face Detection Status */}
              {isWebcamActive && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-blue-600" />
                      Face Detection Status
                    </h4>
                    {isInitializingFaceDetection && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {/* Face Detection Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Face Detected:</span>
                      <div className="flex items-center">
                        {faceDetected ? (
                          <>
                            <UserCheck className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-sm font-medium text-green-600">Yes</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-red-600 mr-1" />
                            <span className="text-sm font-medium text-red-600">No</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Face Confidence */}
                    {faceDetected && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                faceConfidence >= 0.8 ? 'bg-green-500' : 
                                faceConfidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${faceConfidence * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${
                            faceConfidence >= 0.8 ? 'text-green-600' : 
                            faceConfidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(faceConfidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Face Quality */}
                    {faceDetected && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quality:</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                faceQuality >= 0.8 ? 'bg-green-500' : 
                                faceQuality >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${faceQuality * 100}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${
                            faceQuality >= 0.8 ? 'text-green-600' : 
                            faceQuality >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(faceQuality * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Analysis Ready Status */}
                    <div className="mt-3 p-2 rounded-lg border-l-4 border-l-blue-500 bg-blue-50">
                      <div className="flex items-center">
                        {faceDetected && faceConfidence >= 0.7 && faceQuality >= 0.6 ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-green-700">Ready for analysis</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                            <span className="text-sm font-medium text-orange-700">
                              {!faceDetected ? 'Position your face in front of camera' :
                               faceConfidence < 0.7 ? 'Improve lighting for better detection' :
                               'Ensure clear face visibility'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Prompt Card */}
              {showAnalysisPrompt && isReadyForAnalysis && !analysisResult && (
                <div className="mt-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-emerald-200 shadow-lg animate-fadeIn">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="relative">
                        <Sparkles className="h-8 w-8 text-emerald-600 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-lg font-bold text-emerald-800">Perfect Detection! 🎯</h4>
                        <p className="text-sm text-emerald-600">Your face is clearly visible and ready for analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAnalysisPrompt(false)}
                      className="text-emerald-400 hover:text-emerald-600 transition-colors"
                    >
                      <UserX className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="bg-white/70 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-emerald-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>Face Confidence: {Math.round(faceConfidence * 100)}%</span>
                      </div>
                      <div className="flex items-center text-emerald-700">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>Image Quality: {Math.round(faceQuality * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-emerald-700 mb-3 font-medium">
                      🌟 Great! Click the button below to start your personalized skin analysis
                    </p>
                    <div className="flex items-center justify-center text-xs text-emerald-600 bg-emerald-100 rounded-lg p-2">
                      <Target className="h-3 w-3 mr-1" />
                      <span>AI will analyze your skin type, concerns, and provide personalized recommendations</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            <div ref={resultsSectionRef} className="space-y-6">
              {analysisResult ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <h4 className="text-xl font-bold text-gray-800">Analysis Complete</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-600 mr-3" />
                        <span className="font-semibold">Skin Type:</span>
                      </div>
                      <span className="text-blue-600 font-bold capitalize">{analysisResult.skinType}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center">
                        {React.createElement(getSkinConcernIcon(analysisResult.skinIssue), {
                          className: "h-5 w-5 text-purple-600 mr-3"
                        })}
                        <span className="font-semibold">Main Concern:</span>
                      </div>
                      <span className="text-purple-600 font-bold">
                        {zeshtoDataService.formatSkinIssue(analysisResult.skinIssue)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <div className="flex items-center">
                        <Eye className="h-5 w-5 text-green-600 mr-3" />
                        <span className="font-semibold">Confidence:</span>
                      </div>
                      <span className="text-green-600 font-bold">{(analysisResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-white rounded-xl">
                    <h5 className="font-semibold text-gray-800 mb-2">Detected Features:</h5>
                    <ul className="space-y-1">
                      {analysisResult.detectedFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200 text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Ready for Analysis</h4>
                  <p className="text-gray-500">Start your webcam and click "Analyze Skin" to begin AI analysis</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={resetAnalysis}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-slate-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <RotateCcw className="h-5 w-5" />
              Reset
            </button>
          </div>
        </div>

        {/* Recommendation Section */}
        {recommendation && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl mr-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Your AI-Powered Recommendation</h3>
                <p className="text-gray-600">Based on advanced facial analysis technology</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border border-emerald-200">
                <h4 className="font-bold text-emerald-800 mb-2 text-lg">Detected Skin Issue</h4>
                <p className="text-emerald-700 text-lg">{recommendation.skinIssue}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 text-lg">Analyzed Skin Type</h4>
                <p className="text-blue-700 text-lg">{recommendation.skinDetail}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 mb-6">
              <h4 className="font-bold text-purple-800 mb-3 text-lg">AI Recommended Zeshto Soap</h4>
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

            {recommendation.usageNotes && (
              <div className="bg-gradient-to-r from-cyan-50 to-sky-50 p-6 rounded-2xl border border-cyan-200 mb-6">
                <h4 className="font-bold text-cyan-800 mb-3 text-lg">AI Usage Recommendations</h4>
                <p className="text-cyan-700 leading-relaxed text-lg">{recommendation.usageNotes}</p>
              </div>
            )}

            <button
              onClick={handleGoToProduct}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 transition-all duration-300 font-bold text-lg flex items-center justify-center transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Go to Product
            </button>
          </div>
        )}

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* AI Analysis Guidelines - Moved to bottom */}
        <div className="mt-12 mb-8">
          <Disclaimer type="aiAccuracy" className="max-w-4xl mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;