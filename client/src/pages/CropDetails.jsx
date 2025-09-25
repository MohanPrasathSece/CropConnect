import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const CropDetails = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState({ imageUrl: '', code: '' });
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    const fetchCrop = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCrop({
          id: parseInt(id),
          name: 'Basmati Rice',
          variety: 'Pusa Basmati 1121',
          quantity: 500,
          unit: 'kg',
          pricePerUnit: 45,
          farmer: {
            name: 'Rajesh Kumar',
            phone: '+91 9876543210',
            email: 'rajesh@example.com',
            location: 'Bhubaneswar, Odisha'
          },
          location: 'Bhubaneswar, Odisha',
          harvestDate: '2024-01-15',
          organicCertified: true,
          description: 'Premium quality Basmati rice grown using traditional farming methods. Rich in aroma and taste.',
          images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
          blockchainHash: '0x1234567890abcdef...',
          qrCode: 'QR123456'
        });
      } catch (error) {
        console.error('Failed to fetch crop:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

  const handleGenerateQR = async () => {
    try {
      setQrLoading(true);
      setQrError('');
      const res = await fetch(`${API_BASE}/qr/generate/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate QR');
      }
      setQr({ imageUrl: json.qr.imageUrl, code: json.qr.code });
    } catch (e) {
      setQrError(e.message);
    } finally {
      setQrLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading crop details...</div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Crop not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/marketplace" className="text-green-600 hover:text-green-500">
          ← Back to Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center mb-4">
            <span className="text-gray-500">Crop Images</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {crop.images.map((image, index) => (
              <div key={index} className="bg-gray-200 h-20 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">Img {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{crop.name}</h1>
            {crop.organicCertified && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Organic Certified
              </span>
            )}
          </div>

          <p className="text-lg text-gray-600 mb-2">{crop.variety}</p>
          <p className="text-2xl font-bold text-green-600 mb-4">₹{crop.pricePerUnit}/{crop.unit}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Availability</h3>
            <p className="text-gray-600">{crop.quantity} {crop.unit} available</p>
            <p className="text-gray-600">Harvested on: {new Date(crop.harvestDate).toLocaleDateString()}</p>
            <p className="text-gray-600">Location: {crop.location}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{crop.description}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Farmer Details</h3>
            <p className="text-gray-600">Name: {crop.farmer.name}</p>
            <p className="text-gray-600">Phone: {crop.farmer.phone}</p>
            <p className="text-gray-600">Email: {crop.farmer.email}</p>
            <p className="text-gray-600">Location: {crop.farmer.location}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Verification & QR</h3>
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="text-sm text-gray-700">
                <div className="mb-1">Blockchain Hash: <span className="text-gray-600">{crop.blockchainHash || '—'}</span></div>
                <div>QR Code ID: <span className="text-gray-600">{qr.code || crop.qrCode || '—'}</span></div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleGenerateQR} disabled={qrLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                  {qrLoading ? 'Generating...' : 'Generate QR'}
                </button>
                <Link
                  to={`/trace/${id}`}
                  className="px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-sm"
                >
                  View Traceability
                </Link>
              </div>
            </div>
            {qrError && <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded mt-3 p-2">{qrError}</div>}
            {qr.imageUrl && (
              <div className="mt-4">
                <img src={qr.imageUrl} alt="Crop QR" className="w-40 h-40 object-contain bg-white p-2 rounded border" />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Contact Farmer
            </button>
            <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
              Make Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetails;
