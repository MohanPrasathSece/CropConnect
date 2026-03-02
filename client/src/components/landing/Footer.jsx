import React from 'react';
import { Wheat, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-slate-50 text-slate-600 py-8">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-3 mb-6">
                    <div>
                        <Link to="/" className="mb-4 flex items-center gap-2.5 text-slate-800 inline-block">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-md shadow-green-100">
                                <Wheat className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-normal tracking-tight">Crop<span className="text-green-600">Connect</span></span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-500 max-w-sm mt-3">
                            Blockchain-powered agricultural supply chain platform connecting farmers to markets with transparency.
                        </p>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-normal text-slate-700">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/marketplace" className="hover:text-green-600 transition-colors">Marketplace</Link></li>
                            <li><a href="#how-it-works" className="hover:text-green-600 transition-colors">How It Works</a></li>
                            <li><a href="#features" className="hover:text-green-600 transition-colors">Features</a></li>
                            <li><a href="#faq" className="hover:text-green-600 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-normal text-slate-700">Stay Updated</h4>
                        <p className="text-sm text-slate-500 mb-3">Get the latest updates on agricultural trends.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white border border-green-200 rounded-lg py-2.5 pl-4 pr-12 text-sm text-slate-700 focus:ring-1 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                            />
                            <button className="absolute right-1.5 top-1.5 bg-green-600 text-white h-8 px-3 rounded-md text-xs font-normal hover:bg-green-700 transition-all">
                                <Mail className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-green-100 text-center">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} CropConnect. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
