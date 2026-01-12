import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AnalysisProvider } from './contexts/AnalysisContext'

// Pages
import SimpleSkinAnalysis from './pages/SimpleSkinAnalysis'
import AIAnalysis from './pages/AIAnalysis'
import BeforeAfterAnalysis from './pages/BeforeAfterAnalysis'
import AIWebcamAnalysis from './pages/AIWebcamAnalysis'
import CameraTest from './pages/CameraTest'
import MinimalCameraTest from './pages/MinimalCameraTest'
import DiagnosticPage from './pages/DiagnosticPage'
import AutoDiagnostic from './pages/AutoDiagnostic'
import CameraDiagnostic from './pages/CameraDiagnostic'
import ZeshtoReview from './pages/ZeshtoReview'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import TestReviewCard from './pages/TestReviewCard'
// Components
import SkinProgressTracker from './components/SkinProgressTracker'
import EnhancedAIAnalysis from './components/EnhancedAIAnalysis'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  // Register Service Worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <AuthProvider>
      <AnalysisProvider>
        <div className="min-h-screen">
          <Router>
          <Routes>
            {/* Default route redirects to manual analysis */}
            <Route path="/" element={<Navigate to="/manual-analysis" replace />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Dashboard Route */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/test-review-card" element={<TestReviewCard />} />
            
            {/* Manual Analysis Page */}
            <Route path="/manual-analysis" element={<SimpleSkinAnalysis />} />
            
            {/* AI Analysis Page */}
            <Route path="/ai-analysis" element={<AIAnalysis />} />
            
            {/* Enhanced AI Analysis Page */}
            <Route path="/enhanced-analysis" element={<EnhancedAIAnalysis />} />
            
            {/* Before/After Analysis Page */}
            <Route path="/before-after-analysis" element={
              <ProtectedRoute>
                <BeforeAfterAnalysis />
              </ProtectedRoute>
            } />
            
            {/* AI Webcam Analysis Page */}
            <Route path="/ai-webcam-analysis" element={<AIWebcamAnalysis />} />
            
            {/* Progress Tracking Page */}
            <Route path="/progress-tracker" element={<SkinProgressTracker />} />
            
            {/* Camera Test Page */}
            <Route path="/camera-test" element={<CameraTest />} />
            <Route path="/minimal-camera-test" element={<MinimalCameraTest />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/auto-diagnostic" element={<AutoDiagnostic />} />
            <Route path="/camera-diagnostic" element={<CameraDiagnostic />} />
            
            {/* Zeshto Review/Progress Page */}
            <Route path="/zeshto-review" element={<ZeshtoReview />} />
            
            {/* Catch all route - redirect to manual analysis */}
            <Route path="*" element={<Navigate to="/manual-analysis" replace />} />
          </Routes>
        </Router>
        
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: 'green',
                secondary: 'black',
              },
            },
          }}
        />
        </div>
      </AnalysisProvider>
    </AuthProvider>
  )
}

export default App