import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Activity, 
  Heart, 
  Moon, 
  Footprints,
  TrendingUp,
  Download,
  Calendar,
  Shield
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dataApi } from '../services/api';
import toast from 'react-hot-toast';

const BuyerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('heartRate');

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      const response = await dataApi.getStats();
      
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  const mockTimeSeriesData = [
    { date: '2025-01-01', submissions: 45, avgHeartRate: 72, avgSleep: 7.2, avgSteps: 8500 },
    { date: '2025-01-02', submissions: 52, avgHeartRate: 74, avgSleep: 7.0, avgSteps: 9200 },
    { date: '2025-01-03', submissions: 48, avgHeartRate: 71, avgSleep: 7.5, avgSteps: 8800 },
    { date: '2025-01-04', submissions: 61, avgHeartRate: 73, avgSleep: 6.8, avgSteps: 9500 },
    { date: '2025-01-05', submissions: 58, avgHeartRate: 75, avgSleep: 7.3, avgSteps: 9100 },
    { date: '2025-01-06', submissions: 67, avgHeartRate: 72, avgSleep: 7.6, avgSteps: 10200 },
    { date: '2025-01-07', submissions: 55, avgHeartRate: 74, avgSleep: 7.1, avgSteps: 8900 }
  ];

  const mockDistributionData = [
    { range: '30-50 BPM', count: 15, color: '#ef4444' },
    { range: '51-70 BPM', count: 45, color: '#f97316' },
    { range: '71-90 BPM', count: 120, color: '#22c55e' },
    { range: '91-110 BPM', count: 80, color: '#eab308' },
    { range: '111+ BPM', count: 25, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
        <p className="text-gray-600">Unable to load platform statistics at this time.</p>
      </div>
    );
  }

  const { platform } = stats;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Data Insights
          </h1>
          <p className="text-gray-600">
            Anonymized population health statistics and trends
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <Shield className="h-4 w-4" />
            <span>Privacy Protected</span>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Contributors</p>
              <p className="text-2xl font-bold text-gray-900">
                {platform.uniqueContributors?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {platform.totalSubmissions?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Quality</p>
              <p className="text-2xl font-bold text-gray-900">
                {platform.dataQuality?.consistency?.toFixed(1) || '0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {platform.lastUpdated ? new Date(platform.lastUpdated).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics Overview */}
      {platform.averageMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Heart Rate</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average:</span>
                <span className="font-medium">
                  {platform.averageMetrics.heartRate?.mean?.toFixed(1) || '0'} BPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Median:</span>
                <span className="font-medium">
                  {platform.averageMetrics.heartRate?.median?.toFixed(1) || '0'} BPM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Range:</span>
                <span className="font-medium">
                  {platform.averageMetrics.heartRate?.range?.min || '0'} - {platform.averageMetrics.heartRate?.range?.max || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Moon className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Sleep Hours</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average:</span>
                <span className="font-medium">
                  {platform.averageMetrics.sleepHours?.mean?.toFixed(1) || '0'} hrs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Median:</span>
                <span className="font-medium">
                  {platform.averageMetrics.sleepHours?.median?.toFixed(1) || '0'} hrs
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Range:</span>
                <span className="font-medium">
                  {platform.averageMetrics.sleepHours?.range?.min || '0'} - {platform.averageMetrics.sleepHours?.range?.max || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Footprints className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Daily Steps</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average:</span>
                <span className="font-medium">
                  {platform.averageMetrics.steps?.mean?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Median:</span>
                <span className="font-medium">
                  {platform.averageMetrics.steps?.median?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Range:</span>
                <span className="font-medium">
                  {platform.averageMetrics.steps?.range?.min?.toLocaleString() || '0'} - {platform.averageMetrics.steps?.range?.max?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Time Series Chart */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Submission Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="submissions">Submissions</option>
              <option value="avgHeartRate">Avg Heart Rate</option>
              <option value="avgSleep">Avg Sleep</option>
              <option value="avgSteps">Avg Steps</option>
            </select>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTimeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString().slice(0, -5)}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Heart Rate Distribution</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Access Notice */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <Shield className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Privacy-First Data Access
            </h3>
            <p className="text-gray-700 mb-4">
              All data displayed is anonymized and aggregated to protect individual privacy. 
              Zero-knowledge proofs ensure that no personal information is exposed while 
              maintaining data integrity and usefulness for research purposes.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                ✓ HIPAA Compliant
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                ✓ Zero-Knowledge Verified
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                ✓ Blockchain Secured
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
