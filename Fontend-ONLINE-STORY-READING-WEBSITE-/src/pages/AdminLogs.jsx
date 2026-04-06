import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin-layout';
import { 
    Activity, Clock, User as UserIcon, Shield, 
    Trash2, RefreshCcw, Search, Filter,
    FileText, Zap, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearLogs = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa sạch lịch sử hoạt động? Hành động này không thể hoàn tác!")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/logs/clear`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchLogs();
        } catch (error) {
            console.error("Error clearing logs:", error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getActionBadge = (action) => {
        if (action.includes('DELETE')) return 'bg-rose-50 text-rose-600 border-rose-100';
        if (action.includes('UPDATE')) return 'bg-amber-50 text-amber-600 border-amber-100';
        if (action.includes('CREATE')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    };

    return (
        <AdminLayout>
            <div className="space-y-8 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest mb-2">
                            <Activity size={14} />
                            An ninh hệ thống
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nhật ký hoạt động</h1>
                        <p className="text-slate-500 font-medium">Theo dõi các thay đổi và tác vụ quản trị theo thời gian thực.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            className="rounded-xl border-slate-200 bg-white font-bold"
                            onClick={fetchLogs}
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" /> Làm mới
                        </Button>
                        <Button 
                            variant="destructive"
                            className="rounded-xl shadow-lg shadow-rose-100 font-bold"
                            onClick={clearLogs}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Xóa nhật ký
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Tìm kiếm hành động, nội dung..." 
                            className="pl-10 h-12 rounded-2xl border-slate-100 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 bg-white text-slate-500 font-bold gap-2">
                        <Filter size={16} /> Lọc nâng cao
                    </Button>
                </div>

                {/* Logs Timeline */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
                            <RefreshCcw className="w-8 h-8 animate-spin text-indigo-500" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">Đang truy xuất dữ liệu an ninh...</p>
                        </div>
                    ) : filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                            <Card key={log.id} className="border-slate-50 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row items-stretch">
                                        <div className="p-6 md:w-48 bg-slate-50 flex flex-col justify-center items-center md:items-start text-center md:text-left shrink-0">
                                            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-1">
                                                <Clock size={12} /> {new Date(log.createdAt).toLocaleTimeString()}
                                            </div>
                                            <div className="font-black text-slate-900 text-sm">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-500 shrink-0">
                                                {log.action.includes('SECURITY') ? <Shield size={22} /> : <Zap size={22} />}
                                            </div>
                                            <div className="flex-1 min-w-0 text-center md:text-left">
                                                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                                    <Badge variant="outline" className={`text-[10px] font-black uppercase rounded-lg px-2 py-0.5 ${getActionBadge(log.action)}`}>
                                                        {log.action}
                                                    </Badge>
                                                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                                        <UserIcon size={14} className="text-slate-400" /> {log.user?.username || 'System'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 font-medium leading-relaxed truncate">
                                                    {log.details}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm" className="rounded-xl text-slate-400 font-bold px-4">
                                                Chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                             <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                             <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">Nhật ký trống</h3>
                             <p className="text-slate-400 font-medium">Chưa có hoạt động nào được ghi nhận trong thời gian này.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminLogs;
