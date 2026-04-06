import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AdminLayout } from '@/components/admin-layout';
import {
    TrendingUp, Users, CreditCard, DollarSign,
    ArrowUpRight, ArrowDownRight, Clock,
    CheckCircle2, XCircle, AlertCircle,
    Calendar, Download, Filter, RefreshCcw, Trash2, Check, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const AdminAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAllModal, setShowAllModal] = useState(false);
    const [allTransactions, setAllTransactions] = useState([]);
    const [isDeleting, setIsDeleting] = useState(null);
    const [period, setPeriod] = useState('all');

    const fetchAnalytics = async (targetPeriod = period) => {
        try {
            setRefreshing(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/analytics?period=${targetPeriod}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
            if (showAllModal) {
                fetchAllTransactions();
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        fetchAnalytics(newPeriod);
    };

    const fetchAllTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllTransactions(response.data);
        } catch (error) {
            console.error("Error fetching all transactions:", error);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này? Hành động này không thể hoàn tác.')) return;
        
        try {
            setIsDeleting(id);
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAnalytics();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Không thể xóa giao dịch. Vui lòng thử lại.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleExportExcel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/admin/export-revenue`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' // Important for file download
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bao_cao_doanh_thu_${new Date().toLocaleDateString('vi-VN')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting excel:", error);
            alert("Không thể xuất báo cáo. Vui lòng thử lại.");
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-500 font-bold animate-pulse">Đang tổng hợp dữ liệu hệ thống...</p>
                </div>
            </AdminLayout>
        );
    }

    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'];

    const pieData = data ? Object.entries(data.revenueByMethod).map(([name, value]) => ({ name, value })) : [];

    // Formatting currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const stats = [
        {
            title: "Tổng doanh thu",
            value: formatCurrency(data?.totalRevenue || 0),
            icon: <DollarSign className="w-5 h-5" />,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            desc: "Lợi nhuận từ các gói Premium"
        },
        {
            title: "Người dùng hệ thống",
            value: data?.totalUsers || 0,
            icon: <Users className="w-5 h-5" />,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            desc: `${data?.totalPremiumUsers || 0} tài khoản Premium`
        },
        {
            title: "Giao dịch thành công",
            value: data?.successTransactions || 0,
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: "text-blue-600",
            bg: "bg-blue-50",
            desc: `${((data?.successTransactions / (data?.totalTransactions || 1)) * 100).toFixed(1)}% tỉ lệ hoàn tất`
        },
        {
            title: "Giao dịch thất bại",
            value: data?.failedTransactions || 0,
            icon: <XCircle className="w-5 h-5" />,
            color: "text-rose-600",
            bg: "bg-rose-50",
            desc: "Bao gồm lỗi cổng và hủy bỏ"
        }
    ];

    return (
        <AdminLayout>
            <div className="space-y-8 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
                            <TrendingUp size={14} />
                            Trung tâm dữ liệu
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Thống kê hệ thống</h1>
                        <p className="text-slate-500 font-medium">Theo dõi hiệu suất kinh doanh và hoạt động người dùng.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 bg-white"
                            onClick={fetchAnalytics}
                            disabled={refreshing}
                        >
                            <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Làm mới
                        </Button>
                        <Button 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 font-bold"
                            onClick={handleExportExcel}
                        >
                            <Download className="w-4 h-4 mr-2" /> Xuất báo cáo (Excel)
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                        {stat.icon}
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold border-slate-100 bg-slate-50/50">
                                        Live
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.title}</h3>
                                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                    <p className="text-[11px] text-slate-400 font-medium">{stat.desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border-slate-100 shadow-sm rounded-[2rem] p-6">
                        <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-800">Doanh thu theo phương thức</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400">Tỷ lệ đóng góp của các cổng thanh toán</CardDescription>
                            </div>
                            <div className="bg-slate-50 p-1 rounded-xl flex gap-1">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className={`h-7 text-[10px] font-bold px-3 rounded-lg transition-all ${period === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                    onClick={() => handlePeriodChange('month')}
                                >
                                    Tháng này
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className={`h-7 text-[10px] font-bold px-3 rounded-lg transition-all ${period === 'quarter' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                    onClick={() => handlePeriodChange('quarter')}
                                >
                                    Quý trước
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className={`h-7 text-[10px] font-bold px-3 rounded-lg transition-all ${period === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                                    onClick={() => handlePeriodChange('all')}
                                >
                                    Tất cả
                                </Button>
                            </div>
                        </CardHeader>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pieData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                        cursor={{ fill: '#f8fafc' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={50}>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="border-slate-100 shadow-sm rounded-[2rem] p-6">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="text-xl font-black text-slate-800">Phân phối cổng</CardTitle>
                            <CardDescription className="text-xs font-bold text-slate-400">Tỉ trọng các ví điện tử</CardDescription>
                        </CardHeader>
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', shadow: 'lg' }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase font-black text-slate-400">Tổng cộng</p>
                                    <p className="text-lg font-black text-slate-800">{formatCurrency(data?.totalRevenue || 0)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {pieData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-xs font-bold text-slate-600 uppercase">{item.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Recent Transactions Table */}
                <Card className="border-slate-100 shadow-sm rounded-[3rem] overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-800">Giao dịch gần đây</CardTitle>
                            <CardDescription className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-1">Lịch sử 10 giao dịch mới nhất</CardDescription>
                        </div>
                        <Button 
                            variant="ghost" 
                            className="text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl"
                            onClick={() => {
                                fetchAllTransactions();
                                setShowAllModal(true);
                            }}
                        >
                            Xem tất cả
                        </Button>
                    </CardHeader>
                    <div className="px-4 pb-4 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Người dùng</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Gói cước</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Phương thức</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Số tiền</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Thời gian</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentTransactions.length > 0 ? (
                                    data.recentTransactions.map((tx, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 border-b border-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs">
                                                        {tx.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-700">{tx.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50 border-spacing-2">
                                                <Badge variant="outline" className="border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold rounded-lg px-2">
                                                    {tx.packageName}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50">
                                                <span className="text-[11px] font-black text-slate-500 uppercase flex items-center gap-1.5">
                                                    <CreditCard size={12} className="text-slate-400" /> {tx.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50">
                                                <span className="font-black text-slate-800 tracking-tight">{formatCurrency(tx.amount)}</span>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-600">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-medium text-slate-400">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50 text-center">
                                                <div className="flex items-center justify-center">
                                                    {tx.status === 'SUCCESS' && (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm shadow-emerald-500/5 flex items-center gap-1 font-bold text-[10px] rounded-lg">
                                                            <CheckCircle2 size={10} strokeWidth={3} /> HOÀN TẤT
                                                        </Badge>
                                                    )}
                                                    {tx.status === 'PENDING' && (
                                                        <Badge className="bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/5 flex items-center gap-1 font-bold text-[10px] rounded-lg">
                                                            <Clock size={10} strokeWidth={3} /> ĐANG CHỜ
                                                        </Badge>
                                                    )}
                                                    {tx.status === 'FAILED' && (
                                                        <Badge className="bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-500/5 flex items-center gap-1 font-bold text-[10px] rounded-lg">
                                                            <XCircle size={10} strokeWidth={3} /> THẤT BẠI
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b border-slate-50 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                    onClick={() => handleDeleteTransaction(tx.id)}
                                                    disabled={isDeleting === tx.id}
                                                >
                                                    <Trash2 size={16} className={isDeleting === tx.id ? "animate-pulse" : ""} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold italic">
                                            Chưa có dữ liệu giao dịch nào được ghi nhận.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal See All Transactions */}
            {showAllModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in transition-all">
                    <div className="w-full max-w-6xl bg-white rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] h-[90vh] flex flex-col animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        
                        <div className="px-10 pt-10 pb-6 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Toàn bộ giao dịch</h3>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 px-1">Danh sách đầy đủ từ trước đến nay</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setShowAllModal(false)}
                                className="rounded-2xl h-14 w-14 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <X size={28} />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-10 custom-scrollbar">
                            <div className="rounded-[2.5rem] border border-slate-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                        <tr>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Người dùng</th>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Gói cước</th>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Thời gian</th>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">Số tiền</th>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-center">Trạng thái</th>
                                            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {allTransactions.length > 0 ? (
                                            allTransactions.map((tx) => (
                                                <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100 ring-4 ring-indigo-500/5">
                                                                {tx.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-800 leading-none mb-1">{tx.username}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{tx.paymentMethod}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <Badge variant="outline" className="border-indigo-100 bg-indigo-50/20 text-indigo-600 font-bold rounded-xl px-3 py-1 text-[11px]">
                                                            {tx.packageName}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-600">{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                            <span className="text-[10px] font-medium text-slate-400">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-base font-black text-slate-900 tracking-tight">{formatCurrency(tx.amount)}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <div className="flex items-center justify-center">
                                                            {tx.status === 'SUCCESS' && (
                                                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1.5 font-black text-[10px] rounded-xl px-3 py-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> HOÀN TẤT
                                                                </Badge>
                                                            )}
                                                            {tx.status === 'PENDING' && (
                                                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1.5 font-black text-[10px] rounded-xl px-3 py-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> ĐANG CHỜ
                                                                </Badge>
                                                            )}
                                                            {tx.status === 'FAILED' && (
                                                                <Badge className="bg-rose-50 text-rose-600 border-rose-100 flex items-center gap-1.5 font-black text-[10px] rounded-xl px-3 py-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> THẤT BẠI
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                                            onClick={() => handleDeleteTransaction(tx.id)}
                                                            disabled={isDeleting === tx.id}
                                                        >
                                                            <Trash2 size={20} className={isDeleting === tx.id ? "animate-pulse" : ""} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-20 text-center text-slate-400 font-bold italic">
                                                    Không tìm thấy dữ liệu giao dịch nào.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminAnalytics;
