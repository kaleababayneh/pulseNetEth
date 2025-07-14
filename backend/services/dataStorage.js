const fs = require('fs');
const path = require('path');

class DataStorage {
  constructor() {
    this.dataFile = path.join(__dirname, '../data/health_data.json');
    this.statsFile = path.join(__dirname, '../data/stats.json');
    this.ensureDataDirectory();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDirectory() {
    const dataDir = path.dirname(this.dataFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize files if they don't exist
    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, '[]');
    }

    if (!fs.existsSync(this.statsFile)) {
      fs.writeFileSync(this.statsFile, JSON.stringify({
        totalSubmissions: 0,
        uniqueContributors: 0,
        lastUpdated: new Date().toISOString()
      }, null, 2));
    }
  }

  /**
   * Store health data submission
   * @param {Object} healthData - The health data to store
   * @returns {boolean} - Success status
   */
  storeHealthData(healthData) {
    try {
      const data = this.loadHealthData();
      
      // Add timestamp if not present
      if (!healthData.timestamp) {
        healthData.timestamp = Date.now();
      }

      // Add unique ID
      healthData.id = this.generateId();

      data.push(healthData);
      
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      this.updateStats(healthData);
      
      return true;
    } catch (error) {
      console.error('Failed to store health data:', error.message);
      return false;
    }
  }

  /**
   * Load all health data
   * @returns {Array} - Array of health data entries
   */
  loadHealthData() {
    try {
      const data = fs.readFileSync(this.dataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load health data:', error.message);
      return [];
    }
  }

  /**
   * Get anonymized statistics for buyers
   * @returns {Object} - Anonymized statistics
   */
  getAnonymizedStats() {
    try {
      const data = this.loadHealthData();
      const stats = this.loadStats();

      if (data.length === 0) {
        return {
          totalSubmissions: 0,
          uniqueContributors: 0,
          averageMetrics: null,
          dataQuality: {
            completeness: 100,
            consistency: 100
          },
          temporalDistribution: {},
          lastUpdated: stats.lastUpdated
        };
      }

      // Calculate averages (anonymized)
      const heartRates = data.map(d => d.heartRate).filter(hr => hr);
      const sleepHours = data.map(d => d.sleepHours).filter(sh => sh);
      const steps = data.map(d => d.steps).filter(s => s);

      const averageMetrics = {
        heartRate: {
          mean: this.calculateMean(heartRates),
          median: this.calculateMedian(heartRates),
          range: {
            min: Math.min(...heartRates),
            max: Math.max(...heartRates)
          }
        },
        sleepHours: {
          mean: this.calculateMean(sleepHours),
          median: this.calculateMedian(sleepHours),
          range: {
            min: Math.min(...sleepHours),
            max: Math.max(...sleepHours)
          }
        },
        steps: {
          mean: this.calculateMean(steps),
          median: this.calculateMedian(steps),
          range: {
            min: Math.min(...steps),
            max: Math.max(...steps)
          }
        }
      };

      // Temporal distribution (by day of week)
      const temporalDistribution = this.calculateTemporalDistribution(data);

      return {
        totalSubmissions: data.length,
        uniqueContributors: new Set(data.map(d => d.userAddress)).size,
        averageMetrics,
        dataQuality: this.calculateDataQuality(data),
        temporalDistribution,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to get anonymized stats:', error.message);
      return null;
    }
  }

  /**
   * Get user-specific data count
   * @param {string} userAddress - User's Ethereum address
   * @returns {number} - Number of submissions
   */
  getUserSubmissionCount(userAddress) {
    try {
      const data = this.loadHealthData();
      return data.filter(d => d.userAddress.toLowerCase() === userAddress.toLowerCase()).length;
    } catch (error) {
      console.error('Failed to get user submission count:', error.message);
      return 0;
    }
  }

  /**
   * Update statistics
   * @param {Object} newData - New health data entry
   */
  updateStats(newData) {
    try {
      const stats = this.loadStats();
      const data = this.loadHealthData();
      
      stats.totalSubmissions = data.length;
      stats.uniqueContributors = new Set(data.map(d => d.userAddress)).size;
      stats.lastUpdated = new Date().toISOString();

      fs.writeFileSync(this.statsFile, JSON.stringify(stats, null, 2));
    } catch (error) {
      console.error('Failed to update stats:', error.message);
    }
  }

  /**
   * Load statistics
   * @returns {Object} - Statistics object
   */
  loadStats() {
    try {
      const data = fs.readFileSync(this.statsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load stats:', error.message);
      return {
        totalSubmissions: 0,
        uniqueContributors: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Generate unique ID
   * @returns {string} - Unique identifier
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Calculate mean of array
   * @param {Array} arr - Array of numbers
   * @returns {number} - Mean value
   */
  calculateMean(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Calculate median of array
   * @param {Array} arr - Array of numbers
   * @returns {number} - Median value
   */
  calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  /**
   * Calculate temporal distribution
   * @param {Array} data - Health data array
   * @returns {Object} - Temporal distribution
   */
  calculateTemporalDistribution(data) {
    const distribution = {
      hourly: {},
      daily: {},
      weekly: {}
    };

    data.forEach(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      const week = this.getWeekNumber(date);

      distribution.hourly[hour] = (distribution.hourly[hour] || 0) + 1;
      distribution.daily[day] = (distribution.daily[day] || 0) + 1;
      distribution.weekly[week] = (distribution.weekly[week] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Calculate data quality metrics
   * @param {Array} data - Health data array
   * @returns {Object} - Data quality metrics
   */
  calculateDataQuality(data) {
    let completeEntries = 0;
    let consistentEntries = 0;

    data.forEach(entry => {
      // Check completeness
      if (entry.heartRate && entry.sleepHours && entry.steps) {
        completeEntries++;
      }

      // Check consistency (basic range validation)
      const validHR = entry.heartRate >= 30 && entry.heartRate <= 220;
      const validSleep = entry.sleepHours >= 0 && entry.sleepHours <= 24;
      const validSteps = entry.steps >= 0 && entry.steps <= 100000;

      if (validHR && validSleep && validSteps) {
        consistentEntries++;
      }
    });

    return {
      completeness: data.length > 0 ? (completeEntries / data.length) * 100 : 100,
      consistency: data.length > 0 ? (consistentEntries / data.length) * 100 : 100
    };
  }

  /**
   * Get week number of year
   * @param {Date} date - Date object
   * @returns {number} - Week number
   */
  getWeekNumber(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    return Math.ceil(((diff / (1000 * 60 * 60 * 24)) + start.getDay() + 1) / 7);
  }
}

module.exports = new DataStorage();
