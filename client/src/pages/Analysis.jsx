import React, { useState, useRef, useEffect } from 'react'
import { useAnalysis } from '../contexts/AnalysisContext'
import { useSkinAnalysis } from '../hooks/useSkinAnalysis'
import { useCart } from '../contexts/CartContext'
import ZeshtoRecommendationService from '../services/zeshtoRecommendationService'
import ZeshtoRecommendation from '../components/ZeshtoRecommendation'
import { 
  CameraIcon,
  PhotoIcon,
  DocumentTextIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  FaceSmileIcon,
  BeakerIcon,
  SunIcon,
  MoonIcon,
  ClockIcon,
  StarIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Modal from '../components/common/Modal'
import Disclaimer from '../components/common/Disclaimer'

const Analysis = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [analysisType, setAnalysisType] = useState('ai') // 'ai' or 'manual'
  const [isBaseline, setIsBaseline] = useState(false)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualData, setManualData] = useState({
    skinType: '',
    skinConcerns: [],
    notes: ''
  })
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState('analysis') // 'analysis', 'recommendations', 'routine'
  
  // Zeshto recommendation states
  const [zeshtoRecommendations, setZeshtoRecommendations] = useState(null)
  const [zestoBrandBenefits, setZestoBrandBenefits] = useState(null)
  
  // Camera states
  const [uploadMethod, setUploadMethod] = useState('file') // 'file' or 'camera'
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [isCameraLoading, setIsCameraLoading] = useState(false)
  
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const uploadSectionRef = useRef(null)
  const resultsSectionRef = useRef(null)
  const { addToCart, isInCart, getItemQuantity } = useCart()
  const { 
    analyzeWithAI, 
    analyzeManually, 
    analyzing, 
    currentAnalysis,
    formatSkinType,
    formatSkinConcerns,
    getSkinTypeColor,
    getConcernColor
  } = useAnalysis();



  // New skin analysis hook
  const {
    isAnalyzing: isAIAnalyzing,
    analysisResult: aiAnalysisResult,
    error: aiError,
    analyzeImage,
    clearResult,
    getAnalysisSummary,
    getRecommendations,
    getSkinConcerns,
    isHealthySkin,
    getRoutineSuggestions,
    fileInputRef: aiFileInputRef
  } = useSkinAnalysis();

  // Initialize AI service on component mount
  useEffect(() => {
    // Auto-initialize the AI service
    // Load brand benefits
    setZestoBrandBenefits(ZeshtoRecommendationService.getBrandBenefits())
  }, [])

  // Function to get Zeshto recommendations based on analysis
  const getZeshtoRecommendations = (skinType, skinConcerns) => {
    try {
      const concernsArray = Array.isArray(skinConcerns) ? skinConcerns : [skinConcerns]
      const primaryConcern = concernsArray[0] // Use first concern as primary
      
      const recommendation = ZeshtoRecommendationService.getBestRecommendations(
        skinType, 
        concernsArray,
        primaryConcern // Pass primary concern for detailed format
      )
      setZeshtoRecommendations(recommendation)
      return recommendation
    } catch (error) {
      console.error('Error getting Zeshto recommendations:', error)
      return null
    }
  }

  // Function to handle Zeshto ecommerce redirect
  const handleZeshtoShopNow = (productName = '') => {
    const url = ZeshtoRecommendationService.getEcommerceUrl(productName)
    window.open(url, '_blank')
  }

  const skinTypes = [
    { value: 'dry_skin', label: 'Dry Skin' },
    { value: 'oily_skin', label: 'Oily Skin' },
    { value: 'normal_skin', label: 'Normal Skin' },
    { value: 'dull_skin', label: 'Dull Skin' },
    { value: 'sensitive_skin', label: 'Sensitive Skin' }
  ]

  const skinConcerns = [
    { value: 'acne_pimple', label: 'Acne/Pimples' },
    { value: 'dark_spots_marks', label: 'Dark Spots/Marks' },
    { value: 'acne_scars', label: 'Acne Scars' },
    { value: 'pigmentation', label: 'Pigmentation' },
    { value: 'dull_skin', label: 'Dull Skin' },
    { value: 'under_eye_dark_circles', label: 'Under Eye Dark Circles' },
    { value: 'anti_aging', label: 'Anti-Aging' }
  ]

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)

      // Auto-analyze with AI if AI mode is selected
      if (analysisType === 'ai') {
        await handleAIAnalysis(file)
      }
    }
  }

  const handleAIAnalysis = async (file = selectedImage) => {
    if (!file) {
      alert('Please select an image first')
      return
    }

    try {
      const result = await analyzeImage(file)
      if (result) {
        // Get Zeshto recommendations based on AI analysis
        const skinType = result.skinType || 'normal_skin'
        const concerns = result.skinConcerns || []
        getZeshtoRecommendations(skinType, concerns)
        
        setShowResults(true)
        setActiveTab('analysis')
        // Auto-scroll to results section after a brief delay
        setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }, 500)
      }
    } catch (error) {
      console.error('AI Analysis failed:', error)
    }
  }

  const handleManualAnalysis = async () => {
    if (!manualData.skinType) {
      alert('Please select a skin type')
      return
    }

    if (manualData.skinConcerns.length === 0) {
      alert('Please select at least one skin concern')
      return
    }

    const analysisData = {
      ...manualData,
      isBaseline
    }

    // Get Zeshto recommendations based on manual selection
    getZeshtoRecommendations(manualData.skinType, manualData.skinConcerns)

    const result = await analyzeManually(analysisData)
    if (result.success) {
      setShowManualForm(false)
      setShowResults(true)
      setActiveTab('analysis')
      // Auto-scroll to results section
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        })
      }, 500)
    }
  }

  const handleConcernToggle = (concern) => {
    setManualData(prev => ({
      ...prev,
      skinConcerns: prev.skinConcerns.includes(concern)
        ? prev.skinConcerns.filter(c => c !== concern)
        : [...prev.skinConcerns, concern]
    }))
  }

  const resetForm = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setAnalysisType('ai')
    setIsBaseline(false)
    setShowManualForm(false)
    setShowResults(false)
    setActiveTab('analysis')
    setManualData({
      skinType: '',
      skinConcerns: [],
      notes: ''
    })
    // Clear Zeshto recommendations
    setZeshtoRecommendations([])
    clearResult() // Clear AI analysis results
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (aiFileInputRef.current) {
      aiFileInputRef.current.value = ''
    }
    // Stop camera if active
    stopCamera()
  }

  // Camera functionality
  const startCamera = async () => {
    try {
      console.log('=== STARTING CAMERA INITIALIZATION ===')
      console.log('Browser:', navigator.userAgent)
      console.log('MediaDevices supported:', !!navigator.mediaDevices)
      console.log('getUserMedia supported:', !!navigator.mediaDevices?.getUserMedia)
      
      setCameraError(null)
      setIsCameraLoading(true)
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser')
      }
      
      // Check available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        console.log('Available video devices:', videoDevices.length)
        videoDevices.forEach((device, index) => {
          console.log(`Device ${index}:`, device.label || `Camera ${index + 1}`, device.deviceId)
        })
        
        if (videoDevices.length === 0) {
          throw new Error('No camera devices found')
        }
      } catch (enumError) {
        console.warn('Could not enumerate devices:', enumError)
      }
      
      // Stop any existing camera stream
      if (cameraStream) {
        console.log('Stopping existing camera stream')
        cameraStream.getTracks().forEach(track => track.stop())
      }

      console.log('Requesting camera access...')
      
      let stream = null
      const constraints = [
        // Try with ideal settings first
        {
          video: {
            facingMode: 'user',
            width: { ideal: 1280, min: 320, max: 1920 },
            height: { ideal: 720, min: 240, max: 1080 },
            frameRate: { ideal: 30, min: 15, max: 60 }
          }
        },
        // Fallback to basic settings
        {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        },
        // Last resort - any camera
        {
          video: true
        }
      ]

      for (let i = 0; i < constraints.length; i++) {
        const constraint = constraints[i]
        try {
          console.log(`Trying camera constraint ${i + 1}/${constraints.length}:`, JSON.stringify(constraint, null, 2))
          stream = await navigator.mediaDevices.getUserMedia(constraint)
          console.log('✅ Camera stream obtained successfully with constraint', i + 1)
          console.log('Stream details:', {
            id: stream.id,
            active: stream.active,
            tracks: stream.getTracks().length
          })
          
          // Log track details
          stream.getTracks().forEach((track, index) => {
            console.log(`Track ${index}:`, {
              kind: track.kind,
              label: track.label,
              enabled: track.enabled,
              readyState: track.readyState,
              settings: track.getSettings ? track.getSettings() : 'N/A'
            })
          })
          break
        } catch (err) {
          console.log(`❌ Failed with constraint ${i + 1}:`, err.name, err.message)
          continue
        }
      }

      if (!stream) {
        throw new Error('Unable to access camera with any configuration')
      }

      console.log('Setting camera state...')
      setCameraStream(stream)
      setIsCameraActive(true) // Set this first to render the video element
      
      // Wait for video element to be mounted
      console.log('⏳ Waiting for video element to mount...')
      let videoElement = null
      let retryCount = 0
      const maxRetries = 20 // Wait up to 2 seconds
      
      while (!videoElement && retryCount < maxRetries) {
        videoElement = videoRef.current
        if (!videoElement) {
          console.log(`⏳ Video element not ready, waiting... (${retryCount + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 100))
          retryCount++
        }
      }

      if (videoElement) {
        console.log('✅ Video element found after', retryCount, 'attempts')
        setIsCameraLoading(false)
        console.log('Setting up video element with stream...')
        const video = videoRef.current
        
        // Log initial video element state
        console.log('Initial video element state:', {
          srcObject: video.srcObject,
          readyState: video.readyState,
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          paused: video.paused
        })
        
        // Clear any existing srcObject
        if (video.srcObject) {
          console.log('Clearing existing srcObject')
          video.srcObject = null
        }
        
        // Wait a moment for cleanup, then set the new stream
        setTimeout(() => {
          if (videoRef.current && stream && stream.active) {
            console.log('🎥 Assigning stream to video element...')
            const video = videoRef.current
            
            // Assign the stream
            video.srcObject = stream
            console.log('Stream assigned. New video element state:', {
              srcObject: !!video.srcObject,
              srcObjectId: video.srcObject?.id,
              readyState: video.readyState,
              videoWidth: video.videoWidth,
              videoHeight: video.videoHeight
            })
            
            // Add comprehensive event listeners for debugging
            video.onloadstart = () => console.log('📺 Video: loadstart')
            video.onloadeddata = () => console.log('📺 Video: loadeddata')
            video.oncanplay = () => console.log('📺 Video: canplay')
            video.oncanplaythrough = () => console.log('📺 Video: canplaythrough')
            video.onplaying = () => console.log('📺 Video: playing')
            video.onwaiting = () => console.log('📺 Video: waiting')
            video.onstalled = () => console.log('📺 Video: stalled')
            video.onsuspend = () => console.log('📺 Video: suspend')
            video.onabort = () => console.log('📺 Video: abort')
            video.onemptied = () => console.log('📺 Video: emptied')
            
            video.onerror = (err) => {
              console.error('❌ Video error event:', err)
              console.error('Video error details:', video.error)
              if (video.error) {
                console.error('Error code:', video.error.code)
                console.error('Error message:', video.error.message)
              }
              setCameraError('Video playback error occurred.')
            }
            
            // Enhanced metadata loading handler
            video.onloadedmetadata = async () => {
              try {
                console.log('🎬 Video metadata loaded successfully')
                console.log('Final video dimensions:', video.videoWidth, 'x', video.videoHeight)
                console.log('Video ready state:', video.readyState)
                console.log('Video duration:', video.duration)
                
                // Multiple attempts to play the video
                const playVideo = async (attempt = 1) => {
                  try {
                    console.log(`🎮 Attempting to play video (attempt ${attempt})...`)
                    await video.play()
                    console.log('✅ Video playing successfully!')
                    
                    // Final verification
                    setTimeout(() => {
                      console.log('🔍 Final video state check:', {
                        playing: !video.paused && !video.ended,
                        currentTime: video.currentTime,
                        readyState: video.readyState,
                        videoWidth: video.videoWidth,
                        videoHeight: video.videoHeight
                      })
                    }, 500)
                    
                  } catch (playErr) {
                    console.error(`❌ Play attempt ${attempt} failed:`, playErr)
                    if (attempt < 3) {
                      console.log(`🔄 Retrying play in 500ms...`)
                      setTimeout(() => playVideo(attempt + 1), 500)
                    } else {
                      setCameraError('Unable to start video playback after multiple attempts.')
                    }
                  }
                }
                
                // Start playing
                if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                  await playVideo()
                } else {
                  console.log('⏳ Video not ready, waiting for canplay event')
                  video.addEventListener('canplay', () => playVideo(), { once: true })
                }
                
              } catch (err) {
                console.error('❌ Error in onloadedmetadata:', err)
                setCameraError('Unable to start video playback. Please try refreshing the page.')
              }
            }
            
            // Force load if metadata doesn't trigger within 2 seconds
            setTimeout(() => {
              if (video.readyState === 0) {
                console.log('⚠️ Video not loading after 2s, forcing load...')
                video.load()
                
                // If still not loading after another 2 seconds, show error
                setTimeout(() => {
                  if (video.readyState === 0) {
                    console.error('❌ Video failed to load even after forcing')
                    setCameraError('Camera failed to initialize. Please refresh the page and try again.')
                  }
                }, 2000)
              }
            }, 2000)
            
          } else {
            console.error('❌ Cannot assign stream - video ref or stream not available')
            console.log('Debug info:', {
              videoRefCurrent: !!videoRef.current,
              stream: !!stream,
              streamActive: stream?.active
            })
            setCameraError('Failed to connect camera to video element.')
          }
        }, 100)
      } else {
        console.error('❌ Video element not found after waiting')
        console.error('Debug info:', {
          retryCount,
          maxRetries,
          videoRefCurrent: !!videoRef.current,
          isCameraActive
        })
        setIsCameraLoading(false)
        setCameraError('Video element failed to mount. Please refresh the page and try again.')
      }
    } catch (error) {
      console.error('❌ Error accessing camera:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      
      let errorMessage = 'Unable to access camera. Please check permissions.'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please allow camera permissions in your browser and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found. Please connect a camera device and try again.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.'
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not supported. Please try with a different camera.'
      } else if (error.message.includes('not supported')) {
        errorMessage = 'Camera not supported in this browser. Please try Chrome, Firefox, or Safari.'
      } else if (error.message.includes('not found')) {
        errorMessage = 'No camera devices found. Please connect a camera and refresh the page.'
      }
      
      setCameraError(errorMessage)
      setIsCameraLoading(false)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setIsCameraActive(false)
    setCameraError(null)
    setIsCameraLoading(false)
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const debugCamera = () => {
    console.log('=== CAMERA DEBUG INFO ===')
    console.log('Camera active:', isCameraActive)
    console.log('Camera loading:', isCameraLoading)
    console.log('Camera error:', cameraError)
    console.log('Camera stream:', cameraStream)
    
    if (cameraStream) {
      console.log('Stream active:', cameraStream.active)
      console.log('Stream tracks:', cameraStream.getTracks().map(track => ({
        kind: track.kind,
        enabled: track.enabled,
        readyState: track.readyState,
        settings: track.getSettings()
      })))
    }
    
    if (videoRef.current) {
      const video = videoRef.current
      console.log('Video element:', {
        srcObject: video.srcObject,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        ended: video.ended,
        currentTime: video.currentTime,
        duration: video.duration,
        networkState: video.networkState,
        error: video.error
      })
      
      // Check computed styles
      const computedStyle = window.getComputedStyle(video)
      console.log('Video computed styles:', {
        display: computedStyle.display,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        width: computedStyle.width,
        height: computedStyle.height,
        backgroundColor: computedStyle.backgroundColor,
        transform: computedStyle.transform
      })
    }
    
    console.log('=== END DEBUG INFO ===')
  }

  const checkCameraPermissions = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera not supported in this browser. Please try Chrome, Firefox, or Safari.')
        return
      }

      // Check if permissions API is available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'camera' })
        console.log('Camera permission status:', permission.state)
        
        if (permission.state === 'denied') {
          setCameraError('Camera access is blocked. Please enable camera permissions in your browser settings.')
          return
        }
      }

      // Try to enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      console.log('Available video devices:', videoDevices)
      
      if (videoDevices.length === 0) {
        setCameraError('No camera devices found. Please connect a camera and try again.')
        return
      }

      setCameraError(null)
      alert(`Camera check passed! Found ${videoDevices.length} camera device(s). You can now try to start the camera.`)
    } catch (error) {
      console.error('Error checking camera permissions:', error)
      setCameraError('Unable to check camera permissions. Please try starting the camera directly.')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Flip the canvas horizontally to match the mirrored video
    context.save()
    context.scale(-1, 1)
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    context.restore()

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        // Create a file from the blob
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        
        setSelectedImage(file)
        setImagePreview(canvas.toDataURL('image/jpeg'))
        
        // Stop camera after capture
        stopCamera()
        
        // Auto-analyze with AI if AI mode is selected
        if (analysisType === 'ai') {
          await handleAIAnalysis(file)
        }
      }
    }, 'image/jpeg', 0.9)
  }

  // Cleanup camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl flex items-center justify-center mb-6 shadow-strong">
            <CameraIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent font-display">
            Skin Analysis
          </h1>
          <p className="text-neutral-700 mt-3 text-lg font-medium">
            Get AI-powered insights about your skin or input manual observations
          </p>
        </div>



        {/* Analysis Type Selection */}
        <Card className="mb-8 border-2 border-neutral-200" variant="elevated" padding="lg">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6 font-display">Choose Analysis Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setAnalysisType('ai')
                // Auto-scroll to upload section after a brief delay
                setTimeout(() => {
                  uploadSectionRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  })
                }, 300)
              }}
              className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                analysisType === 'ai'
                  ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-medium'
                  : 'border-neutral-300 hover:border-primary-300 hover:shadow-soft'
              }`}
            >
              <SparklesIcon className={`w-10 h-10 mx-auto mb-4 ${
                analysisType === 'ai' ? 'text-primary-600' : 'text-neutral-500'
              }`} />
              <h3 className="font-bold text-neutral-900 mb-3 text-lg">AI Analysis</h3>
              <p className="text-neutral-700 font-medium leading-relaxed">
                Upload a photo and get AI-powered skin analysis with detailed insights
              </p>
            </button>

            <button
              onClick={() => setAnalysisType('manual')}
              className={`p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                analysisType === 'manual'
                  ? 'border-secondary-500 bg-gradient-to-br from-secondary-50 to-secondary-100 shadow-medium'
                  : 'border-neutral-300 hover:border-secondary-300 hover:shadow-soft'
              }`}
            >
              <DocumentTextIcon className={`w-10 h-10 mx-auto mb-4 ${
                analysisType === 'manual' ? 'text-secondary-600' : 'text-neutral-500'
              }`} />
              <h3 className="font-bold text-neutral-900 mb-3 text-lg">Manual Input</h3>
              <p className="text-neutral-700 font-medium leading-relaxed">
                Manually input your skin observations and get product recommendations
              </p>
            </button>
          </div>

          {/* Baseline Option */}
          <div className="mt-8 p-6 bg-gradient-to-r from-accent-50 to-accent-100 rounded-2xl border-2 border-accent-200 shadow-soft">
            <div className="flex items-start space-x-3">
              <input
                id="baseline"
                type="checkbox"
                checked={isBaseline}
                onChange={(e) => setIsBaseline(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div>
                <label htmlFor="baseline" className="text-sm font-medium text-blue-900">
                  Mark as Baseline Analysis
                </label>
                <p className="text-xs text-blue-700 mt-1">
                  Use this analysis as your starting point to track progress over time
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Analysis Section */}
        {analysisType === 'ai' && (
          <Card ref={uploadSectionRef} padding="lg" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Get Your Photo</h2>
            
            {/* Upload Method Selection */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => {
                  setUploadMethod('file')
                  stopCamera()
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                  uploadMethod === 'file'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <PhotoIcon className="w-5 h-5" />
                <span className="font-medium">Upload File</span>
              </button>
              <button
                onClick={() => setUploadMethod('camera')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                  uploadMethod === 'camera'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <CameraIcon className="w-5 h-5" />
                <span className="font-medium">Take Photo</span>
              </button>
            </div>

            <div className="space-y-6">
              {/* File Upload Section */}
              {uploadMethod === 'file' && (
                <>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">Upload a photo</p>
                          <p className="text-sm text-gray-600">
                            Click to select or drag and drop your image here
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Supports JPG, PNG, WebP (max 10MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </>
              )}

              {/* Camera Section */}
              {uploadMethod === 'camera' && (
                <div className="space-y-4">
                  {!isCameraActive && !imagePreview && (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Take a Live Photo</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Use your camera to capture a photo for analysis
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={checkCameraPermissions}
                          variant="outline"
                          className="mx-auto"
                          icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                        >
                          Check Camera
                        </Button>
                        <Button
                          onClick={startCamera}
                          className="mx-auto"
                          icon={<CameraIcon className="w-5 h-5" />}
                        >
                          Start Camera
                        </Button>
                        <Button
                          onClick={debugCamera}
                          variant="outline"
                          size="sm"
                          className="mx-auto text-xs"
                        >
                          Debug
                        </Button>
                      </div>
                    </div>
                  )}

                  {cameraError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-red-900">Camera Error</h4>
                          <p className="text-sm text-red-800 mt-1">{cameraError}</p>
                          <div className="mt-3 text-xs text-red-700">
                            <p className="font-medium mb-1">Troubleshooting tips:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Make sure your camera is connected and not being used by other apps</li>
                              <li>Check browser permissions by clicking the camera icon in the address bar</li>
                              <li>Try refreshing the page and allowing camera access when prompted</li>
                              <li>Use Chrome, Firefox, or Safari for best compatibility</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCameraActive && (
                    <div className="space-y-4">
                      <div className="relative bg-gray-900 rounded-xl overflow-hidden min-h-[300px] flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          controls={false}
                          preload="auto"
                          style={{ 
                            transform: 'scaleX(-1)',
                            minHeight: '300px',
                            maxHeight: '400px',
                            backgroundColor: 'transparent'
                          }}
                          className="w-full h-auto object-contain"
                        />
                        {isCameraLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                            <div className="text-center text-white">
                              <LoadingSpinner size="lg" />
                              <p className="mt-2 text-sm">Starting camera...</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 border-2 border-white/30 rounded-xl pointer-events-none">
                          <div className="absolute top-4 left-4 right-4 text-center">
                            <p className="text-white text-sm bg-black/50 rounded-full px-3 py-1 inline-block">
                              Position your face in the center
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={capturePhoto}
                          className="flex-1"
                          icon={<CameraIcon className="w-5 h-5" />}
                        >
                          Capture Photo
                        </Button>
                        <Button
                          onClick={stopCamera}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="flex justify-center mt-2">
                        <Button
                          onClick={debugCamera}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          Debug Camera
                        </Button>
                      </div>
                    </div>
                  )}

                  {imagePreview && uploadMethod === 'camera' && (
                    <div className="space-y-4">
                      <div className="border-2 border-gray-300 rounded-xl p-4 text-center">
                        <img
                          src={imagePreview}
                          alt="Captured"
                          className="max-w-xs max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-gray-600 mt-2">Photo captured successfully</p>
                      </div>
                      <Button
                        onClick={() => {
                          setImagePreview(null)
                          setSelectedImage(null)
                          startCamera()
                        }}
                        variant="outline"
                        fullWidth
                        icon={<CameraIcon className="w-5 h-5" />}
                      >
                        Take Another Photo
                      </Button>
                    </div>
                  )}

                  {/* Hidden canvas for photo capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* Photo Guidelines */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-900">Photo Guidelines</h4>
                    <ul className="text-xs text-yellow-800 mt-2 space-y-1">
                      <li>• Use good lighting (natural light preferred)</li>
                      <li>• Face the camera directly</li>
                      <li>• Remove makeup for best results</li>
                      <li>• Ensure your face fills most of the frame</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAIAnalysis}
                loading={analyzing}
                disabled={!selectedImage}
                size="lg"
                fullWidth
                icon={<SparklesIcon className="w-5 h-5" />}
              >
                {analyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </div>
          </Card>
        )}

        {/* Manual Analysis Section */}
        {analysisType === 'manual' && (
          <Card padding="lg" className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manual Skin Assessment</h2>
            
            <div className="space-y-6">
              {/* Skin Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your skin type?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skinTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setManualData(prev => ({ ...prev, skinType: type.value }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        manualData.skinType === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Concerns Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are your main skin concerns? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skinConcerns.map((concern) => (
                    <button
                      key={concern.value}
                      onClick={() => handleConcernToggle(concern.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        manualData.skinConcerns.includes(concern.value)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{concern.label}</span>
                        {manualData.skinConcerns.includes(concern.value) && (
                          <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={manualData.notes}
                  onChange={(e) => setManualData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional observations about your skin..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <Button
                onClick={handleManualAnalysis}
                loading={analyzing}
                disabled={!manualData.skinType || manualData.skinConcerns.length === 0}
                size="lg"
                fullWidth
                icon={<DocumentTextIcon className="w-5 h-5" />}
              >
                {analyzing ? 'Processing...' : 'Save Analysis'}
              </Button>
            </div>
          </Card>
        )}

        {/* AI Analysis Results */}
        {showResults && (aiAnalysisResult || currentAnalysis) && (
          <div ref={resultsSectionRef} className="space-y-8">
            {/* Results Header */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                  {isHealthySkin(aiAnalysisResult) ? (
                    <FaceSmileIcon className="w-8 h-8 text-white" />
                  ) : (
                    <BeakerIcon className="w-8 h-8 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analysis Complete!
                </h2>
                <p className="text-gray-600">
                  {aiAnalysisResult?.faceDetected 
                    ? "Face detected successfully. Here's your detailed skin analysis."
                    : "Analysis completed. Here are your personalized insights."
                  }
                </p>
                {aiError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{aiError}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Medical Disclaimer */}
            <Disclaimer type="analysis" />

            {/* Tab Navigation */}
            <Card>
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'analysis', label: 'Analysis', icon: BeakerIcon },
                    { id: 'recommendations', label: 'Products', icon: StarIcon },
                    { id: 'routine', label: 'Routine', icon: ClockIcon }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div className="space-y-6">
                    {aiAnalysisResult && (
                      <>
                        {/* Skin Type Analysis */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Skin Type</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Type:</span>
                                <span className="font-medium text-blue-600 capitalize">
                                  {getAnalysisSummary()?.skinType || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Oiliness:</span>
                                <span className="font-medium">
                                  {aiAnalysisResult.skinAnalysis?.skinType?.oiliness || 0}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Confidence:</span>
                                <span className="font-medium">
                                  {Math.round((getAnalysisSummary()?.overallConfidence || 0) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">Skin Tone</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Tone:</span>
                                <span className="font-medium text-purple-600 capitalize">
                                  {aiAnalysisResult.skinAnalysis?.skinTone?.tone || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Undertone:</span>
                                <span className="font-medium capitalize">
                                  {aiAnalysisResult.skinAnalysis?.skinTone?.undertone || 'Unknown'}
                                </span>
                              </div>
                              {aiAnalysisResult.skinAnalysis?.skinTone?.rgb && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-600">Color:</span>
                                  <div 
                                    className="w-6 h-6 rounded-full border border-gray-300"
                                    style={{
                                      backgroundColor: `rgb(${aiAnalysisResult.skinAnalysis.skinTone.rgb.r}, ${aiAnalysisResult.skinAnalysis.skinTone.rgb.g}, ${aiAnalysisResult.skinAnalysis.skinTone.rgb.b})`
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Skin Concerns */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">Detected Concerns</h3>
                          {getSkinConcerns().length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {getSkinConcerns().map((concern, index) => (
                                <div key={index} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-gray-900 capitalize">
                                      {concern.type.replace('_', ' ')}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      concern.severityLevel === 'high' ? 'bg-red-100 text-red-800' :
                                      concern.severityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {concern.severityLevel}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{concern.description}</p>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          concern.severityLevel === 'high' ? 'bg-red-500' :
                                          concern.severityLevel === 'medium' ? 'bg-yellow-500' :
                                          'bg-green-500'
                                        }`}
                                        style={{ width: `${concern.severityPercentage}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {concern.severityPercentage}%
                                    </span>
                                  </div>
                                  {concern.areas && concern.areas.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs text-gray-500">Areas: </span>
                                      <span className="text-xs text-gray-700">
                                        {concern.areas.join(', ')}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-200">
                              <FaceSmileIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                              <h4 className="font-medium text-green-900 mb-2">Great News!</h4>
                              <p className="text-sm text-green-700">
                                No major skin concerns detected. Your skin appears to be in good condition!
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Skin Type Characteristics */}
                        {aiAnalysisResult.skinAnalysis?.skinType?.characteristics && (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Skin Characteristics</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <ul className="space-y-2">
                                {aiAnalysisResult.skinAnalysis.skinType.characteristics.map((char, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-gray-700">{char}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Fallback to old analysis if no AI result */}
                    {!aiAnalysisResult && currentAnalysis && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Skin Type</h4>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSkinTypeColor(currentAnalysis.skinType)}`}>
                            {formatSkinType(currentAnalysis.skinType)}
                          </span>
                        </div>

                        {currentAnalysis.skinConcerns?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Skin Concerns</h4>
                            <div className="flex flex-wrap gap-2">
                              {formatSkinConcerns(currentAnalysis.skinConcerns).map((concern, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getConcernColor(currentAnalysis.skinConcerns[index])}`}
                                >
                                  {concern}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                  <div className="space-y-6">
                    <Disclaimer type="products" />
                    
                    {/* Zeshto Recommendation Component */}
                    <ZeshtoRecommendation 
                      recommendation={zeshtoRecommendations}
                      onShopNow={handleZeshtoShopNow}
                    />

                    {/* Why Zeshto Brand is Beneficial */}
                    {zestoBrandBenefits && (
                      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center">
                          <StarIcon className="w-6 h-6 mr-2 text-amber-600" />
                          Why {zestoBrandBenefits.brand_name} Brand is Essential
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-amber-800 mb-3">Why Essential:</h4>
                            <div className="space-y-2">
                              {zestoBrandBenefits.why_essential.map((reason, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <CheckCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-amber-700 text-sm">{reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-amber-800 mb-3">Key Advantages:</h4>
                            <div className="space-y-2">
                              {zestoBrandBenefits.key_advantages.map((advantage, idx) => (
                                <div key={idx} className="flex items-start space-x-2">
                                  <SparklesIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-amber-700 text-sm">{advantage}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-amber-200">
                          <Button 
                            size="sm" 
                            variant="primary"
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 border-0"
                            onClick={() => handleZeshtoShopNow()}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Explore All Zeshto Products
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {zeshtoRecommendations && zeshtoRecommendations.length > 0 ? (
                      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg mb-6">
                        <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                          <SparklesIcon className="w-6 h-6 mr-2 text-green-600" />
                          Zeshto Soap Recommendations
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {zeshtoRecommendations.map((product, idx) => (
                            <div key={idx} className="bg-white border border-green-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                              <h4 className="font-semibold text-green-800 mb-2">{product.name}</h4>
                              <p className="text-green-700 text-sm mb-3">{product.description}</p>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    {product.category}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-green-800">₹{product.price}</span>
                                  <Button 
                                    size="sm" 
                                    variant="primary"
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-0"
                                    onClick={() => handleZeshtoShopNow()}
                                  >
                                    Buy Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-green-200 text-center">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => handleZeshtoShopNow()}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Explore All Zeshto Products
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-6 mb-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Zeshto Recommendations</h3>
                        <p className="text-gray-600 mb-4">
                          Complete your skin analysis to get personalized Zeshto soap recommendations tailored to your specific skin type and concerns.
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => handleZeshtoShopNow()}
                        >
                          Browse All Zeshto Products
                        </Button>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Recommended Products</h3>
                      {getRecommendations().length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getRecommendations().map((rec, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="font-medium text-gray-900">{rec.product}</h4>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                                    {rec.category}
                                  </span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
                              
                              {/* Product details */}
                              {rec.price && (
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-lg font-semibold text-gray-900">{rec.price}</span>
                                  {rec.rating && (
                                    <div className="flex items-center">
                                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                      <span className="ml-1 text-sm text-gray-600">{rec.rating}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1"
                                  onClick={() => {
                                    // Navigate to products page with filter
                                    window.location.href = '/products';
                                  }}
                                >
                                  View Products
                                </Button>
                                
                                {rec.name && (
                                  <Button
                                    size="sm"
                                    variant={isInCart(rec.id) ? "secondary" : "primary"}
                                    icon={ShoppingCartIcon}
                                    className="flex-1"
                                    onClick={() => {
                                      // Create a product object for cart
                                      const productForCart = {
                                        _id: rec.id,
                                        name: rec.name,
                                        price: parseFloat(rec.price?.replace('₹', '') || '0'),
                                        image: rec.image || '/api/placeholder/300/300',
                                        category: rec.category,
                                        description: rec.description,
                                        stock: 10 // Default stock for recommendations
                                      };
                                      addToCart(productForCart);
                                    }}
                                  >
                                    {isInCart(rec.id) ? `In Cart (${getItemQuantity(rec.id)})` : 'Add to Cart'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <BeakerIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500">No specific product recommendations available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Routine Tab */}
                {activeTab === 'routine' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">Personalized Skincare Routine</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Morning Routine */}
                        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                          <div className="flex items-center space-x-2 mb-4">
                            <SunIcon className="w-6 h-6 text-yellow-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{getRoutineSuggestions().morning.title}</h4>
                              <p className="text-sm text-gray-600">{getRoutineSuggestions().morning.description}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {getRoutineSuggestions().morning.steps.map((step, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-yellow-100">
                                <div className="flex items-start space-x-3">
                                  <span className="flex-shrink-0 w-8 h-8 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium">
                                    {step.step}
                                  </span>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{step.action}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                    {step.product && (
                                      <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
                                        <span className="font-medium">Recommended: </span>
                                        {step.product.name}
                                      </div>
                                    )}
                                    {step.duration && (
                                      <p className="text-xs text-gray-500 mt-1">Duration: {step.duration}</p>
                                    )}
                                    {step.tips && (
                                      <p className="text-xs text-blue-600 mt-1 italic">💡 {step.tips}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Evening Routine */}
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-4">
                            <MoonIcon className="w-6 h-6 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">{getRoutineSuggestions().evening.title}</h4>
                              <p className="text-sm text-gray-600">{getRoutineSuggestions().evening.description}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {getRoutineSuggestions().evening.steps.map((step, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border border-blue-100">
                                <div className="flex items-start space-x-3">
                                  <span className="flex-shrink-0 w-8 h-8 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                    {step.step}
                                  </span>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{step.action}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                    {step.product && (
                                      <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                                        <span className="font-medium">Recommended: </span>
                                        {step.product.name}
                                      </div>
                                    )}
                                    {step.duration && (
                                      <p className="text-xs text-gray-500 mt-1">Duration: {step.duration}</p>
                                    )}
                                    {step.tips && (
                                      <p className="text-xs text-blue-600 mt-1 italic">💡 {step.tips}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Treatments */}
                    {getRoutineSuggestions().weekly.treatments.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <StarIcon className="w-6 h-6 text-purple-600" />
                          <div>
                            <h4 className="font-medium text-gray-900">{getRoutineSuggestions().weekly.title}</h4>
                            <p className="text-sm text-gray-600">{getRoutineSuggestions().weekly.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getRoutineSuggestions().weekly.treatments.map((treatment, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 border border-purple-100">
                              <div className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-8 h-8 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{treatment.action}</h5>
                                  <p className="text-sm text-gray-600 mt-1">{treatment.description}</p>
                                  <p className="text-xs text-purple-600 mt-1 font-medium">{treatment.frequency}</p>
                                  {treatment.duration && (
                                    <p className="text-xs text-gray-500 mt-1">Duration: {treatment.duration}</p>
                                  )}
                                  {treatment.tips && (
                                    <p className="text-xs text-blue-600 mt-1 italic">💡 {treatment.tips}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Routine Tips */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Routine Tips</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Always apply products from thinnest to thickest consistency</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Wait 2-3 minutes between applying different products</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Introduce new products gradually to avoid irritation</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>Consistency is key - stick to your routine for best results</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <Card>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={() => setShowResults(false)}
                  variant="outline"
                  fullWidth
                >
                  Close Results
                </Button>
                <Button
                  onClick={resetForm}
                  fullWidth
                >
                  New Analysis
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  fullWidth
                >
                  Save Results
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* AI Analysis Guidelines - Moved to bottom */}
        <div className="mb-8">
          <Disclaimer type="aiAccuracy" className="max-w-4xl mx-auto" />
        </div>

        {/* Disclaimer */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Important Disclaimer</h4>
              <p className="text-xs text-blue-800 mt-1">
                This analysis is for informational purposes only and should not replace professional dermatological advice. 
                Consult with a qualified dermatologist for serious skin concerns or before starting any new skincare regimen.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Analysis