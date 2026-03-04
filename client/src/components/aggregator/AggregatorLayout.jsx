import React from "react";
import AggregatorSidebar from "./AggregatorSidebar";
import { Outlet } from 'react-router-dom';

export function AggregatorLayout({ children }) {
    return (
        <div className="h-screen overflow-hidden bg-slate-50/50 aggregator-side-no-bold">
            <AggregatorSidebar />
            <main className="lg:pl-64 h-screen overflow-y-auto transition-all duration-300">
                <div className="px-4 py-8 sm:px-8 lg:px-12 pt-24 lg:pt-12 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
}

export default AggregatorLayout;
