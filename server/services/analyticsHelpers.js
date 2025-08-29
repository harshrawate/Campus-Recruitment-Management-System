// analyticsHelpers.js

const calculateStatistics = (data, configuration) => {
  if (!data || data.length === 0) return {};

  const values = data.map((item) => item.value);

  const stats = {
    count: data.length,
    sum: values.reduce((a, b) => a + b, 0),
    average: values.reduce((a, b) => a + b, 0) / data.length,
    median: getMedian(values),
    min: Math.min(...values),
    max: Math.max(...values),
    standardDeviation: calculateStandardDeviation(values),
    quartiles: calculateQuartiles(values),
    trends: analyzeTrends(data, configuration),
    summary: generateSummary(data, configuration),
  };

  if (configuration.dataSource.timeRange) {
    stats.timeBasedMetrics = calculateTimeBasedMetrics(data, configuration);
  }

  return stats;
};

const generateReport = async (data, configuration, format = "pdf") => {
  const stats = calculateStatistics(data, configuration);
  const reportData = {
    title: configuration.name,
    timestamp: new Date(),
    configuration: {
      type: configuration.type,
      dataSource: configuration.dataSource,
      filters: configuration.filters,
    },
    data: data,
    statistics: stats,
    insights: await generateInsights(data, stats, configuration),
    recommendations: await generateRecommendations(data, stats, configuration),
  };

  switch (format.toLowerCase()) {
    case "csv":
      return generateCSV(reportData);
    case "excel":
      return generateExcel(reportData);
    default:
      return generatePDF(reportData);
  }
};

// Helper functions
const getMedian = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const calculateStandardDeviation = (values) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
};

const calculateQuartiles = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    Q1: sorted[Math.floor(sorted.length * 0.25)],
    Q2: getMedian(sorted),
    Q3: sorted[Math.floor(sorted.length * 0.75)],
  };
};

const analyzeTrends = (data, configuration) => {
  if (data.length < 2) return null;

  const trends = {
    direction: "stable",
    changeRate: 0,
    significantChanges: [],
  };

  // Calculate period-over-period changes
  for (let i = 1; i < data.length; i++) {
    const change =
      ((data[i].value - data[i - 1].value) / data[i - 1].value) * 100;
    if (Math.abs(change) > 10) {
      // Significant change threshold
      trends.significantChanges.push({
        period: data[i]._id,
        change: change.toFixed(2) + "%",
      });
    }
  }

  // Determine overall trend
  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const overallChange = ((lastValue - firstValue) / firstValue) * 100;

  trends.direction =
    overallChange > 5
      ? "increasing"
      : overallChange < -5
      ? "decreasing"
      : "stable";
  trends.changeRate = overallChange.toFixed(2) + "%";

  return trends;
};

const generateSummary = (data, configuration) => {
  const summary = {
    mainMetric: null,
    keyFindings: [],
    anomalies: [],
  };

  // Calculate main metric based on configuration
  switch (configuration.dataSource.aggregation) {
    case "average":
      summary.mainMetric = `Average ${configuration.dataSource.field}: ${(
        data.reduce((sum, item) => sum + item.value, 0) / data.length
      ).toFixed(2)}`;
      break;
    case "sum":
      summary.mainMetric = `Total ${configuration.dataSource.field}: ${data
        .reduce((sum, item) => sum + item.value, 0)
        .toFixed(2)}`;
      break;
    default:
      summary.mainMetric = `Count: ${data.length}`;
  }

  // Detect anomalies using IQR method
  const values = data.map((item) => item.value);
  const quartiles = calculateQuartiles(values);
  const iqr = quartiles.Q3 - quartiles.Q1;
  const lowerBound = quartiles.Q1 - 1.5 * iqr;
  const upperBound = quartiles.Q3 + 1.5 * iqr;

  data.forEach((item) => {
    if (item.value < lowerBound || item.value > upperBound) {
      summary.anomalies.push({
        period: item._id,
        value: item.value,
        type: item.value < lowerBound ? "low" : "high",
      });
    }
  });

  return summary;
};

const calculateTimeBasedMetrics = (data, configuration) => {
  const { timeRange } = configuration.dataSource;
  const metrics = {
    periodComparison: {},
    growthRate: null,
    seasonality: null,
  };

  // Calculate period-over-period comparison
  if (timeRange.start && timeRange.end) {
    const midPoint = new Date(
      (new Date(timeRange.start).getTime() +
        new Date(timeRange.end).getTime()) /
        2
    );
    const firstPeriod = data.filter((item) => new Date(item._id) < midPoint);
    const secondPeriod = data.filter((item) => new Date(item._id) >= midPoint);

    const firstPeriodAvg =
      firstPeriod.reduce((sum, item) => sum + item.value, 0) /
      firstPeriod.length;
    const secondPeriodAvg =
      secondPeriod.reduce((sum, item) => sum + item.value, 0) /
      secondPeriod.length;

    metrics.periodComparison = {
      firstPeriod: firstPeriodAvg,
      secondPeriod: secondPeriodAvg,
      change: ((secondPeriodAvg - firstPeriodAvg) / firstPeriodAvg) * 100,
    };
  }

  return metrics;
};

module.exports = {
  calculateStatistics,
  generateReport,
};
