import React from 'react';
import { AdminSideNav } from './admin-side-nav';

export function AdminLayout({ children }) {
    return (
        <div className="flex min-h-[calc(100vh-64px)] bg-[#fdf8f8] mt-16 group/admin overflow-x-hidden">
            {/* Dynamic Background Effects - Warmer tone for Admin */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-rose-200/30 rounded-full blur-[120px] animate-pulse duration-[10s]" />
                <div className="absolute bottom-[5%] right-[-5%] w-[35%] h-[35%] bg-indigo-100/30 rounded-full blur-[100px] animate-pulse duration-[15s]" />
            </div>

            <AdminSideNav />

            <main className="flex-1 relative z-10 px-8 py-10 md:px-12 md:py-12 overflow-y-auto">
                <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}
