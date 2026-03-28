import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { storyService, chapterService } from '@/services/api';
import { StoryDetailContent } from '@/components/story-detail-content';
import { Loader2 } from "lucide-react";

const StoryDetail = () => {
    const { id } = useParams();
    const [story, setStory] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStoryData = async () => {
            try {
                setLoading(true);
                // The URL id might be ID or SLUG
                // If it's a number, it's ID, otherwise it's SLUG
                // For now, assume it's ID
                const storyRes = await storyService.getById(id);
                setStory(storyRes.data);

                // Fetch chapters
                const chaptersRes = await chapterService.getByStory(id, 0, 1000);
                setChapters(chaptersRes.data.content || []);

                setError(null);
            } catch (err) {
                console.error("Error fetching story:", err);
                setError("Có lỗi xảy ra khi tải dữ liệu truyện. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchStoryData();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Đang tải dữ liệu truyện...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-20 text-center">
                <p className="text-destructive font-semibold mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (!story) {
        return <div className="container py-20 text-center text-muted-foreground font-medium italic">Truyện không tồn tại hoặc đã bị xóa.</div>;
    }

    return (
        <div className="flex flex-col">
            <StoryDetailContent story={story} initialChapters={chapters} />
        </div>
    );
};

export default StoryDetail;
