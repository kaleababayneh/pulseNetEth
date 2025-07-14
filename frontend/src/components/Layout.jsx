import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  BarChart3, 
  Shield, 
  User, 
  Settings,
  Wallet,
  Home
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import ConnectWallet from './ConnectWallet';
import NetworkStatus from './NetworkStatus';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isConnected, account } = useWallet();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Submit Data', href: '/submit', icon: Heart },
    { name: 'Buyer Dashboard', href: '/buyer', icon: BarChart3 },
    { name: 'My Dashboard', href: '/dashboard', icon: User },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const isActivePage = (href) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-pulse-gradient rounded-lg">
                <Heart className="h-6 w-6 text-white heartbeat" />
              </div>
              <span className="text-xl font-bold text-gray-900">PulseNet</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActivePage(item.href)
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-4">
              <ConnectWallet />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    isActivePage(item.href)
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Status */}
        <div className="mb-6">
          <NetworkStatus />
        </div>
        
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-pulse-gradient rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">PulseNet</span>
              </div>
              <p className="text-gray-600 text-sm">
                Secure, decentralized health data marketplace powered by zero-knowledge proofs.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/submit" className="hover:text-gray-900">Submit Data</Link></li>
                <li><Link to="/buyer" className="hover:text-gray-900">Buy Data</Link></li>
                <li><Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Privacy & Security</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>ZK-Proof Verified</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Blockchain Secured</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2025 PulseNet. Built for decentralized health data sharing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
