import React, { useState, useEffect, useCallback } from "react";
import { StatusBadge } from "../../components/farmer/StatusBadge";
import { Plus, Search, Loader2, Package, ShieldCheck, Eye, X, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { farmerApi } from "../../utils/api";
import { cropApi } from "../../utils/api";

const statusFilters = ["All", "Listed", "Sold"];

export default function MyCropsFarmer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [detailCrop, setDetailCrop] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCrops = useCallback(async () => {
    setLoading(true);
    try {
      const response = await farmerApi.getCrops(user.email);
      if (response.data.success) {
        setCrops(response.data.crops || []);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) fetchCrops();
  }, [user, fetchCrops]);

  const handleEdit = (crop) => {
    navigate('/farmer/upload', { state: { editCrop: crop } });
  };

  const handleDelete = async (crop) => {
    const ok = window.confirm(`Delete "${crop?.name}"? This will remove the listing.`);
    if (!ok) return;

    try {
      setDeletingId(crop.id);
      await cropApi.delete(crop.id);
      await fetchCrops();
    } catch (error) {
      console.error('Error deleting crop:', error);
      alert('Failed to delete crop. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || crop.status.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getImageUrl = (imageValue) => {
    if (!imageValue) return null;
    const url = imageValue?.url || imageValue;
    if (typeof url === 'string' && url.includes('localhost:5000/uploads/')) {
      return url.replace(/^https?:\/\/localhost:5000/, '');
    }
    if (typeof url === 'string' && url.includes('localhost:5001/uploads/')) {
      return url.replace(/^https?:\/\/localhost:5001/, '');
    }
    return url;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Loading My Crops...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">My Crops</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your production inventory.</p>
        </div>
        <Link
          to="/farmer/upload"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-700 shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Crop
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crops..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm text-slate-600 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter} onClick={() => setActiveFilter(filter)}
              className={`rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${activeFilter === filter
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Area */}
      {filteredCrops.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrops.map((crop) => (
            <div key={crop.id} className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-sm hover:shadow-md">
              <div className="h-40 overflow-hidden relative bg-slate-100">
                <img
                  src={getImageUrl(crop.images?.[0]) || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80'}
                  alt={crop.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <StatusBadge status={crop.status} />
                  {(crop.blockchain_hash || crop.traceability_id) && (
                    <div className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm border border-white/20">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                {crop.quality_grade && (
                  <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">G-{crop.quality_grade}</span>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 capitalize truncate tracking-tight">{crop.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{crop.variety || 'Standard Variety'} · {crop.category || 'Grains'}</p>
                </div>
                <div className="flex bg-slate-50 rounded-lg p-3 border border-slate-100 space-x-3">
                  <div className="flex-1 text-center border-r border-slate-200/60">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Quantity</p>
                    <p className="text-xs text-slate-700 font-bold">{crop.quantity} {crop.unit}</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">Rate</p>
                    <p className="text-xs text-emerald-600 font-bold">₹{crop.price_per_unit || crop.pricePerUnit}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/crop/${crop.id}`}
                    className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider text-center hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                  >
                    Manage
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleEdit(crop)}
                    className="px-3 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDetailCrop(crop)}
                    className="px-4 py-2.5 rounded-lg bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider active:scale-95"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === crop.id}
                    onClick={() => handleDelete(crop)}
                    className="px-3 py-2.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider active:scale-95 disabled:opacity-60"
                  >
                    {deletingId === crop.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-16 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Package className="h-8 w-8 text-slate-200" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No inventory listed</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">Upload your first harvest to start trading in the marketplace.</p>
          <Link
            to="/farmer/upload"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-8 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-700 shadow-md active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Add First Crop
          </Link>
        </div>
      )}

      {/* Details Modal */}
      {detailCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="h-48 overflow-hidden relative bg-slate-100">
              <img
                src={getImageUrl(detailCrop.images?.[0]) || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80'}
                alt={detailCrop.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setDetailCrop(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all shadow-md"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
              <div className="absolute bottom-4 left-4">
                <StatusBadge status={detailCrop.status} />
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 capitalize tracking-tight">{detailCrop.name}</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">{detailCrop.variety || 'Standard Variety'} · {detailCrop.category || 'General category'}</p>
                </div>
                {detailCrop.quality_grade && (
                  <div className="px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Grade {detailCrop.quality_grade}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Net Payload</p>
                  <p className="text-base font-bold text-slate-800">{detailCrop.quantity} {detailCrop.unit}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Market Price</p>
                  <p className="text-base font-bold text-emerald-600">₹{detailCrop.price_per_unit || detailCrop.pricePerUnit || 'N/A'}</p>
                </div>
              </div>

              {(detailCrop.blockchain_hash || detailCrop.traceability_id) && (
                <div className="bg-slate-900 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Blockchain Provenance</span>
                  </div>
                  <div className="space-y-1.5">
                    {detailCrop.traceability_id && (
                      <p className="text-[10px] text-slate-400 font-mono break-all font-bold">ID: {detailCrop.traceability_id}</p>
                    )}
                    {detailCrop.blockchain_hash && (
                      <p className="text-[10px] text-slate-400 font-mono truncate font-bold">HASH: {detailCrop.blockchain_hash}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Link
                  to={`/crop/${detailCrop.id}`}
                  className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider text-center hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                >
                  Edit Crop Data
                </Link>
                <button
                  onClick={() => setDetailCrop(null)}
                  className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all active:scale-95"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
