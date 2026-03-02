import React, { useState, useEffect, useRef } from "react";
import { Download, FileText, Star, TrendingUp, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { farmerApi } from "../../utils/api";

function getGradeColor(score) {
    if (score >= 90) return "text-emerald-600";
    if (score >= 80) return "text-amber-500";
    return "text-orange-500";
}

function getBgColor(score) {
    if (score >= 90) return "bg-emerald-500/10";
    if (score >= 80) return "bg-amber-500/10";
    return "bg-orange-500/10";
}

export default function Reports() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ reports: [], summary: {} });
    
    // Ref to store AbortController
    const abortController = useRef();

    useEffect(() => {
        if (user?.email) {
            fetchReports();
        }
        
        // Cleanup function to abort pending requests
        return () => {
            if (abortController.current) {
                abortController.current.abort();
            }
        };
    }, [user?.email]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await farmerApi.getReports(user.email);
            if (response.data.success) {
                setData({
                    reports: response.data.reports,
                    summary: response.data.summary
                });
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-xs text-slate-400 uppercase tracking-widest animate-pulse">Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl text-slate-900 tracking-tight">Quality Reports</h1>
                    <p className="text-sm text-slate-500">View quality assessments and grading history for your crops.</p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm text-white transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/15 active:scale-95">
                    <Download className="h-4 w-4" />
                    Download Report
                </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 flex items-center gap-5 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform">
                        <Star className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl text-slate-900 font-bold">{data.summary.avgGrade || 'N/A'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Average Grade</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 flex items-center gap-5 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform">
                        <TrendingUp className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl text-slate-900 font-bold">{data.summary.avgScore || 0}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Quality Score</p>
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-6 flex items-center gap-5 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:scale-105 transition-transform">
                        <FileText className="h-7 w-7 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl text-slate-900 font-bold">{data.summary.totalAnalyzed || 0}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Crops Analyzed</p>
                    </div>
                </div>
            </div>

            {/* Quality History */}
            <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm text-slate-900 font-medium">Quality History</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Detailed records of your crop quality assessments.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">AI Verified</span>
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {data.reports.length > 0 ? (
                        data.reports.map((item) => (
                            <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 px-6 py-6 hover:bg-slate-50/50 transition-all group">
                                <div className="h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-lg group-hover:scale-105 transition-all">
                                    {item.image ? (
                                        <img src={item.image} alt={item.crop} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-50 flex items-center justify-center">
                                            <Sparkles className="h-8 w-8 text-slate-200" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-3">
                                        <h3 className="text-base text-slate-900 font-medium tracking-tight">{item.crop}</h3>
                                        <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                            {item.type === 'ai_analysis' ? 'AI Analysis' : 'Manual Check'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
                                        <span className="capitalize">{item.date}</span>
                                        <span className="h-1 w-1 bg-slate-200 rounded-full" />
                                        <span>ID: {item.id.substring(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 w-full md:w-auto text-center md:text-right space-y-2">
                                    <div>
                                        <p className={`text-3xl font-bold ${getGradeColor(item.score)}`}>{item.grade}</p>
                                        <div className="mt-1.5 flex items-center justify-center md:justify-end gap-2">
                                            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getGradeColor(item.score).replace('text-', 'bg-')}`}
                                                    style={{ width: `${item.score}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium">{item.score}/100</span>
                                        </div>
                                    </div>
                                    <button className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:gap-2 transition-all">
                                        View Details <ChevronRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 px-8">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                <Sparkles className="h-8 w-8 text-slate-200" />
                            </div>
                            <h3 className="text-xl text-slate-900 mb-2 tracking-tight">No Reports Yet</h3>
                            <p className="text-sm text-slate-500 max-w-sm mx-auto">Quality reports will appear here after you upload crops and run quality checks.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
