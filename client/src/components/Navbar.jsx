import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Button } from './ui/button';
import { Menu, X, Wallet, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate('/');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-green-100 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <span className="text-white font-bold text-lg sm:text-xl group-hover:animate-bounce">🌾</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent group-hover:from-green-500 group-hover:to-green-700 transition-all duration-300">
                CropConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/marketplace" className="relative group px-3 py-2 text-gray-700 hover:text-green-600 transition-all duration-300 font-medium">
              <span className="relative z-10">🛒 Marketplace</span>
              <div className="absolute inset-0 bg-green-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
            </Link>
            
            {isAuthenticated ? (
              <>
                {user?.role === 'farmer' && (
                  <>
                    <Link to="/farmer/crops" className="text-gray-700 hover:text-green-600 transition-colors">
                      My Crops
                    </Link>
                    <Link to="/farmer/upload" className="text-gray-700 hover:text-green-600 transition-colors">
                      Upload Crop
                    </Link>
                  </>
                )}
                
                {/* Wallet Connection */}
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnectWallet}
                      className="flex items-center space-x-1"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>{formatAddress(account)}</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={connectWallet}
                      className="flex items-center space-x-1"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </Button>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{user?.name}</span>
                  </Button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/analytics"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Analytics
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative p-2 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-300 touch-target"
              aria-label="Toggle mobile menu"
            >
              <div className="relative w-6 h-6">
                <Menu className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
                <X className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-4 pt-4 pb-6 space-y-3 bg-gradient-to-br from-green-50 to-white border-t border-green-100">
              <Link
                to="/marketplace"
                className="group flex items-center px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-white rounded-xl transition-all duration-300 touch-target"
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg mr-3 group-hover:scale-110 transition-transform">🛒</span>
                <span className="font-medium">Marketplace</span>
              </Link>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'farmer' && (
                    <>
                      <Link
                        to="/farmer/crops"
                        className="group flex items-center px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-white rounded-xl transition-all duration-300 touch-target"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="text-lg mr-3">🌾</span>
                        <span className="font-medium">My Crops</span>
                      </Link>
                      <Link
                        to="/farmer/upload"
                        className="group flex items-center px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-white rounded-xl transition-all duration-300 touch-target"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="text-lg mr-3">📤</span>
                        <span className="font-medium">Upload Crop</span>
                      </Link>
                    </>
                  )}
                  <div className="px-4 py-3">
                    {isConnected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectWallet}
                        className="w-full"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        {formatAddress(account)}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={connectWallet}
                        className="w-full"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                      </Button>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="group flex items-center w-full px-4 py-3 text-gray-700 hover:text-green-600 hover:bg-white rounded-xl transition-all duration-300 touch-target"
                  >
                    <span className="text-lg mr-3">🚪</span>
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
