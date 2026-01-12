import React, { useState, useRef } from 'react';

const MinimalCameraTest = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleStartCamera = async () => {
    console.log('MinimalCameraTest: Start camera clicked');
    alert('Start camera button clicked!'); // Visual confirmation
    
    setError(null);

    try {
      console.log('MinimalCameraTest: Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      console.log('MinimalCameraTest: Camera access granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        console.log('MinimalCameraTest: Camera started successfully');
      }
    } catch (err) {
      console.error('MinimalCameraTest: Camera error:', err);
      setError(err.message);
      alert(`Camera error: ${err.message}`);
    }
  };

  const handleStopCamera = () => {
    console.log('MinimalCameraTest: Stop camera clicked');
    alert('Stop camera button clicked!'); // Visual confirmation
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const testAlert = () => {
    console.log('MinimalCameraTest: Test alert clicked');
    alert('Test button works!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Minimal Camera Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testAlert}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            margin: '5px',
            fontSize: '16px'
          }}
        >
          Test Alert
        </button>

        {!isStreaming ? (
          <button 
            onClick={handleStartCamera}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              margin: '5px',
              fontSize: '16px'
            }}
          >
            Start Camera
          </button>
        ) : (
          <button 
            onClick={handleStopCamera}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              margin: '5px',
              fontSize: '16px'
            }}
          >
            Stop Camera
          </button>
        )}
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ border: '2px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', maxWidth: '500px' }}
          />
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '500px',
            height: '300px',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p>Camera not started</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
        <p><strong>Status:</strong> {isStreaming ? 'Streaming' : 'Not streaming'}</p>
        <p><strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}</p>
        <p><strong>Protocol:</strong> {location.protocol}</p>
        <p><strong>Host:</strong> {location.hostname}</p>
        <p><strong>MediaDevices:</strong> {navigator.mediaDevices ? 'Supported' : 'Not supported'}</p>
        <p><strong>getUserMedia:</strong> {navigator.mediaDevices?.getUserMedia ? 'Supported' : 'Not supported'}</p>
      </div>
    </div>
  );
};

export default MinimalCameraTest;