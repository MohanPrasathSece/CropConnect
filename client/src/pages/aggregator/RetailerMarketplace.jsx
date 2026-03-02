import React, { useState } from "react";
import { StatusBadge } from "../../components/farmer/StatusBadge";
import { Plus, Pencil, Pause, Play, Store, TrendingUp, DollarSign, X, CheckCircle2, ArrowLeft, Activity, Sparkles, Box, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialListings = [
    { id: 1, crop: "Basmati Rice", grade: "Grade A", quantity: "800 kg", price: "42", status: "available" },
    { id: 2, crop: "Durum Wheat", grade: "Grade B", quantity: "500 kg", price: "28", status: "available" },
    { id: 3, crop: "Yellow Maize", grade: "Grade A", quantity: "650 kg", price: "22", status: "available" },
    { id: 4, crop: "High-Grade Soybean", grade: "Grade A", quantity: "200 kg", price: "55", status: "paused" },
];

export default function RetailerMarketplace() {
    const navigate = useNavigate();
    const [listings, setListings] = useState(initialListings);
    const [newOpen, setNewOpen] = useState(false);
    const [priceOpen, setPriceOpen] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);

    const togglePause = (id) => {
        setListings(prev => prev.map(l =>
            l.id === id ? { ...l, status: l.status === "paused" ? "available" : "paused" } : l
        ));
    };

    const handleUpdatePrice = () => {
        if (priceOpen && newPrice) {
            setListings(prev => prev.map(l =>
                l.id === priceOpen ? { ...l, price: newPrice } : l
            ));
        }
        setPriceOpen(null);
        setNewPrice("");
    };

    const handlePublish = (e) => {
        e.preventDefault();
        setIsPublishing(true);
        setTimeout(() => {
            setIsPublishing(false);
            setNewOpen(false);
        }, 1500);
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/aggregator/dashboard')}
                        className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-2xl text-slate-900 tracking-tight font-bold">Consignment Forge</h1>
                        <p className="text-sm text-slate-500">Control the flow of verified commodities to downstream regional retail networks.</p>
                    </div>
                </div>
                <button
                    onClick={() => setNewOpen(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4 text-emerald-500" /> Deploy New Batch
                </button>
            </div>

            {/* Market Intelligence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Market Sentiment", value: "Bullish", trend: "+12.4% Neural Growth", icon: TrendingUp, color: "emerald" },
                    { label: "Downstream Nodes", value: "42 Retailers", trend: "8 Requests Pending", icon: Store, color: "blue" },
                    { label: "Asset Liquidity", value: "₹45.2L", trend: "Cycle Snapshot", icon: Box, color: "indigo" },
                    { label: "Ledger Clarity", value: "99.9%", trend: "Immutability Factor", icon: ShieldCheck, color: "slate" },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className={`p-4 rounded-2xl bg-${item.color}-50 border border-${item.color}-100 group-hover:bg-slate-900 transition-all duration-300 w-fit`}>
                                <item.icon className={`h-5 w-5 text-${item.color}-600 group-hover:text-white transition-colors`} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{item.value}</h3>
                                <p className={`text-[9px] font-bold text-${item.color}-600 uppercase tracking-widest mt-1`}>{item.trend}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {listings.map((item) => (
                    <div key={item.id} className="group bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden flex flex-col h-full">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-10">
                                <div className="h-20 w-20 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 transition-all duration-500">
                                    <Box className={`h-8 w-8 text-slate-400 group-hover:text-white transition-colors ${item.status === 'paused' ? 'rotate-12' : 'animate-pulse'}`} />
                                </div>
                                <StatusBadge status={item.status} />
                            </div>

                            <div className="space-y-2 mb-10">
                                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight capitalize">{item.crop}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">{item.grade}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">In Inventory: {item.quantity}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-10 mt-auto">
                                <span className="text-2xl font-bold text-slate-300">₹</span>
                                <span className="text-5xl font-bold text-slate-900 tracking-tighter group-hover:scale-110 transition-transform origin-left">{item.price}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase self-end mb-2 ml-2 tracking-widest">/ Metric Unit</span>
                            </div>

                            <div className="grid grid-cols-4 gap-4 pt-8 border-t border-slate-50">
                                <button
                                    onClick={() => setPriceOpen(item.id)}
                                    className="col-span-3 flex items-center justify-center gap-4 rounded-[24px] bg-slate-900 px-6 py-5 text-[10px] font-bold text-white uppercase tracking-[0.2em] transition-all hover:bg-slate-800 active:scale-95 shadow-2xl shadow-slate-900/10"
                                >
                                    <Pencil className="h-4 w-4 text-emerald-500" /> Market Update
                                </button>
                                <button
                                    onClick={() => togglePause(item.id)}
                                    className={`flex items-center justify-center rounded-[24px] transition-all active:scale-95 border border-slate-100 ${item.status === "paused"
                                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                            : "bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                        }`}
                                >
                                    {item.status === "paused" ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
                                </button>
                            </div>
                        </div>

                        {/* Background Accents */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-50 rounded-full group-hover:scale-[3] transition-all duration-1000 -z-0" />
                        <Sparkles className="absolute bottom-10 right-10 w-12 h-12 text-slate-50 group-hover:text-emerald-50/50 transition-all duration-1000" />
                    </div>
                ))}
            </div>

            {/* New Deployment Modal */}
            {newOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in slide-in-from-bottom-12 duration-500 relative">
                        <div className="p-12 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl text-slate-900 font-bold tracking-tight">Consignment Relay</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Deploy Commodities to Retail Nodes</p>
                                </div>
                                <button
                                    onClick={() => setNewOpen(false)}
                                    className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handlePublish} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Asset Commodity</label>
                                        <div className="relative">
                                            <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer">
                                                <option>Premium Basmati Rice</option>
                                                <option>Durum Wheat Grain</option>
                                                <option>Organic Yellow Maize</option>
                                                <option>Soybean High Grade</option>
                                            </select>
                                            <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Verified Tier</label>
                                            <div className="relative">
                                                <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-500/20 focus:outline-none transition-all appearance-none cursor-pointer">
                                                    <option>Grade A</option>
                                                    <option>Grade B</option>
                                                    <option>Grade C</option>
                                                </select>
                                                <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Injected Mass (KG)</label>
                                            <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/20 focus:outline-none transition-all" placeholder="500" required />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Market MSRP (₹ UNIT)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                            <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-16 pr-8 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/20 focus:outline-none transition-all" placeholder="42" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="submit"
                                        disabled={isPublishing}
                                        className="flex-1 inline-flex items-center justify-center gap-4 rounded-[28px] bg-slate-900 px-10 py-6 text-[10px] font-bold text-white uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5 text-emerald-500" />}
                                        {isPublishing ? "Syncing Logic..." : "Publish to Regional Nodes"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewOpen(false)}
                                        className="px-10 rounded-[28px] bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Adjustment Modal */}
            {priceOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-2xl bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-4 text-slate-900">
                                <div className="p-3 bg-emerald-50 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">Market Recalibration</h2>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Injected MSRP (₹ UNIT)</label>
                                <input
                                    type="number"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-5 px-8 text-3xl font-bold text-emerald-600 placeholder:text-slate-300 focus:bg-white focus:border-emerald-500/20 focus:outline-none transition-all"
                                    placeholder="42"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleUpdatePrice} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest active:scale-95 shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all">Commit Signal</button>
                                <button onClick={() => setPriceOpen(null)} className="px-6 rounded-2xl bg-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-200 transition-all">Dismiss</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
