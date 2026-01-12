import React, { useState, useRef, useEffect } from 'react';

const AutoDiagnostic = () => {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const runAutoDiagnostic = async () => {
    setIsRunning(true);
    setLogs([]);
    
    addLog('Starting auto-diagnostic...', 'info');
    
    // Test 1: Basic environment
    addLog(`User Agent: ${navigator.userAgent}`, 'info');
    addLog(`Protocol: ${location.protocol}`, 'info');
    addLog(`Host: ${location.host}`, 'info');
    addLog(`Secure Context: ${window.isSecureContext}`, 'info');
    
    // Test 2: MediaDevices API
    if (!navigator.mediaDevices) {
      addLog('navigator.mediaDevices is not available', 'error');
      setIsRunning(false);
      return;
    }
    addLog('navigator.mediaDevices is available', 'success');
    
    // Test 3: getUserMedia support
    if (!navigator.mediaDevices.getUserMedia) {
      addLog('getUserMedia is not supported', 'error');
      setIsRunning(false);
      return;
    }
    addLog('getUserMedia is supported', 'success');
    
    // Test 4: Enumerate devices
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      addLog(`Found ${devices.length} total devices, ${videoDevices.length} video devices`, 'info');
      
      if (videoDevices.length === 0) {
        addLog('No video input devices found', 'warning');
      } else {
        videoDevices.forEach((device, index) => {
          addLog(`Video device ${index + 1}: ${device.label || 'Unknown device'}`, 'info');
        });
      }
    } catch (error) {
      addLog(`Error enumerating devices: ${error.message}`, 'error');
    }
    
    // Test 5: Check permissions
    if (navigator.permissions) {
      try {
        const result = await navigator.permissions.query({ name: 'camera' });
        addLog(`Camera permission state: ${result.state}`, 'info');
      } catch (error) {
        addLog(`Error checking permissions: ${error.message}`, 'warning');
      }
    } else {
      addLog('Permissions API not available', 'warning');
    }
    
    // Test 6: Attempt camera access
    addLog('Attempting to access camera...', 'info');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      addLog('Camera access granted successfully!', 'success');
      addLog(`Stream active: ${stream.active}`, 'info');
      addLog(`Video tracks: ${stream.getVideoTracks().length}`, 'info');
      
      if (stream.getVideoTracks().length > 0) {
        const track = stream.getVideoTracks()[0];
        addLog(`Track label: ${track.label}`, 'info');
        addLog(`Track enabled: ${track.enabled}`, 'info');
        addLog(`Track ready state: ${track.readyState}`, 'info');
        
        const settings = track.getSettings();
        addLog(`Video settings: ${JSON.stringify(settings)}`, 'info');
      }
      
      // Try to assign to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        addLog('Stream assigned to video element', 'success');
        
        // Wait a bit and check if video is playing
        setTimeout(() => {
          if (videoRef.current) {
            addLog(`Video paused: ${videoRef.current.paused}`, 'info');
            addLog(`Video ready state: ${videoRef.current.readyState}`, 'info');
            addLog(`Video width: ${videoRef.current.videoWidth}`, 'info');
            addLog(`Video height: ${videoRef.current.videoHeight}`, 'info');
          }
        }, 2000);
      } else {
        addLog('Video element not available', 'error');
      }
      
    } catch (error) {
      addLog(`Camera access failed: ${error.name} - ${error.message}`, 'error');
      
      // Provide specific error information
      switch (error.name) {
        case 'NotAllowedError':
          addLog('User denied camera permission or camera is blocked', 'error');
          break;
        case 'NotFoundError':
          addLog('No camera device found', 'error');
          break;
        case 'NotReadableError':
          addLog('Camera is already in use or hardware error', 'error');
          break;
        case 'OverconstrainedError':
          addLog('Camera constraints cannot be satisfied', 'error');
          break;
        case 'SecurityError':
          addLog('Security error - possibly due to insecure context', 'error');
          break;
        default:
          addLog(`Unknown error type: ${error.name}`, 'error');
      }
    }
    
    addLog('Auto-diagnostic completed', 'info');
    setIsRunning(false);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      addLog('Camera stream stopped', 'info');
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    // Auto-run diagnostic on component mount
    runAutoDiagnostic();
    
    return () => {
      stopCamera();
    };
  }, []);

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1>Auto Camera Diagnostic</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAutoDiagnostic} 
          disabled={isRunning}
          style={{
            background: isRunning ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isRunning ? 'Running...' : 'Run Diagnostic'}
        </button>
        
        <button 
          onClick={stopCamera}
          style={{
            background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Stop Camera
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>Diagnostic Logs</h2>
          <div style={{
            background: '#1f2937',
            color: '#f9fafb',
            padding: '15px',
            borderRadius: '8px',
            height: '400px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            {logs.length === 0 ? (
              <div>No logs yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ color: getLogColor(log.type), marginBottom: '4px' }}>
                  [{log.timestamp}] {log.type.toUpperCase()}: {log.message}
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2>Camera Preview</h2>
          <div style={{
            background: '#f3f4f6',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            padding: '10px',
            height: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoDiagnostic;