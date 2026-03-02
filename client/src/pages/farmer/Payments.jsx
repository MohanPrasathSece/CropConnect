import React, { useState, useEffect } from "react";
import { StatCard } from "../../components/farmer/StatCard";
import { StatusBadge } from "../../components/farmer/StatusBadge";
import { Wallet, Clock, CheckCircle, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { farmerApi } from "../../utils/api";

export default function Payments() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ payments: [], stats: {} });

    useEffect(() => {
        const fetchPayments = async () => {
            if (!user?.email) return;
            try {
                setLoading(true);
                const response = await farmerApi.getPayments(user.email);
                if (response.data.success) {
                    setData({
                        payments: response.data.payments,
                        stats: response.data.stats
                    });
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [user?.email]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Loading payments...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl text-slate-900 tracking-tight">Payments</h1>
                    <p className="text-sm text-slate-500">View your earnings and payment history.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/15 active:scale-95">
                    Withdraw Balance <ArrowRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Balance" value={`₹${data.stats.wallet_balance?.toLocaleString() || 0}`} icon={Wallet} />
                <StatCard title="Pending" value={`₹${data.stats.pending_payments?.toLocaleString() || 0}`} icon={Clock} subtitle="Awaiting settlement" />
                <StatCard title="Total Earned" value={`₹${data.stats.total_earned?.toLocaleString() || 0}`} icon={CheckCircle} trend="All time" trendUp />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                    <h2 className="text-sm text-slate-900 font-medium">Transaction History</h2>
                </div>

                {data.payments.length > 0 ? (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-white">
                                        <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Crop</th>
                                        <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Amount (₹)</th>
                                        <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Verification</th>
                                        <th className="px-6 py-4 text-left text-xs text-slate-400 font-medium uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.payments.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-all">
                                            <td className="px-6 py-5 text-sm font-mono text-slate-500">{tx.id}</td>
                                            <td className="px-6 py-5 text-sm text-slate-800 font-medium capitalize">{tx.crop}</td>
                                            <td className="px-6 py-5 text-sm text-slate-900 font-semibold">₹{(Number(tx.amount) || 0).toLocaleString()}</td>
                                            <td className="px-6 py-5"><StatusBadge status={tx.status} /></td>
                                            <td className="px-6 py-5">
                                                {tx.hash !== "—" ? (
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition-colors text-xs"
                                                    >
                                                        Verified <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">Processing</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-slate-400 capitalize">{tx.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {data.payments.map((tx) => (
                                <div key={tx.id} className="p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono text-slate-400">{tx.id}</span>
                                        <StatusBadge status={tx.status} />
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                                        <span className="text-xs text-slate-400 capitalize">{tx.crop}</span>
                                        <span className="text-sm text-slate-900 font-semibold">₹{(Number(tx.amount) || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 capitalize">{tx.date}</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 px-8">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                            <Wallet className="h-8 w-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl text-slate-900 mb-2 tracking-tight">No Payments Yet</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">Payment records will appear here when orders are completed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
