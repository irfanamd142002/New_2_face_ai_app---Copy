/**
 * WebRTC Camera Service for High-Quality Video Capture
 * Provides professional-grade video streaming for skin analysis
 */

class WebRTCCameraService {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.isStreaming = false;
    this.constraints = {
      video: {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, min: 15 },
        facingMode: 'user',
        // Advanced video constraints for better quality
        aspectRatio: { ideal: 16/9 },
        resizeMode: 'crop-and-scale',
        // Request high-quality video
        advanced: [
          { width: 1920, height: 1080 },
          { width: 1280, height: 720 },
          { frameRate: 60 },
          { frameRate: 30 }
        ]
      },
      audio: false // We don't need audio for skin analysis
    };
    
    this.supportedConstraints = null;
    this.currentSettings = null;
  }

  /**
   * Initialize WebRTC and check capabilities
   */
  async initialize() {
    try {
      console.log('🎥 Initializing WebRTC Camera Service...');
      
      // Check WebRTC support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('WebRTC not supported in this browser');
      }
      
      // Get supported constraints
      this.supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
      console.log('📋 Supported constraints:', this.supportedConstraints);
      
      // Enumerate available devices
      const devices = await this.getAvailableDevices();
      console.log('📱 Available devices:', devices);
      
      console.log('✅ WebRTC Camera Service initialized');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to initialize WebRTC Camera Service:', error);
      return false;
    }
  }

  /**
   * Get available video input devices
   */
  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      return videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
        groupId: device.groupId
      }));
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      return [];
    }
  }

  /**
   * Start high-quality video stream
   */
  async startStream(videoElement, deviceId = null) {
    try {
      console.log('🚀 Starting high-quality video stream...');
      
      // Update constraints with specific device if provided
      const constraints = { ...this.constraints };
      if (deviceId) {
        constraints.video.deviceId = { exact: deviceId };
      }
      
      // Request user media with high-quality constraints
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Set up video element
      this.videoElement = videoElement;
      this.videoElement.srcObject = this.stream;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          resolve();
        };
      });
      
      // Get actual stream settings
      const videoTrack = this.stream.getVideoTracks()[0];
      this.currentSettings = videoTrack.getSettings();
      
      console.log('📊 Stream settings:', this.currentSettings);
      console.log('✅ High-quality video stream started');
      
      this.isStreaming = true;
      return this.currentSettings;
      
    } catch (error) {
      console.error('❌ Failed to start video stream:', error);
      throw error;
    }
  }

  /**
   * Switch to different camera device
   */
  async switchCamera(deviceId) {
    if (this.isStreaming) {
      await this.stopStream();
    }
    
    return await this.startStream(this.videoElement, deviceId);
  }

  /**
   * Adjust video quality dynamically
   */
  async adjustQuality(qualityLevel = 'high') {
    if (!this.stream) {
      throw new Error('No active stream to adjust');
    }
    
    const videoTrack = this.stream.getVideoTracks()[0];
    
    let constraints;
    switch (qualityLevel) {
      case 'ultra':
        constraints = {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        };
        break;
      case 'high':
        constraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        };
        break;
      case 'medium':
        constraints = {
          width: { ideal: 854 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        };
        break;
      case 'low':
        constraints = {
          width: { ideal: 640 },
          height: { ideal: 360 },
          frameRate: { ideal: 15 }
        };
        break;
      default:
        constraints = this.constraints.video;
    }
    
    try {
      await videoTrack.applyConstraints(constraints);
      this.currentSettings = videoTrack.getSettings();
      console.log(`📊 Quality adjusted to ${qualityLevel}:`, this.currentSettings);
      return this.currentSettings;
    } catch (error) {
      console.error('Failed to adjust quality:', error);
      throw error;
    }
  }

  /**
   * Capture high-quality frame from video stream
   */
  captureFrame(format = 'jpeg', quality = 0.95) {
    if (!this.videoElement || !this.isStreaming) {
      throw new Error('No active video stream to capture from');
    }
    
    // Create canvas with video dimensions
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = this.videoElement.videoWidth;
    canvas.height = this.videoElement.videoHeight;
    
    // Draw current video frame
    ctx.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    
    // Convert to desired format
    const mimeType = `image/${format}`;
    const dataURL = canvas.toDataURL(mimeType, quality);
    
    // Also return as blob for upload
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          dataURL,
          blob,
          width: canvas.width,
          height: canvas.height,
          format,
          quality,
          timestamp: new Date().toISOString()
        });
      }, mimeType, quality);
    });
  }

  /**
   * Record video segment for analysis
   */
  async recordSegment(duration = 5000) {
    if (!this.stream) {
      throw new Error('No active stream to record');
    }
    
    const mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000 // 2.5 Mbps for high quality
    });
    
    const chunks = [];
    
    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        resolve({
          blob,
          url,
          duration,
          size: blob.size,
          timestamp: new Date().toISOString()
        });
      };
      
      mediaRecorder.onerror = reject;
      
      // Start recording
      mediaRecorder.start();
      
      // Stop after specified duration
      setTimeout(() => {
        mediaRecorder.stop();
      }, duration);
    });
  }

  /**
   * Get stream statistics and quality metrics
   */
  async getStreamStats() {
    if (!this.stream) {
      return null;
    }
    
    const videoTrack = this.stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();
    const capabilities = videoTrack.getCapabilities();
    
    // Get WebRTC stats if available
    let rtcStats = null;
    if (window.RTCPeerConnection) {
      try {
        const pc = new RTCPeerConnection();
        const sender = pc.addTrack(videoTrack, this.stream);
        const stats = await sender.getStats();
        
        stats.forEach((report) => {
          if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
            rtcStats = {
              framesSent: report.framesSent,
              framesPerSecond: report.framesPerSecond,
              bytesSent: report.bytesSent,
              timestamp: report.timestamp
            };
          }
        });
        
        pc.close();
      } catch (error) {
        console.warn('Could not get RTC stats:', error);
      }
    }
    
    return {
      settings,
      capabilities,
      rtcStats,
      isActive: videoTrack.readyState === 'live',
      label: videoTrack.label
    };
  }

  /**
   * Enable/disable torch (flashlight) if supported
   */
  async toggleTorch(enable = true) {
    if (!this.stream) {
      throw new Error('No active stream');
    }
    
    const videoTrack = this.stream.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities();
    
    if (!capabilities.torch) {
      throw new Error('Torch not supported on this device');
    }
    
    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: enable }]
      });
      
      console.log(`🔦 Torch ${enable ? 'enabled' : 'disabled'}`);
      return true;
    } catch (error) {
      console.error('Failed to toggle torch:', error);
      throw error;
    }
  }

  /**
   * Apply zoom if supported
   */
  async setZoom(zoomLevel = 1.0) {
    if (!this.stream) {
      throw new Error('No active stream');
    }
    
    const videoTrack = this.stream.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities();
    
    if (!capabilities.zoom) {
      throw new Error('Zoom not supported on this device');
    }
    
    const { min, max } = capabilities.zoom;
    const clampedZoom = Math.max(min, Math.min(max, zoomLevel));
    
    try {
      await videoTrack.applyConstraints({
        advanced: [{ zoom: clampedZoom }]
      });
      
      console.log(`🔍 Zoom set to ${clampedZoom}x`);
      return clampedZoom;
    } catch (error) {
      console.error('Failed to set zoom:', error);
      throw error;
    }
  }

  /**
   * Stop video stream and cleanup
   */
  async stopStream() {
    try {
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          track.stop();
        });
        this.stream = null;
      }
      
      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }
      
      this.isStreaming = false;
      this.currentSettings = null;
      
      console.log('🛑 Video stream stopped');
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  }

  /**
   * Check if WebRTC features are supported
   */
  static checkSupport() {
    const support = {
      webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      mediaRecorder: !!window.MediaRecorder,
      rtcPeerConnection: !!window.RTCPeerConnection,
      getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
    };
    
    return support;
  }

  /**
   * Get current stream info
   */
  getStreamInfo() {
    return {
      isStreaming: this.isStreaming,
      settings: this.currentSettings,
      constraints: this.constraints,
      supportedConstraints: this.supportedConstraints
    };
  }
}

// Create and export service instance
const webRTCCameraService = new WebRTCCameraService();

console.log('🎉 WebRTC Camera Service loaded successfully');

// Export the service instance
export { webRTCCameraService };
export default webRTCCameraService;