import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { storyService, genreService, mangaSearchService } from '@/services/api';
import { StoryCard } from '@/components/story-card';
import { Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const CategoryPage = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const isSearch = !!searchParams.get('q');
    const query = searchParams.get('q');
    const filterType = searchParams.get('type');

    const [stories, setStories] = useState([]);
    const [genre, setGenre] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Reset page when filter or category changes
    useEffect(() => {
        setPage(0);
    }, [slug, query, filterType]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                let response;
                if (isSearch) {
                    // Update: use Hybrid Search API instead of legacy MySQL fulltext search
                    response = await mangaSearchService.search(query, 50); // get top 50 matches
                } else if (filterType === 'ongoing') {
                    response = await storyService.getByStatus('ONGOING', page);
                } else if (filterType === 'completed') {
                    response = await storyService.getByStatus('COMPLETED', page);
                } else if (filterType === 'premium') {
                    response = await storyService.getPremium(page);
                } else if (filterType === 'new') {
                    response = await storyService.getNewest(page);
                } else if (slug && slug !== 'all') {
                    // Fetch genre info
                    const genreRes = await genreService.getById(slug);
                    setGenre(genreRes.data);
                    response = await storyService.getByGenre(slug, page);
                } else {
                    response = await storyService.getAll(page);
                }

                // mangaSearchService returns { results, count }, while storyService returns { content, totalPages }
                if (isSearch) {
                    // Map Hybrid Search Result to Story format expected by StoryCard
                    const mappedStories = (response.data.results || []).map(r => ({
                        id: r.storyId,
                        title: r.title,
                        author: r.author,
                        coverImage: r.coverImage,
                        viewCount: r.viewCount,
                        rating: r.rating,
                        status: r.status,
                        isPremium: r.isPremium,
                        createdAt: r.createdAt,
                        searchScore: r.combinedScore // custom property if we want to show it
                    }));
                    setStories(mappedStories);
                    setTotalPages(1); // Vector search is typically single page top-K
                } else {
                    setStories(response.data.content || []);
                    setTotalPages(response.data.totalPages || 0);
                }
            } catch (error) {
                console.error("Failed to fetch stories:", error);
                setStories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, query, isSearch, page, filterType]);

    const getTitle = () => {
        if (isSearch) return `Kết quả tìm kiếm cho: "${query}"`;
        if (filterType === 'ongoing') return "Truyện Đang Ra";
        if (filterType === 'completed') return "Truyện Đã Hoàn Thành";
        if (filterType === 'premium') return "Truyện Premium VIP";
        if (filterType === 'new') return "Truyện Mới Cập Nhật";
        if (genre) return `Thể loại: ${genre.name}`;
        return "Tất cả truyện";
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{getTitle()}</h1>
                    <p className="text-muted-foreground mt-1 font-medium">Khám phá thế giới truyện tranh đầy màu sắc</p>
                </div>
                {!isSearch && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl border border-border">
                        <Filter size={16} className="text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider">Lọc truyện</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse font-medium">Đang tải danh sách truyện...</p>
                </div>
            ) : stories.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mb-12">
                        {stories.map((story) => (
                            <StoryCard key={story.id} story={story} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 py-8">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 rounded-xl border border-border bg-card hover:bg-secondary disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-bold">
                                Trang {page + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                                className="p-2 rounded-xl border border-border bg-card hover:bg-secondary disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="py-20 text-center bg-card rounded-[2rem] border-2 border-dashed border-border">
                    <p className="text-xl font-bold text-muted-foreground italic">Không tìm thấy truyện nào.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
