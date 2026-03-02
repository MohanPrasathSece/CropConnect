import React, { useState, useEffect } from "react";
import { Menu, X, Wheat, ShieldCheck, Languages } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [translateOpen, setTranslateOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { label: "Traceability", href: "#how-it-works", isExternal: false },
        { label: "Stakeholders", href: "#roles", isExternal: false },
        { label: "Features", href: "#features", isExternal: false },
        { label: "FAQ", href: "#faq", isExternal: false },
    ];

    const handleNavClick = (href, isExternal) => {
        setMobileOpen(false);
        if (isExternal || href.startsWith('/')) {
            navigate(href);
            return;
        }

        if (location.pathname !== "/") {
            navigate("/");
            setTimeout(() => {
                const el = document.querySelector(href);
                el?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        } else {
            const el = document.querySelector(href);
            el?.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <header
            className={`wrapper sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/95 backdrop-blur-md border-b border-green-100 py-2.5 shadow-sm"
                : "bg-transparent py-4"
                }`}
        >
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link
                    to="/"
                    className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-md shadow-green-100 rotate-2 group-hover:rotate-0 transition-all duration-500">
                        <Wheat className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col -gap-1">
                        <span className="text-xl font-normal tracking-tight text-slate-800 leading-none">
                            Crop<span className="text-green-600">Chain</span>
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.2em] font-normal text-slate-400">Blockchain Ledger</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-10 lg:flex">
                    <div className="flex items-center gap-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => handleNavClick(link.href, link.isExternal)}
                                className="relative text-[14px] font-normal text-slate-600 transition-colors hover:text-green-600 group py-2"
                            >
                                {link.label}
                                <span className="absolute -bottom-0 left-0 h-0.5 w-0 bg-green-600 transition-all duration-300 group-hover:w-full" />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 ml-4 border-l pl-10 border-green-100">
                        {/* Google Translate Button ... same as before ... */}
                        <div className="relative">
                            <button
                                onClick={() => setTranslateOpen(!translateOpen)}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Translate"
                            >
                                <Languages className="h-5 w-5 text-green-600" />
                            </button>
                            {translateOpen && (
                                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-green-100 p-3 min-w-[200px] z-50">
                                    <div id="google_translate_element"></div>
                                </div>
                            )}
                        </div>

                        {isAuthenticated ? (
                            <>
                                <Link to="/my-orders">
                                    <Button variant="ghost" className="font-normal text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg px-4">
                                        Orders
                                    </Button>
                                </Link>
                                <Button
                                    onClick={logout}
                                    className="rounded-xl px-6 h-10 font-normal shadow-lg shadow-green-500/10 hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-red-500 to-orange-500 border-none"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="font-normal text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg px-4">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="rounded-xl px-6 h-10 font-normal shadow-lg shadow-green-500/10 hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-green-600 to-emerald-500 border-none">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="lg:hidden p-2 hover:bg-green-50 rounded-xl transition-colors"
                >
                    {mobileOpen ? (
                        <X className="h-6 w-6 text-slate-700" />
                    ) : (
                        <Menu className="h-6 w-6 text-slate-700" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden overflow-hidden bg-white border-t border-green-100"
                    >
                        <div className="container mx-auto px-4 py-8">
                            {/* Mobile Translate */}
                            <div className="mb-6 p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Languages className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-normal text-slate-700">Translate</span>
                                </div>
                                <div id="google_translate_element_mobile"></div>
                            </div>

                            <div className="flex flex-col space-y-1 mb-8">
                                {navLinks.map((link, idx) => (
                                    <motion.button
                                        key={link.label}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleNavClick(link.href, link.isExternal)}
                                        className="w-full text-2xl font-normal text-slate-800 hover:text-green-600 transition-colors py-3 text-left border-b border-green-50"
                                    >
                                        {link.label}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-auto py-10 space-y-4">
                                <Link to="/trace" onClick={() => setMobileOpen(false)}>
                                    <Button size="lg" variant="outline" className="w-full rounded-xl font-normal h-14 text-lg border-2 border-green-200 hover:bg-green-50">
                                        <ShieldCheck className="mr-2 h-5 w-5 text-green-600" />
                                        Verify Product
                                    </Button>
                                </Link>
                                <Link to="/register" onClick={() => setMobileOpen(false)}>
                                    <Button size="lg" className="w-full rounded-xl font-normal h-14 text-lg shadow-xl shadow-green-500/10 bg-gradient-to-r from-green-600 to-emerald-500">
                                        Get Started Free
                                    </Button>
                                </Link>
                                <p className="text-center text-slate-400 text-sm font-normal">
                                    Already using CropConnect? <Link to="/login" className="text-green-600 font-normal">Login</Link>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Initialize mobile translate element */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    if (typeof google !== 'undefined' && google.translate) {
                        new google.translate.TranslateElement({
                            pageLanguage: 'en',
                            includedLanguages: 'en,hi,or,bn,te,ta,mr,gu,kn,ml,pa',
                            layout: google.translate.TranslateElement.InlineLayout.SIMPLE
                        }, 'google_translate_element_mobile');
                    }
                `
            }} />
        </header>
    );
};

export default Header;
