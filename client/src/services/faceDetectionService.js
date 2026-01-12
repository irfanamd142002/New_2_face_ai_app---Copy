import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

class FaceDetectionService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.isDetecting = false;
    this.videoElement = null;
    this.detectionCallback = null;
    this.detectionInterval = null;
    this.lastDetectionTime = 0;
    this.throttleDelay = 200; // 200ms throttle for better performance
  }

  async initialize() {
    try {
      console.log('Initializing TensorFlow.js BlazeFace model...');
      
      // Set TensorFlow.js backend
      await tf.ready();
      console.log('TensorFlow.js backend:', tf.getBackend());
      
      // Load BlazeFace model
      this.model = await blazeface.load();
      this.isInitialized = true;
      
      console.log('BlazeFace model loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize BlazeFace model:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async startDetection(videoElement, callback) {
    if (!this.isInitialized) {
      console.warn('Face detection service not initialized');
      return false;
    }

    this.videoElement = videoElement;
    this.detectionCallback = callback;
    this.isDetecting = true;

    // Start detection loop
    this.detectionInterval = setInterval(() => {
      this.detectFaces();
    }, this.throttleDelay);

    console.log('Face detection started');
    return true;
  }

  async detectFaces() {
    if (!this.isDetecting || !this.videoElement || !this.model) {
      return;
    }

    try {
      // Check if video is ready
      if (this.videoElement.readyState !== 4) {
        return;
      }

      // Throttle detection calls
      const now = Date.now();
      if (now - this.lastDetectionTime < this.throttleDelay) {
        return;
      }
      this.lastDetectionTime = now;

      // Perform face detection
      const predictions = await this.model.estimateFaces(this.videoElement, false);
      
      if (predictions && predictions.length > 0) {
        // Face detected
        const face = predictions[0];
        const confidence = face.probability ? face.probability[0] : 0.9; // BlazeFace doesn't always provide probability
        
        // Calculate face quality based on bounding box size and position
        const quality = this.calculateFaceQuality(face, this.videoElement);
        
        if (this.detectionCallback) {
          this.detectionCallback({
            faceDetected: true,
            confidence: confidence,
            quality: quality,
            faceCount: predictions.length,
            boundingBox: face.topLeft ? {
              x: face.topLeft[0],
              y: face.topLeft[1],
              width: face.bottomRight[0] - face.topLeft[0],
              height: face.bottomRight[1] - face.topLeft[1]
            } : null
          });
        }
      } else {
        // No face detected
        if (this.detectionCallback) {
          this.detectionCallback({
            faceDetected: false,
            confidence: 0,
            quality: 0,
            faceCount: 0,
            boundingBox: null
          });
        }
      }
    } catch (error) {
      console.error('Face detection error:', error);
      if (this.detectionCallback) {
        this.detectionCallback({
          faceDetected: false,
          confidence: 0,
          quality: 0,
          faceCount: 0,
          boundingBox: null,
          error: error.message
        });
      }
    }
  }

  calculateFaceQuality(face, videoElement) {
    if (!face.topLeft || !face.bottomRight) {
      return 0.5; // Default quality if no bounding box
    }

    const videoWidth = videoElement.videoWidth || videoElement.width;
    const videoHeight = videoElement.videoHeight || videoElement.height;
    
    if (!videoWidth || !videoHeight) {
      return 0.5;
    }

    // Calculate face size relative to video
    const faceWidth = face.bottomRight[0] - face.topLeft[0];
    const faceHeight = face.bottomRight[1] - face.topLeft[1];
    const faceArea = faceWidth * faceHeight;
    const videoArea = videoWidth * videoHeight;
    const faceRatio = faceArea / videoArea;

    // Calculate face position (center is better)
    const faceCenterX = (face.topLeft[0] + face.bottomRight[0]) / 2;
    const faceCenterY = (face.topLeft[1] + face.bottomRight[1]) / 2;
    const videoCenterX = videoWidth / 2;
    const videoCenterY = videoHeight / 2;
    
    const distanceFromCenter = Math.sqrt(
      Math.pow(faceCenterX - videoCenterX, 2) + 
      Math.pow(faceCenterY - videoCenterY, 2)
    );
    const maxDistance = Math.sqrt(Math.pow(videoWidth / 2, 2) + Math.pow(videoHeight / 2, 2));
    const centerScore = 1 - (distanceFromCenter / maxDistance);

    // Quality score based on size and position
    let quality = 0;
    
    // Size score (optimal face should be 10-40% of video area)
    if (faceRatio >= 0.1 && faceRatio <= 0.4) {
      quality += 0.5;
    } else if (faceRatio >= 0.05 && faceRatio <= 0.6) {
      quality += 0.3;
    } else {
      quality += 0.1;
    }
    
    // Position score
    quality += centerScore * 0.5;
    
    return Math.min(Math.max(quality, 0), 1);
  }

  stopDetection() {
    this.isDetecting = false;
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    
    this.videoElement = null;
    this.detectionCallback = null;
    
    console.log('Face detection stopped');
  }

  isFaceDetected() {
    return this.isDetecting && this.lastDetectionResult?.faceDetected;
  }

  getFaceConfidence() {
    return this.lastDetectionResult?.confidence || 0;
  }

  getFaceQuality() {
    return this.lastDetectionResult?.quality || 0;
  }

  dispose() {
    this.stopDetection();
    
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    
    this.isInitialized = false;
    console.log('Face detection service disposed');
  }
}

// Create and export a singleton instance
const faceDetectionService = new FaceDetectionService();
export default faceDetectionService;