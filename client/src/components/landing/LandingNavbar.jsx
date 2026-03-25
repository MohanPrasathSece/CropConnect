import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Globe, Leaf } from "lucide-react";

// Declare google as a global variable to avoid ESLint errors
/* global google */

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
    const [scrolled, setScrolled] = useState(false);
    const [translateOpen, setTranslateOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const location = useLocation();
    const navigate = useNavigate();

    // Available languages with their codes and names
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
        { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
        { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
        { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
        { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
        { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Initialize Google Translate
    useEffect(() => {
        const initGoogleTranslate = () => {
            if (typeof google !== 'undefined' && google.translate) {
                // Initialize desktop translate element
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: languages.map(lang => lang.code).join(','),
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                    multilanguagePage: true
                }, 'google_translate_element');

                // Initialize mobile translate element
                new google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: languages.map(lang => lang.code).join(','),
                    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                    multilanguagePage: true
                }, 'google_translate_element_mobile');
                
                console.log('Google Translate initialized successfully');
            } else {
                console.warn('Google Translate not available');
            }
        };

        // Load Google Translate script
        if (!document.querySelector('script[src*="translate.google.com"]')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.head.appendChild(script);
        }

        // Set up global callback
        window.googleTranslateElementInit = initGoogleTranslate;

        return () => {
            // Cleanup if needed
        };
    }, []);

    const handleLanguageChange = (languageCode) => {
        setSelectedLanguage(languageCode);
        setTranslateOpen(false);
        
        // Change Google Translate language
        if (typeof google !== 'undefined' && google.translate) {
            // Try multiple methods to trigger translation
            const selectElement = document.querySelector('.goog-te-combo');
            if (selectElement) {
                selectElement.value = languageCode;
                selectElement.dispatchEvent(new Event('change'));
            }
            
            // Alternative: Try to find and click the translate element
            const translateElements = document.querySelectorAll('.goog-te-menu-value span');
            translateElements.forEach(element => {
                if (element.textContent.toLowerCase().includes(languageCode) || 
                    element.getAttribute('data-language') === languageCode) {
                    element.click();
                }
            });
            
            // Force page reload if translation doesn't work
            setTimeout(() => {
                const url = new URL(window.location);
                url.searchParams.set('hl', languageCode);
                window.history.replaceState({}, '', url.toString());
            }, 100);
        } else {
            console.warn('Google Translate not available');
        }
    };

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
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                scrolled
                    ? "bg-gradient-to-r from-emerald-50/95 via-white/95 to-emerald-50/95 backdrop-blur-xl border-b border-emerald-100/50 shadow-lg shadow-emerald-500/10"
                    : "bg-gradient-to-r from-emerald-600/10 via-transparent to-emerald-600/10 backdrop-blur-sm"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Premium Logo */}
                <Link
                    to="/"
                    className="group flex items-center gap-3 transition-all duration-300 hover:scale-105"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                    <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl blur-sm transition-opacity duration-500 ${
                            scrolled 
                                ? "from-emerald-400 to-emerald-600 opacity-75" 
                                : "from-white/20 to-white/40 opacity-75"
                        } group-hover:opacity-100`}></div>
                        <div className={`relative w-12 h-12 bg-gradient-to-br rounded-2xl flex items-center justify-center shadow-lg border transition-all duration-500 ${
                            scrolled 
                                ? "from-emerald-500 to-emerald-700 shadow-emerald-500/25 border-emerald-400/20" 
                                : "from-white/30 to-white/50 shadow-white/25 border-white/30"
                        }`}>
                            <Leaf className={`w-7 h-7 drop-shadow-sm transition-colors duration-500 ${
                                scrolled ? "text-white" : "text-white"
                            }`} />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-2xl font-bold transition-all duration-500 ${
                            scrolled 
                                ? "bg-gradient-to-r from-emerald-700 to-emerald-900 bg-clip-text text-transparent" 
                                : "text-white"
                        }`}>
                            AgriTrack
                        </span>
                        <span className={`text-[10px] font-medium uppercase tracking-widest transition-colors duration-500 ${
                            scrolled ? "text-emerald-600" : "text-white/80"
                        }`}>
                            Smart Agriculture
                        </span>
                    </div>
                </Link>

                {/* Premium Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => handleNavClick(link.href)}
                            className={`relative px-4 py-2 text-sm font-semibold transition-all duration-300 hover:text-emerald-700 group ${
                                scrolled ? "text-gray-700" : "text-white"
                            }`}
                        >
                            {link.label}
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                        </button>
                    ))}
                </div>

                {/* Premium Language & Actions */}
                <div className="flex items-center gap-4">
                    {/* Elegant Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setTranslateOpen(!translateOpen)}
                            className={`group relative p-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 shadow-sm hover:shadow-md ${
                                scrolled 
                                    ? "bg-white/50 border-emerald-200/50 hover:bg-white hover:border-emerald-300" 
                                    : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30"
                            }`}
                            title="Language"
                        >
                            <Globe className={`w-5 h-5 group-hover:rotate-12 transition-transform duration-500 ${
                                scrolled ? "text-emerald-600" : "text-white"
                            }`} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        </button>
                        
                        {translateOpen && (
                            <div className="absolute top-full right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-emerald-100/50 p-4 min-w-[320px] z-50">
                                <div className="mb-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Choose Language</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                                    {languages.map((language) => (
                                        <button
                                            key={language.code}
                                            onClick={() => handleLanguageChange(language.code)}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-sm ${
                                                selectedLanguage === language.code 
                                                    ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm' 
                                                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                            }`}
                                        >
                                            <span className="text-xl">{language.flag}</span>
                                            <span className="text-left flex-1">
                                                <p className="font-semibold text-xs">{language.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase">{language.code}</p>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-emerald-100 mt-4 pt-3">
                                    <div id="google_translate_element" className="min-h-[32px]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex items-center gap-3">
                        <Link 
                            to="/login" 
                            className={`group relative px-6 py-3 rounded-2xl backdrop-blur-sm border font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-md ${
                                scrolled 
                                    ? "bg-white/50 border-emerald-200/50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300" 
                                    : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                            }`}
                        >
                            Log In
                            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                        </Link>
                        <Link 
                            to="/register" 
                            className="group relative px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold text-sm hover:from-emerald-600 hover:to-emerald-800 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Get Started
                            <span className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className={`lg:hidden relative p-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 shadow-sm hover:shadow-md ${
                            scrolled 
                                ? "bg-white/50 border-emerald-200/50 hover:bg-white hover:border-emerald-300" 
                                : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30"
                        }`}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                    >
                        {menuOpen ? (
                            <X className={`h-6 w-6 transition-colors duration-500 ${
                                scrolled ? "text-emerald-600" : "text-white"
                            }`} />
                        ) : (
                            <Menu className={`h-6 w-6 transition-colors duration-500 ${
                                scrolled ? "text-emerald-600" : "text-white"
                            }`} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="lg:hidden bg-gradient-to-b from-white/95 to-emerald-50/95 backdrop-blur-xl border-t border-emerald-100/50 shadow-xl">
                    <div className="px-6 py-8 space-y-6">
                        {navLinks.map((link) => (
                            <button
                                key={link.label}
                                onClick={() => handleNavClick(link.href)}
                                className="block w-full text-left text-lg font-bold text-gray-800 hover:text-emerald-700 transition-colors duration-300 py-3 border-b border-gray-100 hover:border-emerald-200"
                            >
                                {link.label}
                            </button>
                        ))}
                        <div className="border-t border-emerald-200 pt-6">
                            <div id="google_translate_element_mobile" className="min-h-[32px] mb-6"></div>
                            <div className="flex flex-col gap-4">
                                <Link 
                                    to="/login" 
                                    onClick={() => setMenuOpen(false)} 
                                    className="w-full text-center py-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 font-bold text-lg hover:bg-emerald-50 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    Log In
                                </Link>
                                <Link 
                                    to="/register" 
                                    onClick={() => setMenuOpen(false)} 
                                    className="w-full text-center py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-bold text-lg hover:from-emerald-600 hover:to-emerald-800 transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default LandingNavbar;
