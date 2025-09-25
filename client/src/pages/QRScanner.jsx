import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const videoRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const isSupported = 'BarcodeDetector' in window && typeof window.BarcodeDetector === 'function';
        setSupported(isSupported);
        if (!isSupported) return;

        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

        const scanLoop = async () => {
          try {
            if (videoRef.current) {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const raw = barcodes[0].rawValue || '';
                let code = raw;
                try {
                  const parsed = JSON.parse(raw);
                  code = parsed.traceabilityId || parsed.code || parsed.cropId || raw;
                } catch (_) {}
                if (code) {
                  navigate(`/trace/${encodeURIComponent(code)}`);
                  return;
                }
              }
            }
          } catch (e) {
            // continue scanning
          }
          requestAnimationFrame(scanLoop);
        };
        requestAnimationFrame(scanLoop);
      } catch (e) {
        setError(e.message || 'Failed to access camera');
      }
    };
    init();
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [navigate]);

  const handleManualNavigate = (e) => {
    e.preventDefault();
    if (manualCode.trim()) navigate(`/trace/${encodeURIComponent(manualCode.trim())}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">QR Scanner</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h2 className="font-medium text-gray-900 mb-3">Live Camera</h2>
          {supported ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            </div>
          ) : (
            <div className="text-sm text-gray-600">Your browser does not support camera QR scanning. Use manual input below.</div>
          )}
          {error && <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">{error}</div>}
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h2 className="font-medium text-gray-900 mb-3">Manual Input</h2>
          <form onSubmit={handleManualNavigate} className="space-y-3">
            <input
              type="text"
              placeholder="Enter Traceability ID or Crop ID"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">View Traceability</button>
          </form>
          <p className="text-xs text-gray-500 mt-3">Tip: If your device doesn't support live scanning, enter the code printed below the QR.</p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
