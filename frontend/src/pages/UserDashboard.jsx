import React, { useState, useEffect } from 'react';
import { 
  User, 
  Coins, 
  Activity, 
  TrendingUp, 
  Calendar,
  Heart,
  Award,
  BarChart3,
  Clock,
  Shield
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { dataApi, rewardApi } from '../services/api';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { isConnected, account } = useWallet();
  const [userStats, setUserStats] = useState(null);
  const [rewardBalance, setRewardBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && account) {
      fetchUserData();
    }
  }, [isConnected, account]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user statistics and reward balance in parallel
      const [statsResponse, balanceResponse] = await Promise.all([
        dataApi.getUserStats(account),
        rewardApi.getBalance(account)
      ]);

      if (statsResponse.success) {
        setUserStats(statsResponse.data);
      }

      if (balanceResponse.success) {
        setRewardBalance(balanceResponse.data);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="flex flex-col items-center space-y-4">
          <User className="h-16 w-16 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900">Connect Your Wallet</h2>
          <p className="text-gray-600">
            Please connect your wallet to view your personal dashboard and earnings.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const mockRecentActivity = [
    {
      id: 1,
      type: 'submission',
      description: 'Health data submitted',
      reward: '10 PULSE',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed'
    },
    {
      id: 2,
      type: 'submission',
      description: 'Health data submitted',
      reward: '10 PULSE',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'completed'
    },
    {
      id: 3,
      type: 'submission',
      description: 'Health data submitted',
      reward: '10 PULSE',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'completed'
    }
  ];

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">
            Track your contributions, earnings, and impact on health research
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Connected Wallet</p>
          <p className="text-sm font-mono text-gray-900">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Coins className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700">PULSE Balance</p>
              <p className="text-2xl font-bold text-green-900">
                {rewardBalance?.balance || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">
                {userStats?.submissions?.offChain || '0'}
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
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                {rewardBalance?.totalEarned || '0'} PULSE
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contributor Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                #{Math.floor(Math.random() * 100) + 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contribution History */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Contribution History</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="font-medium">5 submissions</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-medium">22 submissions</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">All Time</span>
              <span className="font-medium">{userStats?.submissions?.offChain || '0'} submissions</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Average per Week</span>
              <span className="font-medium">
                {userStats?.submissions?.offChain ? Math.round(userStats.submissions.offChain / 4) : '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Earnings Breakdown</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Base Rewards</span>
              <span className="font-medium text-green-600">
                {rewardBalance?.totalEarned || '0'} PULSE
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Quality Bonus</span>
              <span className="font-medium text-blue-600">Coming Soon</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Consistency Streak</span>
              <span className="font-medium text-purple-600">Coming Soon</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-3">
              <span className="text-sm font-medium text-green-700">Current Balance</span>
              <span className="font-bold text-green-800">
                {rewardBalance?.balance || '0'} PULSE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Recent Activity</span>
        </h3>
        
        <div className="space-y-4">
          {mockRecentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activity.description}</p>
                  <p className="text-sm text-gray-500">{getTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-green-600">+{activity.reward}</p>
                <p className="text-sm text-gray-500 capitalize">{activity.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start space-x-4">
          <Shield className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your Data is Protected
            </h3>
            <p className="text-gray-700 mb-4">
              All your health data submissions are protected by zero-knowledge proofs. 
              Your personal information remains private while contributing to valuable research.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                ✓ {userStats?.submissions?.offChain || '0'} Submissions Verified
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                ✓ Identity Protected
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                ✓ Blockchain Secured
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card bg-gradient-to-br from-primary-50 to-pulse-50 border-primary-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready for Your Next Submission?
            </h3>
            <p className="text-gray-600">
              Keep your streak going and earn more PULSE tokens
            </p>
          </div>
          <a
            href="/submit"
            className="btn-primary flex items-center space-x-2"
          >
            <Heart className="h-4 w-4" />
            <span>Submit New Data</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
