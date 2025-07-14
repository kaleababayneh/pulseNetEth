import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Shield, 
  Coins, 
  BarChart3, 
  Users, 
  Activity,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const HomePage = () => {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: Shield,
      title: 'Zero-Knowledge Privacy',
      description: 'Your health data is protected by advanced ZK proofs, ensuring complete privacy while enabling valuable insights.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Coins,
      title: 'Earn Rewards',
      description: 'Get compensated for contributing your health data. Earn PULSE tokens for each submission.',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: BarChart3,
      title: 'Valuable Insights',
      description: 'Help researchers and healthcare providers gain insights from anonymized population health data.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a community of health-conscious individuals contributing to medical research and innovation.',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const stats = [
    { label: 'Data Submissions', value: '12,450+' },
    { label: 'Active Contributors', value: '3,200+' },
    { label: 'Tokens Distributed', value: '124,500' },
    { label: 'Research Partners', value: '50+' }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Connect Wallet',
      description: 'Connect your Ethereum wallet to securely link your submissions.',
      icon: Shield
    },
    {
      step: 2,
      title: 'Submit Health Data',
      description: 'Share your heart rate, sleep, and activity data through our secure form.',
      icon: Heart
    },
    {
      step: 3,
      title: 'ZK Proof Generation',
      description: 'Our system generates zero-knowledge proofs to verify data without exposing details.',
      icon: CheckCircle
    },
    {
      step: 4,
      title: 'Earn Rewards',
      description: 'Receive PULSE tokens automatically for each verified submission.',
      icon: Coins
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Your Health Data,
            <span className="block text-transparent bg-clip-text pulse-gradient">
              Your Rewards
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Contribute to medical research while maintaining complete privacy. 
            Earn cryptocurrency rewards for sharing anonymized health metrics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/submit"
            className="btn-primary px-8 py-4 text-lg flex items-center space-x-2"
          >
            <Heart className="h-5 w-5" />
            <span>Start Earning</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
          
          <Link
            to="/buyer"
            className="btn-secondary px-8 py-4 text-lg flex items-center space-x-2"
          >
            <BarChart3 className="h-5 w-5" />
            <span>View Data Insights</span>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose PulseNet?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform combines cutting-edge privacy technology with fair compensation 
            to create a sustainable health data ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple, secure process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="card bg-gradient-to-br from-primary-50 to-pulse-50 border-primary-200 text-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Start Earning?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who are already earning rewards while contributing 
            to important health research. Your privacy is guaranteed.
          </p>
          
          {isConnected ? (
            <Link
              to="/submit"
              className="btn-primary px-8 py-4 text-lg inline-flex items-center space-x-2"
            >
              <Activity className="h-5 w-5" />
              <span>Submit Your First Entry</span>
            </Link>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Connect your wallet to get started
              </p>
              <div className="flex justify-center">
                {/* ConnectWallet component will be rendered by Layout */}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
