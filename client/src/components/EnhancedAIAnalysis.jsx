import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Zap, Brain, Eye, Sparkles, Download, Share2, Settings } from 'lucide-react';
import { enhancedAiSkinAnalysisService } from '../services/enhancedAiSkinAnalysisService';
import { webRTCCameraService } from '../services/webRTCCameraService';

/**
 * Enhanced AI Analysis Component
 * Integrates MediaPipe Face Mesh, TensorFlow.js, OpenCV.js, WebRTC, and Web Workers
 */
const EnhancedAIAnalysis = () => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('realtime'); // 'realtime' | 'snapshot'
  const [qualitySettings, setQualitySettings] = useState({
    resolution: 'hd',
    frameRate: 30,
    enableHDR: false
  });
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const workerRef = useRef(null);
  const analysisIntervalRef = useRef(null);

  /**
   * Initialize all AI services and camera
   */
  const initializeServices = useCallback(async () => {
    try {
      setProgress(10);
      setError(null);

      // Initialize Web Worker
      workerRef.current = new Worker('/src/workers/skinAnalysisWorker.js');
      workerRef.current.onmessage = handleWorkerMessage;
      
      setProgress(25);

      // Initialize AI services
      await enhancedAiSkinAnalysisService.initialize((progress) => {
        setProgress(25 + (progress * 0.5));
      });

      setProgress(75);

      // Initialize WebRTC camera service
      await webRTCCameraService.initialize();
      
      // Get available camera devices
      const devices = await webRTCCameraService.getAvailableDevices();
      setAvailableDevices(devices);
      
      if (devices.length > 0) {
        setSelectedDevice(devices[0].deviceId);
      }

      setProgress(100);
      setIsInitialized(true);
      
    } catch (error) {
      console.error('Failed to initialize services:', error);
      setError(`Initialization failed: ${error.message}`);
    }
  }, []);

  /**
   * Handle messages from Web Worker
   */
  const handleWorkerMessage = useCallback((event) => {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'ANALYSIS_COMPLETE':
        setAnalysisResults(payload);
        setIsAnalyzing(false);
        
        // Add to history
        setAnalysisHistory(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          results: payload
        }, ...prev.slice(0, 9)]); // Keep last 10 analyses
        break;
        
      case 'ANALYSIS_PROGRESS':
        setProgress(payload.progress);
        break;
        
      case 'ANALYSIS_ERROR':
        setError(payload.error);
        setIsAnalyzing(false);
        break;
        
      case 'WORKER_READY':
        console.log('Worker initialized successfully');
        break;
        
      default:
        console.warn('Unknown worker message type:', type);
    }
  }, []);

  /**
   * Start camera stream
   */
  const startCamera = useCallback(async () => {
    try {
      if (!selectedDevice) return;
      
      const constraints = {
        video: {
          deviceId: selectedDevice,
          width: qualitySettings.resolution === 'hd' ? 1280 : 640,
          height: qualitySettings.resolution === 'hd' ? 720 : 480,
          frameRate: qualitySettings.frameRate
        }
      };

      const stream = await webRTCCameraService.startStream(constraints);
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start real-time analysis if enabled
      if (analysisMode === 'realtime') {
        startRealtimeAnalysis();
      }
      
    } catch (error) {
      console.error('Failed to start camera:', error);
      setError(`Camera error: ${error.message}`);
    }
  }, [selectedDevice, qualitySettings, analysisMode]);

  /**
   * Stop camera stream
   */
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      webRTCCameraService.stopStream();
      setCameraStream(null);
    }
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, [cameraStream]);

  /**
   * Start real-time analysis
   */
  const startRealtimeAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    analysisIntervalRef.current = setInterval(() => {
      if (!isAnalyzing && videoRef.current && canvasRef.current) {
        captureAndAnalyze();
      }
    }, 2000); // Analyze every 2 seconds
  }, [isAnalyzing]);

  /**
   * Capture frame and analyze
   */
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !workerRef.current) return;
    
    try {
      setIsAnalyzing(true);
      setProgress(0);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Send to worker for analysis
      workerRef.current.postMessage({
        type: 'ANALYZE_SKIN',
        payload: {
          imageData: imageData,
          width: canvas.width,
          height: canvas.height,
          timestamp: Date.now()
        }
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(`Analysis failed: ${error.message}`);
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Take snapshot and analyze
   */
  const takeSnapshot = useCallback(() => {
    if (analysisMode === 'snapshot') {
      captureAndAnalyze();
    }
  }, [analysisMode, captureAndAnalyze]);

  /**
   * Switch camera device
   */
  const switchCamera = useCallback(async (deviceId) => {
    setSelectedDevice(deviceId);
    if (cameraStream) {
      stopCamera();
      // Restart with new device
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [cameraStream, stopCamera, startCamera]);

  /**
   * Download analysis results
   */
  const downloadResults = useCallback(() => {
    if (!analysisResults) return;
    
    const dataStr = JSON.stringify(analysisResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `skin-analysis-${new Date().toISOString()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [analysisResults]);

  /**
   * Share analysis results
   */
  const shareResults = useCallback(async () => {
    if (!analysisResults || !navigator.share) return;
    
    try {
      await navigator.share({
        title: 'My Skin Analysis Results',
        text: `Skin Health Score: ${analysisResults.overallScore}/100`,
        url: window.location.href
      });
    } catch (error) {
      console.log('Sharing failed:', error);
    }
  }, [analysisResults]);

  // Initialize on mount
  useEffect(() => {
    initializeServices();
    
    return () => {
      stopCamera();
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [initializeServices, stopCamera]);

  // Auto-start camera when initialized
  useEffect(() => {
    if (isInitialized && selectedDevice && !cameraStream) {
      startCamera();
    }
  }, [isInitialized, selectedDevice, cameraStream, startCamera]);

  /**
   * Render analysis results
   */
  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    const { overallScore, skinType, concerns, recommendations, details } = analysisResults;

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Analysis Results</h3>
          <div className="flex gap-2">
            <button
              onClick={downloadResults}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Download Results"
            >
              <Download size={20} />
            </button>
            {navigator.share && (
              <button
                onClick={shareResults}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Share Results"
              >
                <Share2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Overall Skin Health</span>
            <span className="text-2xl font-bold text-blue-600">{overallScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                overallScore >= 80 ? 'bg-green-500' :
                overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* Skin Type */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Detected Skin Type</h4>
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {skinType}
          </span>
        </div>

        {/* Concerns */}
        {concerns && concerns.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Detected Concerns</h4>
            <div className="flex flex-wrap gap-2">
              {concerns.map((concern, index) => (
                <span
                  key={index}
                  className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                >
                  {concern}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        {details && (
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Detailed Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{value}</div>
                  <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Sparkles size={16} className="text-yellow-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Brain className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Initializing AI Services</h2>
          <p className="text-gray-600 mb-4">Loading advanced skin analysis models...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress}% Complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Enhanced AI Skin Analysis
          </h1>
          <p className="text-gray-600">
            Powered by MediaPipe, TensorFlow.js, and OpenCV.js
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Camera Feed</h2>
              <div className="flex gap-2">
                <select
                  value={selectedDevice || ''}
                  onChange={(e) => switchCamera(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  {availableDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setAnalysisMode(analysisMode === 'realtime' ? 'snapshot' : 'realtime')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    analysisMode === 'realtime'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {analysisMode === 'realtime' ? 'Real-time' : 'Snapshot'}
                </button>
              </div>
            </div>

            {/* Video Element */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Analysis Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Zap className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    <p>Analyzing...</p>
                    <div className="w-32 bg-gray-700 rounded-full h-1 mt-2">
                      <div
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 mt-4">
              {analysisMode === 'snapshot' && (
                <button
                  onClick={takeSnapshot}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Camera size={20} />
                  Analyze Snapshot
                </button>
              )}
              
              <button
                onClick={cameraStream ? stopCamera : startCamera}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors ${
                  cameraStream
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Eye size={20} />
                {cameraStream ? 'Stop Camera' : 'Start Camera'}
              </button>
            </div>

            {/* Hidden canvas for image processing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>

          {/* Results Section */}
          <div>
            {renderAnalysisResults()}
            
            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Analyses</h3>
                <div className="space-y-3">
                  {analysisHistory.slice(0, 5).map((analysis) => (
                    <div
                      key={analysis.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setAnalysisResults(analysis.results)}
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          Score: {analysis.results.overallScore}/100
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        analysis.results.overallScore >= 80 ? 'bg-green-500' :
                        analysis.results.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAIAnalysis;