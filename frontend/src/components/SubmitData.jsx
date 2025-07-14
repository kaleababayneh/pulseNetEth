import React, { useState } from 'react';
import { Heart, Activity, Moon, Footprints, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { dataApi } from '../services/api';
import toast from 'react-hot-toast';

const SubmitData = () => {
  const { isConnected, account, submitDataToBlockchain, waitForTransaction } = useWallet();
  const [formData, setFormData] = useState({
    heartRate: '',
    sleepHours: '',
    steps: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { heartRate, sleepHours, steps } = formData;

    if (!heartRate || !sleepHours || !steps) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (heartRate < 30 || heartRate > 220) {
      toast.error('Heart rate must be between 30-220 bpm');
      return false;
    }

    if (sleepHours < 0 || sleepHours > 24) {
      toast.error('Sleep hours must be between 0-24 hours');
      return false;
    }

    if (steps < 0 || steps > 100000) {
      toast.error('Steps must be between 0-100,000');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setTransactionStatus(null);

    try {
      const healthData = {
        userAddress: account,
        heartRate: parseFloat(formData.heartRate),
        sleepHours: parseFloat(formData.sleepHours),
        steps: parseInt(formData.steps),
        timestamp: Date.now()
      };

      console.log('Submitting health data:', healthData);

      // Step 1: Submit to backend for ZK proof generation and off-chain storage
      toast.loading('Generating ZK proof...', { id: 'submission' });
      
      const response = await dataApi.submitData(healthData);

      if (!response.success) {
        throw new Error(response.error || 'Backend submission failed');
      }

      toast.success('ZK proof generated! Please approve blockchain transaction...', { id: 'submission' });

      // Step 2: Submit to blockchain directly from frontend
      setTransactionStatus('pending');
      
      const txResult = await submitDataToBlockchain(response.data.dataHash);
      
      toast.loading(`Transaction submitted! Hash: ${txResult.transactionHash.slice(0, 8)}...`, { id: 'submission' });

      // Step 3: Wait for transaction confirmation
      const receipt = await waitForTransaction(txResult.transactionHash);

      if (receipt.success) {
        setTransactionStatus('confirmed');
        toast.success('🎉 Data submitted and confirmed on blockchain!', { id: 'submission' });
        
        setLastSubmission({
          ...response.data,
          blockchain: {
            success: true,
            transactionHash: receipt.transactionHash,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed
          }
        });
      } else {
        setTransactionStatus('failed');
        toast.error('Transaction failed on blockchain', { id: 'submission' });
      }

      setFormData({ heartRate: '', sleepHours: '', steps: '' });

    } catch (error) {
      console.error('Submission error:', error);
      setTransactionStatus('failed');
      
      if (error.message.includes('rejected')) {
        toast.error('Transaction rejected by user', { id: 'submission' });
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas fees', { id: 'submission' });
      } else {
        toast.error(error.message || 'Failed to submit data. Please try again.', { id: 'submission' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHealthMetricColor = (metric, value) => {
    switch (metric) {
      case 'heartRate':
        if (value >= 60 && value <= 100) return 'text-green-600';
        if (value >= 50 && value <= 110) return 'text-yellow-600';
        return 'text-red-600';
      case 'sleepHours':
        if (value >= 7 && value <= 9) return 'text-green-600';
        if (value >= 6 && value <= 10) return 'text-yellow-600';
        return 'text-red-600';
      case 'steps':
        if (value >= 8000) return 'text-green-600';
        if (value >= 5000) return 'text-yellow-600';
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isConnected) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-16 w-16 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-900">Wallet Required</h2>
          <p className="text-gray-600">
            Please connect your wallet to submit health data and earn rewards.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Submit Your Health Data</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Share your health metrics securely and earn PULSE tokens. Your data is protected by 
          zero-knowledge proofs ensuring complete privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">ZK-Proof Protected</span>
            </div>

            {/* Heart Rate */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Heart Rate (BPM)</span>
              </label>
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleInputChange}
                min="30"
                max="220"
                placeholder="e.g., 72"
                className={`input-field ${formData.heartRate ? getHealthMetricColor('heartRate', parseFloat(formData.heartRate)) : ''}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Normal range: 60-100 BPM</p>
            </div>

            {/* Sleep Hours */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Moon className="h-4 w-4 text-blue-500" />
                <span>Sleep Hours (Last Night)</span>
              </label>
              <input
                type="number"
                name="sleepHours"
                value={formData.sleepHours}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.1"
                placeholder="e.g., 7.5"
                className={`input-field ${formData.sleepHours ? getHealthMetricColor('sleepHours', parseFloat(formData.sleepHours)) : ''}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 7-9 hours</p>
            </div>

            {/* Steps */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Footprints className="h-4 w-4 text-green-500" />
                <span>Steps (Today)</span>
              </label>
              <input
                type="number"
                name="steps"
                value={formData.steps}
                onChange={handleInputChange}
                min="0"
                max="100000"
                placeholder="e.g., 8500"
                className={`input-field ${formData.steps ? getHealthMetricColor('steps', parseInt(formData.steps)) : ''}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Goal: 8,000+ steps per day</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>
                    {transactionStatus === 'pending' ? 'Confirming on blockchain...' : 'Processing...'}
                  </span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  <span>Submit Data & Send Transaction</span>
                </>
              )}
            </button>

            {/* Transaction Status */}
            {transactionStatus && (
              <div className={`p-3 rounded-lg text-sm ${
                transactionStatus === 'pending' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                transactionStatus === 'confirmed' ? 'bg-green-50 text-green-800 border border-green-200' :
                'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {transactionStatus === 'pending' && <div className="spinner"></div>}
                  {transactionStatus === 'confirmed' && <CheckCircle className="h-4 w-4" />}
                  {transactionStatus === 'failed' && <AlertCircle className="h-4 w-4" />}
                  <span>
                    {transactionStatus === 'pending' && 'Transaction pending confirmation...'}
                    {transactionStatus === 'confirmed' && 'Transaction confirmed on blockchain!'}
                    {transactionStatus === 'failed' && 'Transaction failed'}
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* Privacy Info */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span>Privacy Protection</span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Zero-knowledge proofs ensure data privacy</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Only aggregated statistics are shared</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Your identity remains anonymous</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Blockchain-secured submissions</span>
              </li>
            </ul>
          </div>

          {/* Rewards Info */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward System</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Per submission:</span>
                <span className="font-medium text-green-600">10 PULSE tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Bonus for consistency:</span>
                <span className="font-medium text-blue-600">Coming soon</span>
              </div>
              <div className="flex justify-between">
                <span>Quality metrics:</span>
                <span className="font-medium text-purple-600">Extra rewards</span>
              </div>
            </div>
          </div>

          {/* Last Submission */}
          {lastSubmission && (
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Last Submission</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">ZK Proof:</span>
                  <span className="text-green-600 font-medium">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Blockchain:</span>
                  <span className="text-green-600 font-medium">
                    {lastSubmission.blockchain?.success ? '✓ Confirmed' : '⏳ Pending'}
                  </span>
                </div>
                {lastSubmission.blockchain?.transactionHash && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Tx Hash:</span>
                    <span className="text-green-600 font-mono text-xs">
                      {lastSubmission.blockchain.transactionHash.slice(0, 10)}...
                    </span>
                  </div>
                )}
                {lastSubmission.blockchain?.blockNumber && (
                  <div className="flex justify-between">
                    <span className="text-green-700">Block:</span>
                    <span className="text-green-600 font-medium">
                      #{lastSubmission.blockchain.blockNumber}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-green-700">Tokens Earned:</span>
                  <span className="text-green-600 font-medium">10 PULSE</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitData;
