import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Wheat } from "lucide-react";

const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Gallery", href: "/#gallery" },
    { label: "FAQ", href: "/#faq" },
    { label: "QR Scanner", href: "/qr" },
];

const LandingNavbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavClick = (href) => {
        setMenuOpen(false);
        if (href.startsWith("/#")) {
            const id = href.slice(2);
            if (location.pathname === "/") {
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            } else {
                navigate("/");
                setTimeout(() => {
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        } else {
            navigate(href);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-green-100 h-[72px]">
            <div className="container mx-auto px-6 h-full flex items-center justify-between">
                <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 group">
                    <div className="h-6 w-6 rounded-lg bg-green-600 flex items-center justify-center shadow-sm shadow-green-100 rotate-2 group-hover:rotate-0 transition-all duration-500">
                        <Wheat className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[16px] font-black tracking-tight text-slate-800 leading-none">
                        Crop<span className="text-green-600">Chain</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-7 text-[14px] font-semibold text-slate-600">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => handleNavClick(link.href)}
                            className="hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer"
                        >
                            {link.label}
                        </button>
                    ))}
                    {/* Google Translate Widget */}
                    <div className="flex items-center pl-4 border-l border-slate-100">
                        <div className="relative">
                            <div id="google_translate_element" className="translate-widget" />
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2.5">
                    <Link to="/login" className="px-4 py-2 rounded-xl text-[14px] font-semibold text-slate-600 hover:bg-green-50 hover:text-green-600 transition-all">
                        Log In
                    </Link>
                    <Link to="/register" className="px-5 py-2 rounded-xl bg-green-600 text-white text-[14px] font-semibold hover:bg-green-700 transition-all shadow-md shadow-green-200 hover:-translate-y-0.5 active:translate-y-0">
                        Get Started
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-800 bg-green-50 rounded-xl">
                    {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t border-green-50 px-6 py-8 space-y-4 shadow-xl">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => handleNavClick(link.href)}
                            className="block w-full text-left text-lg font-semibold text-slate-700 hover:text-green-600 transition-colors bg-transparent border-none cursor-pointer py-2 border-b border-slate-50"
                        >
                            {link.label}
                        </button>
                    ))}
                    <div id="google_translate_element_mobile" className="translate-widget py-2" />
                    <div className="flex flex-col gap-3 pt-4">
                        <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full text-center py-4 rounded-2xl text-base font-semibold text-slate-700 bg-slate-50 border border-slate-100">
                            Log In
                        </Link>
                        <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full text-center py-4 rounded-2xl bg-green-600 text-white text-base font-semibold shadow-xl shadow-green-100">
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
