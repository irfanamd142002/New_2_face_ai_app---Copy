import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import Card from './common/Card';
import Button from './common/Button';
import progressService from '../services/progressService';

const SkinProgressTracker = ({ userId, analysisType = 'all' }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');
  const [selectedMetric, setSelectedMetric] = useState('overallHealth');
  const [comparisonData, setComparisonData] = useState(null);
  const [milestones, setMilestones] = useState([]);

  const timeRanges = [
    { value: '7days', label: '7 Days' },
    { value: '30days', label: '30 Days' },
    { value: '90days', label: '3 Months' },
    { value: '6months', label: '6 Months' },
    { value: '1year', label: '1 Year' }
  ];

  const skinMetrics = [
    { value: 'overallHealth', label: 'Overall Health', color: '#3B82F6' },
    { value: 'oiliness', label: 'Oiliness', color: '#F59E0B' },
    { value: 'dryness', label: 'Dryness', color: '#06B6D4' },
    { value: 'acneLevel', label: 'Acne Level', color: '#EF4444' },
    { value: 'pigmentationLevel', label: 'Pigmentation', color: '#8B5CF6' },
    { value: 'wrinkleLevel', label: 'Wrinkles', color: '#6B7280' }
  ];

  const [overallImprovement, setOverallImprovement] = useState(null);

  useEffect(() => {
    loadProgressData();
  }, [selectedTimeRange, analysisType]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await progressService.getProgressData(selectedTimeRange, analysisType);
      
      if (response.success) {
        setProgressData(response.progressData);
        setComparisonData(response.comparisonData);
        setMilestones(response.milestones);
        
        // Calculate overall improvement
        const improvement = progressService.calculateOverallImprovement(response.comparisonData);
        setOverallImprovement(improvement);
      } else {
        throw new Error(response.message || 'Failed to load progress data');
      }

    } catch (err) {
      setError(err.message || 'Failed to load progress data');
      console.error('Progress data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format data for charts
  const formatDataForChart = (metric) => {
    return progressService.formatProgressDataForChart(progressData, metric);
  };

  // Calculate metric trend
  const calculateMetricTrend = (metric) => {
    return progressService.calculateMetricTrend(progressData, metric);
  };

  // Generate radar chart data
  const generateRadarData = () => {
    if (!comparisonData || progressData.length === 0) return { labels: [], datasets: [] };
    
    const latest = progressData[progressData.length - 1];
    const baseline = progressData[0];
    
    return progressService.generateRadarChartData(
      latest.skinMetrics,
      baseline.skinMetrics
    );
  };

  // Analyze milestones
  const analyzeMilestones = () => {
    return progressService.analyzeMilestones(milestones, progressData);
  };

  const formatProgressData = () => {
    return progressData.map(item => ({
      ...item,
      date: format(parseISO(item.analysisDate), 'MMM dd'),
      fullDate: item.analysisDate,
      daysSinceStart: differenceInDays(parseISO(item.analysisDate), parseISO(progressData[0]?.analysisDate || item.analysisDate))
    }));
  };

  const getMetricTrend = (metric) => {
    if (progressData.length < 2) return { trend: 'stable', change: 0 };

    const recent = progressData.slice(-3);
    const older = progressData.slice(-6, -3);

    if (recent.length === 0 || older.length === 0) return { trend: 'stable', change: 0 };

    const recentAvg = recent.reduce((sum, item) => sum + (item.skinMetrics?.[metric] || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + (item.skinMetrics?.[metric] || 0), 0) / older.length;

    const change = recentAvg - olderAvg;
    const threshold = 5; // 5% threshold for significant change

    if (Math.abs(change) < threshold) return { trend: 'stable', change };
    
    // For negative metrics (acne, wrinkles, pigmentation), lower is better
    const negativeMetrics = ['acneLevel', 'pigmentationLevel', 'wrinkleLevel'];
    const isNegativeMetric = negativeMetrics.includes(metric);
    
    if (isNegativeMetric) {
      return { trend: change < 0 ? 'improving' : 'declining', change: Math.abs(change) };
    } else {
      return { trend: change > 0 ? 'improving' : 'declining', change: Math.abs(change) };
    }
  };

  const getRadarData = () => {
    if (progressData.length === 0) return [];

    const latest = progressData[progressData.length - 1];
    const baseline = progressData[0];

    return skinMetrics.map(metric => ({
      metric: metric.label,
      current: latest.skinMetrics?.[metric.value] || 0,
      baseline: baseline.skinMetrics?.[metric.value] || 0,
      fullMark: 100
    }));
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateImprovementScore = () => {
    if (progressData.length < 2) return 0;

    const latest = progressData[progressData.length - 1];
    const baseline = progressData[0];

    let totalImprovement = 0;
    let metricCount = 0;

    skinMetrics.forEach(metric => {
      const currentValue = latest.skinMetrics?.[metric.value] || 0;
      const baselineValue = baseline.skinMetrics?.[metric.value] || 0;
      
      if (baselineValue > 0) {
        const negativeMetrics = ['acneLevel', 'pigmentationLevel', 'wrinkleLevel'];
        const isNegativeMetric = negativeMetrics.includes(metric.value);
        
        let improvement;
        if (isNegativeMetric) {
          improvement = ((baselineValue - currentValue) / baselineValue) * 100;
        } else {
          improvement = ((currentValue - baselineValue) / baselineValue) * 100;
        }
        
        totalImprovement += improvement;
        metricCount++;
      }
    });

    return metricCount > 0 ? totalImprovement / metricCount : 0;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>Error loading progress data: {error}</p>
          <Button onClick={loadProgressData} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const formattedData = formatProgressData();
  const improvementScore = calculateImprovementScore();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              Skin Progress Tracker
            </h2>
            <p className="text-gray-600 mt-1">
              Monitor your skin improvement journey over time
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {skinMetrics.map(metric => (
                <option key={metric.value} value={metric.value}>
                  {metric.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Analyses</p>
              <p className="text-2xl font-bold text-green-600">{progressData.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Improvement</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-blue-600">
                  {overallImprovement?.grade || 'N/A'}
                </p>
                <span className="text-sm text-gray-500">
                  {overallImprovement?.score ? `${overallImprovement.score}%` : ''}
                </span>
              </div>
              {overallImprovement?.description && (
                <p className="text-xs text-gray-500 mt-1">
                  {overallImprovement.description}
                </p>
              )}
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Milestones</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-orange-600">
                  {analyzeMilestones().totalAchieved}
                </p>
                <span className="text-sm text-gray-500">achieved</span>
              </div>
              {analyzeMilestones().next.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Next: {analyzeMilestones().next[0].title}
                </p>
              )}
            </div>
            <Award className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {skinMetrics.find(m => m.value === selectedMetric)?.label} Progress
        </h3>
        
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? format(parseISO(item.fullDate), 'PPP') : label;
                }}
                formatter={(value) => [`${value.toFixed(1)}%`, selectedMetric]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={`skinMetrics.${selectedMetric}`}
                stroke={skinMetrics.find(m => m.value === selectedMetric)?.color}
                strokeWidth={3}
                dot={{ fill: skinMetrics.find(m => m.value === selectedMetric)?.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No progress data available for the selected time range.</p>
            <p className="text-sm">Start taking regular skin analyses to track your progress!</p>
          </div>
        )}
      </Card>

      {/* Radar Chart - Current vs Baseline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current vs Baseline Comparison</h3>
        {progressData.length >= 2 ? (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={generateRadarData().labels?.map((label, index) => ({
              metric: label,
              current: generateRadarData().datasets[0]?.data[index] || 0,
              baseline: generateRadarData().datasets[1]?.data[index] || 0
            }))}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
              <Radar
                name="Baseline"
                dataKey="baseline"
                stroke="#9CA3AF"
                fill="#9CA3AF"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Need at least 2 analyses for comparison</p>
          </div>
        )}
      </Card>

      {/* Metric Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">All Metrics Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skinMetrics.map(metric => {
            const trend = getMetricTrend(metric.value);
            const latest = progressData[progressData.length - 1];
            const currentValue = latest?.skinMetrics?.[metric.value] || 0;
            
            return (
              <div key={metric.value} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{metric.label}</h4>
                  {getTrendIcon(trend.trend)}
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: metric.color }}>
                  {currentValue.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  {trend.change > 0 && (
                    <span className={trend.trend === 'improving' ? 'text-green-600' : 'text-red-600'}>
                      {trend.trend === 'improving' ? '↑' : '↓'} {trend.change.toFixed(1)}% change
                    </span>
                  )}
                  {trend.change === 0 && (
                    <span className="text-gray-500">No significant change</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Milestones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Milestones & Achievements</h3>
        <div className="space-y-4">
          {/* Achieved Milestones */}
          {analyzeMilestones().achieved.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Achieved</h4>
              {analyzeMilestones().achieved.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg mb-2">
                  <Award className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{milestone.title}</p>
                    <p className="text-sm text-green-600">{milestone.description}</p>
                    <p className="text-xs text-green-500">
                      Achieved on {format(parseISO(milestone.achievedDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Next Milestones */}
          {analyzeMilestones().next.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-3">Next Goals</h4>
              {analyzeMilestones().next.map((milestone, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg mb-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800">{milestone.title}</p>
                    <p className="text-sm text-blue-600">{milestone.description}</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-blue-500 mb-1">
                        <span>Progress: {milestone.progress}/{milestone.target}</span>
                        <span>{Math.round((milestone.progress / milestone.target) * 100)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((milestone.progress / milestone.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analyzeMilestones().achieved.length === 0 && analyzeMilestones().next.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No milestones available yet</p>
              <p className="text-sm">Complete more analyses to unlock achievements!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SkinProgressTracker;