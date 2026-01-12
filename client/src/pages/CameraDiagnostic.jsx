import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const CameraDiagnostic = () => {
  const [diagnosticResults, setDiagnosticResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const addResult = (message, type = 'info') => {
    setDiagnosticResults(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnosticResults([]);
    
    addResult('Starting camera diagnostics...', 'info');
    
    // Basic environment checks
    addResult(`User Agent: ${navigator.userAgent}`, 'info');
    addResult(`Protocol: ${location.protocol}`, 'info');
    addResult(`Host: ${location.host}`, 'info');
    addResult(`Secure Context: ${window.isSecureContext}`, window.isSecureContext ? 'success' : 'warning');
    
    // MediaDevices API check
    if (navigator.mediaDevices) {
      addResult('✓ MediaDevices API is supported', 'success');
      
      if (navigator.mediaDevices.getUserMedia) {
        addResult('✓ getUserMedia is supported', 'success');
      } else {
        addResult('✗ getUserMedia is not supported', 'error');
      }
    } else {
      addResult('✗ MediaDevices API is not supported', 'error');
      setIsRunning(false);
      return;
    }

    // Enumerate devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      addResult(`Total devices found: ${devices.length}`, 'info');
      addResult(`Video input devices: ${videoDevices.length}`, videoDevices.length > 0 ? 'success' : 'warning');
      
      videoDevices.forEach((device, index) => {
        addResult(`Video device ${index + 1}: ${device.label || 'Unknown device'}`, 'info');
      });
    } catch (error) {
      addResult(`Error enumerating devices: ${error.message}`, 'error');
    }

    // Check permissions
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        addResult(`Camera permission state: ${result.state}`, 
          result.state === 'granted' ? 'success' : 
          result.state === 'prompt' ? 'warning' : 'error');
      } catch (error) {
        addResult(`Error checking permissions: ${error.message}`, 'error');
      }
    } else {
      addResult('Permissions API not available', 'warning');
    }

    // Test camera access
    addResult('Attempting to access camera...', 'info');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      addResult('✓ Camera access successful!', 'success');
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        addResult('✓ Video stream attached to video element', 'success');
      }
      
      // Get stream info
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        addResult(`Video track settings: ${settings.width}x${settings.height}`, 'info');
        addResult(`Device ID: ${settings.deviceId}`, 'info');
        addResult(`Frame rate: ${settings.frameRate}`, 'info');
      }
      
    } catch (error) {
      addResult(`✗ Camera access failed: ${error.name} - ${error.message}`, 'error');
      
      // Try with different constraints
      addResult('Trying with basic constraints...', 'info');
      try {
        const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
        addResult('✓ Basic camera access successful!', 'success');
        setCameraStream(basicStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = basicStream;
        }
      } catch (basicError) {
        addResult(`✗ Basic camera access also failed: ${basicError.name} - ${basicError.message}`, 'error');
      }
    }
    
    setIsRunning(false);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      addResult('Camera stopped', 'info');
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Camera Diagnostic Tool</h1>
          <p className="text-gray-600">Test camera functionality and identify potential issues</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Diagnostic Results */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Diagnostic Results</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={runDiagnostics} 
                  disabled={isRunning}
                  className="text-sm"
                >
                  {isRunning ? 'Running...' : 'Run Diagnostics'}
                </Button>
                {cameraStream && (
                  <Button 
                    onClick={stopCamera} 
                    variant="outline"
                    className="text-sm"
                  >
                    Stop Camera
                  </Button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              {diagnosticResults.length === 0 ? (
                <div className="text-gray-500">Click "Run Diagnostics" to start testing...</div>
              ) : (
                diagnosticResults.map((result, index) => (
                  <div key={index} className={`mb-1 ${getResultColor(result.type)}`}>
                    <span className="text-gray-400">[{result.timestamp}]</span> {result.message}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Camera Preview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Camera Preview</h3>
            <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {cameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div>No camera stream</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CameraDiagnostic;