import { Link } from "react-router-dom";
import { Github, Mail, Linkedin } from "lucide-react";

const LandingFooter = () => {
    return (
        <footer className="bg-slate-900 text-white py-16">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12 mb-12">
                    <div>
                        <div className="flex items-center gap-2.5 mb-6">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                <span className="font-black text-white text-xs">CC</span>
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase">Crop<span className="text-emerald-500">Chain</span></span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Powering a smarter agricultural supply chain with intelligent quality verification, full traceability, and secure digital payments from farm to table.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><a href="/#features" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                            <li><a href="/#gallery" className="hover:text-primary transition-colors">Gallery</a></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-white mb-6 uppercase tracking-wider text-xs">Connect</h3>
                        <div className="flex gap-4">
                            <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-300">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-300">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-300">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/5 pt-8 text-center text-sm text-slate-500 font-medium">
                    © 2026 Crop Chain. All rights reserved. <span className="text-primary/60">Built for a smarter agricultural future.</span>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
