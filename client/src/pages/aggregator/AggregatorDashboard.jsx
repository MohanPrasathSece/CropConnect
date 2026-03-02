import React, { useState, useEffect } from "react";
import { Users, Warehouse, ClipboardList, DollarSign, Loader2, AlertCircle, Activity, Search, QrCode } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { aggregatorApi } from "../../utils/api";

export default function AggregatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await aggregatorApi.getDashboard();
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError("Failed to fetch node telemetry.");
      }
    } catch (err) {
      console.error("Aggregator dashboard fetch error:", err);
      setError("Server connection failure.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium tracking-tight uppercase tracking-widest">Loading Node...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto mt-20">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Sync Refused</h2>
        <p className="text-sm text-slate-500 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-2.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats, chartData, recentActivity } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Aggregator Hub</h1>
          <p className="text-sm text-slate-500 font-medium">Monitoring {stats.pendingCollections} pending collections.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 shadow-md top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search collections..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 shadow-sm transition-all"
            />
          </div>
          <button
            onClick={() => navigate('/aggregator/scan-qr')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" /> Scan QR
          </button>
        </div>
      </div>

      {/* Cluster Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Pending Pickups", val: stats.pendingCollections, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Inventory Held", val: stats.inventoryHeld, icon: Warehouse, color: "text-slate-600", bg: "bg-slate-50" },
          { title: "Active Orders", val: stats.activeOrders, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Total Revenue", val: `₹${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50" }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 ${card.bg} rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.title}</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics area */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-8 uppercase tracking-wider">Node Throughput</h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: '12px' }}
                />
                <Bar dataKey="collections" fill="#10b981" radius={[2, 2, 0, 0]} barSize={26} />
                <Bar dataKey="sales" fill="#334155" radius={[2, 2, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-semibold text-slate-800 uppercase tracking-wider">Activity Feed</h2>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-4 flex-grow overflow-y-auto max-h-[450px]">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <div key={item.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all cursor-default">
                  <p className="text-xs font-semibold text-slate-700 mb-2">{item.text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.time}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest ${item.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-10">No recent activity logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
