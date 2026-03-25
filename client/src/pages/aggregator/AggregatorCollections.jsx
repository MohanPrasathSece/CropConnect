import React, { useState, useEffect } from "react";
import { StatusBadge } from "../../components/farmer/StatusBadge";
import { MapPin, QrCode, Eye, X, Wheat, Search, Filter, Loader2, Package, Calendar, User, ShieldCheck, ShoppingCart } from "lucide-react";
import { formatLocation } from "../../utils/format";
import { useNavigate } from "react-router-dom";
import { aggregatorApi } from "../../utils/api";
import QRCode from "qrcode";

export default function AggregatorCollections() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const [qrSrc, setQrSrc] = useState(null);
    const [activeTab, setActiveTab] = useState("listings"); // Changed default to listings so user sees crops first
    const [availableCrops, setAvailableCrops] = useState([]);
    const [fetchingCrops, setFetchingCrops] = useState(false);

    useEffect(() => {
        fetchCollections();
        fetchAvailableCrops();
    }, []);

    const fetchAvailableCrops = async () => {
        try {
            setFetchingCrops(true);
            const response = await aggregatorApi.getDashboard();
            if (response.data.success) {
                setAvailableCrops(response.data.data.availableCrops || []);
            }
        } catch (err) {
            console.error("Available crops fetch error:", err);
        } finally {
            setFetchingCrops(false);
        }
    };

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const response = await aggregatorApi.getCollections();
            if (response.data.success) {
                setCollections(response.data.data.collections);
            } else {
                setError("Failed to synchronize collection records.");
            }
        } catch (err) {
            console.error("Collections fetch error:", err);
            setError("Security context expired or network failure.");
        } finally {
            setLoading(false);
        }
    };

    const filteredCollections = collections.filter(item =>
        item.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source_crop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.collection_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (selected) {
            const date = new Date(selected.created_at).toLocaleDateString();
            const cropName = selected.source_crop?.name || 'Unknown Crop';
            const locationString = typeof selected.farmer?.address === 'string'
                ? selected.farmer?.address
                : formatLocation(selected.farmer?.address);

            const details = `Product: ${cropName}\nAddress: ${locationString}\nDate: ${date}\nQuality: Grade ${selected.quality_assessment?.overallGrade || 'N/A'}`;

            QRCode.toDataURL(details, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
                .then(url => setQrSrc(url))
                .catch(err => console.error(err));
        } else {
            setQrSrc(null);
        }
    }, [selected]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Loading records...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Marketplace</h1>
                    <p className="text-slate-500 font-medium mt-2 text-lg">Buy fresh crops directly from farmers or view your collection history.</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab("listings")}
                        className={`px-8 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "listings" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        Farmer Listings
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`px-8 py-3 rounded-[1.5rem] text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "history" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:text-slate-600"}`}
                    >
                        My Collections
                    </button>
                </div>
                <button
                    onClick={() => navigate('/aggregator/scan-qr')}
                    className="inline-flex items-center justify-center gap-4 rounded-3xl bg-primary px-10 py-5 text-sm font-semibold text-white uppercase tracking-[0.2em] transition-all hover:bg-primary/90 shadow-2xl shadow-primary/30 active:scale-95"
                >
                    <QrCode className="h-5 w-5" />
                    Collect Crop
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="SEARCH BY FARMER, CROP, OR ID..."
                        className="w-full rounded-[2rem] border border-slate-100 bg-white py-5 pl-16 pr-8 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-xl shadow-slate-200/50 uppercase"
                    />
                </div>
                <button className="aspect-square w-16 flex items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all hover:border-primary/20 shadow-xl shadow-slate-200/50">
                    <Filter className="h-6 w-6" />
                </button>
            </div>

            {/* Content Section */}
            {activeTab === "history" ? (
                filteredCollections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {filteredCollections.map((item) => (
                            <div key={item.id} className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all hover:-translate-y-1.5 relative overflow-hidden">
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                                            <Wheat className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.source_crop?.variety || 'Commodity'}</p>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors capitalize">{item.source_crop?.name || 'Unknown Crop'}</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                                            <p className="text-sm font-black text-slate-800">{item.collected_quantity} {item.collected_unit}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quality</p>
                                            <p className="text-sm font-black text-primary uppercase">Tier {item.quality_assessment?.overallGrade || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 bg-slate-50/50 p-4 rounded-xl border border-slate-50 uppercase tracking-widest">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {formatLocation(item.farmer?.address)}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={() => setSelected(item)}
                                            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200"
                                        >
                                            <Eye className="h-4 w-4" /> View Details
                                        </button>
                                    </div>
                                </div>

                                {/* Decorative Background Pattern */}
                                <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-[2.5] transition-transform duration-1000" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                            <Package className="w-8 h-8 text-slate-300" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">NO RECORDS FOUND</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]"> You haven't collected any crops yet</p>
                        </div>
                    </div>
                )
            ) : fetchingCrops ? (
                <div className="py-40 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-slate-500 font-medium uppercase tracking-widest text-xs">Scanning Marketplace...</p>
                </div>
            ) : availableCrops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {availableCrops.filter(crop =>
                        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        crop.farmer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((crop) => (
                        <div key={crop.id} className="group bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all hover:-translate-y-1.5 relative overflow-hidden">
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100">
                                        <Wheat className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-xl uppercase">Listed</span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{crop.variety || 'Standard'}</p>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight capitalize">{crop.name}</h3>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                                        <p className="text-sm font-black text-slate-800">{crop.quantity} {crop.unit}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected Price</p>
                                        <p className="text-sm font-black text-emerald-600">₹{crop.price_per_unit}/unit</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-500">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {formatLocation(crop.farmer?.address)}
                                </div>

                                <div className="pt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-6 flex items-center justify-between">
                                    <span>Farmer: {crop.farmer?.name}</span>
                                    <span>{new Date(crop.created_at).toLocaleDateString()}</span>
                                </div>

                                <button
                                    onClick={() => navigate('/aggregator/collect', { state: { cropData: { crop, farmer: crop.farmer } } })}
                                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-200"
                                >
                                    <ShoppingCart className="h-4 w-4" /> Buy Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-40 text-center space-y-6 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto">
                        <Wheat className="w-8 h-8 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">NO LISTINGS AVAILABLE</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No farmers have listed crops in your region yet.</p>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selected && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 backdrop-blur-2xl bg-slate-900/60 transition-all animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500 relative">
                        {/* Header Gradient */}
                        <div className="h-2 w-full bg-gradient-to-r from-primary via-blue-500 to-primary" />

                        <div className="p-12 space-y-10">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20">
                                        <ShieldCheck className="w-10 h-10 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Crop Details</p>
                                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Collection ID: {selected.collection_id?.slice(0, 10)}</h2>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" /> Farmer Name
                                    </p>
                                    <p className="text-xl font-black text-slate-800 tracking-tight">{selected.farmer?.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Cert. #XP-2024-OD</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Collection Date
                                    </p>
                                    <p className="text-xl font-black text-slate-800 tracking-tight">{new Date(selected.created_at).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(selected.created_at).toLocaleTimeString()}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Wheat className="w-3 h-3" /> Quality Score
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg uppercase">Grade {selected.quality_assessment?.overallGrade}</span>
                                        <span className="text-xl font-black text-slate-800 tracking-tight">{selected.quality_assessment?.qualityScore}/100</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Package className="w-3 h-3" /> Total Quantity
                                    </p>
                                    <p className="text-xl font-black text-slate-800 tracking-tight">{selected.collected_quantity} {selected.collected_unit}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Fully Collected</p>
                                </div>
                            </div>

                            {selected.quality_assessment?.defectDetection && selected.quality_assessment.defectDetection.length > 0 && (
                                <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Defects Found</p>
                                    <div className="space-y-2">
                                        {selected.quality_assessment.defectDetection.map((d, i) => (
                                            <div key={i} className="flex justify-between text-xs font-bold text-amber-800">
                                                <span>{d.defectType}</span>
                                                <span>Severity: {d.severity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 border-t border-slate-100 space-y-4">
                                {selected.status === 'collected' ? (
                                    <div className="space-y-4 animate-in slide-in-from-top-4">
                                        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Set Selling Price per {selected.collected_unit}</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-600">₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="w-full bg-white border border-emerald-200 rounded-xl py-3 pl-10 pr-4 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                    value={selected.listingPrice || ''}
                                                    onChange={(e) => setSelected({ ...selected, listingPrice: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (!selected.listingPrice) return alert("Please set a price");
                                                try {
                                                    const res = await aggregatorApi.listCollection({
                                                        collectionId: selected.id,
                                                        sellingPricePerUnit: selected.listingPrice
                                                    });
                                                    if (res.data.success) {
                                                        alert("Listed successfully!");
                                                        setSelected(null);
                                                        fetchCollections();
                                                    }
                                                } catch (err) {
                                                    alert("Failed to list: " + err.message);
                                                }
                                            }}
                                            className="w-full bg-emerald-600 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.25em] shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            List for Retailer
                                        </button>
                                    </div>
                                ) : selected.status === 'listed' ? (
                                    <div className="p-6 bg-blue-50 rounded-[1.5rem] border border-blue-100 flex items-center gap-6">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Currently Selling For</span>
                                            <span className="text-2xl font-black text-blue-800">₹{selected.market_info?.selling_price || 'N/A'}</span>
                                        </div>
                                        <div className="flex-1 flex justify-end">
                                            {qrSrc && (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                                                        <img src={qrSrc} alt="Product QR" className="w-24 h-24 object-contain rounded-lg" />
                                                    </div>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase">Product QR</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    qrSrc && (
                                        <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center gap-6">
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Product Identity QR</p>
                                                <p className="text-xs font-bold text-slate-400">Scan for detailed product, origin, and quality info</p>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                                                <img src={qrSrc} alt="Product QR" className="w-24 h-24 object-contain rounded-lg" />
                                            </div>
                                        </div>
                                    )
                                )}

                                <button
                                    onClick={() => setSelected(null)}
                                    className="w-full bg-slate-900 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.25em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
