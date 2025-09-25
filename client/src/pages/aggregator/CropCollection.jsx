import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Brain,
  Zap,
  Shield
} from 'lucide-react';
import axios from 'axios';

const CropCollection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cropData = location.state?.cropData;

  const [formData, setFormData] = useState({
    cropId: cropData?.crop?.id || '',
    collectedQuantity: '',
    collectedUnit: cropData?.crop?.unit || 'kg',
    purchasePrice: '',
    collectionLocation: {
      farmAddress: '',
      district: cropData?.crop?.farmLocation?.district || '',
      state: cropData?.crop?.farmLocation?.state || '',
      gpsCoordinates: {
        latitude: '',
        longitude: ''
      }
    },
    storageDetails: {
      facilityName: '',
      facilityAddress: '',
      storageType: 'warehouse',
      storageConditions: {
        temperature: '',
        humidity: '',
        ventilation: 'good'
      }
    },
    notes: ''
  });

  const [qualityImages, setQualityImages] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!cropData) {
      navigate('/aggregator/scan-qr');
      return;
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            collectionLocation: {
              ...prev.collectionLocation,
              gpsCoordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          }));
        },
        (error) => console.log('Location access denied')
      );
    }
  }, [cropData, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (child.includes('.')) {
        const [subParent, subChild] = child.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [subParent]: {
              ...prev[parent][subParent],
              [subChild]: value
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setQualityImages(files);
    
    // Simulate AI analysis when images are uploaded
    if (files.length > 0) {
      performAIAnalysis(files);
    }
  };

  const performAIAnalysis = async (images) => {
    setAnalyzing(true);
    setError('');

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock AI analysis results
      const mockAnalysis = {
        overallGrade: ['Premium', 'A', 'B', 'C'][Math.floor(Math.random() * 4)],
        qualityScore: Math.floor(Math.random() * 40) + 60,
        visualInspection: {
          color: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
          texture: ['Uniform', 'Slightly Varied', 'Inconsistent'][Math.floor(Math.random() * 3)],
          size: ['Uniform', 'Mixed', 'Small'][Math.floor(Math.random() * 3)],
          uniformity: Math.floor(Math.random() * 30) + 70
        },
        defectDetection: Math.random() > 0.7 ? [{
          defectType: ['Insect Damage', 'Discoloration', 'Cracks', 'Foreign Matter'][Math.floor(Math.random() * 4)],
          severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
          affectedPercentage: Math.floor(Math.random() * 15) + 1
        }] : [],
        moistureContent: Math.floor(Math.random() * 10) + 10,
        purityLevel: Math.floor(Math.random() * 20) + 80,
        contaminants: Math.random() > 0.8 ? ['Dust', 'Stones'] : [],
        pesticidesDetected: Math.random() > 0.9,
        organicCompliance: Math.random() > 0.3,
        marketRecommendation: {
          suggestedPrice: Math.floor(Math.random() * 20) + 30,
          marketDemand: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          bestMarkets: ['Local Market', 'Export', 'Processing Unit']
        }
      };

      setAiAnalysis(mockAnalysis);
    } catch (error) {
      setError('AI analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object' && formData[key] !== null) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add quality images
      qualityImages.forEach((image, index) => {
        formDataToSend.append('qualityImages', image);
      });

      const response = await axios.post('/api/v1/aggregator/collect-crop', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/aggregator/collections');
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to collect crop');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'Premium': 'text-purple-600 bg-purple-100',
      'A': 'text-green-600 bg-green-100',
      'B': 'text-blue-600 bg-blue-100',
      'C': 'text-yellow-600 bg-yellow-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Collection Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            Crop has been collected, quality checked, and stored on blockchain successfully.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to collections...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏭 Crop Collection & Quality Assessment
          </h1>
          <p className="text-gray-600">
            Collect crop from farmer with AI-powered quality analysis and blockchain storage
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Crop Details & Collection Info */}
            <div className="space-y-6">
              {/* Crop Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-6 h-6 mr-2 text-green-600" />
                  Crop Summary
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Crop Name</label>
                    <p className="text-lg font-semibold text-gray-900">{cropData?.crop?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Variety</label>
                    <p className="text-lg font-semibold text-gray-900">{cropData?.crop?.variety}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Available</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {cropData?.crop?.quantity} {cropData?.crop?.unit}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Farmer Price</label>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{cropData?.crop?.pricePerUnit}/{cropData?.crop?.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* Collection Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
                  Collection Details
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity to Collect *
                      </label>
                      <input
                        type="number"
                        name="collectedQuantity"
                        required
                        min="0"
                        max={cropData?.crop?.quantity}
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.collectedQuantity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit
                      </label>
                      <select
                        name="collectedUnit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.collectedUnit}
                        onChange={handleInputChange}
                      >
                        <option value="kg">Kilograms</option>
                        <option value="tons">Tons</option>
                        <option value="bags">Bags</option>
                        <option value="quintal">Quintal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Price (Total) *
                    </label>
                    <input
                      type="number"
                      name="purchasePrice"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      placeholder="Enter total purchase amount"
                    />
                    {formData.collectedQuantity && formData.purchasePrice && (
                      <p className="text-sm text-gray-600 mt-1">
                        Price per unit: ₹{(formData.purchasePrice / formData.collectedQuantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-red-600" />
                  Collection Location
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farm Address *
                    </label>
                    <input
                      type="text"
                      name="collectionLocation.farmAddress"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.collectionLocation.farmAddress}
                      onChange={handleInputChange}
                      placeholder="Complete farm address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                      </label>
                      <input
                        type="text"
                        name="collectionLocation.district"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.collectionLocation.district}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="collectionLocation.state"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.collectionLocation.state}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quality Assessment */}
            <div className="space-y-6">
              {/* Image Upload for AI Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-2 text-purple-600" />
                  AI Quality Assessment
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Quality Check Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="quality-images"
                      />
                      <label htmlFor="quality-images" className="cursor-pointer">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Click to upload quality check images
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Upload multiple angles for better AI analysis
                        </p>
                      </label>
                    </div>
                    
                    {qualityImages.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">
                          {qualityImages.length} image(s) selected
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {qualityImages.map((image, index) => (
                            <div key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {image.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Analysis Progress */}
                  {analyzing && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                        <div>
                          <p className="font-medium text-blue-900">🤖 AI Analysis in Progress</p>
                          <p className="text-sm text-blue-700">
                            Analyzing crop quality, detecting defects, and generating recommendations...
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Results */}
                  {aiAnalysis && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-purple-600" />
                        AI Analysis Results
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className={`inline-flex px-4 py-2 rounded-full font-semibold ${getGradeColor(aiAnalysis.overallGrade)}`}>
                            Grade: {aiAnalysis.overallGrade}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {aiAnalysis.qualityScore}/100
                          </div>
                          <div className="text-sm text-gray-600">Quality Score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Color:</span>
                          <span className="ml-2 text-gray-700">{aiAnalysis.visualInspection.color}</span>
                        </div>
                        <div>
                          <span className="font-medium">Texture:</span>
                          <span className="ml-2 text-gray-700">{aiAnalysis.visualInspection.texture}</span>
                        </div>
                        <div>
                          <span className="font-medium">Moisture:</span>
                          <span className="ml-2 text-gray-700">{aiAnalysis.moistureContent}%</span>
                        </div>
                        <div>
                          <span className="font-medium">Purity:</span>
                          <span className="ml-2 text-gray-700">{aiAnalysis.purityLevel}%</span>
                        </div>
                      </div>

                      {aiAnalysis.defectDetection.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Defects Detected</h4>
                          {aiAnalysis.defectDetection.map((defect, index) => (
                            <div key={index} className="text-sm text-yellow-700">
                              {defect.defectType} - {defect.severity} ({defect.affectedPercentage}% affected)
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">💡 AI Recommendations</h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <div>Suggested Price: ₹{aiAnalysis.marketRecommendation.suggestedPrice}/{formData.collectedUnit}</div>
                          <div>Market Demand: {aiAnalysis.marketRecommendation.marketDemand}</div>
                          <div>Organic Compliant: {aiAnalysis.organicCompliance ? '✅ Yes' : '❌ No'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Storage Details */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-indigo-600" />
                  Storage Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Facility Name
                    </label>
                    <input
                      type="text"
                      name="storageDetails.facilityName"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.storageDetails.facilityName}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC Warehouse"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Type
                    </label>
                    <select
                      name="storageDetails.storageType"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.storageDetails.storageType}
                      onChange={handleInputChange}
                    >
                      <option value="warehouse">Warehouse</option>
                      <option value="cold_storage">Cold Storage</option>
                      <option value="silo">Silo</option>
                      <option value="open_yard">Open Yard</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        name="storageDetails.storageConditions.temperature"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.storageDetails.storageConditions.temperature}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Humidity (%)
                      </label>
                      <input
                        type="number"
                        name="storageDetails.storageConditions.humidity"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={formData.storageDetails.storageConditions.humidity}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Additional Notes
            </h2>
            <textarea
              name="notes"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about the collection, quality, or special handling requirements..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/aggregator/scan-qr')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || analyzing || !aiAnalysis}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 font-semibold flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5 mr-2" />
                  Collect Crop & Store on Blockchain
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropCollection;
