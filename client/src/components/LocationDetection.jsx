import React, { useState, useEffect } from 'react';
import { MapPin, Loader, AlertCircle, CheckCircle, Navigation } from 'lucide-react';
import locationService from '../utils/locationService';
import axios from 'axios';

const LocationDetection = ({ user, onLocationSaved, onSkip }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [permission, setPermission] = useState('prompt');

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const permissionState = await locationService.checkLocationPermission();
    setPermission(permissionState);
  };

  const detectLocation = async () => {
    setLoading(true);
    setError('');
    
    try {
      const location = await locationService.getLocationWithAddress();
      setLocationData(location);
      
      // Save location to database
      await saveLocationToDatabase(location);
      
      setSuccess(true);
      setTimeout(() => {
        onLocationSaved(location);
      }, 2000);
      
    } catch (error) {
      console.error('Location detection error:', error);
      setError(error.message || 'Failed to detect location');
    } finally {
      setLoading(false);
    }
  };

  const saveLocationToDatabase = async (location) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/users/location`, {
        email: user.email,
        address: {
          village: location.village,
          district: location.district,
          state: location.state,
          pincode: location.pincode,
          coordinates: location.coordinates,
          fullAddress: location.fullAddress,
          isLocationDetected: true
        }
      });

      if (!response.data.success) {
        throw new Error('Failed to save location');
      }
    } catch (error) {
      throw new Error('Failed to save location to database');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Location Saved! 🎉</h1>
          <p className="text-gray-600 text-lg mb-4">Your farm location has been detected and saved</p>
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <p className="text-sm text-gray-600 mb-2">📍 Your Location:</p>
            <p className="font-medium text-gray-800">{locationData?.fullAddress}</p>
          </div>
          <div className="animate-pulse text-gray-500 mt-4">Taking you to your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome to CropConnect! 🌾
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Hi <strong>{user?.name}</strong>! To provide you with the best experience, 
            we'd like to detect your farm location automatically.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={detectLocation}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-5 h-5 mr-3 animate-spin" />
                  Detecting Location...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Navigation className="w-5 h-5 mr-3" />
                  Detect My Location
                </div>
              )}
            </button>

            <button
              onClick={onSkip}
              className="w-full text-gray-600 hover:text-gray-800 py-3 px-6 rounded-2xl hover:bg-gray-100 transition-colors font-medium"
            >
              Skip for now
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Why we need location:</strong><br/>
              • Show relevant market prices in your area<br/>
              • Connect you with nearby buyers<br/>
              • Provide weather updates for your region<br/>
              • Calculate accurate delivery distances
            </p>
          </div>

          {permission === 'denied' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800">
                Location access is blocked. Please enable location permission in your browser settings and refresh the page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationDetection;
