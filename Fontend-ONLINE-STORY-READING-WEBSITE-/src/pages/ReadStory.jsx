import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { chapterService, storyService } from '../services/api';
import { ChevronLeft, ChevronRight, List, Home, ArrowLeft, Loader2, Settings, MessageSquare, Share2, Heart, ExternalLink, Star, AlertCircle, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

const ReadStory = () => {
    const { storyId, chapterId } = useParams();
    const navigate = useNavigate();

    const [chapter, setChapter] = useState(null);
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        fetchData();
      
        const timer = setTimeout(() => setShowControls(false), 3000);
        return () => clearTimeout(timer);
    }, [chapterId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch story first to check premium status
            const storyRes = await storyService.getById(storyId);
            const currentStory = storyRes.data;
            setStory(currentStory);

            // Fetch chapters for navigation
            const allChaptersRes = await chapterService.getByStory(storyId, 0, 1000);
            setChapters(allChaptersRes.data.content || []);

            // Fetch current chapter
            try {
                const chapterRes = await chapterService.getById(chapterId);
                const currentChapter = chapterRes.data;
                setChapter(currentChapter);

                // Handle content (Images or Text)
                if (currentChapter.content && (currentChapter.content.startsWith('http') || currentChapter.content.includes('otruyenapi.com'))) {
                    // It's likely an API URL for images
                    try {
                        const imgDataRes = await axios.get(currentChapter.content);
                        const g2iData = imgDataRes.data;

                        if (g2iData.status === 'success' && g2iData.data) {
                            const { domain_cdn, item } = g2iData.data;
                            const constructedImages = item.chapter_image.map(img =>
                                `${domain_cdn}/${item.chapter_path}/${img.image_file}`
                            );
                            setImages(constructedImages);
                        } else {
                            setImages([]);
                        }
                    } catch (err) {
                        console.error("Failed to fetch image data:", err);
                        setImages([]);
                    }
                } else {
                    setImages([]);
                }
            } catch (err) {
                if (err.response && err.response.status === 403) {
                    setError({
                        type: 'PREMIUM_LOCKED',
                        message: err.response.data || "Truyện này đã được khóa. Vui lòng mua gói Premium để tiếp tục đọc."
                    });
                } else {
                    throw err;
                }
            }

        } catch (err) {
            console.error("Data fetch error:", err);
            setError({
                type: 'GENERAL_ERROR',
                message: "Không thể tải chương này. Vui lòng thử lại."
            });
        } finally {
            setLoading(false);
            window.scrollTo(0, 0);

            // Save reading progress if logged in
            try {
                const localUser = JSON.parse(localStorage.getItem('user'));
                if (localUser) {
                    const { readingProgressService } = await import('../services/api');
                    await readingProgressService.saveProgress(storyId, chapterId);
                }
            } catch (e) {
                console.error("Failed to save progress", e);
            }
        }
    };

    const currentIndex = chapters.findIndex(c => c.id === parseInt(chapterId));
    const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

    const handleChapterChange = (e) => {
        const id = e.target.value;
        if (id) navigate(`/story/${storyId}/read/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 text-white">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                    <Loader2 className="absolute inset-0 m-auto text-indigo-400 animate-pulse" size={24} />
                </div>
                <div className="text-center">
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] text-indigo-400 mb-2">Đang đồng bộ dữ liệu đồ họa</p>
                    <h2 className="text-xl font-bold italic">Chương {chapter?.chapterNumber || ''}...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
                {/* Subtle decorative elements for light theme */}
                <div className="absolute top-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-100 blur-[100px] rounded-full opacity-50" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-amber-100 blur-[100px] rounded-full opacity-50" />
                
                <div className="relative z-10 w-full max-w-lg">
                    <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[3.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
                        <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl transition-transform hover:scale-110 duration-500 relative ${error.type === 'PREMIUM_LOCKED' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-rose-500 text-white shadow-rose-200'}`}>
                            {error.type === 'PREMIUM_LOCKED' ? <Lock size={52} /> : <AlertCircle size={52} />}
                            {error.type === 'PREMIUM_LOCKED' && (
                                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-2 rounded-full shadow-lg border-4 border-white">
                                    <Star size={20} fill="currentColor" />
                                </div>
                            )}
                        </div>
                        
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
                            {error.type === 'PREMIUM_LOCKED' ? 'Nội dung Premium' : 'Đã xảy ra lỗi'}
                        </h2>
                        
                        <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed px-2">
                            {error.message}
                        </p>
                        
                        <div className="flex flex-col gap-4">
                            {error.type === 'PREMIUM_LOCKED' ? (
                                <>
                                    <Button 
                                        onClick={() => navigate('/premium')} 
                                        className="h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        <Sparkles size={24} fill="currentColor" /> Nâng cấp ngay
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => navigate(`/story/${storyId}`)} 
                                        className="h-14 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold"
                                    >
                                        Quay lại chi tiết truyện
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => navigate(`/story/${storyId}`)} className="h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl shadow-xl shadow-indigo-100">
                                        Quay lại chi tiết truyện
                                    </Button>
                                    <Button variant="ghost" onClick={fetchData} className="h-14 text-slate-400 hover:text-slate-600 font-bold">Thử lại</Button>
                                </>
                            )}
                        </div>

                        {error.type === 'PREMIUM_LOCKED' && (
                            <div className="mt-10 flex items-center justify-center gap-4 opacity-50">
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">TruyenHay Exclusive VIP</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Top Navigation Bar - Sticky & More Compact */}
            <div className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 bg-black/60 backdrop-blur-xl border-b border-white/5 py-3 px-4 lg:px-8 ${showControls ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={`/story/${storyId}`} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-xs uppercase tracking-wider line-clamp-1 max-w-[150px] lg:max-w-xs">{story?.title}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/10">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                disabled={!prevChapter}
                                className={`rounded-lg h-8 w-8 ${!prevChapter ? 'opacity-20 pointer-events-none' : 'hover:bg-white/10'}`}
                            >
                                {prevChapter ? <Link to={`/story/${storyId}/read/${prevChapter.id}`}><ChevronLeft size={16} /></Link> : <span><ChevronLeft size={16} /></span>}
                            </Button>

                            <select
                                value={chapterId}
                                onChange={handleChapterChange}
                                className="bg-transparent text-[10px] font-black uppercase tracking-widest px-2 border-none focus:ring-0 cursor-pointer h-8 outline-none appearance-none text-center min-w-[100px]"
                            >
                                {chapters.map(c => (
                                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">Chương {c.chapterNumber}</option>
                                ))}
                            </select>

                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                disabled={!nextChapter}
                                className={`rounded-lg h-8 w-8 ${!nextChapter ? 'opacity-20 pointer-events-none' : 'hover:bg-white/10'}`}
                            >
                                {nextChapter ? <Link to={`/story/${storyId}/read/${nextChapter.id}`}><ChevronRight size={16} /></Link> : <span><ChevronRight size={16} /></span>}
                            </Button>
                        </div>

                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                            <Settings size={16} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto pt-14 pb-24 px-0" onClick={() => setShowControls(!showControls)}>
                {images.length > 0 ? (
                    <div className="flex flex-col items-center select-none shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black">
                        {images.map((img, index) => (
                            <div key={index} className="w-full relative group">
                                <img
                                    src={img}
                                    alt={`Page ${index + 1}`}
                                    className="w-full h-auto block mx-auto"
                                    loading={index < 3 ? "eager" : "lazy"}
                                />
                                <div className="absolute top-4 right-6 px-2 py-1 rounded bg-black/40 backdrop-blur-md text-[9px] font-black text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    PAGE {index + 1} / {images.length}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="px-6 py-12 md:px-12 md:py-20 max-w-3xl mx-auto">
                        <div className="prose prose-invert prose-slate max-w-none">
                            <h2 className="text-2xl md:text-3xl font-black text-white italic mb-10 border-l-4 border-indigo-500 pl-6 leading-tight">
                                Chương {chapter?.chapterNumber}: {chapter?.title}
                            </h2>
                            <div className="text-lg leading-[2.2] text-slate-300 font-medium whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
                                {chapter?.content || "Nội dung chương này đang được cập nhật..."}
                            </div>
                        </div>
                    </div>
                )}

                {/* End of Chapter Navigation Area - Compact */}
                <div className="mt-8 mb-20 px-6 max-w-lg mx-auto text-center">
                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
                    <div className="flex items-center justify-center gap-3">
                        {prevChapter && (
                            <Button asChild variant="outline" className="h-10 px-6 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all">
                                <Link to={`/story/${storyId}/read/${prevChapter.id}`}>
                                    <ChevronLeft className="mr-1.5 h-3.5 w-3.5" /> Chương Trước
                                </Link>
                            </Button>
                        )}
                        {nextChapter && (
                            <Button asChild className="h-10 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/10 active:scale-95 transition-all">
                                <Link to={`/story/${storyId}/read/${nextChapter.id}`}>
                                    Chương Tiếp ✨
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Mini Navigation - Visible when scrolling down */}
            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${!showControls ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90'}`}>
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-xl flex items-center gap-0.5">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        disabled={!prevChapter}
                        className="h-9 w-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                    >
                        {prevChapter ? <Link to={`/story/${storyId}/read/${prevChapter.id}`} title="Chương trước"><ChevronLeft size={18} /></Link> : <span><ChevronLeft size={18} /></span>}
                    </Button>

                    <div className="h-3 w-px bg-white/10 mx-1" />

                    <Button
                        variant="ghost"
                        className="h-9 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-white"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        Chương {chapter?.chapterNumber}
                    </Button>

                    <div className="h-3 w-px bg-white/10 mx-1" />

                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        disabled={!nextChapter}
                        className="h-9 w-9 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-white/10"
                    >
                        {nextChapter ? <Link to={`/story/${storyId}/read/${nextChapter.id}`} title="Chương tiếp"><ChevronRight size={18} /></Link> : <span><ChevronRight size={18} /></span>}
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-1 bg-white/5 z-[110]">
                <div
                    className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1] transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / chapters.length) * 100}%` }}
                />
            </div>
        </div>
    );
};

export default ReadStory;
