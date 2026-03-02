import React, { useState } from "react";
import { LayoutDashboard, Leaf, Package, Wallet, BarChart3, User, Settings, LogOut, Menu, X, Sprout, TrendingUp } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
    { title: "Dashboard", url: "/farmer/dashboard", icon: LayoutDashboard },
    { title: "My Crops", url: "/farmer/crops", icon: Leaf },
    { title: "Upload Harvest", url: "/farmer/upload", icon: Sprout },
    { title: "Orders", url: "/farmer/orders", icon: Package },
    { title: "Payments", url: "/farmer/payments", icon: Wallet },
    { title: "Reports", url: "/farmer/reports", icon: BarChart3 },
    { title: "Profile", url: "/farmer/profile", icon: User },
    { title: "Settings", url: "/farmer/settings", icon: Settings },
];

export default function FarmerSidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col bg-slate-900 text-slate-300">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
                    <Sprout className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">CropConnect</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.url}
                        to={item.url}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
                            ${isActive
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            }
                        `}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.title}
                    </NavLink>
                ))}
            </nav>

            {/* Profile Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                        {user?.name?.charAt(0) || 'F'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{user?.name || 'Farmer'}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 lg:hidden flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                        <Sprout className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900">CropConnect</span>
                </div>
                <button
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <SidebarContent />
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200">
                <SidebarContent />
            </aside>
        </>
    );
}
