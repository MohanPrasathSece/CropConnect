import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';

const CropUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Top 7 crops in Odisha (based on agricultural data)
  const odishaCrops = [
    { value: 'rice', label: '🌾 Rice (Paddy)', category: 'grains' },
    { value: 'wheat', label: '🌾 Wheat', category: 'grains' },
    { value: 'maize', label: '🌽 Maize (Corn)', category: 'grains' },
    { value: 'sugarcane', label: '🎋 Sugarcane', category: 'cash_crops' },
    { value: 'groundnut', label: '🥜 Groundnut', category: 'pulses' },
    { value: 'cotton', label: '🌱 Cotton', category: 'cash_crops' },
    { value: 'turmeric', label: '🟡 Turmeric', category: 'spices' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.quantity) {
      alert('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // For now, send as JSON (image upload will be implemented later)
      const cropData = {
        name: formData.name,
        quantity: formData.quantity,
        unit: formData.unit,
        pricePerUnit: formData.pricePerUnit || '0',
        farmerEmail: user.email
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/crops/upload`, cropData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/farmer/crops');
        }, 2000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Crop Uploaded Successfully! 🎉</h1>
          <p className="text-gray-600 text-lg mb-6">Your crop has been added to the marketplace</p>
          <div className="animate-pulse text-gray-500">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                Upload Your Crop 🌾
              </h1>
              <p className="text-gray-600 mt-1">Add photos, select crop type, and set quantity</p>
            </div>
          </div>

          {/* Upload Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload Section */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  📸 Upload Crop Photos *
                </label>
                <div className="border-2 border-dashed border-green-300 rounded-2xl p-8 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    max="3"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <Camera className="w-12 h-12 text-green-500 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Click to upload photos
                      </p>
                      <p className="text-sm text-gray-500">
                        Upload up to 3 clear photos of your crop
                      </p>
                    </div>
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Crop Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  🌾 Select Crop Type *
                </label>
                <select
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choose your crop...</option>
                  {odishaCrops.map((crop) => (
                    <option key={crop.value} value={crop.value}>
                      {crop.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    ⚖️ Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-4">
                    📦 Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintal">Quintal</option>
                    <option value="tons">Tons</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
              </div>

              {/* Price (Optional) */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  💰 Price per {formData.unit || 'unit'} (₹) <span className="text-sm font-normal text-gray-500">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="pricePerUnit"
                  min="0"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter price (leave empty for market rate)"
                />
              </div>


              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xl font-bold py-4 px-8 rounded-2xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Upload className="w-6 h-6 mr-3" />
                      Upload Crop to Marketplace
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropUpload;
