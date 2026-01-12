import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { ExclamationTriangleIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CameraTroubleshoot = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const troubleshootSteps = [
    {
      title: "Check Browser Permissions",
      description: "Ensure camera permissions are granted in your browser",
      instructions: [
        "Click the camera icon in your browser's address bar",
        "Select 'Allow' for camera access",
        "Refresh the page after granting permission"
      ]
    },
    {
      title: "Close Other Applications",
      description: "Common applications that use your camera",
      instructions: [
        "Close Zoom, Microsoft Teams, Skype, or Discord",
        "Close any other browser tabs using the camera",
        "Check for background applications in your system tray",
        "Restart your browser if needed"
      ]
    },
    {
      title: "Check Camera Hardware",
      description: "Verify your camera is working properly",
      instructions: [
        "Make sure your camera is properly connected",
        "Try using your camera in another application",
        "Check if camera drivers are up to date",
        "Restart your computer if issues persist"
      ]
    },
    {
      title: "Browser Compatibility",
      description: "Ensure you're using a supported browser",
      instructions: [
        "Use Chrome, Firefox, Safari, or Edge (latest versions)",
        "Make sure you're accessing the site via HTTPS",
        "Clear browser cache and cookies",
        "Disable browser extensions that might block camera access"
      ]
    }
  ];

  const nextStep = () => {
    if (currentStep < troubleshootSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = troubleshootSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Camera Troubleshooting</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {troubleshootSteps.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / troubleshootSteps.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / troubleshootSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">{currentStep + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{currentStepData.title}</h3>
            </div>
            
            <p className="text-gray-600 mb-4">{currentStepData.description}</p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Instructions:</h4>
              <ul className="space-y-2">
                {currentStepData.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {troubleshootSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < troubleshootSteps.length - 1 ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button onClick={onClose} variant="primary">
                Done
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Quick Actions:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => window.open('chrome://settings/content/camera', '_blank')}
                variant="outline"
                size="sm"
              >
                Chrome Camera Settings
              </Button>
              <Button
                onClick={() => window.open('about:preferences#privacy', '_blank')}
                variant="outline"
                size="sm"
              >
                Firefox Camera Settings
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CameraTroubleshoot;