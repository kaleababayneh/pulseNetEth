import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './contexts/WalletContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SubmitDataPage from './pages/SubmitDataPage';
import BuyerDashboard from './pages/BuyerDashboard';
import UserDashboard from './pages/UserDashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/submit" element={<SubmitDataPage />} />
              <Route path="/buyer" element={<BuyerDashboard />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: '#4ade80',
                },
              },
              error: {
                duration: 5000,
                theme: {
                  primary: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
