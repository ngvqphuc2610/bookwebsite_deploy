import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { premiumPackageService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Check,
    CreditCard,
    Wallet,
    Smartphone,
    ArrowLeft,
    ShieldCheck,
    Info,
    Loader2,
    Lock,
    Zap,
    Crown,
    Star
} from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [pkg, setPkg] = useState(location.state?.pkg || null);
    const [loading, setLoading] = useState(!location.state?.pkg);
    const [selectedMethod, setSelectedMethod] = useState('momo');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (pkg) return; // Skip fetch if already have data from state

        const fetchPackage = async () => {
            try {
                const response = await premiumPackageService.getById(packageId);
                setPkg(response.data);
            } catch (error) {
                console.error("Failed to fetch package:", error);
                toast.error("Không thể tải thông tin gói cước");
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [packageId, pkg]);

    const handlePayment = async () => {
        if (selectedMethod === 'vnpay') {
            setProcessing(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/payment/create-vnpay-url?packageId=${packageId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.paymentUrl) {
                    window.location.href = data.paymentUrl;
                } else {
                    toast.error("Không thể tạo link thanh toán VNPay");
                    setProcessing(false);
                }
            } catch (error) {
                console.error("Payment error:", error);
                toast.error("Lỗi kết nối đến máy chủ thanh toán");
                setProcessing(false);
            }
            return;
        }

        if (selectedMethod === 'momo') {
            setProcessing(true);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/payment/create-momo-url?packageId=${packageId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.payUrl) {
                    window.location.href = data.payUrl;
                } else {
                    toast.error(data.message || "Không thể tạo link thanh toán MoMo");
                    setProcessing(false);
                }
            } catch (error) {
                console.error("Momo Payment error:", error);
                toast.error("Lỗi kết nối đến máy chủ MoMo");
                setProcessing(false);
            }
            return;
        }

        setProcessing(true);
        // Simulate other payment methods (ZaloPay, ATM, etc.)
        setTimeout(() => {
            setProcessing(false);
            toast.success(`Thanh toán qua ${selectedMethod.toUpperCase()} thành công!`);
            navigate('/profile');
        }, 2000);
    };

    const getIcon = (name) => {
        if (!name) return <Star className="text-orange-500" />;
        const n = name.toLowerCase();
        if (n.includes('pro')) return <Zap className="text-yellow-500" size={24} />;
        if (n.includes('vip') || n.includes('king')) return <Crown className="text-indigo-500" size={24} />;
        return <Star className="text-orange-500" size={24} />;
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Đang chuẩn bị trang thanh toán...</p>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Không tìm thấy gói cước</h2>
                <Button onClick={() => navigate('/premium')} variant="outline">Quay lại trang giá</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <button
                    onClick={() => navigate('/premium')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-semibold mb-8 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Quay lại
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Payment Methods */}
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm">1</span>
                                Phương thức thanh toán
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PaymentMethodCard
                                    id="momo"
                                    title="Ví MoMo"
                                    description="Thanh toán qua ứng dụng MoMo"
                                    icon={<Smartphone className="text-[#A50064]" />}
                                    selected={selectedMethod === 'momo'}
                                    onClick={() => setSelectedMethod('momo')}
                                />
                                <PaymentMethodCard
                                    id="vnpay"
                                    title="VNPay"
                                    description="Cổng thanh toán nội địa & Quốc tế"
                                    icon={<CreditCard className="text-blue-600" />}
                                    selected={selectedMethod === 'vnpay'}
                                    onClick={() => setSelectedMethod('vnpay')}
                                />
                            </div>
                        </section>

                        <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Info size={20} className="text-indigo-600" />
                                Lưu ý quan trọng
                            </h3>
                            <ul className="space-y-3 text-slate-600 text-sm">
                                <li className="flex gap-2">
                                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                                    Mọi giao dịch đều được mã hóa và bảo mật tuyệt đối.
                                </li>
                                <li className="flex gap-2">
                                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                                    Tài khoản Premium sẽ được kích hoạt ngay sau khi thanh toán thành công.
                                </li>
                                <li className="flex gap-2">
                                    <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                                    Nếu gặp vấn đề trong quá trình thanh toán, vui lòng liên hệ hỗ trợ 24/7.
                                </li>
                            </ul>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 rounded-[2rem] overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white p-6 pb-12">
                                <CardTitle className="text-lg font-bold">Chi tiết thanh toán</CardTitle>
                                <CardDescription className="text-slate-400">Xem lại thông tin gói cước của bạn</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 -mt-10">
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-50 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                                            {getIcon(pkg.name)}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 leading-tight">{pkg.name}</h4>
                                            <Badge variant="secondary" className="mt-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-bold">
                                                {pkg.durationDays} Ngày
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Giá gốc</span>
                                            <span className="font-medium text-slate-900">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Giảm giá</span>
                                            <span className="font-medium text-green-600">- 0 ₫</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                            <span className="text-lg font-bold text-slate-900">Tổng cộng</span>
                                            <span className="text-2xl font-black text-indigo-600">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.price)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                                        <Lock className="text-slate-400 shrink-0" size={18} />
                                        <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                                            Thông tin thanh toán của bạn được bảo vệ bởi công nghệ mã hóa SSL 256-bit chuẩn quốc tế.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button
                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 size={20} className="mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>Xác nhận thanh toán</>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentMethodCard = ({ id, title, description, icon, selected, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-start gap-4 hover:shadow-md
                ${selected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                    : 'border-slate-100 bg-white hover:border-indigo-200'}`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                ${selected ? 'bg-white' : 'bg-slate-50'}`}>
                {icon}
            </div>
            <div className="flex-grow pt-1">
                <h4 className={`font-bold text-sm ${selected ? 'text-indigo-900' : 'text-slate-800'}`}>{title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
            </div>
            {selected && (
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-white" strokeWidth={4} />
                </div>
            )}
        </div>
    );
};

export default Checkout;
