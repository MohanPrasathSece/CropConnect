import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const TraceProduct = () => {
  const { id } = useParams(); // id is traceabilityId or cropId
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchTrace = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE}/qr/trace/${id}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch traceability');
        }
        setData(json.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrace();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center text-gray-600">Loading traceability...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <div className="font-medium">Failed to load traceability</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const { product, chain, collections } = data || {};

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <Link to="/marketplace" className="text-green-600 hover:text-green-500 text-sm">← Back to Marketplace</Link>
      </div>

      {/* Product Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Traceability</h1>
            <div className="text-sm text-gray-500">Trace ID: {product?.traceabilityId}</div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-gray-500">Product</div>
              <div className="font-medium text-gray-900">{product?.name} · {product?.variety}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> {product?.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Traceability Timeline</h2>
        <ol className="relative border-s border-gray-200 ml-2">
          {chain?.map((item, idx) => {
            const isQuality = item.details && (item.details.qualityGrade || item.details.qualityScore);
            const isSale = item.details && (item.details.salePrice || item.details.paymentStatus);
            return (
              <li key={idx} className="mb-8 ms-6">
                <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 ring-8 ring-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-600"></span>
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span className="font-medium text-gray-900">{item.stage}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  <span>{item.actor || 'N/A'}</span>
                  {item.timestamp && (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </>
                  )}
                </div>
                {item.location && (
                  <div className="text-xs text-gray-500 mb-2">Location: {typeof item.location === 'string' ? item.location : JSON.stringify(item.location)}</div>
                )}
                {isQuality ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 border border-gray-100 rounded p-2"><div className="text-xs text-gray-500">Grade</div><div className="font-medium">{item.details.qualityGrade ?? '—'}</div></div>
                    <div className="bg-gray-50 border border-gray-100 rounded p-2"><div className="text-xs text-gray-500">Score</div><div className="font-medium">{item.details.qualityScore ?? '—'}</div></div>
                    <div className="bg-gray-50 border border-gray-100 rounded p-2"><div className="text-xs text-gray-500">Quantity</div><div className="font-medium">{item.details.collectedQuantity ?? '—'}</div></div>
                    <div className="bg-gray-50 border border-gray-100 rounded p-2 col-span-2 md:col-span-4"><div className="text-xs text-gray-500">AI Analysis</div><pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(item.details.aiAnalysis, null, 2)}</pre></div>
                  </div>
                ) : isSale ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-gray-50 border border-gray-100 rounded p-2"><div className="text-xs text-gray-500">Sale Price</div><div className="font-medium">₹{item.details.salePrice}</div></div>
                    <div className="bg-gray-50 border border-gray-100 rounded p-2"><div className="text-xs text-gray-500">Payment</div><div className="font-medium">{item.details.paymentStatus}</div></div>
                  </div>
                ) : item.details ? (
                  <pre className="bg-gray-50 border border-gray-100 text-xs text-gray-700 p-3 rounded-lg overflow-x-auto">{JSON.stringify(item.details, null, 2)}</pre>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default TraceProduct;
