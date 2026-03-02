import React from "react";
import { StatusBadge } from "../../components/farmer/StatusBadge";
import { ClipboardList, Truck, Package, CheckCircle2, Search, Filter, MoreVertical, MapPin, ArrowLeft, Activity, DollarSign, ChevronRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ordersData = [
    { id: "ORD-1001", retailer: "FreshMart Global", crop: "Basmati Rice", qty: "200 kg", value: "8,400", status: "ordered", date: "2 Hours ago" },
    { id: "ORD-1002", retailer: "GreenBasket Organics", crop: "Durum Wheat", qty: "150 kg", value: "4,200", status: "packed", date: "5 Hours ago" },
    { id: "ORD-1003", retailer: "AgriStore India", crop: "Yellow Maize", qty: "300 kg", value: "6,600", status: "dispatched", date: "Yesterday" },
    { id: "ORD-1004", retailer: "NatureFresh Co.", crop: "High-Grade Soybean", qty: "100 kg", value: "5,500", status: "delivered", date: "2 Days ago" },
    { id: "ORD-1005", retailer: "FarmDirect Premium", crop: "Premium Basmati Rice", qty: "500 kg", value: "21,000", status: "ordered", date: "3 Days ago" },
];

const steps = ["ordered", "packed", "dispatched", "delivered"];

export default function RetailerOrders() {
    const navigate = useNavigate();

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
                        <h1 className="text-2xl text-slate-900 tracking-tight font-bold">Inbound Consignments</h1>
                        <p className="text-sm text-slate-500">Track and manage downstream distribution fulfillment and retail lifecycle sync.</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pipeline Flux</p>
                        <p className="text-xl font-bold text-slate-900 tracking-tighter mt-1.5 flex items-center justify-end gap-1.5">
                            <span className="text-sm text-emerald-500 font-bold">₹</span> 45,700
                        </p>
                    </div>
                    <button className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group">
                        <Activity className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                    </button>
                </div>
            </div>

            {/* Search & Intelligence Zone */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Consignment ID or Retailer Entity Node..."
                        className="w-full rounded-[24px] border border-slate-100 bg-white py-5 pl-16 pr-8 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500/20 focus:outline-none transition-all shadow-sm"
                    />
                </div>
                <button className="px-8 flex items-center justify-center rounded-[24px] bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                    <Filter className="h-5 w-5 mr-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Logic Filter</span>
                </button>
            </div>

            {/* Consignments List */}
            <div className="grid grid-cols-1 gap-8">
                {ordersData.map((order) => {
                    const currentStep = steps.indexOf(order.status);
                    return (
                        <div key={order.id} className="group bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all relative overflow-hidden flex flex-col">
                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
                                    <div className="flex items-start gap-8">
                                        <div className="h-20 w-20 bg-slate-50 rounded-[32px] flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 transition-all duration-500">
                                            <ClipboardList className="h-8 w-8 text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{order.retailer}</h3>
                                                <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.id}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <Package className="w-3.5 h-3.5" /> {order.crop}
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <Activity className="w-3.5 h-3.5" /> Mass: {order.qty}
                                                </div>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                                                    <DollarSign className="w-3.5 h-3.5" /> Value: ₹{order.value}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Regional Node Hub • <Clock className="w-3 h-3 ml-1" /> {order.date}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-start lg:self-center">
                                        <StatusBadge status={order.status} />
                                        <button className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors active:scale-95">
                                            <MoreVertical className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Visualizer */}
                                <div className="px-10">
                                    <div className="relative pt-6 pb-2">
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-50 -translate-y-[12px] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
                                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                                            />
                                        </div>
                                        <div className="relative flex justify-between items-center w-full">
                                            {steps.map((step, idx) => {
                                                const isCompleted = idx <= currentStep;
                                                const isCurrent = idx === currentStep;
                                                return (
                                                    <div key={step} className="flex flex-col items-center gap-6 flex-1 first:items-start last:items-end">
                                                        <div className={`relative z-20 h-6 w-6 rounded-full border-4 transition-all duration-700 flex items-center justify-center ${isCompleted
                                                                ? "bg-emerald-500 border-white ring-8 ring-emerald-50 shadow-xl"
                                                                : "bg-white border-slate-50"
                                                            } ${isCurrent ? "scale-125" : ""}`}>
                                                            {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${isCompleted ? "text-slate-900" : "text-slate-300"
                                                            } ${isCurrent ? "text-emerald-600" : ""}`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Decoration */}
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-slate-50 rounded-full group-hover:scale-[3] transition-all duration-1000 -z-0" />
                            <Truck className="absolute bottom-10 left-10 w-16 h-16 text-slate-50/50 group-hover:text-emerald-50/20 transition-all duration-1000 -rotate-12" />
                        </div>
                    );
                })}
            </div>

            {/* Global Dispatch Controls */}
            <div className="bg-slate-900 rounded-[56px] p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-slate-900/30 group">
                <div className="relative z-10 flex flex-col items-center gap-10">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Network Synchronizer Active</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tighter">Regional Logistics Control</h2>
                        <p className="text-white/50 font-medium text-sm leading-relaxed">
                            Optimize mass distribution through regional retail nodes and manage immutable delivery signatures for finalized settlements.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <button className="bg-white text-slate-900 px-12 py-6 rounded-[32px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-emerald-400 active:scale-95 shadow-2xl flex items-center justify-center gap-4">
                            <Activity className="w-5 h-5" /> Launch Dispatcher Hub
                        </button>
                        <button className="bg-white/5 border border-white/10 text-white px-12 py-6 rounded-[32px] text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3">
                            <MapPin className="w-5 h-5 text-emerald-500" /> Visualize Node Fleet
                        </button>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] group-hover:bg-emerald-500/20 transition-all duration-1000" />
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
            </div>
        </div>
    );
}
