import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, ShieldCheck, ChevronRight, Activity, Database, Settings2, BarChart3, Bell, Headphones } from 'lucide-react';

export function AdminSideNav() {
    const location = useLocation();

    const adminLinks = [
        { to: "/admin", label: "Người dùng", icon: Users, desc: "Phân quyền & bảo mật" },
        { to: "/admin/support", label: "Chăm sóc KH", icon: Headphones, desc: "Trực CSKH & Trả lời" },
        { to: "/admin/analytics", label: "Thống kê", icon: BarChart3, desc: "Số liệu hệ thống" },
        { to: "/admin/logs", label: "Nhật ký hệ thống", icon: Activity, desc: "Lịch sử hoạt động" },
        { to: "/admin/settings", label: "Cài đặt chung", icon: Settings2, desc: "Cấu hình toàn cục" },
    ];

    return (
        <aside className="w-72 border-r border-rose-200/40 bg-white/50 backdrop-blur-xl h-[calc(100vh-64px)] overflow-y-auto hidden md:block shrink-0 sticky top-16">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="bg-gradient-to-br from-rose-500 to-orange-600 p-2 rounded-xl shadow-lg shadow-rose-200">
                        <ShieldCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent leading-none uppercase">
                            Admin Center
                        </h2>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Super User Access</span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-4 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-rose-500" />
                        Tổng quan quản trị
                    </h3>
                    <nav className="space-y-1.5">
                        {adminLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = location.pathname === link.to;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                                            ? "bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-md shadow-rose-200"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-rose-600"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-white/20" : "bg-slate-100 group-hover:bg-rose-50"}`}>
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

                <div className="mt-20 p-5 rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50/50 border border-rose-100 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
                        <p className="text-[10px] font-bold text-rose-900/40 uppercase tracking-widest">Kênh thông báo</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed relative z-10 font-medium italic">Quan sát các hoạt động bất thường để đảm bảo an ninh mạng.</p>
                </div>
            </div>
        </aside>
    );
}
