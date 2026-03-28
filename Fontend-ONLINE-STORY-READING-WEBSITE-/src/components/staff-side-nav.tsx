import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LayoutGrid, Download, ChevronRight, Sparkles, Activity, Globe, Info, Crown } from 'lucide-react';

export function StaffSideNav() {
    const location = useLocation();

    const staffLinks = [
        { to: "/staff", label: "Quản lý truyện", icon: BookOpen, desc: "Chỉnh sửa & quản lý nội dung" },
        { to: "/staff/genres", label: "Quản lý thể loại", icon: LayoutGrid, desc: "Phân loại kho truyện" },
        { to: "/staff/import", label: "Import Tự động", icon: Download, desc: "Đồng bộ từ đối tác" },
        { to: "/staff/premium", label: "Quản lý Premium", icon: Crown, desc: "Quản lý gói cước & doanh thu" },
    ];

    return (
        <aside className="w-72 border-r border-slate-200/60 bg-white/50 backdrop-blur-xl h-[calc(100vh-64px)] overflow-y-auto hidden md:block shrink-0 sticky top-16">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none uppercase">
                            Staff Hub
                        </h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Management Suite</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-4 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-indigo-500" />
                        Công việc hàng ngày
                    </h3>
                    <nav className="space-y-1.5">
                        {staffLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-indigo-50"}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{link.label}</span>
                                            {!isActive && <span className="text-[10px] text-slate-400 font-medium">{link.desc}</span>}
                                        </div>
                                    </div>
                                    {!isActive && <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-20 p-5 rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-indigo-900/40 uppercase tracking-widest">Hỗ trợ kỹ thuật</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed relative z-10">Liên hệ qua Slack hoặc Hotline nội bộ để xử lý sự cố.</p>
                </div>
            </div>
        </aside>
    );
}
