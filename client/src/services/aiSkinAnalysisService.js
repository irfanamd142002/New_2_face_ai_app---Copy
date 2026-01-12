import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { FaceDetection } from '@mediapipe/face_detection';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';

class AISkinAnalysisService {
  constructor() {
    this.faceDetection = null;
    this.selfieSegmentation = null;
    this.isInitialized = false;
    this.skinAnalysisModel = null;
  }

  async initialize() {
    try {
      console.log('Initializing AI Skin Analysis Service...');
      
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js ready');

      // Initialize MediaPipe Face Detection
      this.faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      this.faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      });

      // Initialize MediaPipe Selfie Segmentation for skin area detection
      this.selfieSegmentation = new SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        }
      });

      this.selfieSegmentation.setOptions({
        modelSelection: 1,
      });

      // Load or create a simple skin analysis model
      await this.initializeSkinAnalysisModel();

      this.isInitialized = true;
      console.log('AI Skin Analysis Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AI Skin Analysis Service:', error);
      throw error;
    }
  }

  async initializeSkinAnalysisModel() {
    try {
      // For now, we'll use a simple rule-based analysis
      // In production, you would load a pre-trained model for skin analysis
      console.log('Initializing skin analysis model...');
      
      // This is a placeholder - in a real implementation, you would:
      // 1. Load a pre-trained model for skin analysis
      // 2. Or train a custom model for skin condition detection
      // 3. Use transfer learning from existing models
      
      this.skinAnalysisModel = {
        analyzeTexture: this.analyzeTextureFeatures.bind(this),
        analyzeColor: this.analyzeColorFeatures.bind(this),
        detectAcne: this.detectAcneFeatures.bind(this),
        detectWrinkles: this.detectWrinkleFeatures.bind(this),
        analyzePigmentation: this.analyzePigmentationFeatures.bind(this)
      };
      
      console.log('Skin analysis model ready');
    } catch (error) {
      console.error('Failed to initialize skin analysis model:', error);
      throw error;
    }
  }

  async analyzeFrame(videoElement) {
    if (!this.isInitialized) {
      throw new Error('AI Skin Analysis Service not initialized');
    }

    try {
      // Create canvas for processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw current frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Detect face
      const faceResults = await this.detectFace(canvas);
      
      if (!faceResults || faceResults.detections.length === 0) {
        return {
          success: false,
          error: 'No face detected',
          confidence: 0
        };
      }

      // Get face region
      const faceRegion = this.extractFaceRegion(imageData, faceResults.detections[0]);
      
      // Analyze skin in face region
      const skinAnalysis = await this.analyzeSkinRegion(faceRegion);
      
      return {
        success: true,
        faceDetected: true,
        confidence: faceResults.detections[0].score,
        faceBox: this.getFaceBox(faceResults.detections[0]),
        skinMetrics: skinAnalysis,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Frame analysis error:', error);
      return {
        success: false,
        error: error.message,
        confidence: 0
      };
    }
  }

  async detectFace(canvas) {
    return new Promise((resolve, reject) => {
      this.faceDetection.onResults((results) => {
        resolve(results);
      });
      
      this.faceDetection.send({ image: canvas }).catch(reject);
    });
  }

  extractFaceRegion(imageData, detection) {
    // Extract face region based on detection bounding box
    const bbox = detection.boundingBox;
    const x = Math.floor(bbox.xCenter * imageData.width - bbox.width * imageData.width / 2);
    const y = Math.floor(bbox.yCenter * imageData.height - bbox.height * imageData.height / 2);
    const width = Math.floor(bbox.width * imageData.width);
    const height = Math.floor(bbox.height * imageData.height);
    
    // Create new canvas for face region
    const faceCanvas = document.createElement('canvas');
    const faceCtx = faceCanvas.getContext('2d');
    faceCanvas.width = width;
    faceCanvas.height = height;
    
    // Create temporary canvas with full image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.putImageData(imageData, 0, 0);
    
    // Extract face region
    faceCtx.drawImage(tempCanvas, x, y, width, height, 0, 0, width, height);
    
    return faceCtx.getImageData(0, 0, width, height);
  }

  async analyzeSkinRegion(faceImageData) {
    try {
      // Convert ImageData to tensor and normalize to float32 [0, 1]
      const rawTensor = tf.browser.fromPixels(faceImageData);
      const tensor = rawTensor.toFloat().div(255.0);
      
      // Clean up raw tensor
      rawTensor.dispose();
      
      // Analyze different skin features
      const textureAnalysis = await this.analyzeTextureFeatures(tensor);
      const colorAnalysis = await this.analyzeColorFeatures(tensor);
      const acneAnalysis = await this.detectAcneFeatures(tensor);
      const wrinkleAnalysis = await this.detectWrinkleFeatures(tensor);
      const pigmentationAnalysis = await this.analyzePigmentationFeatures(tensor);
      
      // Clean up tensor
      tensor.dispose();
      
      return {
        oiliness: this.calculateOiliness(colorAnalysis, textureAnalysis),
        dryness: this.calculateDryness(colorAnalysis, textureAnalysis),
        acneLevel: acneAnalysis.severity,
        pigmentationLevel: pigmentationAnalysis.unevenness,
        wrinkleLevel: wrinkleAnalysis.severity,
        skinTone: colorAnalysis.dominantTone,
        textureScore: textureAnalysis.smoothness,
        overallHealth: this.calculateOverallHealth({
          oiliness: this.calculateOiliness(colorAnalysis, textureAnalysis),
          dryness: this.calculateDryness(colorAnalysis, textureAnalysis),
          acneLevel: acneAnalysis.severity,
          pigmentationLevel: pigmentationAnalysis.unevenness,
          wrinkleLevel: wrinkleAnalysis.severity
        })
      };
      
    } catch (error) {
      console.error('Skin region analysis error:', error);
      throw error;
    }
  }

  async analyzeTextureFeatures(tensor) {
    // Analyze skin texture using edge detection and variance
    const grayscale = tf.image.rgbToGrayscale(tensor);
    
    // Apply Sobel edge detection (convert to float32)
    const sobelX = tf.tensor2d([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], [3, 3], 'float32').expandDims(2).expandDims(3);
    const sobelY = tf.tensor2d([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], [3, 3], 'float32').expandDims(2).expandDims(3);
    
    const edgesX = tf.conv2d(grayscale.expandDims(0), sobelX, 1, 'same');
    const edgesY = tf.conv2d(grayscale.expandDims(0), sobelY, 1, 'same');
    
    // Calculate edge magnitude
    const edgeMagnitude = tf.sqrt(tf.add(tf.square(edgesX), tf.square(edgesY)));
    
    // Calculate texture metrics
    const meanEdge = await tf.mean(edgeMagnitude).data();
    const variance = await tf.moments(grayscale).variance.data();
    
    // Clean up tensors
    grayscale.dispose();
    sobelX.dispose();
    sobelY.dispose();
    edgesX.dispose();
    edgesY.dispose();
    edgeMagnitude.dispose();
    
    return {
      edgeIntensity: meanEdge[0] * 100,
      variance: variance[0] * 100,
      smoothness: Math.max(0, 100 - meanEdge[0] * 200) // Higher smoothness = lower edge intensity
    };
  }

  async analyzeColorFeatures(tensor) {
    // Analyze color distribution and skin tone
    const [r, g, b] = tf.split(tensor, 3, 2);
    
    const rMean = await tf.mean(r).data();
    const gMean = await tf.mean(g).data();
    const bMean = await tf.mean(b).data();
    
    const rStd = await tf.moments(r).variance.sqrt().data();
    const gStd = await tf.moments(g).variance.sqrt().data();
    const bStd = await tf.moments(b).variance.sqrt().data();
    
    // Clean up tensors
    r.dispose();
    g.dispose();
    b.dispose();
    
    // Calculate skin tone and color properties
    const dominantTone = this.calculateSkinTone(rMean[0], gMean[0], bMean[0]);
    const colorVariance = (rStd[0] + gStd[0] + bStd[0]) / 3;
    
    return {
      dominantTone,
      redness: rMean[0] / 255 * 100,
      colorVariance: colorVariance * 100,
      brightness: (rMean[0] + gMean[0] + bMean[0]) / 3 / 255 * 100
    };
  }

  async detectAcneFeatures(tensor) {
    // Simple acne detection based on color and texture irregularities
    const [r, g, b] = tf.split(tensor, 3, 2);
    
    // Look for reddish spots (higher red, lower green/blue)
    const redness = tf.sub(r, tf.mean([g, b], 0));
    const redSpots = tf.greater(redness, tf.scalar(0.1));
    
    // Count potential acne spots
    const spotCount = await tf.sum(tf.cast(redSpots, 'float32')).data();
    const totalPixels = tensor.shape[0] * tensor.shape[1];
    
    // Clean up tensors
    r.dispose();
    g.dispose();
    b.dispose();
    redness.dispose();
    redSpots.dispose();
    
    return {
      severity: Math.min(100, (spotCount[0] / totalPixels) * 1000),
      spotCount: spotCount[0]
    };
  }

  async detectWrinkleFeatures(tensor) {
    // Detect wrinkles using edge detection and line analysis
    const grayscale = tf.image.rgbToGrayscale(tensor);
    
    // Apply Laplacian filter for wrinkle detection (convert to float32)
    const laplacian = tf.tensor2d([[0, -1, 0], [-1, 4, -1], [0, -1, 0]], [3, 3], 'float32').expandDims(2).expandDims(3);
    const wrinkleMap = tf.conv2d(grayscale.expandDims(0), laplacian, 1, 'same');
    
    // Calculate wrinkle intensity
    const wrinkleIntensity = await tf.mean(tf.abs(wrinkleMap)).data();
    
    // Clean up tensors
    grayscale.dispose();
    laplacian.dispose();
    wrinkleMap.dispose();
    
    return {
      severity: Math.min(100, wrinkleIntensity[0] * 500)
    };
  }

  async analyzePigmentationFeatures(tensor) {
    // Analyze pigmentation unevenness
    const [r, g, b] = tf.split(tensor, 3, 2);
    
    // Calculate color uniformity
    const rVar = await tf.moments(r).variance.data();
    const gVar = await tf.moments(g).variance.data();
    const bVar = await tf.moments(b).variance.data();
    
    // Clean up tensors
    r.dispose();
    g.dispose();
    b.dispose();
    
    const avgVariance = (rVar[0] + gVar[0] + bVar[0]) / 3;
    
    return {
      unevenness: Math.min(100, avgVariance * 1000),
      uniformity: Math.max(0, 100 - avgVariance * 1000)
    };
  }

  calculateOiliness(colorAnalysis, textureAnalysis) {
    // Higher brightness and lower texture variance often indicate oiliness
    const oiliness = (colorAnalysis.brightness * 0.6) + ((100 - textureAnalysis.variance) * 0.4);
    return Math.min(100, Math.max(0, oiliness));
  }

  calculateDryness(colorAnalysis, textureAnalysis) {
    // Lower brightness and higher texture variance often indicate dryness
    const dryness = ((100 - colorAnalysis.brightness) * 0.6) + (textureAnalysis.variance * 0.4);
    return Math.min(100, Math.max(0, dryness));
  }

  calculateOverallHealth(metrics) {
    // Calculate overall skin health score
    const healthScore = 100 - (
      (metrics.acneLevel * 0.3) +
      (metrics.pigmentationLevel * 0.2) +
      (metrics.wrinkleLevel * 0.2) +
      (Math.abs(metrics.oiliness - 50) * 0.15) + // Optimal oiliness is around 50
      (Math.abs(metrics.dryness - 30) * 0.15)    // Optimal dryness is around 30
    );
    
    return Math.min(100, Math.max(0, healthScore));
  }

  calculateSkinTone(r, g, b) {
    // Simple skin tone classification
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    if (rNorm > 0.8 && gNorm > 0.7 && bNorm > 0.6) return 'fair';
    if (rNorm > 0.6 && gNorm > 0.5 && bNorm > 0.4) return 'medium';
    if (rNorm > 0.4 && gNorm > 0.3 && bNorm > 0.2) return 'olive';
    return 'dark';
  }

  getFaceBox(detection) {
    return {
      x: detection.boundingBox.xCenter,
      y: detection.boundingBox.yCenter,
      width: detection.boundingBox.width,
      height: detection.boundingBox.height
    };
  }

  async captureAndAnalyze(videoElement) {
    try {
      const analysis = await this.analyzeFrame(videoElement);
      
      if (!analysis.success) {
        return analysis;
      }

      // Create canvas to capture the frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob for upload
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
      return {
        ...analysis,
        imageBlob: blob,
        imageDataUrl: canvas.toDataURL('image/jpeg', 0.8)
      };
      
    } catch (error) {
      console.error('Capture and analyze error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  dispose() {
    if (this.faceDetection) {
      this.faceDetection.close();
    }
    if (this.selfieSegmentation) {
      this.selfieSegmentation.close();
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
const aiSkinAnalysisService = new AISkinAnalysisService();

export default aiSkinAnalysisService;