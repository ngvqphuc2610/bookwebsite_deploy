import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getServerUrl } from '@/services/api';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/favorites`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFavorites(response.data.content || []);
        } catch (error) {
            console.error("Error fetching favorites:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (storyId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/favorites/toggle/${storyId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state by removing the story
            setFavorites(prev => prev.filter(s => s.id !== storyId));
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    return (
        <div className="bg-slate-50 py-12">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="text-rose-500 font-bold text-xs uppercase tracking-widest px-1">
                            Bộ sưu tập cá nhân
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Truyện yêu thích</h1>
                        <p className="text-slate-500 font-medium">Danh sách những bộ truyện bạn đã đánh dấu để theo dõi.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center flex flex-col items-center gap-4 opacity-50">
                        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Đang tải danh sách yêu thích...</p>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favorites.map((story) => (
                            <Card key={story.id} className="group relative overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white transition-all hover:-translate-y-2">
                                <CardContent className="p-0">
                                    <div className="flex flex-row p-5 gap-5">
                                        {/* Image wrapper */}
                                        <div className="relative w-32 h-44 shrink-0 overflow-hidden rounded-3xl shadow-lg ring-1 ring-slate-100 flex-none bg-slate-100">
                                            <img
                                                src={getServerUrl(story.coverImage)}
                                                alt={story.title}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            {story.isPremium && (
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div className="bg-amber-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">PREMIUM</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col justify-between py-1 min-w-0">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] uppercase">
                                                        {story.status}
                                                    </Badge>
                                                </div>
                                                <Link to={`/story/${story.id}`}>
                                                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                        {story.title}
                                                    </h3>
                                                </Link>
                                                <p className="text-sm text-slate-400 font-bold mb-3">{story.author}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="secondary" 
                                                    className="rounded-2xl h-10 px-4 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                                                    onClick={() => toggleFavorite(story.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                                <Button 
                                                    className="flex-1 rounded-2xl h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold group/btn"
                                                    asChild
                                                >
                                                    <Link to={`/story/${story.id}`}>
                                                        Đọc ngay <ArrowRight size={16} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                         <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Danh sách trống</h3>
                         <p className="text-slate-500 font-medium mb-8 max-w-sm mx-auto">Bạn chưa yêu thích bộ truyện nào. Hãy khám phá và lưu lại những bộ truyện hay nhé!</p>
                         <Button asChild className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 h-12 font-bold shadow-lg shadow-indigo-100">
                            <Link to="/">Khám phá ngay</Link>
                         </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
