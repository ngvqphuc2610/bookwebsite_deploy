
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Eye, Star, Trophy } from "lucide-react"
import { storyService } from "@/services/api"
import { formatViews } from "@/lib/data"

const tabs = [
  { label: "Doc Nhieu", value: "viewCount,desc" },
  { label: "Danh Gia Cao", value: "rating,desc" },
  { label: "Moi Cap Nhat", value: "createdAt,desc" },
]

export function RankingSection() {
  const [activeTab, setActiveTab] = useState("viewCount,desc")
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRanked = async () => {
      try {
        setLoading(true)
        let data;
        if (activeTab === "rating,desc") {
          const response = await storyService.getTopRated(10)
          data = response.data
        } else {
          const response = await storyService.getAll(0, 10, activeTab)
          data = response.data.content
        }
        setStories(data || [])
      } catch (error) {
        console.error("Failed to fetch ranked stories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRanked()
  }, [activeTab])

  const getAvatarUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/150'
    if (url.startsWith('http')) return url
    return `http://localhost:8080${url}`
  }

  return (
    <section className="bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Bang Xep Hang
          </h2>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-card p-1 w-fit border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 w-full animate-pulse rounded-lg bg-card border border-border" />
            ))
          ) : stories.map((story: any, index: number) => (
            <Link
              key={story.id}
              to={`/story/${story.id}`}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              {/* Rank Number */}
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${index === 0
                    ? "bg-accent text-accent-foreground"
                    : index === 1
                      ? "bg-muted-foreground/20 text-foreground"
                      : index === 2
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
              >
                {index + 1}
              </div>

              {/* Cover */}
              <div className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={getAvatarUrl(story.coverImage)}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h3 className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                  {story.title}
                </h3>
                <p className="text-xs text-muted-foreground">{story.author}</p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {formatViews(story.viewCount || 0)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
