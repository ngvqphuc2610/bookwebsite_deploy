import React, { useEffect, useState } from 'react';
import { premiumPackageService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Star, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PremiumPricing = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await premiumPackageService.getAll();
                setPackages(response.data || []);
            } catch (error) {
                console.error("Failed to fetch packages:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    const getIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('pro')) return <Zap className="text-yellow-500" size={20} />;
        if (n.includes('vip') || n.includes('king')) return <Crown className="text-indigo-500" size={20} />;
        return <Star className="text-orange-500" size={20} />;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                        Gói Cước <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-800">Premium VIP</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium text-lg">Nâng cấp tài khoản để đọc toàn bộ kho truyện và xoá quảng cáo!</p>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-amber-700" />
                    <p className="text-muted-foreground animate-pulse font-medium">Đang tải các gói ưu đãi...</p>
                </div>
            ) : packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`flex flex-col bg-stone-50 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden
                                ${pkg.durationDays >= 30 ? 'border-amber-600 shadow-lg shadow-amber-100' : 'border-stone-200'}`}
                        >
                            {pkg.durationDays >= 30 && (
                                <div className="bg-gradient-to-r from-amber-700 to-orange-800 text-white text-xs font-black uppercase tracking-widest px-4 py-2 text-center">
                                    ⭐ Phổ Biến Nhất
                                </div>
                            )}

                            <div className="p-8 pb-0">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                        {getIcon(pkg.name)}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{pkg.name}</h3>
                                        <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">{pkg.durationDays} Ngày Truy Cập</p>
                                    </div>
                                </div>

                                <div className="py-6 border-b border-stone-200 border-dashed">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-amber-800">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pt-6 flex-grow flex flex-col">
                                <ul className="space-y-4 text-left flex-grow mb-8">
                                    <li className="flex items-start gap-3 text-stone-600 font-medium">
                                        <Check className="text-amber-600 mt-0.5 shrink-0" size={18} strokeWidth={3} />
                                        <span>Đọc toàn bộ truyện được phân loại là <strong className="text-amber-800">Premium</strong></span>
                                    </li>
                                    <li className="flex items-start gap-3 text-stone-600 font-medium">
                                        <Check className="text-amber-600 mt-0.5 shrink-0" size={18} strokeWidth={3} />
                                        <span>Xóa bỏ hoàn toàn <strong>quảng cáo</strong></span>
                                    </li>
                                    <li className="flex items-start gap-3 text-stone-600 font-medium">
                                        <Check className="text-amber-600 mt-0.5 shrink-0" size={18} strokeWidth={3} />
                                        <span>Truy cập nhanh vào các truyện ưu tiên</span>
                                    </li>
                                </ul>

                                <Button
                                    className={`w-full h-14 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all h-auto
                                        ${pkg.durationDays >= 30
                                            ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-lg shadow-amber-200'
                                            : 'bg-stone-800 hover:bg-black text-white'}`}
                                    onClick={() => navigate(`/checkout/${pkg.id}`, { state: { pkg } })}
                                >
                                    Đăng ký gói {pkg.name} <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-card rounded-[2rem] border-2 border-dashed border-border">
                    <p className="text-xl font-bold text-muted-foreground italic">Chưa có gói Premium nào được mở bán.</p>
                </div>
            )}
        </div>
    );
};

export default PremiumPricing;

