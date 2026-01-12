import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestReviewCard = () => {
  const { user, token } = useAuth();
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    console.log('🔐 Auth state:', { user: user ? 'Present' : 'Missing', token: token ? 'Present' : 'Missing' });
    if (token) {
      fetchZeshtoJourney();
    } else {
      setError('Please log in to view your Zeshto journey');
      setLoading(false);
    }
  }, [token]);

  const fetchZeshtoJourney = async () => {
    try {
      console.log('🔍 Fetching Zeshto journey...');
      
      const response = await fetch('/api/analysis/zeshto/journey', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response:', { status: response.status, ok: response.ok });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Journey data received:', data);
        setJourney(data.journey);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        setError(`Failed to fetch your Zeshto journey: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('🚨 Network error:', err);
      setError(`Network error occurred: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const TestCard = ({ analysis, isSelected, onClick }) => {
    console.log('🎯 TestCard rendered:', { analysis, isSelected });
    
    return (
      <div 
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => {
          console.log('🖱️ Card clicked!', analysis);
          onClick(analysis);
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-800">
            Day {analysis.usageDay}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(analysis.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          Click me to test functionality!
        </div>
        
        {isSelected && (
          <div className="mt-2 p-2 bg-green-100 rounded text-green-800 text-sm">
            ✅ This card is selected!
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <a href="/login" className="text-blue-600 hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Review Card Test Page
          </h1>
          <p className="text-lg text-gray-600">
            Testing the review card click functionality
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</div>
            <div><strong>Token:</strong> {token ? 'Present' : 'Missing'}</div>
            <div><strong>Journey:</strong> {journey ? 'Loaded' : 'Not loaded'}</div>
            <div><strong>Selected Analysis:</strong> {selectedAnalysis ? `Day ${selectedAnalysis.usageDay}` : 'None'}</div>
          </div>
        </div>

        {journey?.analyses && journey.analyses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Analysis Cards */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Analysis Timeline</h2>
                <div className="space-y-3">
                  {journey.analyses.map((analysis) => (
                    <TestCard
                      key={analysis._id}
                      analysis={analysis}
                      isSelected={selectedAnalysis?._id === analysis._id}
                      onClick={setSelectedAnalysis}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Analysis Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Selected Analysis Details</h2>
                {selectedAnalysis ? (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Day {selectedAnalysis.usageDay}</h3>
                    <p className="text-gray-600 mb-4">
                      Created: {new Date(selectedAnalysis.createdAt).toLocaleDateString()}
                    </p>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedAnalysis, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500">Click on an analysis card to view details</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No Analysis Data</h2>
            <p className="text-gray-600 mb-4">
              No Zeshto journey data found. You may need to start a journey first.
            </p>
            <a href="/zeshto-review" className="text-blue-600 hover:underline">
              Go to Zeshto Review
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestReviewCard;