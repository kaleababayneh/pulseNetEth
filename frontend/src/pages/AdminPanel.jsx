import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Coins, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Send
} from 'lucide-react';
import { rewardApi, healthApi } from '../services/api';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [rewardForm, setRewardForm] = useState({
    userAddress: '',
    amount: '',
    adminKey: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRewardInputChange = (e) => {
    const { name, value } = e.target;
    setRewardForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManualReward = async (e) => {
    e.preventDefault();
    
    if (!rewardForm.userAddress || !rewardForm.amount || !rewardForm.adminKey) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(rewardForm.userAddress)) {
      toast.error('Invalid Ethereum address');
      return;
    }

    if (isNaN(rewardForm.amount) || parseFloat(rewardForm.amount) <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await rewardApi.manualReward(
        rewardForm.userAddress,
        parseFloat(rewardForm.amount),
        rewardForm.adminKey
      );

      if (response.success) {
        toast.success('Manual reward processed successfully!');
        setRewardForm({
          userAddress: '',
          amount: '',
          adminKey: ''
        });
      } else {
        throw new Error(response.error || 'Failed to process reward');
      }

    } catch (error) {
      console.error('Manual reward error:', error);
      toast.error(error.message || 'Failed to process manual reward');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await healthApi.getDetailedStatus();
      setSystemStatus(response);
      toast.success('System status updated');
    } catch (error) {
      console.error('System status error:', error);
      toast.error('Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      case 'unhealthy':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-600">
            Manage platform operations, rewards, and system health
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
          <Shield className="h-4 w-4" />
          <span>Admin Access Required</span>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="card bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Admin Access Notice
            </h3>
            <p className="text-gray-700">
              This panel provides administrative functions for the PulseNet platform. 
              Only authorized administrators should access these features. All actions are logged and audited.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manual Reward */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Manual Reward</span>
          </h3>
          
          <form onSubmit={handleManualReward} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Address
              </label>
              <input
                type="text"
                name="userAddress"
                value={rewardForm.userAddress}
                onChange={handleRewardInputChange}
                placeholder="0x..."
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (PULSE tokens)
              </label>
              <input
                type="number"
                name="amount"
                value={rewardForm.amount}
                onChange={handleRewardInputChange}
                placeholder="e.g., 50"
                min="0"
                step="0.1"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                name="adminKey"
                value={rewardForm.adminKey}
                onChange={handleRewardInputChange}
                placeholder="Enter admin key"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Reward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Status</span>
            </h3>
            <button
              onClick={checkSystemStatus}
              disabled={loading}
              className="btn-secondary text-sm flex items-center space-x-2"
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <Settings className="h-4 w-4" />
              )}
              <span>Refresh</span>
            </button>
          </div>

          {systemStatus ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(systemStatus.status)}`}>
                  {getStatusIcon(systemStatus.status)}
                  <span className="capitalize">{systemStatus.status}</span>
                </span>
              </div>

              {systemStatus.checks && (
                <div className="space-y-2">
                  {Object.entries(systemStatus.checks).map(([service, check]) => (
                    <div key={service} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                      <span className="text-sm text-gray-600 capitalize">{service}:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${getStatusColor(check.status)}`}>
                        {getStatusIcon(check.status)}
                        <span className="capitalize">{check.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {systemStatus.uptime && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Uptime:</span>
                  <span className="text-sm font-medium">{Math.floor(systemStatus.uptime / 3600)}h {Math.floor((systemStatus.uptime % 3600) / 60)}m</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Click refresh to check system status</p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Platform Overview</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">1,247</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">15,429</div>
            <div className="text-sm text-gray-600">Data Submissions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">154,290</div>
            <div className="text-sm text-gray-600">Tokens Distributed</div>
          </div>
        </div>
      </div>

      {/* Recent Admin Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Admin Actions</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Manual reward sent</p>
              <p className="text-sm text-gray-500">50 PULSE to 0x1234...5678</p>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">System health check</p>
              <p className="text-sm text-gray-500">All systems operational</p>
            </div>
            <span className="text-sm text-gray-500">5 hours ago</span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <div>
              <p className="font-medium text-gray-900">Buyer authorized</p>
              <p className="text-sm text-gray-500">New research partner added</p>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
