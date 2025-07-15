import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const healthApi = {
  // Health check
  getStatus: () => api.get('/health'),
  getDetailedStatus: () => api.get('/health/detailed'),
};

export const dataApi = {
  // Submit health data
  submitData: (healthData) => api.post('/data/submit', healthData),
  
  // Get platform statistics
  getStats: () => api.get('/data/stats'),
  
  // Get user statistics
  getUserStats: (address) => api.get(`/data/user/${address}`),
  
  // Verify ZK proof
  verifyProof: (proof, dataHash) => api.post('/data/verify', { proof, dataHash }),
};

export const rewardApi = {
  // Manual reward (admin)
  manualReward: (userAddress, amount, adminKey) => 
    api.post('/rewards/manual', { userAddress, amount, adminKey }),
  
  // Get user balance
  getBalance: (address) => api.get(`/rewards/balance/${address}`),
  
  // Get leaderboard
  getLeaderboard: () => api.get('/rewards/leaderboard'),
};

export default api;
