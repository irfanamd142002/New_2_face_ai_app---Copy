import React, { useState, useRef, useEffect } from 'react';

const DiagnosticPage = () => {
  const [diagnostics, setDiagnostics] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, { test, result, details, timestamp: new Date().toISOString() }]);
  };

  const runDiagnostics = () => {
    const diag = {
      userAgent: navigator.userAgent,
      protocol: location.protocol,
      hostname: location.hostname,
      port: location.port,
      pathname: location.pathname,
      mediaDevicesSupported: !!navigator.mediaDevices,
      getUserMediaSupported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      isSecureContext: window.isSecureContext,
      permissions: 'unknown'
    };

    // Check permissions if available
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'camera' }).then(result => {
        setDiagnostics(prev => ({ ...prev, permissions: result.state }));
      }).catch(err => {
        setDiagnostics(prev => ({ ...prev, permissions: 'error: ' + err.message }));
      });
    }

    setDiagnostics(diag);
    addTestResult('Diagnostics', 'completed', 'Initial diagnostics gathered');
  };

  const testButtonClick = () => {
    addTestResult('Button Click', 'success', 'Button click event fired');
    alert('Button click test successful!');
  };

  const testConsoleLog = () => {
    console.log('Console log test from DiagnosticPage');
    addTestResult('Console Log', 'success', 'Check browser console for log message');
  };

  const testLocalStorage = () => {
    try {
      localStorage.setItem('test', 'value');
      const value = localStorage.getItem('test');
      localStorage.removeItem('test');
      addTestResult('Local Storage', 'success', `Value: ${value}`);
    } catch (error) {
      addTestResult('Local Storage', 'failed', error.message);
    }
  };

  const testMediaDevices = async () => {
    try {
      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices not available');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      addTestResult('Media Devices', 'success', `Found ${videoDevices.length} video devices`);
    } catch (error) {
      addTestResult('Media Devices', 'failed', error.message);
    }
  };

  const testCameraAccess = async () => {
    try {
      addTestResult('Camera Access', 'testing', 'Requesting camera permission...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        addTestResult('Camera Access', 'success', 'Camera stream obtained successfully');
      } else {
        throw new Error('Video element not available');
      }
    } catch (error) {
      addTestResult('Camera Access', 'failed', `${error.name}: ${error.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    addTestResult('Camera Stop', 'success', 'Camera stopped');
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('Test Suite', 'started', 'Running all tests...');
    
    testButtonClick();
    testConsoleLog();
    testLocalStorage();
    await testMediaDevices();
    
    addTestResult('Test Suite', 'completed', 'All tests completed');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Camera Diagnostic Page</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Quick Tests</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={testButtonClick} style={buttonStyle}>Test Button Click</button>
          <button onClick={testConsoleLog} style={buttonStyle}>Test Console Log</button>
          <button onClick={testLocalStorage} style={buttonStyle}>Test Local Storage</button>
          <button onClick={testMediaDevices} style={buttonStyle}>Test Media Devices</button>
          <button onClick={testCameraAccess} style={buttonStyle}>Test Camera Access</button>
          {isStreaming && <button onClick={stopCamera} style={{...buttonStyle, background: '#ef4444'}}>Stop Camera</button>}
          <button onClick={runAllTests} style={{...buttonStyle, background: '#10b981'}}>Run All Tests</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h2>System Diagnostics</h2>
          <div style={cardStyle}>
            {Object.entries(diagnostics).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '8px' }}>
                <strong>{key}:</strong> {String(value)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Test Results</h2>
          <div style={cardStyle}>
            {testResults.length === 0 ? (
              <p>No tests run yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} style={{
                  marginBottom: '10px',
                  padding: '8px',
                  borderRadius: '4px',
                  background: result.result === 'success' ? '#d1fae5' : 
                             result.result === 'failed' ? '#fee2e2' : 
                             result.result === 'testing' ? '#fef3c7' : '#f3f4f6'
                }}>
                  <div><strong>{result.test}:</strong> {result.result}</div>
                  {result.details && <div style={{ fontSize: '12px', color: '#666' }}>{result.details}</div>}
                  <div style={{ fontSize: '10px', color: '#999' }}>{new Date(result.timestamp).toLocaleTimeString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Camera Test</h2>
        <div style={cardStyle}>
          {isStreaming ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxWidth: '400px', border: '2px solid #10b981', borderRadius: '8px' }}
            />
          ) : (
            <div style={{
              width: '100%',
              maxWidth: '400px',
              height: '300px',
              background: '#f3f4f6',
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p>Camera not active</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const buttonStyle = {
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  padding: '10px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px'
};

const cardStyle = {
  background: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px'
};

export default DiagnosticPage;