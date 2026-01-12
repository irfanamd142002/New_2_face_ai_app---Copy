/**
 * Web Worker for Background AI Skin Analysis Processing
 * Prevents UI blocking during intensive computations
 */

// Import TensorFlow.js for worker thread
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.22.0/dist/tf-backend-webgl.min.js');

class SkinAnalysisWorker {
  constructor() {
    this.isInitialized = false;
    this.models = {};
    this.analysisQueue = [];
    this.isProcessing = false;
  }

  /**
   * Initialize TensorFlow.js and models in worker thread
   */
  async initialize() {
    try {
      console.log('🔧 Initializing AI models in Web Worker...');
      
      // Initialize TensorFlow.js
      await tf.ready();
      
      // Set backend to WebGL for better performance
      await tf.setBackend('webgl');
      
      console.log('✅ TensorFlow.js initialized in worker');
      console.log('🖥️ Backend:', tf.getBackend());
      
      this.isInitialized = true;
      
      // Notify main thread that worker is ready
      self.postMessage({
        type: 'WORKER_READY',
        payload: {
          backend: tf.getBackend(),
          memory: tf.memory()
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to initialize worker:', error);
      self.postMessage({
        type: 'WORKER_ERROR',
        payload: { error: error.message }
      });
    }
  }

  /**
   * Process skin analysis in background
   */
  async processSkinAnalysis(imageData, landmarks, options = {}) {
    try {
      const startTime = performance.now();
      
      // Convert image data to tensor
      const imageTensor = this.imageDataToTensor(imageData);
      
      // Perform various analyses
      const results = {
        textureAnalysis: await this.analyzeTexture(imageTensor, landmarks),
        colorAnalysis: await this.analyzeColor(imageTensor, landmarks),
        wrinkleAnalysis: await this.analyzeWrinkles(imageTensor, landmarks),
        poreAnalysis: await this.analyzePores(imageTensor, landmarks),
        pigmentationAnalysis: await this.analyzePigmentation(imageTensor, landmarks),
        skinTypeAnalysis: await this.determineSkinType(imageTensor, landmarks),
        overallHealth: 0 // Will be calculated after individual analyses
      };
      
      // Calculate overall health score
      results.overallHealth = this.calculateOverallHealth(results);
      
      // Calculate processing time
      const processingTime = performance.now() - startTime;
      
      // Cleanup tensors
      imageTensor.dispose();
      
      // Return results
      return {
        ...results,
        processingTime: Math.round(processingTime),
        timestamp: new Date().toISOString(),
        workerProcessed: true
      };
      
    } catch (error) {
      console.error('Analysis failed in worker:', error);
      throw error;
    }
  }

  /**
   * Convert ImageData to TensorFlow tensor
   */
  imageDataToTensor(imageData) {
    const { data, width, height } = imageData;
    
    // Convert RGBA to RGB and normalize
    const rgbData = new Float32Array(width * height * 3);
    
    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      rgbData[pixelIndex * 3] = data[i] / 255.0;     // R
      rgbData[pixelIndex * 3 + 1] = data[i + 1] / 255.0; // G
      rgbData[pixelIndex * 3 + 2] = data[i + 2] / 255.0; // B
    }
    
    return tf.tensor3d(rgbData, [height, width, 3]);
  }

  /**
   * Advanced texture analysis using convolution
   */
  async analyzeTexture(imageTensor, landmarks) {
    // Convert to grayscale
    const grayscale = tf.image.rgbToGrayscale(imageTensor);
    
    // Sobel edge detection kernels
    const sobelX = tf.tensor2d([
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ], [3, 3]).expandDims(2).expandDims(3);
    
    const sobelY = tf.tensor2d([
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ], [3, 3]).expandDims(2).expandDims(3);
    
    // Apply convolution
    const edgesX = tf.conv2d(grayscale.expandDims(0), sobelX, 1, 'same');
    const edgesY = tf.conv2d(grayscale.expandDims(0), sobelY, 1, 'same');
    
    // Calculate edge magnitude
    const magnitude = tf.sqrt(tf.add(tf.square(edgesX), tf.square(edgesY)));
    
    // Calculate texture metrics
    const meanMagnitude = await magnitude.mean().data();
    const stdMagnitude = await tf.moments(magnitude).variance.sqrt().data();
    
    // Cleanup
    grayscale.dispose();
    sobelX.dispose();
    sobelY.dispose();
    edgesX.dispose();
    edgesY.dispose();
    magnitude.dispose();
    
    const smoothness = 1 - meanMagnitude[0];
    const variance = stdMagnitude[0];
    
    return {
      smoothness: Math.max(0, Math.min(1, smoothness)),
      variance: Math.max(0, Math.min(1, variance)),
      edgeIntensity: meanMagnitude[0],
      textureScore: smoothness * 0.7 + (1 - variance) * 0.3
    };
  }

  /**
   * Advanced color analysis
   */
  async analyzeColor(imageTensor, landmarks) {
    // Calculate mean color
    const meanColor = await imageTensor.mean([0, 1]).data();
    
    // Calculate color variance
    const colorVariance = await tf.moments(imageTensor, [0, 1]).variance.data();
    
    // Convert to HSV for better analysis
    const hsvTensor = tf.image.rgbToHsv(imageTensor);
    const hsvMean = await hsvTensor.mean([0, 1]).data();
    const hsvVariance = await tf.moments(hsvTensor, [0, 1]).variance.data();
    
    // Calculate skin tone
    const skinTone = this.calculateSkinTone(meanColor);
    
    // Calculate uniformity
    const uniformity = 1 - (colorVariance[0] + colorVariance[1] + colorVariance[2]) / 3;
    
    // Cleanup
    hsvTensor.dispose();
    
    return {
      meanRGB: {
        r: meanColor[0],
        g: meanColor[1],
        b: meanColor[2]
      },
      meanHSV: {
        h: hsvMean[0],
        s: hsvMean[1],
        v: hsvMean[2]
      },
      uniformity: Math.max(0, Math.min(1, uniformity)),
      variance: Math.sqrt(colorVariance[0] + colorVariance[1] + colorVariance[2]),
      skinTone,
      colorScore: uniformity * 0.6 + (1 - Math.sqrt(colorVariance[0] + colorVariance[1] + colorVariance[2])) * 0.4
    };
  }

  /**
   * Wrinkle detection using Laplacian
   */
  async analyzeWrinkles(imageTensor, landmarks) {
    // Convert to grayscale
    const grayscale = tf.image.rgbToGrayscale(imageTensor);
    
    // Laplacian kernel for edge detection
    const laplacianKernel = tf.tensor2d([
      [0, -1, 0],
      [-1, 4, -1],
      [0, -1, 0]
    ], [3, 3]).expandDims(2).expandDims(3);
    
    // Apply Gaussian blur first
    const blurred = tf.image.resizeBilinear(grayscale, [
      Math.floor(grayscale.shape[0] * 0.9),
      Math.floor(grayscale.shape[1] * 0.9)
    ]);
    
    // Apply Laplacian
    const laplacian = tf.conv2d(blurred.expandDims(0), laplacianKernel, 1, 'same');
    
    // Calculate wrinkle intensity
    const wrinkleIntensity = await tf.abs(laplacian).mean().data();
    const wrinkleVariance = await tf.moments(tf.abs(laplacian)).variance.data();
    
    // Cleanup
    grayscale.dispose();
    laplacianKernel.dispose();
    blurred.dispose();
    laplacian.dispose();
    
    const intensity = wrinkleIntensity[0];
    const level = intensity > 0.15 ? 'high' : intensity > 0.08 ? 'medium' : 'low';
    
    return {
      intensity,
      level,
      variance: wrinkleVariance[0],
      wrinkleScore: 1 - intensity
    };
  }

  /**
   * Pore analysis using morphological operations
   */
  async analyzePores(imageTensor, landmarks) {
    // Convert to grayscale
    const grayscale = tf.image.rgbToGrayscale(imageTensor);
    
    // Simple pore detection using local minima
    const blurred = tf.image.resizeBilinear(grayscale, [
      Math.floor(grayscale.shape[0] * 0.95),
      Math.floor(grayscale.shape[1] * 0.95)
    ]);
    
    const difference = tf.sub(grayscale, blurred);
    const poreIntensity = await tf.abs(difference).mean().data();
    
    // Cleanup
    grayscale.dispose();
    blurred.dispose();
    difference.dispose();
    
    const visibility = poreIntensity[0];
    const size = visibility > 0.12 ? 'large' : visibility > 0.06 ? 'medium' : 'small';
    
    return {
      visibility,
      size,
      poreScore: 1 - visibility
    };
  }

  /**
   * Pigmentation analysis
   */
  async analyzePigmentation(imageTensor, landmarks) {
    // Convert to LAB color space approximation
    const meanColor = await imageTensor.mean([0, 1]).data();
    const colorVariance = await tf.moments(imageTensor, [0, 1]).variance.data();
    
    // Calculate pigmentation irregularities
    const pigmentationLevel = Math.sqrt(colorVariance[0] + colorVariance[1] + colorVariance[2]);
    const uniformity = 1 - pigmentationLevel;
    
    const level = pigmentationLevel > 0.15 ? 'high' : pigmentationLevel > 0.08 ? 'medium' : 'low';
    
    return {
      level,
      uniformity: Math.max(0, Math.min(1, uniformity)),
      pigmentationScore: uniformity,
      variance: pigmentationLevel
    };
  }

  /**
   * Determine skin type based on analysis
   */
  async determineSkinType(imageTensor, landmarks) {
    // Analyze oil content (simplified)
    const meanColor = await imageTensor.mean([0, 1]).data();
    const colorVariance = await tf.moments(imageTensor, [0, 1]).variance.data();
    
    // Simple heuristics for skin type
    const oiliness = colorVariance[1]; // Green channel variance
    const dryness = 1 - meanColor[0]; // Red channel inverse
    
    let skinType = 'normal';
    if (oiliness > 0.15 && dryness < 0.3) skinType = 'oily';
    else if (oiliness < 0.08 && dryness > 0.6) skinType = 'dry';
    else if (oiliness > 0.12) skinType = 'combination';
    
    return {
      type: skinType,
      oiliness: Math.max(0, Math.min(1, oiliness)),
      dryness: Math.max(0, Math.min(1, dryness)),
      confidence: 0.8 // Simplified confidence score
    };
  }

  /**
   * Calculate skin tone from RGB values
   */
  calculateSkinTone(rgbValues) {
    const [r, g, b] = rgbValues;
    
    // Simple skin tone classification
    const lightness = (r + g + b) / 3;
    
    if (lightness > 0.8) return 'very_light';
    if (lightness > 0.65) return 'light';
    if (lightness > 0.5) return 'medium';
    if (lightness > 0.35) return 'dark';
    return 'very_dark';
  }

  /**
   * Calculate overall health score
   */
  calculateOverallHealth(results) {
    const weights = {
      texture: 0.25,
      color: 0.2,
      wrinkles: 0.25,
      pores: 0.15,
      pigmentation: 0.15
    };
    
    const scores = {
      texture: results.textureAnalysis?.textureScore || 0.5,
      color: results.colorAnalysis?.colorScore || 0.5,
      wrinkles: results.wrinkleAnalysis?.wrinkleScore || 0.5,
      pores: results.poreAnalysis?.poreScore || 0.5,
      pigmentation: results.pigmentationAnalysis?.pigmentationScore || 0.5
    };
    
    let overallScore = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      overallScore += scores[metric] * weight;
    }
    
    return Math.round(overallScore * 100);
  }

  /**
   * Process analysis queue
   */
  async processQueue() {
    if (this.isProcessing || this.analysisQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.analysisQueue.length > 0) {
      const task = this.analysisQueue.shift();
      
      try {
        const results = await this.processSkinAnalysis(
          task.imageData,
          task.landmarks,
          task.options
        );
        
        self.postMessage({
          type: 'ANALYSIS_COMPLETE',
          payload: {
            taskId: task.id,
            results
          }
        });
        
      } catch (error) {
        self.postMessage({
          type: 'ANALYSIS_ERROR',
          payload: {
            taskId: task.id,
            error: error.message
          }
        });
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Add analysis task to queue
   */
  addToQueue(task) {
    this.analysisQueue.push(task);
    this.processQueue();
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    return tf.memory();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    // Dispose all tensors
    tf.disposeVariables();
    
    // Clear queue
    this.analysisQueue = [];
    this.isProcessing = false;
  }
}

// Initialize worker
const worker = new SkinAnalysisWorker();

// Handle messages from main thread
self.onmessage = async function(event) {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'INITIALIZE':
      await worker.initialize();
      break;
      
    case 'ANALYZE':
      worker.addToQueue(payload);
      break;
      
    case 'GET_MEMORY':
      self.postMessage({
        type: 'MEMORY_USAGE',
        payload: worker.getMemoryUsage()
      });
      break;
      
    case 'CLEANUP':
      worker.cleanup();
      self.postMessage({
        type: 'CLEANUP_COMPLETE'
      });
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
};