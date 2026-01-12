import React, { useState, useRef } from 'react';
import Button from '../components/common/Button';

const CameraTest = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    console.log('CameraTest: startCamera called');
    setError(null);

    try {
      console.log('CameraTest: Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      console.log('CameraTest: Camera access granted');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        console.log('CameraTest: Camera started successfully');
      }
    } catch (err) {
      console.error('CameraTest: Camera error:', err);
      setError(err.message);
    }
  };

  const stopCamera = () => {
    console.log('CameraTest: stopCamera called');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const testClick = () => {
    console.log('CameraTest: Test button clicked!');
    alert('Button click works!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Camera Test Component</h1>
      
      <div className="space-y-4">
        <div>
          <Button onClick={testClick}>
            Test Button Click
          </Button>
        </div>

        <div>
          {!isStreaming ? (
            <Button onClick={startCamera}>
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera}>
              Stop Camera
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md"
            />
          ) : (
            <div className="w-full max-w-md h-64 bg-gray-200 flex items-center justify-center">
              <p>Camera not started</p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <p>Status: {isStreaming ? 'Streaming' : 'Not streaming'}</p>
          <p>Browser: {navigator.userAgent}</p>
          <p>HTTPS: {location.protocol === 'https:' ? 'Yes' : 'No'}</p>
          <p>Localhost: {location.hostname === 'localhost' ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  );
};

export default CameraTest;