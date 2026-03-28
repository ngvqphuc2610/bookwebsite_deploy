
import { useState } from "react"
import { Link } from "react-router-dom"
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { StoryCard } from "@/components/story-card"
import { stories, categories } from "@/lib/data"



export function CategoryPageContent({ slug, categoryName }: CategoryPageContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "completed">("all")
  const [sortBy, setSortBy] = useState<"views" | "rating" | "chapters">("views")

  const filteredStories = stories.filter((story) => {
    const matchesCategory = slug === "all" || story.categorySlug === slug
    const matchesSearch =
      searchQuery === "" ||
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || story.status === statusFilter
    return matchesCategory && matchesSearch && matchesStatus
  })

  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === "views") return b.views - a.views
    if (sortBy === "rating") return b.rating - a.rating
    if (sortBy === "chapters") return b.chapters - a.chapters
    return 0
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link to="/" className="hover:text-primary">
            Trang Chu
          </Link>
          <span>/</span>
          <span className="text-foreground">{categoryName}</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          {categoryName}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {slug === "all"
            ? "Tat ca truyen trong thu vien"
            : `Kham pha nhung cau truyen ${categoryName} hay nhat`}
        </p>
      </div>

      {/* Category Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/category/all">
          <Badge
            variant={slug === "all" ? "default" : "outline"}
            className="cursor-pointer px-3 py-1 text-sm"
          >
            Tat Ca
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/category/${cat.slug}`}>
            <Badge
              variant={slug === cat.slug ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm"
            >
              {cat.name}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tim truyen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex gap-1 rounded-md border border-border p-0.5">
            {(["all", "ongoing", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === status
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status === "all"
                  ? "Tat ca"
                  : status === "ongoing"
                    ? "Dang ra"
                    : "Hoan thanh"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground"
          >
            <option value="views">Luot doc</option>
            <option value="rating">Danh gia</option>
            <option value="chapters">So chuong</option>
          </select>

          {/* View Mode */}
          <div className="flex gap-1 rounded-md border border-border p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded p-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded p-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="mb-4 text-sm text-muted-foreground">
        Tim thay <span className="font-semibold text-foreground">{sortedStories.length}</span> truyen
      </p>

      {/* Stories */}
      {sortedStories.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sortedStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sortedStories.map((story) => (
              <StoryCard key={story.id} story={story} variant="horizontal" />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Khong tim thay truyen nao
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Thu thay doi bo loc hoac tu khoa tim kiem
          </p>
        </div>
      )}
    </div>
  )
}
