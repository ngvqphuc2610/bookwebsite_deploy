import React, { useState } from 'react';
import { otruyenService } from '../services/api';
import { Search, Download, Check, AlertCircle, Loader2, ExternalLink, Activity, Sparkles, Database, Globe, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StaffLayout } from '@/components/staff-layout';
import { Badge } from '@/components/ui/badge';

const StaffDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [importingStates, setImportingStates] = useState({});
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        try {
            setLoading(true);
            const response = await otruyenService.search(searchTerm);
            const items = response.data?.data?.items || [];
            setResults(items);
        } catch (error) {
            showNotification('error', 'Lỗi khi kết nối với máy chủ nguồn.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (story) => {
        const storyKey = story.slug;
        try {
            setImportingStates(prev => ({ ...prev, [storyKey]: 'loading' }));
            const detailRes = await otruyenService.getDetail(storyKey);
            const fullStory = detailRes.data?.data?.item;

            if (!fullStory) throw new Error("Thất bại khi trích xuất dữ liệu gốc.");

            const storyToImport = {
                title: fullStory.name,
                slug: fullStory.slug,
                author: Array.isArray(fullStory.author) ? fullStory.author.join(', ') : (fullStory.author || 'Đang cập nhật'),
                description: fullStory.content ? fullStory.content.replace(/<[^>]*>?/gm, '') : '',
                coverImage: `https://img.otruyenapi.com/uploads/comics/${fullStory.thumb_url}`,
                status: fullStory.status === 'ongoing' ? 'ONGOING' :
                    fullStory.status === 'coming_soon' ? 'COMING_SOON' :
                        fullStory.status === 'completed' ? 'COMPLETED' : 'ONGOING',
                isPremium: false,
                genres: fullStory.category ? fullStory.category.map(c => c.name) : [],
                chapters: fullStory.chapters
            };

            await otruyenService.importStory(storyToImport);

            setImportingStates(prev => ({ ...prev, [storyKey]: 'success' }));
            showNotification('success', `Đã đồng bộ hóa "${fullStory.name}"!`);
        } catch (error) {
            setImportingStates(prev => ({ ...prev, [storyKey]: 'error' }));
            showNotification('error', error.response?.data?.message || 'Có lỗi xảy ra khi lưu vào DB.');
        }
    };

    return (
        <StaffLayout>
            {notification && (
                <div className={`fixed top-24 right-8 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full backdrop-blur-md border border-white/20 ${notification.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'
                    }`}>
                    <div className="bg-white/20 p-1.5 rounded-full">
                        {notification.type === 'success' ? <Check size={18} strokeWidth={3} /> : <AlertCircle size={18} strokeWidth={3} />}
                    </div>
                    <span className="font-bold tracking-tight">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <Globe size={14} />
                        Dữ liệu đối tác (External Source)
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Đồng bộ hóa nội dung
                        <div className="bg-indigo-100 text-indigo-600 p-1.5 rounded-xl">
                            <Zap size={20} fill="currentColor" />
                        </div>
                    </h1>
                    <p className="text-slate-500 font-medium italic">Tự động nhập dữ liệu từ máy chủ đối tác otruyen.cc vào hệ thống cục bộ.</p>
                </div>
            </div>

            <form className="mb-12 group relative max-w-3xl flex gap-3" onSubmit={handleSearch}>
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Nhập tên truyện muốn đồng bộ (Ví dụ: Đao Kiếm Thần Vực...)"
                        className="pl-12 h-16 rounded-2xl border-slate-200 bg-white shadow-lg shadow-indigo-500/5 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all text-lg font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button type="submit" disabled={loading} className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3">
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Activity className="h-5 w-5" />}
                    Tìm kiếm nguồn
                </Button>
            </form>

            <div className="grid grid-cols-1 gap-6">
                {loading && results.length === 0 ? (
                    <div className="col-span-full py-40 text-center flex flex-col items-center gap-6 text-slate-300">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
                            <Globe className="absolute inset-0 m-auto text-indigo-200" size={24} />
                        </div>
                        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Đang truy vấn database đối tác...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-4">
                        <div className="px-6 py-3 bg-white/40 backdrop-blur-sm border border-slate-100 rounded-2xl flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Kết quả tìm kiếm ({results.length})</p>
                            <Badge variant="ghost" className="text-indigo-500 font-bold">otruyen.cc API v1</Badge>
                        </div>
                        {results.map(story => (
                            <div key={story.slug} className="group bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 md:h-[140px] flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Database size={100} />
                                </div>

                                <div className="relative shrink-0 w-24 h-32 md:w-20 md:h-28 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-md group-hover:shadow-indigo-200/50 transition-all">
                                    <img
                                        src={`https://img.otruyenapi.com/uploads/comics/${story.thumb_url}`}
                                        alt=""
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                                        onError={(e) => e.target.src = 'https://via.placeholder.com/300x450'}
                                    />
                                </div>

                                <div className="flex-1 min-w-0 text-center md:text-left">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                        <h3 className="font-black text-xl text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors truncate max-w-sm">{story.name}</h3>
                                        <Badge variant="outline" className={`text-[10px] py-0.5 px-3 rounded-full font-black uppercase tracking-wider border ${story.status === 'ongoing' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                            {story.status === 'ongoing' ? 'Đang ra' : 'Hoàn thành'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-[11px] font-bold text-slate-400">
                                        <span className="flex items-center gap-1.5"><Globe size={14} className="text-indigo-300" /> SOURCE_SLUG: <span className="text-indigo-500 font-mono tracking-tighter">{story.slug}</span></span>
                                    </div>
                                </div>

                                <div className="flex flex-row gap-3 pt-4 md:pt-0 shrink-0 relative z-10">
                                    <Button
                                        variant={importingStates[story.slug] === 'success' ? 'outline' : 'default'}
                                        className={`h-12 px-6 rounded-2xl font-black transition-all ${importingStates[story.slug] === 'success'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 hover:-translate-y-1'
                                            }`}
                                        onClick={() => handleImport(story)}
                                        disabled={importingStates[story.slug] === 'loading' || importingStates[story.slug] === 'success'}
                                    >
                                        {importingStates[story.slug] === 'loading' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> :
                                            importingStates[story.slug] === 'success' ? <Check className="h-5 w-5 mr-2" strokeWidth={3} /> :
                                                <Download className="h-5 w-5 mr-2" />}
                                        {importingStates[story.slug] === 'loading' ? 'Đang nhập...' :
                                            importingStates[story.slug] === 'success' ? 'Đã trong thư viện' : 'Nhập về DB'}
                                    </Button>

                                    <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" asChild title="Xem nguồn gốc">
                                        <a href={`https://otruyen.cc/truyen-tranh/${story.slug}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="col-span-full py-32 text-center bg-white/40 backdrop-blur-sm rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4">
                        <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/5 mb-4 group hover:scale-110 transition-transform duration-500">
                            <Sparkles size={40} className="text-indigo-200 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Cơ sở dữ liệu đang chờ...</h3>
                        <p className="text-slate-400 font-bold max-w-xs leading-relaxed">Nhập tiêu đề hoặc bộ từ khóa để bắt đầu quét dữ liệu từ máy chủ đối tác của chúng tôi.</p>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffDashboard;
