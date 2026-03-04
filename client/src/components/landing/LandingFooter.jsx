import { Link } from "react-router-dom";
import { Github, Mail, Linkedin, Twitter, Instagram, Facebook, Phone, MapPin, ArrowRight, Wheat, Leaf, Shield, Truck } from "lucide-react";

const LandingFooter = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%2322c55e\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm0 0c0 5.5 4.5 10 10 10s10-4.5 10-10-4.5-10-10-10-10 4.5-10 10z\"/%3E%3C/g%3E%3C/svg%3E')"
            }}></div>
            
            <div className="relative z-10">
                {/* Top Section with Newsletter */}
                <div className="border-b border-white/10">
                    <div className="container mx-auto px-6 py-16">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                        <Wheat className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Stay Connected</h3>
                                        <p className="text-green-400 text-sm">Join the agricultural revolution</p>
                                    </div>
                                </div>
                                <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
                                    Get the latest updates on agricultural technology, market insights, and platform features delivered to your inbox.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Phone className="h-4 w-4 text-green-400" />
                                        <span className="text-sm">+91 98765 43210</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Mail className="h-4 w-4 text-green-400" />
                                        <span className="text-sm">support@cropchain.com</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                                <h4 className="text-xl font-semibold mb-4">Subscribe to Updates</h4>
                                <p className="text-slate-300 mb-6">Be the first to know about new features and agricultural insights.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-green-400 focus:bg-white/15 transition-all"
                                    />
                                    <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2">
                                        Subscribe
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="container mx-auto px-6 py-16">
                    <div className="grid lg:grid-cols-5 md:grid-cols-3 gap-12">
                        {/* Brand Section */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                                    <Wheat className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tight">Crop<span className="text-green-400">Chain</span></span>
                            </div>
                            
                            <p className="text-slate-300 leading-relaxed mb-8 max-w-md">
                                Transforming agriculture with intelligent quality verification, complete traceability, and secure digital payments. 
                                Building trust from farm to table through blockchain technology and AI-powered insights.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                        <Leaf className="h-4 w-4 text-green-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-white mb-1">Sustainable Agriculture</h5>
                                        <p className="text-slate-400 text-sm">Supporting eco-friendly farming practices and reducing waste</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Shield className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-white mb-1">Blockchain Security</h5>
                                        <p className="text-slate-400 text-sm">Immutable records and transparent transactions</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                        <Truck className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-white mb-1">Smart Logistics</h5>
                                        <p className="text-slate-400 text-sm">Optimized supply chain management and delivery</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold text-white mb-6 text-lg">Platform</h4>
                            <ul className="space-y-3">
                                <li><Link to="/" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Home</Link></li>
                                <li><a href="/#features" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Features</a></li>
                                <li><a href="/#how-it-works" className="text-slate-300 hover:text-green-400 transition-colors duration-200">How It Works</a></li>
                                <li><a href="/#gallery" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Gallery</a></li>
                                <li><a href="/#faq" className="text-slate-300 hover:text-green-400 transition-colors duration-200">FAQ</a></li>
                                <li><a href="mailto:support@cropchain.com" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Contact</a></li>
                            </ul>
                        </div>

                        {/* Solutions */}
                        <div>
                            <h4 className="font-semibold text-white mb-6 text-lg">Solutions</h4>
                            <ul className="space-y-3">
                                <li><Link to="/register" className="text-slate-300 hover:text-green-400 transition-colors duration-200">For Farmers</Link></li>
                                <li><Link to="/register" className="text-slate-300 hover:text-green-400 transition-colors duration-200">For Aggregators</Link></li>
                                <li><Link to="/register" className="text-slate-300 hover:text-green-400 transition-colors duration-200">For Retailers</Link></li>
                                <li><Link to="/register" className="text-slate-300 hover:text-green-400 transition-colors duration-200">For Consumers</Link></li>
                                <li><Link to="/qr" className="text-slate-300 hover:text-green-400 transition-colors duration-200">QR Scanner</Link></li>
                                <li><Link to="/trace" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Trace Product</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="font-semibold text-white mb-6 text-lg">Company</h4>
                            <ul className="space-y-3">
                                <li><Link to="/login" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Login</Link></li>
                                <li><Link to="/register" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Register</Link></li>
                                <li><a href="/#faq" className="text-slate-300 hover:text-green-400 transition-colors duration-200">Support</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="border-t border-white/10 pt-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-6">
                                <span className="text-slate-400 text-sm font-medium">Follow us:</span>
                                <div className="flex gap-3">
                                    <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 transition-all duration-300">
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 transition-all duration-300">
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 transition-all duration-300">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 transition-all duration-300">
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                    <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-green-500/20 hover:text-green-400 transition-all duration-300">
                                        <Github className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                            
                            <div className="text-center md:text-right">
                                <p className="text-slate-400 text-sm">
                                    © {currentYear} CropChain. All rights reserved.
                                </p>
                                <p className="text-green-400 text-sm mt-1">
                                    Building a smarter agricultural future together.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
