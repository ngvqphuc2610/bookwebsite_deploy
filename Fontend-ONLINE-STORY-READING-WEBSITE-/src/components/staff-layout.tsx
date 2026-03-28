import React from 'react';
import { StaffSideNav } from './staff-side-nav';

export function StaffLayout({ children }) {
    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-[#f8fafc] mt-16 group/staff overflow-x-hidden">
            {/* Dynamic Background Effects */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-purple-200/30 rounded-full blur-[100px] animate-pulse duration-[15s]" />
            </div>

            <StaffSideNav />

            <main className="flex-1 relative z-10 px-8 py-10 md:px-12 md:py-12 overflow-y-auto">
                <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}
