import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Route, Truck, CreditCard, User, Settings, Leaf, Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
    { title: "Dashboard", url: "/retailer/dashboard", icon: LayoutDashboard },
    { title: "Marketplace", url: "/retailer/marketplace", icon: ShoppingCart },
    { title: "My Orders", url: "/retailer/orders", icon: Package },
    { title: "Traceability", url: "/retailer/traceability", icon: Route },
    { title: "Delivery Tracking", url: "/retailer/delivery", icon: Truck },
    { title: "Payments", url: "/retailer/payments", icon: CreditCard },
    { title: "Profile", url: "/retailer/profile", icon: User },
    { title: "Settings", url: "/retailer/settings", icon: Settings },
];

export function RetailerSidebar() {
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
                    <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">CropConnect</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                        <NavLink
                            key={item.url}
                            to={item.url}
                            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                }`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Profile Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-lg mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                        {user?.email?.[0].toUpperCase() || "R"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{user?.email?.split('@')[0] || "Retailer"}</p>
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
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 lg:block">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="lg:hidden">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-sm border border-slate-200"
                >
                    <Menu className="h-6 w-6 text-slate-600" />
                </button>

                {mobileOpen && (
                    <div className="fixed inset-0 z-50 flex">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                        <aside className="relative w-64 h-full">
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute right-4 top-4 z-50 text-slate-400 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                            <SidebarContent />
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}
