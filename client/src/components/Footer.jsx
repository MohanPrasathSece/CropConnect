import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              <span className="text-xl font-bold">CropConnect</span>
            </div>
            <p className="text-gray-400 mb-4">
              Revolutionizing agricultural supply chains through blockchain technology, 
              ensuring transparency, traceability, and fair payments for farmers.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/cropconnect" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="https://twitter.com/cropconnect" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Twitter</span>
                🐦
              </a>
              <a href="https://linkedin.com/company/cropconnect" className="text-gray-400 hover:text-white" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">LinkedIn</span>
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-gray-400 hover:text-white">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/scan" className="text-gray-400 hover:text-white">
                  QR Scanner
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:support@cropconnect.com" className="text-gray-400 hover:text-white">
                  support@cropconnect.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 CropConnect. All rights reserved. Built with ❤️ for farmers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
