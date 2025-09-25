import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Star, Heart, ShoppingCart, Eye, Leaf, Award, TrendingUp } from 'lucide-react';

const Marketplace = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    priceRange: ''
  });

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        // Simulate API call with mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCrops([
          {
            id: 1,
            name: 'Basmati Rice',
            variety: 'Pusa Basmati 1121',
            quantity: 500,
            unit: 'kg',
            pricePerUnit: 45,
            farmer: 'Rajesh Kumar',
            location: 'Bhubaneswar, Odisha',
            harvestDate: '2024-01-15',
            organicCertified: true,
            rating: 4.8,
            reviews: 24,
            category: 'grains',
            image: '🌾'
          },
          {
            id: 2,
            name: 'Fresh Tomatoes',
            variety: 'Hybrid Premium',
            quantity: 200,
            unit: 'kg',
            pricePerUnit: 25,
            farmer: 'Priya Patel',
            location: 'Cuttack, Odisha',
            harvestDate: '2024-01-10',
            organicCertified: false,
            rating: 4.5,
            reviews: 18,
            category: 'vegetables',
            image: '🍅'
          },
          {
            id: 3,
            name: 'Golden Wheat',
            variety: 'HD-2967',
            quantity: 1000,
            unit: 'kg',
            pricePerUnit: 22,
            farmer: 'Suresh Singh',
            location: 'Puri, Odisha',
            harvestDate: '2024-01-20',
            organicCertified: true,
            rating: 4.9,
            reviews: 32,
            category: 'grains',
            image: '🌾'
          },
          {
            id: 4,
            name: 'Organic Onions',
            variety: 'Red Onion',
            quantity: 300,
            unit: 'kg',
            pricePerUnit: 18,
            farmer: 'Amit Sharma',
            location: 'Berhampur, Odisha',
            harvestDate: '2024-01-12',
            organicCertified: true,
            rating: 4.6,
            reviews: 15,
            category: 'vegetables',
            image: '🧅'
          },
          {
            id: 5,
            name: 'Sweet Mangoes',
            variety: 'Alphonso',
            quantity: 150,
            unit: 'kg',
            pricePerUnit: 120,
            farmer: 'Kavita Devi',
            location: 'Koraput, Odisha',
            harvestDate: '2024-01-08',
            organicCertified: true,
            rating: 5.0,
            reviews: 41,
            category: 'fruits',
            image: '🥭'
          },
          {
            id: 6,
            name: 'Green Chilies',
            variety: 'Bhut Jolokia',
            quantity: 80,
            unit: 'kg',
            pricePerUnit: 35,
            farmer: 'Ravi Mohan',
            location: 'Sambalpur, Odisha',
            harvestDate: '2024-01-18',
            organicCertified: false,
            rating: 4.3,
            reviews: 12,
            category: 'vegetables',
            image: '🌶️'
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch crops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-pulse">
              <span className="text-white font-bold text-2xl">🌾</span>
            </div>
            <div className="text-xl font-semibold text-gray-700 mb-2">Loading Marketplace...</div>
            <div className="text-gray-500">Discovering fresh crops from verified farmers</div>
            <div className="flex space-x-2 mt-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Marketplace</h1>
              <p className="text-sm text-gray-500">Discover fresh crops from verified farmers</p>
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search crops, farmers..."
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Quick Category Filters */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="flex-shrink-0 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
              All
            </button>
            <button className="flex-shrink-0 px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border">
              Grains
            </button>
            <button className="flex-shrink-0 px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border">
              Vegetables
            </button>
            <button className="flex-shrink-0 px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border">
              Fruits
            </button>
            <button className="flex-shrink-0 px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium border">
              Organic
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters</span>
            </div>
            <button className="text-xs text-green-600 font-medium">Clear All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Location"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
            </div>
            
            <select
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
            >
              <option value="">Price Range</option>
              <option value="0-20">₹0 - ₹20</option>
              <option value="20-50">₹20 - ₹50</option>
              <option value="50+">₹50+</option>
            </select>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{crops.length}</span> crops found
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <select className="text-sm border-none bg-transparent text-gray-600 focus:outline-none">
              <option>Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {crops.map((crop) => (
          <div key={crop.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Crop Image</span>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{crop.name}</h3>
                {crop.organicCertified && (
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full border border-green-200">
                    Organic
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-1">{crop.variety}</p>
              <p className="text-sm text-gray-600 mb-1">by {crop.farmer}</p>
              <p className="text-sm text-gray-500 mb-4">{crop.location}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-lg font-semibold text-gray-900">₹{crop.pricePerUnit}/{crop.unit}</p>
                  <p className="text-sm text-gray-500">{crop.quantity} {crop.unit} available</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link
                  to={`/crop/${crop.id}`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  View Details
                </Link>
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700">
                  Contact Farmer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default Marketplace;
