import api from './api';

class ProgressService {
  /**
   * Get progress tracking data for a user
   * @param {string} timeRange - Time range for analysis (7days, 30days, 90days, 6months, 1year)
   * @param {string} type - Analysis type filter (all, webcam_ai, before_after)
   * @returns {Promise<Object>} Progress data with trends and milestones
   */
  async getProgressData(timeRange = '30days', type = 'all') {
    try {
      const response = await api.get('/analysis/progress', {
        params: { timeRange, type }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching progress data:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch progress data');
    }
  }

  /**
   * Format progress data for chart visualization
   * @param {Array} progressData - Raw progress data from API
   * @param {string} metric - Specific metric to format
   * @returns {Array} Formatted data for charts
   */
  formatProgressDataForChart(progressData, metric) {
    return progressData.map(item => ({
      date: new Date(item.analysisDate).toLocaleDateString(),
      value: item.skinMetrics[metric] || 0,
      type: item.analysisType,
      confidence: item.confidenceScore
    }));
  }

  /**
   * Calculate metric trends over time
   * @param {Array} progressData - Progress data array
   * @param {string} metric - Metric to analyze
   * @returns {Object} Trend analysis
   */
  calculateMetricTrend(progressData, metric) {
    if (progressData.length < 2) {
      return { trend: 'insufficient_data', change: 0, direction: 'stable' };
    }

    const values = progressData.map(item => item.skinMetrics[metric] || 0);
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    
    if (firstValue === 0) {
      return { trend: 'no_baseline', change: 0, direction: 'stable' };
    }

    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    // For negative metrics (acne, pigmentation, wrinkles), improvement means decrease
    const negativeMetrics = ['acneLevel', 'pigmentationLevel', 'wrinkleLevel'];
    const isNegativeMetric = negativeMetrics.includes(metric);
    
    let direction;
    if (Math.abs(change) < 5) {
      direction = 'stable';
    } else if (isNegativeMetric) {
      direction = change < 0 ? 'improving' : 'declining';
    } else {
      direction = change > 0 ? 'improving' : 'declining';
    }

    return {
      trend: direction,
      change: Math.abs(change),
      direction,
      rawChange: change
    };
  }

  /**
   * Generate radar chart data for skin metrics comparison
   * @param {Object} currentMetrics - Current skin metrics
   * @param {Object} baselineMetrics - Baseline skin metrics
   * @returns {Object} Radar chart data
   */
  generateRadarChartData(currentMetrics, baselineMetrics) {
    const metrics = [
      { key: 'overallHealth', label: 'Overall Health', max: 100 },
      { key: 'oiliness', label: 'Oiliness Control', max: 100 },
      { key: 'dryness', label: 'Hydration', max: 100 },
      { key: 'acneLevel', label: 'Acne Control', max: 100, inverted: true },
      { key: 'pigmentationLevel', label: 'Even Tone', max: 100, inverted: true },
      { key: 'wrinkleLevel', label: 'Smoothness', max: 100, inverted: true }
    ];

    const data = metrics.map(metric => {
      const currentValue = currentMetrics[metric.key] || 0;
      const baselineValue = baselineMetrics[metric.key] || 0;
      
      // For inverted metrics, convert to positive scale
      const currentDisplay = metric.inverted ? Math.max(0, 100 - currentValue) : currentValue;
      const baselineDisplay = metric.inverted ? Math.max(0, 100 - baselineValue) : baselineValue;

      return {
        metric: metric.label,
        current: Math.round(currentDisplay),
        baseline: Math.round(baselineDisplay),
        max: metric.max
      };
    });

    return {
      labels: data.map(item => item.metric),
      datasets: [
        {
          label: 'Current',
          data: data.map(item => item.current),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        },
        {
          label: 'Baseline',
          data: data.map(item => item.baseline),
          backgroundColor: 'rgba(156, 163, 175, 0.2)',
          borderColor: 'rgb(156, 163, 175)',
          borderWidth: 2
        }
      ]
    };
  }

  /**
   * Calculate overall improvement score
   * @param {Object} comparisonData - Comparison data from API
   * @returns {Object} Overall improvement analysis
   */
  calculateOverallImprovement(comparisonData) {
    if (!comparisonData || !comparisonData.improvements) {
      return { score: 0, grade: 'N/A', description: 'Insufficient data' };
    }

    const improvements = Object.values(comparisonData.improvements);
    const avgImprovement = improvements.reduce((sum, val) => sum + val, 0) / improvements.length;
    
    let grade, description;
    
    if (avgImprovement >= 20) {
      grade = 'A+';
      description = 'Excellent progress! Your skin is showing remarkable improvement.';
    } else if (avgImprovement >= 15) {
      grade = 'A';
      description = 'Great progress! Your skincare routine is working well.';
    } else if (avgImprovement >= 10) {
      grade = 'B+';
      description = 'Good progress! Keep up the consistent routine.';
    } else if (avgImprovement >= 5) {
      grade = 'B';
      description = 'Steady progress! Small improvements are building up.';
    } else if (avgImprovement >= 0) {
      grade = 'C';
      description = 'Stable condition. Consider adjusting your routine.';
    } else {
      grade = 'D';
      description = 'Some decline noted. Review your skincare routine.';
    }

    return {
      score: Math.round(avgImprovement),
      grade,
      description,
      timeSpan: comparisonData.timeSpan
    };
  }

  /**
   * Get milestone achievements with progress tracking
   * @param {Array} milestones - Milestones from API
   * @param {Array} progressData - Progress data for calculating next milestones
   * @returns {Object} Milestone analysis
   */
  analyzeMilestones(milestones, progressData) {
    const achieved = milestones.filter(m => m.achievedDate);
    const totalAnalyses = progressData.length;
    
    // Calculate next milestones
    const nextMilestones = [];
    
    if (totalAnalyses < 7) {
      nextMilestones.push({
        title: 'Consistency Champion',
        description: 'Complete 7 skin analyses',
        progress: totalAnalyses,
        target: 7,
        type: 'consistency'
      });
    } else if (totalAnalyses < 30) {
      nextMilestones.push({
        title: 'Dedicated Tracker',
        description: 'Complete 30 skin analyses',
        progress: totalAnalyses,
        target: 30,
        type: 'consistency'
      });
    } else if (totalAnalyses < 100) {
      nextMilestones.push({
        title: 'Skin Expert',
        description: 'Complete 100 skin analyses',
        progress: totalAnalyses,
        target: 100,
        type: 'consistency'
      });
    }

    return {
      achieved,
      next: nextMilestones,
      totalAchieved: achieved.length
    };
  }
}

export default new ProgressService();