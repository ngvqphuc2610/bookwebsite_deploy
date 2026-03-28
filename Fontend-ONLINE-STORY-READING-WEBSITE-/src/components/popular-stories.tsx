import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { storyService } from "@/services/api"
import { StoryCard } from "@/components/story-card"

export function PopularStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await storyService.getPopular(5)
        setStories(response.data.content || [])
      } catch (error) {
        console.error("Failed to fetch popular stories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPopular()
  }, [])

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="h-64 w-full animate-pulse rounded-lg bg-secondary/50" />
    </div>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Truyen Hot Nhat
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nhung cau truyen duoc doc nhieu nhat
          </p>
        </div>
        <Link to="/category/all"
          className="text-sm font-medium text-primary hover:underline"
        >
          Xem tat ca
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {stories.map((story: any) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  )
}
