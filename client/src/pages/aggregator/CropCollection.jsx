import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Camera,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Brain,
  Zap,
  Shield,
  Loader2,
  ArrowLeft,
  Warehouse,
  Thermometer,
  Droplets,
  ChevronRight,
  Sparkles,
  Info,
  Activity,
  User,
  Fingerprint
} from 'lucide-react';
import { aggregatorApi, aiQualityApi, mlApi } from '../../utils/api';

const CropCollection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cropData = location.state?.cropData;

  const [formData, setFormData] = useState({
    cropId: cropData?.crop?.id || '',
    collectedQuantity: cropData?.crop?.quantity || '',
    collectedUnit: cropData?.crop?.unit || 'kg',
    purchasePrice: '',
    collectionLocation: {
      farmAddress: cropData?.farmer?.address?.full_address || cropData?.farmer?.address || '',
      district: cropData?.crop?.farmLocation?.district || '',
      state: cropData?.crop?.farmLocation?.state || '',
      gpsCoordinates: {
        latitude: '',
        longitude: ''
      }
    },
    storageDetails: {
      facilityName: 'Regional Warehouse A-1',
      facilityAddress: 'Bhubaneswar Logistics Hub, Odisha',
      storageType: 'warehouse',
      storageConditions: {
        temperature: '24',
        humidity: '60',
        ventilation: 'good'
      }
    },
    notes: ''
  });

  const [qualityImages, setQualityImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationMode, setVerificationMode] = useState('trained'); // 'ai' or 'trained'
  const [qualityInputs, setQualityInputs] = useState({
    color: 2,
    size: 2,
    texture: 2,
    moisture: 14,
    purity: 98
  });

  useEffect(() => {
    if (!cropData) {
      navigate('/aggregator/dashboard');
      return;
    }

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
      const parts = name.split('.');
      if (parts.length === 3) {
        const [parent, subParent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [subParent]: {
              ...prev[parent][subParent],
              [child]: value
            }
          }
        }));
      } else {
        const [parent, child] = parts;
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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setQualityImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleQualityInputChange = (e) => {
    setQualityInputs({ ...qualityInputs, [e.target.name]: parseFloat(e.target.value) });
  };

  const triggerAIAnalysis = async () => {
    if (verificationMode === 'ai' && qualityImages.length === 0) {
      alert("Please capture at least one physical intake sample.");
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      if (verificationMode === 'ai') {
        const fd = new FormData();
        qualityImages.forEach(img => fd.append('images', img));
        fd.append('cropType', cropData?.crop?.name || 'crop');

        const response = await aiQualityApi.analyze(fd);

        if (response.data.success) {
          setAiAnalysis(response.data.analysis);
        } else {
          throw new Error('Analysis protocol failed');
        }
      } else {
        // Trained ML Mode
        const response = await mlApi.getTrainedQuality(qualityInputs);
        if (response.data.success) {
          // Format as required by existing components
          setAiAnalysis({
            ...response.data,
            visualInspection: {
              color: ['Poor', 'Fair', 'Excellent'][qualityInputs.color],
              texture: ['Inconsistent', 'Slightly Varied', 'Uniform'][qualityInputs.texture],
              size: ['Small', 'Mixed', 'Uniform'][qualityInputs.size]
            },
            moistureContent: qualityInputs.moisture,
            purityLevel: qualityInputs.purity
          });
        }
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Analysis protocol failed. Please re-check parameters.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aiAnalysis) {
      setError("Neural Quality Assessment is mandatory for Regional Intake.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        cropId: cropData.crop.id,
        collectedQuantity: parseFloat(formData.collectedQuantity),
        collectedUnit: formData.collectedUnit,
        purchasePrice: parseFloat(formData.purchasePrice),
        collectionLocation: formData.collectionLocation,
        notes: formData.notes,
        qualityAssessment: aiAnalysis
      };

      const response = await aggregatorApi.collectCrop(payload);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/aggregator/dashboard');
        }, 3000);
      }
    } catch (err) {
      console.error("Collection submission failed:", err);
      setError(err.response?.data?.message || 'Intake Synchronization Failure');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-10 animate-in zoom-in duration-500">
        <div className="w-32 h-32 bg-emerald-50 rounded-[48px] flex items-center justify-center shadow-2xl shadow-emerald-500/10 border border-emerald-100 relative">
          <div className="absolute inset-0 bg-emerald-500/10 rounded-[48px] animate-ping" />
          <CheckCircle className="w-16 h-16 text-emerald-500 relative z-10" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-slate-900 tracking-tighter">Intake Protocol Finalized</h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Regional Logistics Network Updated • Blockchain Entry Confirmed</p>
        </div>
        <div className="flex items-center gap-4 px-10 py-5 bg-slate-900 rounded-[32px] text-white shadow-2xl shadow-slate-900/20">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Redirecting to Node Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-5 bg-white border border-slate-100 rounded-[28px] hover:bg-slate-50 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Regional Cargo Intake</h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              Advanced Quality Verification & Logistics Ledger Optimization
            </p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Network Signal</p>
            <p className="text-sm font-bold text-slate-900 mt-1">Optimized</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Parameters */}
        <div className="lg:col-span-8 space-y-12">
          {/* Manifest Summary */}
          <div className="bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[80px] group-hover:bg-blue-50/50 transition-colors duration-1000" />
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-10 flex items-center gap-4 relative z-10">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Source Manifest Extraction
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative z-10">
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Asset Class</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900 tracking-tighter capitalize">{cropData?.crop?.name}</p>
                </div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{cropData?.crop?.variety}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Potential Volume</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tighter">{cropData?.crop?.quantity} <span className="text-lg text-slate-300">{cropData?.crop?.unit}</span></p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Producer Entity</p>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-bold text-slate-800 truncate">ID: {cropData?.farmer?.id?.slice(0, 12)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Verification Protocol */}
          <div className="bg-slate-900 rounded-[56px] p-12 text-white relative overflow-hidden shadow-2xl shadow-slate-900/30 group">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] transition-all duration-1000 group-hover:bg-emerald-500/20" />

            <div className="relative z-10 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-10">
                <div>
                  <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-3">Quality Matrix Hub</h2>
                  <h3 className="text-4xl font-bold tracking-tighter">Verification Protocol</h3>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setVerificationMode('trained')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${verificationMode === 'trained' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
                  >
                    Trained ML
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationMode('ai')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${verificationMode === 'ai' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-white/40 hover:text-white'}`}
                  >
                    Gemini AI
                  </button>
                </div>
              </div>

              {!aiAnalysis ? (
                <div className="space-y-8">
                  {verificationMode === 'ai' ? (
                    <div className="space-y-8">
                      <div className="border-2 border-dashed border-white/10 rounded-[40px] p-16 text-center group/capture hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer relative">
                        <input
                          type="file" multiple accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        <div className="flex flex-col items-center gap-6 relative z-10">
                          <div className="w-20 h-20 bg-white/5 rounded-[28px] flex items-center justify-center border border-white/10">
                            <Camera className="w-10 h-10 text-white/20 group-hover/capture:text-emerald-400 transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-base font-bold text-white/80 uppercase tracking-widest">Document Physical Sample</p>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Neural Vision Analysis</p>
                          </div>
                        </div>
                      </div>
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-6">
                          {imagePreviews.map((p, idx) => (
                            <div key={idx} className="aspect-square rounded-[24px] overflow-hidden border border-white/10">
                              <img src={p} className="w-full h-full object-cover" alt="sample" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Color Maturation (0-2)</label>
                          <input type="number" name="color" value={qualityInputs.color} onChange={handleQualityInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size Uniformity (0-2)</label>
                          <input type="number" name="size" value={qualityInputs.size} onChange={handleQualityInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">External Texture (0-2)</label>
                          <input type="number" name="texture" value={qualityInputs.texture} onChange={handleQualityInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Moisture Saturation (%)</label>
                          <input type="number" name="moisture" value={qualityInputs.moisture} onChange={handleQualityInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purity Threshold (%)</label>
                          <input type="number" name="purity" value={qualityInputs.purity} onChange={handleQualityInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white" />
                        </div>
                        <div className="pt-4">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4">
                            <Info className="w-5 h-5 text-emerald-400" />
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tight italic">Enter physical metrics measured by the laboratory node.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={triggerAIAnalysis}
                    disabled={analyzing}
                    className="w-full py-6 bg-white text-slate-900 rounded-[32px] flex items-center justify-center gap-4 hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {analyzing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )}
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em]">{verificationMode === 'ai' ? 'Invoke Neural Vision' : 'Execute Dataset Match'}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-12 animate-in zoom-in duration-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/10 pb-10">
                    <div className="flex items-center gap-8">
                      <div className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center text-slate-900 font-bold text-4xl tracking-tighter shadow-2xl shadow-emerald-500/20">
                        {aiAnalysis.overallGrade}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em]">Certified Quality Tier</p>
                        <h4 className="text-3xl font-bold text-white tracking-tighter capitalize">
                          {aiAnalysis.overallGrade === 'Premium' ? 'Neural Elite Reserve' : `Verified Grade ${aiAnalysis.overallGrade}`}
                        </h4>
                      </div>
                    </div>
                    <div className="text-left md:text-right space-y-1">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Neural Confidence Index</p>
                      <p className="text-5xl font-bold text-white tracking-tighter">{aiAnalysis.qualityScore}<span className="text-xl text-emerald-500 font-bold ml-1">%</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {[
                      { label: 'Optical Clarity', val: aiAnalysis.visualInspection.color, icon: Sparkles },
                      { label: 'Matrix Texture', val: aiAnalysis.visualInspection.texture, icon: Package },
                      { label: 'Moisture Lock', val: `${aiAnalysis.moistureContent}%`, icon: Droplets },
                      { label: 'Refinement Tier', val: `${aiAnalysis.purityLevel}%`, icon: Shield }
                    ].map((s, i) => (
                      <div key={i} className="space-y-2 group/metric">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2 group-hover/metric:text-emerald-400 transition-colors">
                          <s.icon className="w-3.5 h-3.5" /> {s.label}
                        </p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{s.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setAiAnalysis(null)}
                      className="px-10 py-5 bg-white/5 border border-white/10 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all shadow-sm"
                    >
                      Reset Model Calibration
                    </button>
                    <div className="flex-1 px-8 py-5 bg-emerald-500/10 border border-emerald-500/20 rounded-[24px] flex items-center gap-4">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Grade Finalization Protocol Ready</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logistics Registry */}
          <div className="bg-white rounded-[56px] p-12 border border-slate-100 shadow-sm space-y-12">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              Intake & Storage Topology
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <label className="block space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Aggregate Volume Intake</span>
                  <div className="relative group/input">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-emerald-500 transition-colors" />
                    <input
                      type="number"
                      name="collectedQuantity"
                      value={formData.collectedQuantity}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-16 pr-24 text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-8 focus:ring-emerald-500/5 transition-all"
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formData.collectedUnit}</span>
                  </div>
                </label>

                <label className="block space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Market Settlement Rate</span>
                  <div className="relative group/input">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-emerald-500 transition-colors" />
                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-16 pr-10 text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-8 focus:ring-emerald-500/5 transition-all"
                    />
                  </div>
                </label>
              </div>

              <div className="space-y-8">
                <label className="block space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Authorized Storage Node</span>
                  <div className="relative group/input">
                    <Warehouse className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-emerald-500 transition-colors" />
                    <select
                      name="storageDetails.facilityName"
                      value={formData.storageDetails.facilityName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-16 pr-12 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-8 focus:ring-emerald-500/5 transition-all appearance-none"
                    >
                      <option>Regional Hub Bhubaneswar</option>
                      <option>Warehouse Delta-4 Pune</option>
                      <option>Silo Alpha-1 Nashik</option>
                    </select>
                    <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-6">
                  <label className="block space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Thermal Metric</span>
                    <div className="relative group/input">
                      <Thermometer className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="number"
                        name="storageDetails.storageConditions.temperature"
                        value={formData.storageDetails.storageConditions.temperature}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-4 text-xs font-bold text-slate-900 outline-none focus:ring-8 focus:ring-blue-500/5 transition-all"
                      />
                    </div>
                  </label>
                  <label className="block space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Humidity Index</span>
                    <div className="relative group/input">
                      <Droplets className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input
                        type="number"
                        name="storageDetails.storageConditions.humidity"
                        value={formData.storageDetails.storageConditions.humidity}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-4 text-xs font-bold text-slate-900 outline-none focus:ring-8 focus:ring-blue-500/5 transition-all"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Control Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[56px] border border-slate-100 shadow-xl shadow-slate-200/50 p-12 space-y-10 sticky top-12">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-4">
              <Clock className="w-4 h-4" />
              Protocol Lifecycle
            </h2>

            <div className="space-y-8 relative before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-50">
              <div className="flex gap-8 group/step relative z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover/step:scale-110 transition-transform"><CheckCircle className="w-4 h-4" /></div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">Origin Discovery Verified</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Decentralized Asset ID Confirmed</p>
                </div>
              </div>
              <div className="flex gap-8 group/step relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 group-hover/step:scale-110 ${aiAnalysis ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-100 text-slate-300'}`}>
                  {aiAnalysis ? <CheckCircle className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <p className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${aiAnalysis ? 'text-slate-900' : 'text-slate-300'}`}>Neural Assessment Sync</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Gemini Laboratory Model Analysis</p>
                </div>
              </div>
              <div className="flex gap-8 group/step relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 group-hover/step:scale-110 ${loading ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-100 text-slate-300'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Supply Ledger Commitment</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Pending Regional Node Broadcast</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Protocol Settlement Sum</p>
                <p className="text-4xl font-bold text-slate-900 tracking-tighter text-center">₹{parseFloat(formData.purchasePrice || 0).toLocaleString()}</p>
              </div>

              {error && (
                <div className="p-5 bg-red-50 border border-red-100 rounded-[24px] flex items-center gap-4 text-red-600 text-[10px] font-bold uppercase tracking-widest leading-tight">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !aiAnalysis}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-8 rounded-[32px] text-[10px] font-bold uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-4 disabled:opacity-50 group/submit"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    Finalize Intake Signal <ChevronRight className="w-4 h-4 text-emerald-500 group-submit:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CropCollection;
