import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Zap, Globe, Users, TrendingUp, CheckCircle, ArrowRight, Play } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Blockchain Security",
      description: "Immutable records ensure complete transparency and prevent tampering in the supply chain."
    },
    {
      icon: <Zap className="w-8 h-8 text-green-600" />,
      title: "Smart Payments",
      description: "Automated escrow payments with 30% on handover and 70% on delivery confirmation."
    },
    {
      icon: <Globe className="w-8 h-8 text-green-600" />,
      title: "QR Traceability",
      description: "Complete product journey from farm to consumer with scannable QR codes."
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Multi-Role Platform",
      description: "Designed for farmers, aggregators, retailers, and consumers with role-based access."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "AI-Powered Grading",
      description: "TensorFlow.js integration for automatic crop quality assessment and grading."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      title: "Digital Certificates",
      description: "Auto-generated compliance certificates with blockchain verification."
    }
  ];

  const stats = [
    { number: "50-64%", label: "Smartphone Usage in Rural Odisha" },
    { number: "₹5,112", label: "Average Monthly Income (NSO 2018-19)" },
    { number: "48%", label: "Paddy Production Share" },
    { number: "100%", label: "Transparency Guaranteed" }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative agri-gradient text-white py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-green-800/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block animate-bounce mb-4">
              <span className="text-6xl sm:text-7xl">🌾</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to <span className="text-yellow-300 animate-pulse">CropConnect</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-green-100 max-w-4xl mx-auto leading-relaxed px-4">
              Empowering farmers with blockchain-powered transparent, secure, and fair agricultural supply chains
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto bg-white text-green-600 hover:bg-gray-100 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl transition-all duration-300 transform hover:shadow-3xl flex items-center justify-center space-x-2">
                  <span>🚀 Get Started Today</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/marketplace" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto bg-green-700 text-white border-2 border-white hover:bg-white hover:text-green-600 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl transition-all duration-300 transform hover:shadow-3xl flex items-center justify-center space-x-2">
                  <span>🛒 Explore Marketplace</span>
                  <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-float hidden lg:block">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-full blur-xl"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float-delayed hidden lg:block">
          <div className="w-20 h-20 bg-green-400/20 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 ${
                  currentStat === index ? 'ring-4 ring-green-400 ring-opacity-50' : ''
                }`}
                style={{
                  animationDelay: `${index * 200}ms`
                }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-2 animate-pulse">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-xs sm:text-sm lg:text-base leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose <span className="text-green-600">CropConnect</span>?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Built specifically for Indian agriculture with cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 border border-gray-100 hover:border-green-200"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-green-50 rounded-2xl group-hover:bg-green-100 transition-colors duration-300 group-hover:scale-110 transform">
                    {React.cloneElement(feature.icon, {
                      className: "w-8 h-8 sm:w-10 sm:h-10 text-green-600 group-hover:text-green-700 transition-colors"
                    })}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              How <span className="text-green-600">CropConnect</span> Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Simple steps to transform your agricultural business
            </p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-6 lg:gap-6">
            <div className="group text-center relative">
              <div className="relative h-16 sm:h-20">
                <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 transform">
                  <span className="group-hover:scale-110 transition-transform">1</span>
                </div>
              </div>
              <h3 className="mt-6 sm:mt-8 text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-green-600 transition-colors">
                Farmer Upload
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Farmers create lots with crop details, images, and harvest data stored in MongoDB
              </p>
            </div>

            <div className="group text-center relative">
              <div className="relative h-16 sm:h-20">
                <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 transform">
                  <span className="group-hover:scale-110 transition-transform">2</span>
                </div>
              </div>
              <h3 className="mt-6 sm:mt-8 text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-green-600 transition-colors">
                Aggregators
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Aggregators collect, grade with AI assistance, package, and generate a QR-traceable batch
              </p>
            </div>

            <div className="group text-center relative">
              <div className="relative h-16 sm:h-20">
                <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 transform">
                  <span className="group-hover:scale-110 transition-transform">3</span>
                </div>
              </div>
              <h3 className="mt-6 sm:mt-8 text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-green-600 transition-colors">
                Retailers
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Retailers receive batches and list inventory with pricing and availability
              </p>
            </div>

            <div className="group text-center relative">
              <div className="relative h-16 sm:h-20">
                <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 transform">
                  <span className="group-hover:scale-110 transition-transform">4</span>
                </div>
              </div>
              <h3 className="mt-6 sm:mt-8 text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-green-600 transition-colors">
                Customer Purchase
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Customers browse/scan QR, place orders, and get full journey details from farm to shelf
              </p>
            </div>

            <div className="group text-center relative">
              <div className="relative h-16 sm:h-20">
                <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 transform">
                  <span className="group-hover:scale-110 transition-transform">5</span>
                </div>
              </div>
              <h3 className="mt-6 sm:mt-8 text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-900 group-hover:text-green-600 transition-colors whitespace-nowrap">
                Settlement & Traceability
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                Smart contracts release payments and every handoff is recorded on-chain with QR traceability
              </p>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 agri-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 to-green-800/30"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Ready to Transform Your Agricultural Business?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 text-green-100 max-w-3xl mx-auto leading-relaxed px-4">
              Join thousands of farmers, aggregators, and retailers already using CropConnect
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              <Link to="/register" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto bg-white text-green-600 hover:bg-gray-100 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl transition-all duration-300 transform hover:shadow-3xl flex items-center justify-center space-x-2">
                  <span>🌱 Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/scan" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto bg-green-700 text-white border-2 border-white hover:bg-white hover:text-green-600 hover:scale-105 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg shadow-2xl transition-all duration-300 transform hover:shadow-3xl flex items-center justify-center space-x-2">
                  <span>📱 Scan QR Code</span>
                  <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 animate-float hidden lg:block">
          <div className="w-20 h-20 bg-yellow-400/10 rounded-full blur-xl"></div>
        </div>
        <div className="absolute bottom-10 right-10 animate-float-delayed hidden lg:block">
          <div className="w-24 h-24 bg-green-400/10 rounded-full blur-xl"></div>
        </div>
        <div className="absolute top-1/2 left-1/4 animate-pulse hidden lg:block">
          <div className="w-2 h-2 bg-white/30 rounded-full"></div>
        </div>
        <div className="absolute top-1/3 right-1/3 animate-pulse hidden lg:block" style={{ animationDelay: '1s' }}>
          <div className="w-1 h-1 bg-white/40 rounded-full"></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
