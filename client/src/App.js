import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';

// Layout Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LocationDetection from './components/LocationDetection';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CropUpload from './pages/farmer/CropUpload';
import MyCrops from './pages/farmer/MyCrops';
import Marketplace from './pages/Marketplace';
import CropDetails from './pages/CropDetails';
import Profile from './pages/Profile';
import QRScanner from './pages/QRScanner';
import TraceProduct from './pages/TraceProduct';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

// Main App Component with Location Detection
const AppContent = () => {
  const { showLocationDetection, user, hideLocationDetection, updateUserLocation } = useAuth();

  const handleLocationSaved = (locationData) => {
    updateUserLocation(locationData);
  };

  const handleSkipLocation = () => {
    hideLocationDetection();
  };

  // Show location detection for new farmers
  if (showLocationDetection) {
    return (
      <LocationDetection
        user={user}
        onLocationSaved={handleLocationSaved}
        onSkip={handleSkipLocation}
      />
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="crop/:id" element={<CropDetails />} />
          <Route path="trace/:id" element={<TraceProduct />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          
          {/* Farmer Routes */}
          <Route path="farmer">
            <Route path="upload" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <CropUpload />
              </ProtectedRoute>
            } />
            <Route path="crops" element={
              <ProtectedRoute allowedRoles={['farmer']}>
                <MyCrops />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <AppContent />
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
