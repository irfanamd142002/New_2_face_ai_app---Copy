import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  EnvelopeIcon,
  ArrowLeftIcon,
  CameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const { forgotPassword, loading } = useAuth()

  const handleChange = (e) => {
    setEmail(e.target.value)
    if (errors.email) {
      setErrors({})
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const result = await forgotPassword(email)
    if (result.success) {
      setIsSubmitted(true)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-200/30 to-accent-200/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <CheckCircleIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-gray-600">
              We've sent a password reset link to
            </p>
            <p className="font-medium text-primary-600">
              {email}
            </p>
          </div>

          <Card padding="lg" className="text-center">
            <div className="space-y-4">
              <p className="text-gray-600">
                Click the link in the email to reset your password. If you don't see the email, check your spam folder.
              </p>
              
              <div className="pt-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    icon={<ArrowLeftIcon className="w-4 h-4" />}
                    fullWidth
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </div>

              <div className="text-sm text-gray-500">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-200/30 to-secondary-200/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary-200/30 to-accent-200/30 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <CameraIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Forgot Password?
          </h2>
          <p className="mt-2 text-gray-600">
            No worries! Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="mt-8" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email address"
              icon={<EnvelopeIcon className="w-5 h-5" />}
              error={errors.email}
              autoComplete="email"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </Card>

        {/* Help */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-4">
            Need help? Contact our support team
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <span>📧 support@skincare-ai.com</span>
            <span>💬 Live Chat</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword