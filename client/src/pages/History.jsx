import React, { useState, useEffect } from 'react';
import { useAnalysis } from '../contexts/AnalysisContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { 
  CalendarIcon, 
  EyeIcon, 
  TrashIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const History = () => {
  const { user } = useAuth();
  const { 
    analysisHistory, 
    loading, 
    fetchAnalysisHistory, 
    deleteAnalysis,
    compareAnalyses,
    comparisonResult 
  } = useAnalysis();
  
  const [selectedAnalyses, setSelectedAnalyses] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, ai, manual
  const [sortBy, setSortBy] = useState('date'); // date, score

  useEffect(() => {
    if (user) {
      fetchAnalysisHistory();
    }
  }, [user, fetchAnalysisHistory]);

  const filteredHistory = analysisHistory.filter(analysis => {
    if (filterType === 'all') return true;
    return analysis.type === filterType;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'score') {
      return (b.confidence || 0) - (a.confidence || 0);
    }
    return 0;
  });

  const handleSelectAnalysis = (analysisId) => {
    setSelectedAnalyses(prev => {
      if (prev.includes(analysisId)) {
        return prev.filter(id => id !== analysisId);
      }
      if (prev.length < 2) {
        return [...prev, analysisId];
      }
      return [prev[1], analysisId];
    });
  };

  const handleCompare = async () => {
    if (selectedAnalyses.length === 2) {
      await compareAnalyses(selectedAnalyses[0], selectedAnalyses[1]);
      setShowComparison(true);
    }
  };

  const handleDeleteClick = (analysis) => {
    setAnalysisToDelete(analysis);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (analysisToDelete) {
      await deleteAnalysis(analysisToDelete._id);
      setShowDeleteModal(false);
      setAnalysisToDelete(null);
      fetchAnalysisHistory();
    }
  };

  const getSkinTypeColor = (skinType) => {
    const colors = {
      'dry': 'text-orange-600 bg-orange-100',
      'oily': 'text-blue-600 bg-blue-100',
      'combination': 'text-purple-600 bg-purple-100',
      'sensitive': 'text-red-600 bg-red-100',
      'normal': 'text-green-600 bg-green-100'
    };
    return colors[skinType?.toLowerCase()] || 'text-gray-600 bg-gray-100';
  };

  const getConcernColor = (concern) => {
    const colors = {
      'acne': 'text-red-600 bg-red-100',
      'dark_spots': 'text-yellow-600 bg-yellow-100',
      'wrinkles': 'text-purple-600 bg-purple-100',
      'dryness': 'text-orange-600 bg-orange-100',
      'oiliness': 'text-blue-600 bg-blue-100',
      'sensitivity': 'text-pink-600 bg-pink-100'
    };
    return colors[concern?.toLowerCase()] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your analysis history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis History</h1>
          <p className="text-gray-600">Track your skin analysis progress over time</p>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="all">All Analyses</option>
                  <option value="ai">AI Analysis</option>
                  <option value="manual">Manual Input</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="date">Date</option>
                  <option value="score">Confidence Score</option>
                </select>
              </div>
            </div>
            
            {selectedAnalyses.length === 2 && (
              <Button
                onClick={handleCompare}
                variant="primary"
                icon={ChartBarIcon}
              >
                Compare Selected
              </Button>
            )}
          </div>
        </Card>

        {/* Analysis Grid */}
        {sortedHistory.length === 0 ? (
          <Card className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis History</h3>
            <p className="text-gray-600 mb-6">Start your first skin analysis to see your progress here.</p>
            <Button variant="primary" href="/analysis">
              Start Analysis
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedHistory.map((analysis) => (
              <Card
                key={analysis._id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedAnalyses.includes(analysis._id)
                    ? 'ring-2 ring-primary-500 bg-primary-50'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => handleSelectAnalysis(analysis._id)}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          analysis.type === 'ai' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {analysis.type === 'ai' ? 'AI Analysis' : 'Manual Input'}
                        </span>
                        {analysis.confidence && (
                          <span className="text-xs text-gray-500">
                            {Math.round(analysis.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {format(new Date(analysis.createdAt), 'MMM dd, yyyy • HH:mm')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(analysis);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Image */}
                  {analysis.imageUrl && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={analysis.imageUrl}
                        alt="Analysis"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Results */}
                  <div className="space-y-3">
                    {/* Skin Type */}
                    {analysis.results?.skinType && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Skin Type</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          getSkinTypeColor(analysis.results.skinType)
                        }`}>
                          {analysis.results.skinType}
                        </span>
                      </div>
                    )}

                    {/* Skin Concerns */}
                    {analysis.results?.skinConcerns && analysis.results.skinConcerns.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Concerns</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.results.skinConcerns.slice(0, 3).map((concern, index) => (
                            <span
                              key={index}
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                getConcernColor(concern)
                              }`}
                            >
                              {concern.replace('_', ' ')}
                            </span>
                          ))}
                          {analysis.results.skinConcerns.length > 3 && (
                            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                              +{analysis.results.skinConcerns.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommended Products Count */}
                    {analysis.recommendedProducts && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Recommended Products</span>
                        <span className="font-medium text-primary-600">
                          {analysis.recommendedProducts.length} products
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {selectedAnalyses.includes(analysis._id) && (
                    <div className="flex items-center justify-center py-2">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {selectedAnalyses.indexOf(analysis._id) + 1}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Comparison Modal */}
        <Modal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          title="Analysis Comparison"
          size="lg"
        >
          {comparisonResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Analysis 1 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Analysis 1 - {format(new Date(comparisonResult.analysis1.createdAt), 'MMM dd, yyyy')}
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Skin Type:</span> {comparisonResult.analysis1.results?.skinType}</p>
                    <p><span className="font-medium">Concerns:</span> {comparisonResult.analysis1.results?.skinConcerns?.join(', ')}</p>
                  </div>
                </div>

                {/* Analysis 2 */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">
                    Analysis 2 - {format(new Date(comparisonResult.analysis2.createdAt), 'MMM dd, yyyy')}
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Skin Type:</span> {comparisonResult.analysis2.results?.skinType}</p>
                    <p><span className="font-medium">Concerns:</span> {comparisonResult.analysis2.results?.skinConcerns?.join(', ')}</p>
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Changes Summary</h3>
                <div className="space-y-2">
                  {comparisonResult.changes?.improved?.length > 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                      <span>Improved: {comparisonResult.changes.improved.join(', ')}</span>
                    </div>
                  )}
                  {comparisonResult.changes?.worsened?.length > 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <ArrowTrendingDownIcon className="h-4 w-4" />
                      <span>Worsened: {comparisonResult.changes.worsened.join(', ')}</span>
                    </div>
                  )}
                  {comparisonResult.changes?.new?.length > 0 && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <span>New concerns: {comparisonResult.changes.new.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Analysis"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete this analysis? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default History;