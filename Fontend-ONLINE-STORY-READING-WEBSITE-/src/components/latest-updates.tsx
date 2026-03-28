import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { storyService } from "@/services/api"
import { StoryCard } from "@/components/story-card"
import { Clock } from "lucide-react"

export function LatestUpdates() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await storyService.getLatest(6)
        setStories(response.data.content || [])
      } catch (error) {
        console.error("Failed to fetch latest stories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLatest()
  }, [])

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 w-full animate-pulse rounded-lg bg-secondary/50" />
        ))}
      </div>
    </div>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Moi Cap Nhat
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Truyen vua duoc cap nhat chuong moi
          </p>
        </div>
        <Link to="/category/all"
          className="text-sm font-medium text-primary hover:underline"
        >
          Xem tat ca
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((story: any) => (
          <div key={story.id} className="relative">
            <StoryCard story={story} variant="horizontal" />
            <div className="absolute right-3 top-3 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {story.updatedAt || 'Vừa xong'}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
