import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  Eye,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  Heart,
  Share2,
  List,
  Lock,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatViews } from "@/lib/data"

interface StoryDetailContentProps {
  story: {
    id: number;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    author: string;
    status: string;
    isPremium: boolean;
    viewCount: number;
    genres: string[];
    rating?: number;
    updatedAt?: string;
  };
  initialChapters: any[];
}

export function StoryDetailContent({ story, initialChapters }: StoryDetailContentProps) {
  const [showAllChapters, setShowAllChapters] = useState(false)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const chapters = initialChapters || []
  const displayedChapters = showAllChapters ? chapters : chapters.slice(0, 20)
  const sortedChapters = sortOrder === "desc" ? [...displayedChapters].reverse() : displayedChapters

  const [readingProgress, setReadingProgress] = useState<any>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [avgRating, setAvgRating] = useState(story.rating || 0)
  const [ratingCount, setRatingCount] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [isPremiumUser, setIsPremiumUser] = useState(false)
  const [checkingPremium, setCheckingPremium] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setCheckingPremium(true);
        const localUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (localUser) {
          // Check role first
          const isAdminOrStaff = localUser.roles?.includes('ADMIN') || localUser.roles?.includes('STAFF');
          if (isAdminOrStaff) {
            setIsPremiumUser(true);
          } else {
            // Fetch profile for latest premium status
            const { userService } = await import('@/services/api');
            const res = await userService.getProfile();
            const expiry = res.data.premiumExpiry ? new Date(res.data.premiumExpiry) : null;
            setIsPremiumUser(res.data.isPremium && expiry && expiry > new Date());
          }

          // Fetch progress
          const { readingProgressService, favoriteService, ratingService } = await import('@/services/api');
          const progressRes = await readingProgressService.getByStory(story.id);
          if (progressRes.data && progressRes.data.lastChapterId) {
            setReadingProgress(progressRes.data);
          }

          // Check favorite
          const favRes = await favoriteService.check(story.id);
          setIsFavorite(favRes.data);

          // Get Rating
          const ratingRes = await ratingService.getRating(story.id);
          setAvgRating(ratingRes.data.averageRating);
          setRatingCount(ratingRes.data.ratingCount);

          const myRatingRes = await ratingService.getMyRating(story.id);
          setUserRating(myRatingRes.data);
        } else {
          setIsPremiumUser(false);
          setIsFavorite(false);
          
          // Still fetch public rating
          const { ratingService } = await import('@/services/api');
          const ratingRes = await ratingService.getRating(story.id);
          setAvgRating(ratingRes.data.averageRating);
          setRatingCount(ratingRes.data.ratingCount);
        }
      } catch (e) {
        console.error("Failed to load user data", e);
        setIsPremiumUser(false);
      } finally {
        setCheckingPremium(false);
      }
    };
    fetchUserData();
  }, [story.id]);

  const formatStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'ONGOING': return 'Đang ra';
      case 'DROPPED': return 'Tạm ngưng';
      case 'COMING_SOON': return 'Sắp ra mắt';
      default: return status || 'Đang ra';
    }
  }

  const displayUpdateDate = story.updatedAt || (chapters.length > 0 ? new Date(chapters[chapters.length - 1].createdAt).toLocaleDateString() : 'Vừa xong');

  const handleToggleFavorite = async () => {
    try {
      const { favoriteService } = await import("@/services/api");
      const res = await favoriteService.toggle(story.id);
      setIsFavorite(res.data);
    } catch (error) {
      console.error("Failed to toggle favorite", error);
      alert("Bạn cần đăng nhập để thực hiện tính năng này.");
    }
  }

  const handleRate = async (stars: number) => {
    try {
      const { ratingService } = await import("@/services/api");
      const res = await ratingService.rate(story.id, stars);
      setAvgRating(res.data.averageRating);
      setRatingCount(res.data.ratingCount);
      setUserRating(stars);
    } catch (error) {
      console.error("Failed to rate", error);
      alert("Bạn cần đăng nhập để đánh giá.");
    }
  }

  return (
    <div>
      {/* Story Header */}
      <div className="relative overflow-hidden">
        {/* Background Blur */}
        <div className="absolute inset-0">
          <img
            src={story.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=60"}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:gap-8">
            {/* Cover */}
            <div className="flex-shrink-0 self-center md:self-start">
              <div className="relative h-72 w-48 overflow-hidden rounded-lg shadow-2xl md:h-80 md:w-56 bg-muted">
                <img
                  src={story.coverImage || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop&q=60"}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col">
              <h1 className="text-center font-serif text-2xl font-bold text-foreground md:text-left md:text-3xl lg:text-4xl">
                {story.title}
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground md:text-left">
                Tác giả: <span className="font-medium text-foreground">{story.author || "Đang cập nhật"}</span>
              </p>

              {/* Stats & Rating */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 group/rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 cursor-pointer transition-all duration-200 ${
                          star <= (hoverRating || userRating || Math.round(avgRating))
                            ? "fill-amber-400 text-amber-400 scale-110"
                            : "text-muted-foreground/40 hover:text-amber-200"
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRate(star)}
                      />
                    ))}
                    <span className="ml-2 font-black text-foreground text-lg">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground font-medium">({ratingCount} đánh giá)</span>
                  </div>
                </div>
                <div className="h-4 w-px bg-border hidden md:block" />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <Eye className="h-4 w-4" />
                  <span>{formatViews(story.viewCount)} lượt đọc</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <BookOpen className="h-4 w-4" />
                  <span>{chapters.length} chương</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                  <Clock className="h-4 w-4" />
                  <span>{displayUpdateDate}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Badge
                  variant={story.status?.toUpperCase() === "COMPLETED" ? "default" : "secondary"}
                >
                  {formatStatus(story.status)}
                </Badge>
                {story.isPremium && (
                  <Badge variant="destructive" className="bg-amber-500 text-white border-none flex items-center gap-1">
                    <Star className="h-3 w-3 fill-white" /> Premium
                  </Badge>
                )}
                {story.genres?.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>

              {/* Description */}
              <div className="mt-5 text-sm leading-relaxed text-muted-foreground max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {story.description || "Chưa có mô tả cho truyện này."}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {readingProgress ? (
                  <Button asChild size="lg" className="font-medium">
                    <Link to={`/story/${story.id}/read/${readingProgress.lastChapterId}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Tiếp tục (Chương {readingProgress.lastChapterNumber})
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="font-medium" disabled={chapters.length === 0}>
                    <Link to={`/story/${story.id}/read/${chapters[0]?.id || 1}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Đọc Từ Đầu
                    </Link>
                  </Button>
                )}

                <Button asChild variant="outline" size="lg" className="font-medium" disabled={chapters.length === 0}>
                  <Link to={`/story/${story.id}/read/${chapters[chapters.length - 1]?.id || 1}`}>
                    Đọc Mới Nhất
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`transition-colors ${isFavorite ? 'text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-destructive'}`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="sr-only">Yêu thích</span>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Chia sẻ</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {/* Chapter List Area */}
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
          <div className="rounded-lg border border-border bg-card">
            {/* Chapter Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Danh Sách Chương
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({chapters.length} chương)
                </span>
                {story.isPremium && !isPremiumUser && !checkingPremium && (
                  <Badge variant="destructive" className="bg-amber-500 text-white border-none ml-2 text-[10px] uppercase font-black tracking-widest hidden sm:flex">
                    <Star size={10} fill="currentColor" className="mr-1" /> Premium Content
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="text-sm text-muted-foreground"
              >
                {sortOrder === "desc" ? (
                  <>
                    Mới nhất <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Cũ nhất <ChevronUp className="ml-1 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Chapter Items */}
            <div className="divide-y divide-border">
              {chapters.length > 0 ? (
                sortedChapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    to={`/story/${story.id}/read/${chapter.id}`}
                    className="group/chapter flex items-center justify-between px-4 py-3 transition-all hover:bg-indigo-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground group-hover/chapter:text-indigo-600 transition-colors">
                        Chương {chapter.chapterNumber}: {chapter.title}
                      </span>
                      {story.isPremium && !isPremiumUser && !checkingPremium && (
                        <Lock size={12} className="text-amber-500 opacity-50" />
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">
                        {new Date(chapter.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground italic">
                  Chưa có chương nào được cập nhật.
                </div>
              )}
            </div>

            {/* Show More */}
            {!showAllChapters && chapters.length > 20 && (
              <div className="border-t border-border p-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllChapters(true)}
                  className="font-medium"
                >
                  Xem thêm {chapters.length - 20} chương
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
