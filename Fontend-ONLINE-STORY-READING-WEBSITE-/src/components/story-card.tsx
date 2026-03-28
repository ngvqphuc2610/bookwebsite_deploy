import { Link } from "react-router-dom"
import { Eye, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getServerUrl } from "@/services/api"
import { formatViews } from "@/lib/data"

interface StoryCardProps {
  story: any
  variant?: "default" | "horizontal"
}

export function StoryCard({ story, variant = "default" }: StoryCardProps) {
  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/300x400?text=No+Cover'
    if (url.startsWith('http')) return url
    return getServerUrl(url)
  }

  const isCompleted = story.status === "COMPLETED"

  if (variant === "horizontal") {
    return (
      <Link to={`/story/${story.id}`}
        className="group flex gap-4 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-md"
      >
        <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <img
            src={getImageUrl(story.coverImage)}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h3 className="truncate font-serif text-sm font-semibold text-foreground group-hover:text-primary">
              {story.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {story.author || 'Đang cập nhật'}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {story.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {formatViews(story.viewCount || 0)}
            </span>
            <Badge
              variant={isCompleted ? "default" : "secondary"}
              className="text-[10px] px-1.5 py-0"
            >
              {isCompleted ? "Hoàn" : "Đang ra"}
            </Badge>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/story/${story.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={getImageUrl(story.coverImage)}
          alt={story.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <Badge
            variant={isCompleted ? "default" : "secondary"}
            className="text-[10px] mb-1"
          >
            {isCompleted ? "Hoàn Thành" : "Đang Ra"}
          </Badge>
        </div>
        {story.isPremium && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-yellow-500/80 px-2 py-0.5">
            <span className="text-[10px] font-bold text-white">VIP</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 font-serif text-sm font-semibold leading-tight text-foreground group-hover:text-primary">
          {story.title}
        </h3>
        <p className="text-xs text-muted-foreground">{story.author || 'Đang cập nhật'}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {formatViews(story.viewCount || 0)}
          </span>
        </div>
      </div>
    </Link>
  )
}
