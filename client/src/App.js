import React, { Suspense, lazy, Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { FarmerLayout } from './components/farmer/FarmerLayout';
import { AggregatorLayout } from './components/aggregator/AggregatorLayout';
import { RetailerLayout } from './components/retailer/RetailerLayout';
import { ConsumerLayout } from './components/consumer/ConsumerLayout';

// Core Modules
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoleSelection from './pages/auth/RoleSelection';
import Dashboard from './pages/Dashboard';
import QRScanner from './pages/QRScanner';
import TraceProduct from './pages/TraceProduct';
import CropDetails from './pages/CropDetails';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/auth/AuthCallback';

// Dashboard Pages (Directly imported for speed)
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyCrops from './pages/farmer/MyCrops';
import RetailerDashboard from './pages/retailer/RetailerDashboard';
import AggregatorDashboard from './pages/aggregator/AggregatorDashboard';

// Error Boundary to filter AbortError
class AbortErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's an AbortError
    if (error.name === 'AbortError' ||
      error.message?.includes('signal is aborted') ||
      error.message?.includes('aborted without reason')) {
      return { hasError: false, error: null }; // Don't show error for AbortError
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log AbortError silently
    if (error.name === 'AbortError' ||
      error.message?.includes('signal is aborted') ||
      error.message?.includes('aborted without reason')) {
      console.warn('AbortError caught and suppressed:', error.message);
      return;
    }

    // Log other errors normally
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render a fallback UI for non-AbortError here
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy Loaded Sub-pages
const CropUpload = lazy(() => import('./pages/farmer/CropUpload'));
const FarmerOrders = lazy(() => import('./pages/farmer/Orders'));
const FarmerPayments = lazy(() => import('./pages/farmer/Payments'));
const FarmerProfile = lazy(() => import('./pages/farmer/Profile'));
const FarmerReports = lazy(() => import('./pages/farmer/Reports'));
const FarmerSettings = lazy(() => import('./pages/farmer/Settings'));
const AIInsights = lazy(() => import('./pages/farmer/AIInsights'));
const TrainedInsights = lazy(() => import('./pages/farmer/TrainedInsights'));

const RetailerMarketplace = lazy(() => import('./pages/retailer/RetailerMarketplace'));
const RetailerOrders = lazy(() => import('./pages/retailer/RetailerOrders'));
const RetailerPayments = lazy(() => import('./pages/retailer/RetailerPayments'));
const RetailerProfile = lazy(() => import('./pages/retailer/RetailerProfile'));
const RetailerDelivery = lazy(() => import('./pages/retailer/RetailerDelivery'));

const AggregatorCollections = lazy(() => import('./pages/aggregator/AggregatorCollections'));
const LogisticsDelivery = lazy(() => import('./pages/aggregator/LogisticsDelivery'));
const AggregatorPayments = lazy(() => import('./pages/aggregator/PaymentsSettlements'));
const AggregatorProfile = lazy(() => import('./pages/aggregator/AggregatorProfile'));
const StorageInventory = lazy(() => import('./pages/aggregator/StorageInventory'));
const QualityVerification = lazy(() => import('./pages/aggregator/QualityVerification'));
const CropCollection = lazy(() => import('./pages/aggregator/CropCollection'));
const AggregatorMarketplace = lazy(() => import('./pages/aggregator/RetailerMarketplace'));
const AggregatorRetailerOrders = lazy(() => import('./pages/aggregator/RetailerOrders'));
const ReportsTraceability = lazy(() => import('./pages/aggregator/ReportsTraceability'));
const AggregatorQRScanner = lazy(() => import('./pages/aggregator/AggregatorQRScanner'));
const AggregatorSettings = lazy(() => import('./pages/aggregator/AggregatorSettings'));
const RetailerTraceability = lazy(() => import('./pages/retailer/RetailerTraceability'));
const RetailerSettings = lazy(() => import('./pages/retailer/RetailerSettings'));
const ConsumerDashboard = lazy(() => import('./pages/consumer/ConsumerDashboard'));
const ConsumerMarketplace = lazy(() => import('./pages/consumer/ConsumerMarketplace'));
const BlockchainDemo = lazy(() => import('./pages/consumer/BlockchainDemo'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Profile = lazy(() => import('./pages/Profile'));


const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
  </div>
);

function App() {
  return (
    <AbortErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/select-role" element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/trace" element={<TraceProduct />} />
          <Route path="/qr" element={<QRScanner />} />
          <Route path="/crop/:id" element={<CropDetails />} />

          {/* Farmer App */}
          <Route path="/farmer" element={<ProtectedRoute allowedRoles={['farmer']}><FarmerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<FarmerDashboard />} />
            <Route path="upload" element={<CropUpload />} />
            <Route path="crops" element={<MyCrops />} />
            <Route path="orders" element={<FarmerOrders />} />
            <Route path="payments" element={<FarmerPayments />} />
            <Route path="profile" element={<FarmerProfile />} />
            <Route path="reports" element={<FarmerReports />} />
            <Route path="settings" element={<FarmerSettings />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="trained-insights" element={<TrainedInsights />} />
          </Route>

          {/* Retailer App */}
          <Route path="/retailer" element={<ProtectedRoute allowedRoles={['retailer']}><RetailerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RetailerDashboard />} />
            <Route path="marketplace" element={<RetailerMarketplace />} />
            <Route path="orders" element={<RetailerOrders />} />
            <Route path="traceability" element={<RetailerTraceability />} />
            <Route path="payments" element={<RetailerPayments />} />
            <Route path="profile" element={<RetailerProfile />} />
            <Route path="delivery" element={<RetailerDelivery />} />
            <Route path="settings" element={<RetailerSettings />} />
          </Route>

          {/* Aggregator App */}
          <Route path="/aggregator" element={<ProtectedRoute allowedRoles={['aggregator']}><AggregatorLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AggregatorDashboard />} />
            <Route path="collections" element={<AggregatorCollections />} />
            <Route path="logistics" element={<LogisticsDelivery />} />
            <Route path="payments" element={<AggregatorPayments />} />
            <Route path="profile" element={<AggregatorProfile />} />
            <Route path="storage" element={<StorageInventory />} />
            <Route path="verify" element={<QualityVerification />} />
            <Route path="collect" element={<CropCollection />} />
            <Route path="marketplace" element={<AggregatorMarketplace />} />
            <Route path="retailer-orders" element={<AggregatorRetailerOrders />} />
            <Route path="reports" element={<ReportsTraceability />} />
            <Route path="scan-qr" element={<AggregatorQRScanner />} />
            <Route path="settings" element={<AggregatorSettings />} />
          </Route>

          {/* Consumer App */}
          <Route path="/consumer" element={<ProtectedRoute allowedRoles={['consumer', 'admin']}><ConsumerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ConsumerDashboard />} />
            <Route path="marketplace" element={<ConsumerMarketplace />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="blockchain" element={<BlockchainDemo />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AbortErrorBoundary>
  );
}

export default App;
