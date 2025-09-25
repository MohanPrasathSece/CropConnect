import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const QRLabel = () => {
  const { id } = useParams(); // traceabilityId or cropId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [crop, setCrop] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        // Verify to get basic crop info (and QR metadata if any)
        const res = await fetch(`${API_BASE}/qr/verify/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to load');
        setCrop(json.data.crop);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading label...</div>;
  }
  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">{error}</div>;
  }

  // Print-focused layout (A4)
  return (
    <div className="p-6">
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
      <div className="no-print mb-4 flex justify-end">
        <button onClick={handlePrint} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Print</button>
      </div>

      <div className="max-w-[794px] mx-auto border border-gray-300 rounded-lg p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">CropConnect Product Label</h1>
            <div className="text-sm text-gray-500">Traceability Enabled</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Trace ID</div>
            <div className="font-mono text-sm">{crop.traceabilityId}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 items-center">
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-gray-500">Product</div>
                <div className="font-medium text-gray-900">{crop.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Variety</div>
                <div className="font-medium text-gray-900">{crop.variety || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-medium text-gray-900">{crop.status}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Organic</div>
                <div className="font-medium text-gray-900">{crop.isOrganic ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {crop.qrCode?.imageUrl ? (
              <img src={crop.qrCode.imageUrl} alt="QR" className="w-40 h-40 object-contain border p-2 bg-white" />
            ) : (
              <div className="text-xs text-gray-500">No QR generated yet</div>
            )}
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Scan the QR to view full traceability: harvest, quality checks, storage, logistics and sale.
        </div>
      </div>
    </div>
  );
};

export default QRLabel;
