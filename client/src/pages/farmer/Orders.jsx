import React, { useState, useEffect } from "react";
import { StatusBadge } from "../../components/farmer/StatusBadge";
import { QrCode, Eye, ChevronRight, Loader2, Search, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { farmerApi } from "../../utils/api";

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (user?.email) {
            fetchOrders();
        }
    }, [user?.email]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await farmerApi.getOrders(user.email);
            if (response.data.success) {
                setOrders(response.data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setUpdating(true);
            const response = await farmerApi.updateOrderStatus(orderId, { status: newStatus });
            if (response.data.success) {
                fetchOrders();
                setShowModal(false);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update order status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl text-slate-900 tracking-tight">My Orders</h1>
                    <p className="text-sm text-slate-500">Track and manage your crop orders.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search by ID or Buyer..."
                        className="pl-11 pr-5 py-3.5 rounded-xl border border-slate-100 bg-white text-sm text-slate-700 min-w-[280px] shadow-sm focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 outline-none transition-all"
                    />
                </div>
            </div>

            {orders.length > 0 ? (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Buyer</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Crop</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Quality</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="transition-all hover:bg-slate-50/50 group">
                                        <td className="px-6 py-5 text-sm text-slate-500 font-mono">{order.id}</td>
                                        <td className="px-6 py-5 text-sm text-slate-800 font-medium">{order.buyer}</td>
                                        <td className="px-6 py-5 text-sm text-slate-600">{order.crop}</td>
                                        <td className="px-6 py-5 text-sm text-slate-500">{order.qty}</td>
                                        <td className="px-6 py-5 text-sm text-emerald-600 font-medium">{order.quality}</td>
                                        <td className="px-6 py-5"><StatusBadge status={order.status} /></td>
                                        <td className="px-6 py-5 text-xs text-slate-400 capitalize">{order.date}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                                    className="p-2.5 bg-white border border-slate-100 rounded-lg hover:bg-slate-50 transition-all shadow-sm group/btn"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4 text-slate-400 group-hover/btn:text-emerald-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-mono">{order.id}</span>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider">Buyer</span>
                                        <span className="text-sm text-slate-800 font-medium">{order.buyer}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                                            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-0.5">Crop</span>
                                            <span className="text-sm text-slate-800 font-medium">{order.crop}</span>
                                        </div>
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                                            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-0.5">Quantity</span>
                                            <span className="text-sm text-slate-800 font-medium">{order.qty}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <span className="text-xs text-slate-400 capitalize">{order.date}</span>
                                    <button
                                        onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-xs text-white rounded-lg shadow-md shadow-emerald-600/15 active:scale-95 transition-all"
                                    >
                                        Update <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <QrCode className="h-8 w-8 text-slate-200" />
                    </div>
                    <h3 className="text-xl text-slate-900 mb-2 tracking-tight">No Orders Yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">Orders will appear here when buyers purchase your crops.</p>
                </div>
            )}

            {/* Status Update Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl text-slate-800 tracking-tight">Update Order Status</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">{selectedOrder.id}</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                    <X className="h-4 w-4 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Current Status</span>
                                    <StatusBadge status={selectedOrder.status} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Crop</span>
                                    <span className="text-sm text-slate-800">{selectedOrder.crop} ({selectedOrder.qty})</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs text-slate-800 uppercase tracking-wider ml-1">Change Status To</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            disabled={updating || selectedOrder.status === status}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                                            className={`py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all border ${selectedOrder.status === status
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
                                                } disabled:opacity-50`}
                                        >
                                            {updating && selectedOrder.status !== status ? '...' : status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
