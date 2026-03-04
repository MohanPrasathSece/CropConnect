import React, { useState, useEffect } from "react";
import { StatusBadge } from "../../components/farmer/StatusBadge";
import { MapPin, QrCode, Eye, X, Wheat, Search, Filter, Loader2, Package, Calendar, User, ShieldCheck } from "lucide-react";
import { formatLocation } from "../../utils/format";
import { useNavigate } from "react-router-dom";
import { aggregatorApi } from "../../utils/api";

export default function AggregatorCollections() {
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCollections();
    }, []);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Querying Regional Ledger...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Regional Cargo Ledger</h1>
                    <p className="text-slate-500 font-bold mt-2 text-lg">History of all synchronized farmer pickups and intake samples.</p>
                </div>
                <button
                    onClick={() => navigate('/aggregator/scan-qr')}
                    className="inline-flex items-center justify-center gap-4 rounded-3xl bg-primary px-10 py-5 text-sm font-black text-white uppercase tracking-[0.2em] transition-all hover:bg-primary/90 shadow-2xl shadow-primary/30 active:scale-95"
                >
                    <QrCode className="h-5 w-5" />
                    Initiate Intake
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
                            placeholder="SEARCH BY FARMER, COMMODITY, OR PROVENANCE ID..."
                            className="w-full rounded-[2rem] border border-slate-100 bg-white py-5 pl-16 pr-8 text-sm font-black text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-xl shadow-slate-200/50 uppercase"
                        />
                    </div>
                    <button className="aspect-square w-16 flex items-center justify-center rounded-[1.5rem] bg-white border border-slate-100 text-slate-400 hover:text-primary transition-all hover:border-primary/20 shadow-xl shadow-slate-200/50">
                        <Filter className="h-6 w-6" />
                    </button>
                </div>

                {/* Collection Grid */}
                {filteredCollections.length > 0 ? (
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
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mass Intake</p>
                                            <p className="text-sm font-black text-slate-800">{item.collected_quantity} {item.collected_unit}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quality Grade</p>
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
                                            <Eye className="h-4 w-4" /> Comprehensive Dossier
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
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">NO RECORDS DETECTED</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]"> Regional collection ledger is currently empty</p>
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
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Immutable Dossier</p>
                                            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Cargo ID: {selected.collection_id?.slice(0, 10)}</h2>
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
                                            <User className="w-3 h-3" /> Origin Producer
                                        </p>
                                        <p className="text-xl font-black text-slate-800 tracking-tight">{selected.farmer?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Cert. #XP-2024-OD</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> Synchronization Date
                                        </p>
                                        <p className="text-xl font-black text-slate-800 tracking-tight">{new Date(selected.created_at).toLocaleDateString()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(selected.created_at).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Wheat className="w-3 h-3" /> Quality Matrix
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-lg uppercase">Grade {selected.quality_assessment?.overallGrade}</span>
                                            <span className="text-xl font-black text-slate-800 tracking-tight">{selected.quality_assessment?.qualityScore}/100</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Package className="w-3 h-3" /> Mass Balance
                                        </p>
                                        <p className="text-xl font-black text-slate-800 tracking-tight">{selected.collected_quantity} {selected.collected_unit}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Full Batch Recorded</p>
                                    </div>
                                </div>

                                {selected.quality_assessment?.defectDetection && selected.quality_assessment.defectDetection.length > 0 && (
                                    <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100">
                                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Optical Defects Detected</p>
                                        <div className="space-y-2">
                                            {selected.quality_assessment.defectDetection.map((d, i) => (
                                                <div key={i} className="flex justify-between text-xs font-bold text-amber-800">
                                                    <span>{d.defectType}</span>
                                                    <span>Impact Level: {d.severity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-8 border-t border-slate-100">
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-full bg-slate-900 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.25em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Close Dossier
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
