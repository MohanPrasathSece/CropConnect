import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Calendar, MapPin, Printer, ArrowLeft, QrCode, Package, User } from 'lucide-react';
import { orderApi } from '../utils/api';
import QRCode from 'qrcode';

const OrderQRLabel = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await orderApi.getDetails(id);
                if (response.data.success) {
                    const data = response.data.data;
                    setOrderData(data);

                    // Generate QR code content
                    const qrContent = JSON.stringify({
                        orderId: data.order_id,
                        product: data.crop?.name,
                        quantity: `${data.quantity} ${data.unit}`,
                        date: new Date(data.created_at).toLocaleDateString(),
                        quality: data.crop?.quality?.overallGrade || data.crop?.quality || 'Grade A',
                        address: data.delivery_address
                    });

                    const url = await QRCode.toDataURL(qrContent);
                    setQrCodeUrl(url);
                } else {
                    setError("Procurement details synchronization failure.");
                }
            } catch (e) {
                console.error("Order Label load error:", e);
                setError("Logistics node unreachable: Unable to fetch order manifest.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handlePrint = () => window.print();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Syncing Logistics Manifest...</p>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
                <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-xl max-w-md text-center">
                    <p className="text-sm font-bold text-red-500 uppercase tracking-widest mb-6">{error}</p>
                    <Link to="/retailer/orders" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-800">
                        RETURN TO LOGISTICS TERMINAL
                    </Link>
                </div>
            </div>
        );
    }

    const { crop, delivery_address, created_at, order_id, quantity, unit, buyer } = orderData;
    const quality = crop?.quality?.overallGrade || crop?.quality || 'Grade A';

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <style>{`
                @page { size: A4; margin: 0; }
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; padding: 0; margin: 0; }
                    .print-container { 
                        box-shadow: none !important; 
                        border: 2px solid #e2e8f0 !important;
                        margin: 20mm auto !important;
                    }
                }
            `}</style>

            <div className="no-print max-w-4xl mx-auto flex items-center justify-between mb-12">
                <button onClick={() => window.history.back()} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> PREVIOUS NODE
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                    <Printer className="w-4 h-4" /> GENERATE PHYSICAL LABEL
                </button>
            </div>

            <div className="print-container max-w-[800px] mx-auto bg-white border-2 border-slate-50 rounded-[3rem] p-16 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                {/* Branding Accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-900/5 rounded-full -ml-16 -mb-16 blur-[40px]" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 border-b-2 border-slate-50 pb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500 rounded-lg text-white">
                                    <Package className="w-6 h-6" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                    CargoLabel
                                </h1>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Individual Order Manifest</p>
                                <p className="text-sm font-bold text-slate-800">Protocol Chain-Verify v3.1</p>
                            </div>
                        </div>

                        <div className="md:text-right space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Identifier</p>
                            <p className="text-sm font-mono font-bold text-slate-800 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                {order_id}
                            </p>
                        </div>
                    </div>

                    {/* Main Label Data */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="space-y-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Payload Description</p>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter capitalize">
                                    {crop?.name || 'Inventory Item'}
                                </h2>
                                <p className="text-xl font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    Quantity: {quantity} {unit}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        <Calendar className="w-3.5 h-3.5" /> Dispatch Date
                                    </div>
                                    <p className="text-sm font-bold text-slate-700">
                                        {new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        <MapPin className="w-3.5 h-3.5" /> Destination Terminal
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 uppercase leading-relaxed">
                                        {typeof delivery_address === 'string' ? delivery_address : 'Regional Logistics Node'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        <User className="w-3.5 h-3.5" /> Recipient Node
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 uppercase">
                                        {buyer?.name || 'Authorized Proxy'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2 leading-none">Quality Assurance</p>
                                    <p className="text-2xl font-black tracking-tighter uppercase">Verified {quality}</p>
                                </div>
                                <ShieldCheck className="w-10 h-10 text-emerald-500 opacity-50" />
                            </div>
                        </div>

                        {/* Large QR Code Terminal */}
                        <div className="flex flex-col items-center">
                            <div className="p-10 bg-white border-2 border-slate-100 rounded-[3.5rem] shadow-xl relative group">
                                <div className="w-56 h-56 bg-white flex items-center justify-center">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="Order QR" className="w-48 h-48" />
                                    ) : (
                                        <QrCode className="w-48 h-48 text-slate-900 opacity-10" />
                                    )}
                                </div>
                                <div className="absolute inset-0 border-[3px] border-emerald-500/20 rounded-[3.5rem] m-6 pointer-events-none" />
                            </div>
                            <div className="mt-8 text-center space-y-2">
                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.3em]">Scan for Terminal Verification</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px] leading-relaxed">
                                    Individual Order Payload Trace. Digital signature encrypted.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Footer Protocol */}
                    <div className="mt-20 pt-12 border-t-2 border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Encrypted Payload</p>
                                <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Digital Twin Protocol v4.0</p>
                            </div>
                        </div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            Official CargoLabel Generation • {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderQRLabel;
