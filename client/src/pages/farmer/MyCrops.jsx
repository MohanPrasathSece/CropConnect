import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Edit,
  Plus,
  Filter,
  Search,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Truck,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';

const MyCrops = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('crops');
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch real crops data
      const cropsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/crops/farmer/${user.email}`);
      
      if (cropsResponse.data.success) {
        const { crops, stats } = cropsResponse.data.data;
        setCrops(crops);
        setStats(stats);
      }

      // Fetch orders (keep mock data for now)
      try {
        const ordersRes = await axios.get(`${process.env.REACT_APP_API_URL}/orders/farmer/${user.email}`);
        setOrders(ordersRes.data.orders || []);
      } catch (orderError) {
        console.log('Orders API not available, using mock data');
        setOrders(mockOrders);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Fallback to mock data if API fails
      setCrops(mockCrops);
      setOrders(mockOrders);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  // Map order status to step (1..4) for progress UI
  const getStatusStep = (status) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'in_transit': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const fetchMockCrops = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCrops;
  };

  // Mock data for demonstration
  const mockCrops = [
    {
      id: 1,
      name: 'Rice',
      variety: 'Basmati',
      quantity: 500,
      unit: 'kg',
      pricePerUnit: 45,
      status: 'listed',
      harvestDate: '2024-01-15',
      location: 'Bhubaneswar, Odisha',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'
      ],
      totalOrders: 3,
      soldQuantity: 200
    },
    {
      id: 2,
      name: 'Wheat',
      variety: 'Hybrid',
      quantity: 300,
      unit: 'kg',
      pricePerUnit: 35,
      status: 'listed',
      harvestDate: '2024-01-10',
      location: 'Cuttack, Odisha',
      images: [
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop'
      ],
      totalOrders: 1,
      soldQuantity: 50
    },
    {
      id: 3,
      name: 'Maize',
      variety: 'Sweet Corn',
      quantity: 200,
      unit: 'kg',
      pricePerUnit: 30,
      status: 'listed',
      harvestDate: '2024-01-12',
      location: 'Puri, Odisha',
      images: [
        'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop'
      ],
      totalOrders: 2,
      soldQuantity: 75
    }
  ];

  const mockOrders = [
    {
      orderId: 'ORD-2024-001',
      cropName: 'Rice',
      buyerName: 'Rajesh Kumar',
      buyerEmail: 'rajesh@example.com',
      buyerPhone: '+91 9876543210',
      quantity: 100,
      unit: 'kg',
      pricePerUnit: 45,
      totalAmount: 4500,
      status: 'pending',
      orderDate: '2024-01-20',
      expectedDeliveryDate: '2024-01-25',
      deliveryAddress: {
        fullAddress: 'Khurda, Odisha',
        district: 'Khurda',
        state: 'Odisha'
      },
      trackingUpdates: [
        { status: 'pending', message: 'Order placed', timestamp: '2024-01-20' }
      ]
    },
    {
      orderId: 'ORD-2024-002',
      cropName: 'Rice',
      buyerName: 'Priya Sharma',
      buyerEmail: 'priya@example.com',
      buyerPhone: '+91 9876543211',
      quantity: 50,
      unit: 'kg',
      pricePerUnit: 45,
      totalAmount: 2250,
      status: 'confirmed',
      orderDate: '2024-01-18',
      expectedDeliveryDate: '2024-01-23',
      deliveryAddress: {
        fullAddress: 'Puri, Odisha',
        district: 'Puri',
        state: 'Odisha'
      },
      trackingUpdates: [
        { status: 'pending', message: 'Order placed', timestamp: '2024-01-18' },
        { status: 'confirmed', message: 'Order confirmed by farmer', timestamp: '2024-01-19' }
      ]
    },
    {
      orderId: 'ORD-2024-003',
      cropName: 'Wheat',
      buyerName: 'Amit Patel',
      buyerEmail: 'amit@example.com',
      buyerPhone: '+91 9876543212',
      quantity: 75,
      unit: 'kg',
      pricePerUnit: 35,
      totalAmount: 2625,
      status: 'delivered',
      orderDate: '2024-01-15',
      expectedDeliveryDate: '2024-01-20',
      actualDeliveryDate: '2024-01-19',
      deliveryAddress: {
        fullAddress: 'Balasore, Odisha',
        district: 'Balasore',
        state: 'Odisha'
      },
      trackingUpdates: [
        { status: 'pending', message: 'Order placed', timestamp: '2024-01-15' },
        { status: 'confirmed', message: 'Order confirmed', timestamp: '2024-01-16' },
        { status: 'in_transit', message: 'Order shipped', timestamp: '2024-01-18' },
        { status: 'delivered', message: 'Order delivered successfully', timestamp: '2024-01-19' }
      ],
      farmerRating: { rating: 5, feedback: 'Excellent quality wheat!' }
    }
  ];

  const mockStats = {
    totalOrders: 3,
    pendingOrders: 1,
    completedOrders: 1,
    totalRevenue: 2625,
    recentOrders: mockOrders.slice(0, 3)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'listed': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // In real app, make API call
      // await axios.put(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, {
      //   status: newStatus,
      //   userEmail: user.email
      // });
      
      // For demo, update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId 
            ? { 
                ...order, 
                status: newStatus,
                trackingUpdates: [
                  ...order.trackingUpdates,
                  {
                    status: newStatus,
                    message: `Order status updated to ${newStatus}`,
                    timestamp: new Date().toISOString()
                  }
                ]
              }
            : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your crops and orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Mobile: Compact Stats Chips (hidden for minimal UI) */}
        <div className="hidden sm:hidden mb-4">
          <div className="flex gap-2 overflow-x-auto">
            <div className="min-w-[150px] bg-white rounded-xl px-3 py-2 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <Package className="w-3.5 h-3.5 text-green-600" />
                  Total Crops
                </span>
                <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-green-600" />
                </div>
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">{stats.totalCrops || 0}</div>
            </div>
            <div className="min-w-[150px] bg-white rounded-xl px-3 py-2 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Active Listings
                </span>
                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">{stats.activeCrops || 0}</div>
            </div>
            <div className="min-w-[150px] bg-white rounded-xl px-3 py-2 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <ShoppingCart className="w-3.5 h-3.5 text-yellow-600" />
                  Total Orders
                </span>
                <div className="w-6 h-6 rounded-md bg-yellow-50 flex items-center justify-center">
                  <ShoppingCart className="w-3.5 h-3.5 text-yellow-600" />
                </div>
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">{stats.totalOrders || 0}</div>
            </div>
            <div className="min-w-[170px] bg-white rounded-xl px-3 py-2 shadow border border-gray-100">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                  Total Revenue
                </span>
                <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                </div>
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">₹{stats.totalRevenue || 0}</div>
            </div>
          </div>
        </div>

        {/* Mobile: Crops first (minimal list) */}
        <div className="block sm:hidden mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-gray-900">Your Crops</h2>
            <Link
              to="/farmer/upload"
              className="text-sm sm:text-base px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-green-600 text-white shadow hover:bg-green-700 active:scale-[0.99] transition"
            >
              + Upload
            </Link>
          </div>
          {crops.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow">
              <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No crops yet</p>
              <Link to="/farmer/upload" className="inline-block text-xs bg-green-600 text-white px-3 py-2 rounded-lg">Upload First Crop</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {crops.map((crop, idx) => (
                <div key={crop._id || crop.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={
                          crop.images && crop.images.length > 0
                            ? (typeof crop.images[0] === 'string' ? crop.images[0] : crop.images[0].url)
                            : getDefaultCropImage(crop.name)
                        }
                        alt={crop.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = getDefaultCropImage(crop.name); }}
                      />
                      {/* Tiny status dot for minimal UI */}
                      <span className="absolute top-1 left-1 inline-block w-2 h-2 rounded-full bg-green-500"></span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 truncate capitalize">{crop.name}</h3>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-sm text-gray-700">
                        <span>{crop.quantity} {crop.unit}</span>
                        <span className="font-semibold">₹{crop.pricePerUnit}/{crop.unit}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-blue-600">Orders: {crop.totalOrders || 0}</span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/crop/${crop._id || crop.id}`}
                            className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-800 hover:bg-gray-50 text-sm"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            onClick={() => { setActiveTab('orders'); setSearchTerm(crop.name || ''); }}
                            className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
                          >
                            View Orders
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile: Orders panel when 'View Orders' is clicked */}
        {activeTab === 'orders' && (
          <div className="block sm:hidden mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Orders</h2>
              <button
                onClick={() => { setActiveTab('crops'); setSearchTerm(''); }}
                className="text-xs text-green-700 font-medium"
              >
                Back to Crops
              </button>
            </div>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                <ShoppingCart className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No orders found for this crop.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.orderId} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">#{order.orderId}</p>
                        <p className="text-xs text-gray-600">{order.cropName} • {order.quantity} {order.unit}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>{formatStatus(order.status)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Buyer: {order.buyerName}</span>
                      <span className="text-base font-bold text-green-700">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Desktop/Tablet Header */}
        <div className="hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              My Farm Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage your crops and orders</p>
          </div>
          <Link
            to="/farmer/upload"
            className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Upload New Crop</span>
          </Link>
        </div>

        {/* Desktop/Tablet Stats Cards */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Crops</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCrops || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCrops || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: show only on tablet/desktop to avoid duplication on mobile */}
        <div className="hidden sm:block bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('crops')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'crops'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>My Crops ({crops.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-green-50 text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Orders ({orders.length})</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'crops' ? (
              <CropsTab crops={crops} getStatusColor={getStatusColor} />
            ) : (
              <OrdersTab 
                orders={filteredOrders}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                getStatusColor={getStatusColor}
                updateOrderStatus={updateOrderStatus}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get default crop images
const getDefaultCropImage = (cropName) => {
  const lowerName = cropName.toLowerCase();
  
  if (lowerName.includes('rice')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
  } else if (lowerName.includes('wheat')) {
    return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop';
  } else if (lowerName.includes('maize') || lowerName.includes('corn')) {
    return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop';
  } else if (lowerName.includes('sugarcane')) {
    return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop';
  } else if (lowerName.includes('groundnut') || lowerName.includes('peanut')) {
    return 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=300&fit=crop';
  } else if (lowerName.includes('cotton')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop';
  } else if (lowerName.includes('turmeric')) {
    return 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=300&fit=crop';
  }
  
  // Default crop image
  return 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop';
};

// Crops Tab Component
const CropsTab = ({ crops, getStatusColor }) => {
  if (crops.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">You haven't uploaded any crops yet.</p>
        <Link
          to="/farmer/upload"
          className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Your First Crop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {crops.map((crop) => (
        <div key={crop._id || crop.id} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
          {/* Crop Images */}
          <div className="relative h-48 bg-gray-200">
            <img
              src={
                crop.images && crop.images.length > 0 
                  ? (typeof crop.images[0] === 'string' ? crop.images[0] : crop.images[0].url)
                  : getDefaultCropImage(crop.name)
              }
              alt={crop.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = getDefaultCropImage(crop.name);
              }}
            />
            {crop.images && crop.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                +{crop.images.length - 1} more
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crop.status)}`}>
                {crop.status}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
                <p className="text-sm text-gray-600">{crop.variety}</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="text-sm font-medium">{crop.quantity} {crop.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price:</span>
                <span className="text-sm font-medium">₹{crop.pricePerUnit}/{crop.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Orders:</span>
                <span className="text-sm font-medium text-blue-600">{crop.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sold:</span>
                <span className="text-sm font-medium text-green-600">{crop.soldQuantity || 0} {crop.unit}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-xl text-sm hover:bg-gray-700 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Orders Tab Component
const OrdersTab = ({ 
  orders, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  getStatusColor, 
  updateOrderStatus 
}) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No orders found.</p>
        <p className="text-sm text-gray-400">Orders will appear here when customers purchase your crops.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders by crop, buyer, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.orderId} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">#{order.orderId}</h3>
                  <p className="text-sm text-gray-600">{order.cropName} • {order.quantity} {order.unit}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-lg font-bold text-green-600">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.buyerName}</p>
                  <p className="text-xs text-gray-600">{order.buyerEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.buyerPhone}</p>
                  <p className="text-xs text-gray-600">Contact Number</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.deliveryAddress?.district}</p>
                  <p className="text-xs text-gray-600">{order.deliveryAddress?.state}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                {order.expectedDeliveryDate && (
                  <div className="flex items-center space-x-1">
                    <Truck className="w-4 h-4" />
                    <span>Expected: {new Date(order.expectedDeliveryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'confirmed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      Confirm Order
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.orderId, 'cancelled')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 'in_transit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {order.status === 'in_transit' && (
                  <button
                    onClick={() => updateOrderStatus(order.orderId, 'delivered')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}

                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>

            {/* Rating Display */}
            {order.farmerRating && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-gray-900">
                    Buyer Rating: {order.farmerRating.rating}/5
                  </span>
                </div>
                {order.farmerRating.feedback && (
                  <p className="text-sm text-gray-600">"{order.farmerRating.feedback}"</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCrops;
