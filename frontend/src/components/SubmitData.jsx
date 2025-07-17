import React, { useState, useEffect } from 'react';
import { Heart, Activity, Moon, Footprints, Shield, CheckCircle, AlertCircle, Smartphone, Watch, Download, Loader, Clock } from 'lucide-react';
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
  const [isImporting, setIsImporting] = useState(false);
  const [importedFrom, setImportedFrom] = useState(null);
  const [isDataImported, setIsDataImported] = useState(false);
  const [hasRecentSubmission, setHasRecentSubmission] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(null);
  const [isCheckingSubmissions, setIsCheckingSubmissions] = useState(false);
  const [timeUntilNextSubmission, setTimeUntilNextSubmission] = useState(null);

  // Update countdown timer
  useEffect(() => {
    let interval;
    if (hasRecentSubmission && lastSubmissionTime) {
      interval = setInterval(() => {
        const timeLeft = (24 * 60 * 60 * 1000) - (Date.now() - lastSubmissionTime);
        if (timeLeft <= 0) {
          setHasRecentSubmission(false);
          setLastSubmissionTime(null);
          setTimeUntilNextSubmission(null);
          // Clear localStorage
          const lastSubmissionKey = `lastSubmission_${account?.toLowerCase()}`;
          localStorage.removeItem(lastSubmissionKey);
        } else {
          setTimeUntilNextSubmission(timeLeft);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasRecentSubmission, lastSubmissionTime, account]);

  // Format time remaining
  const formatTimeRemaining = (timeMs) => {
    const hours = Math.floor(timeMs / (60 * 60 * 1000));
    const minutes = Math.floor((timeMs % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeMs % (60 * 1000)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Check if user has submitted data in the last 24 hours
  const checkRecentSubmissions = async (walletAddress) => {
    if (!walletAddress) return;
    
    setIsCheckingSubmissions(true);
    try {
      const response = await dataApi.getUserStats(walletAddress);
      
      if (response.success && response.data) {
        // Check localStorage for last submission time for this wallet
        const lastSubmissionKey = `lastSubmission_${walletAddress.toLowerCase()}`;
        const lastSubmissionTime = localStorage.getItem(lastSubmissionKey);
        
        if (lastSubmissionTime) {
          const lastSubmission = parseInt(lastSubmissionTime);
          const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
          
          if (lastSubmission > twentyFourHoursAgo) {
            setHasRecentSubmission(true);
            setLastSubmissionTime(lastSubmission);
            return;
          }
        }
        
        // If no localStorage entry, check if they have any submissions
        // and simulate that they might have submitted recently
        if (response.data.submissions && response.data.submissions.offChain > 0) {
          // For demo purposes, randomly assign some users a recent submission
          const userHash = walletAddress.toLowerCase().slice(-4);
          const hashNum = parseInt(userHash, 16);
          
          // If the last 4 characters of wallet hash are divisible by 7, simulate recent submission
          if (hashNum % 7 === 0) {
            const mockRecentTime = Date.now() - (Math.random() * 20 * 60 * 60 * 1000); // Random time within last 20 hours
            setHasRecentSubmission(true);
            setLastSubmissionTime(mockRecentTime);
            localStorage.setItem(lastSubmissionKey, mockRecentTime.toString());
            return;
          }
        }
        
        // No recent submission found
        setHasRecentSubmission(false);
        setLastSubmissionTime(null);
      }
    } catch (error) {
      console.error('Error checking recent submissions:', error);
      // Don't block submission if we can't check - fail safe
      setHasRecentSubmission(false);
    } finally {
      setIsCheckingSubmissions(false);
    }
  };

  // Check recent submissions when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      checkRecentSubmissions(account);
    }
  }, [isConnected, account]);

  // Realistic health data generation for different devices
  const generateHealthData = (source) => {
    const now = new Date();
    const hour = now.getHours();
    
    // Base values with realistic variations
    let heartRate, sleepHours, steps;
    
    if (source === 'apple') {
      // Apple Watch tends to be more accurate and shows slightly different patterns
      heartRate = 65 + Math.floor(Math.random() * 25); // 65-90 BPM
      sleepHours = 6.5 + Math.random() * 2.5; // 6.5-9 hours
      steps = 5000 + Math.floor(Math.random() * 8000); // 5000-13000 steps
      
      // Time-based adjustments for Apple Watch
      if (hour < 10) { // Morning
        heartRate += 5; // Slightly higher after waking up
        steps = Math.floor(steps * 0.3); // Fewer steps in morning
      } else if (hour > 18) { // Evening
        heartRate -= 3; // Lower in evening
        steps = Math.floor(steps * 1.2); // More steps accumulated
      }
    } else {
      // Google Fit tends to show slightly different patterns
      heartRate = 70 + Math.floor(Math.random() * 30); // 70-100 BPM
      sleepHours = 6 + Math.random() * 3; // 6-9 hours
      steps = 4000 + Math.floor(Math.random() * 12000); // 4000-16000 steps
      
      // Time-based adjustments for Google Fit
      if (hour < 10) { // Morning
        steps = Math.floor(steps * 0.2); // Fewer steps in morning
      } else if (hour > 18) { // Evening
        steps = Math.floor(steps * 1.3); // More steps accumulated
      }
    }
    
    // Add some realistic variations based on day of week
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      sleepHours += 0.5; // More sleep on weekends
      steps = Math.floor(steps * 0.8); // Fewer steps on weekends
    } else if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Weekdays
      heartRate += 2; // Slightly higher stress on weekdays
      steps = Math.floor(steps * 1.1); // More steps on weekdays
    }
    
    // Ensure values are within realistic bounds
    heartRate = Math.min(120, Math.max(50, heartRate));
    sleepHours = Math.min(12, Math.max(4, sleepHours));
    steps = Math.min(25000, Math.max(500, steps));
    
    return {
      heartRate: Math.round(heartRate),
      sleepHours: Math.round(sleepHours * 10) / 10, // One decimal place
      steps: Math.round(steps)
    };
  };

  const simulateApiCall = async (source) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Simulate occasional API failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error(`${source === 'apple' ? 'Apple Health' : 'Google Fit'} API temporarily unavailable`);
    }
    
    return generateHealthData(source);
  };

  const handleImportData = async (source) => {
    setIsImporting(true);
    
    try {
      const sourceLabel = source === 'apple' ? 'Apple Health' : 'Google Fit';
      toast.loading(`Connecting to ${sourceLabel}...`, { id: 'import' });
      
      // Simulate authentication and data fetching
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.loading(`Fetching health data from ${sourceLabel}...`, { id: 'import' });
      
      const healthData = await simulateApiCall(source);
      
      // Update form with imported data
      setFormData({
        heartRate: healthData.heartRate.toString(),
        sleepHours: healthData.sleepHours.toString(),
        steps: healthData.steps.toString()
      });
      
      setImportedFrom(source);
      setIsDataImported(true);
      
      toast.success(`✅ Successfully imported data from ${sourceLabel}!`, { id: 'import' });
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import health data', { id: 'import' });
    } finally {
      setIsImporting(false);
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { heartRate, sleepHours, steps } = formData;

    if (hasRecentSubmission) {
      const timeUntilNext = 24 * 60 * 60 * 1000 - (Date.now() - lastSubmissionTime);
      const hoursLeft = Math.ceil(timeUntilNext / (60 * 60 * 1000));
      toast.error(`You can only submit once every 24 hours. Try again in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}.`);
      return false;
    }

    if (!isDataImported) {
      toast.error('Please import health data first');
      return false;
    }

    if (!heartRate || !sleepHours || !steps) {
      toast.error('Health data is incomplete. Please refresh the import.');
      return false;
    }

    if (heartRate < 30 || heartRate > 220) {
      toast.error('Heart rate data appears invalid. Please refresh the import.');
      return false;
    }

    if (sleepHours < 0 || sleepHours > 24) {
      toast.error('Sleep data appears invalid. Please refresh the import.');
      return false;
    }

    if (steps < 0 || steps > 100000) {
      toast.error('Step data appears invalid. Please refresh the import.');
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
        
        // Set cooldown period and store in localStorage
        const submissionTime = Date.now();
        setHasRecentSubmission(true);
        setLastSubmissionTime(submissionTime);
        
        const lastSubmissionKey = `lastSubmission_${account.toLowerCase()}`;
        localStorage.setItem(lastSubmissionKey, submissionTime.toString());
        
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
      setIsDataImported(false);
      setImportedFrom(null);

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

            {/* Data Import Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Download className="h-5 w-5 text-blue-600" />
                <span>Import Health Data</span>
              </h3>
              
              {!isDataImported ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Connect your health app to automatically import your latest health metrics.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Apple Health Button */}
                    <button
                      type="button"
                      onClick={() => handleImportData('apple')}
                      disabled={isImporting}
                      className="group relative flex items-center justify-center space-x-3 p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-3">
                        {isImporting ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                            <Heart className="h-5 w-5 text-red-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <div className="text-sm font-semibold">Apple Health</div>
                          <div className="text-xs text-gray-300">iOS Health App</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                    
                    {/* Google Fit Button */}
                    <button
                      type="button"
                      onClick={() => handleImportData('google')}
                      disabled={isImporting}
                      className="group relative flex items-center justify-center space-x-3 p-4 bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-xl hover:from-blue-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center space-x-3">
                        {isImporting ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg">
                            <Activity className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                        <div className="text-left">
                          <div className="text-sm font-semibold">Google Fit</div>
                          <div className="text-xs text-blue-100">Android Fitness</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm font-semibold text-green-800">
                        Successfully Connected
                      </div>
                      <div className="text-xs text-green-600">
                        Data imported from {importedFrom === 'apple' ? 'Apple Health' : 'Google Fit'} • {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    
                  </div>
                </div>
              )}
            </div>

            {/* Heart Rate */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Heart Rate (BPM)</span>
                {isDataImported && (
                  <span className="text-xs text-white bg-gradient-to-r from-gray-800 to-gray-700 px-2 py-1 rounded-full">
                    {importedFrom === 'apple' ? '🍎 Apple Health' : '🔵 Google Fit'}
                  </span>
                )}
              </label>
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                readOnly
                min="30"
                max="220"
                placeholder={isDataImported ? "" : "Connect your health app to import data"}
                className={`input-field bg-gray-50 cursor-not-allowed ${formData.heartRate ? getHealthMetricColor('heartRate', parseFloat(formData.heartRate)) : 'text-gray-500'}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Normal range: 60-100 BPM</p>
            </div>

            {/* Sleep Hours */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Moon className="h-4 w-4 text-blue-500" />
                <span>Sleep Hours (Last Night)</span>
                {isDataImported && (
                  <span className="text-xs text-white bg-gradient-to-r from-gray-800 to-gray-700 px-2 py-1 rounded-full">
                    {importedFrom === 'apple' ? '🍎 Apple Health' : '🔵 Google Fit'}
                  </span>
                )}
              </label>
              <input
                type="number"
                name="sleepHours"
                value={formData.sleepHours}
                readOnly
                min="0"
                max="24"
                step="0.1"
                placeholder={isDataImported ? "" : "Connect your health app to import data"}
                className={`input-field bg-gray-50 cursor-not-allowed ${formData.sleepHours ? getHealthMetricColor('sleepHours', parseFloat(formData.sleepHours)) : 'text-gray-500'}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 7-9 hours</p>
            </div>

            {/* Steps */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Footprints className="h-4 w-4 text-green-500" />
                <span>Steps (Today)</span>
                {isDataImported && (
                  <span className="text-xs text-white bg-gradient-to-r from-gray-800 to-gray-700 px-2 py-1 rounded-full">
                    {importedFrom === 'apple' ? '🍎 Apple Health' : '🔵 Google Fit'}
                  </span>
                )}
              </label>
              <input
                type="number"
                name="steps"
                value={formData.steps}
                readOnly
                min="0"
                max="100000"
                placeholder={isDataImported ? "" : "Connect your health app to import data"}
                className={`input-field bg-gray-50 cursor-not-allowed ${formData.steps ? getHealthMetricColor('steps', parseInt(formData.steps)) : 'text-gray-500'}`}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Goal: 8,000+ steps per day</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isDataImported || hasRecentSubmission}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner"></div>
                  <span>
                    {transactionStatus === 'pending' ? 'Confirming on blockchain...' : 'Processing...'}
                  </span>
                </>
              ) : hasRecentSubmission ? (
                <>
                  <Clock className="h-4 w-4" />
                  <span>24 Hour Cooldown Active</span>
                </>
              ) : !isDataImported ? (
                <>
                  <Download className="h-4 w-4" />
                  <span>Import Health Data First</span>
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4" />
                  <span>Submit Data & Send Transaction</span>
                </>
              )}
            </button>

            {!isDataImported && !hasRecentSubmission && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Please connect your health app to import data before submitting.</span>
                </div>
              </div>
            )}

            {hasRecentSubmission && (
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3 text-red-800">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">24 Hour Cooldown Period</div>
                    <div className="text-xs text-red-600 mt-1">
                      You can submit again in: {' '}
                      <span className="font-mono font-medium">
                        {timeUntilNextSubmission ? formatTimeRemaining(timeUntilNextSubmission) : 'calculating...'}
                      </span>
                    </div>
                    <div className="text-xs text-red-500 mt-1">
                      This prevents spam and ensures fair token distribution
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isCheckingSubmissions && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Checking recent submissions...</span>
                </div>
              </div>
            )}

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

          {/* Data Import Info */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Download className="h-5 w-5 text-blue-600" />
              <span>Secure Data Import</span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <div className="flex items-center justify-center w-5 h-5 bg-gray-900 rounded-full mt-0.5">
                  <Heart className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Apple Health integration with real-time sync</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mt-0.5">
                  <Activity className="h-2.5 w-2.5 text-white" />
                </div>
                <span>Google Fit compatibility for Android devices</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span>Automatic data validation and accuracy checks</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-purple-500 mt-0.5" />
                <span>End-to-end encryption for all health data transfers</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>No manual entry - ensures data authenticity</span>
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
