import { Camera, BrainCircuit, ShieldCheck, QrCode, ClipboardCheck, ArrowRight } from "lucide-react";

const steps = [
    {
        icon: Camera,
        title: "Capture",
        description: "Upload crop photos via app."
    },
    {
        icon: BrainCircuit,
        title: "Analyze",
        description: "AI grades quality instantly."
    },
    {
        icon: ShieldCheck,
        title: "Secure",
        description: "Data locked on blockchain."
    },
    {
        icon: QrCode,
        title: "Track",
        description: "Generate unique batch QR."
    },
    {
        icon: ClipboardCheck,
        title: "Verify",
        description: "Automated delivery check."
    },
];

const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="bg-slate-50 py-24 md:py-32 overflow-hidden relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-200/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-200/50 to-transparent" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-primary mb-3 block">Workflow</span>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        From Farm to Fork
                    </h2>
                    <p className="text-slate-500 font-medium text-[15px] max-w-lg mx-auto leading-relaxed">
                        A seamless, automated journey ensuring trust at every step.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-green-100 -z-10 mt-6" />

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
                        {steps.map((step, i) => (
                            <div key={step.title} className="relative group">
                                {/* Step Node (Desktop) */}
                                <div className="hidden lg:flex absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-4 border-green-100 group-hover:border-green-500 transition-colors z-0 mt-6" />

                                <div className="flex flex-col items-center text-center">
                                    {/* Icon Card */}
                                    <div className="w-24 h-24 rounded-3xl bg-white border border-green-50 shadow-xl shadow-green-100/50 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 relative z-10">
                                        <step.icon className="h-8 w-8 text-green-300 group-hover:text-green-600 transition-colors duration-300" />

                                        {/* Number Badge */}
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-xl bg-green-600 text-white flex items-center justify-center text-[12px] font-black shadow-lg group-hover:bg-green-700 transition-colors">
                                            {i + 1}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-lg font-black text-slate-900 mb-2">{step.title}</h3>
                                    <p className="text-slate-500 text-[15px] font-medium leading-relaxed max-w-[140px]">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Mobile Connector Arrow */}
                                {i < steps.length - 1 && (
                                    <div className="lg:hidden flex justify-center py-4">
                                        <ArrowRight className="h-5 w-5 text-green-200 rotate-90" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
