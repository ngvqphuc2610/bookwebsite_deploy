import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Sparkles,
  Swords,
  Heart,
  Building2,
  Flame,
  Scroll,
  Rocket,
  Ghost,
} from "lucide-react"
import { genreService } from "@/services/api"

const iconMap: Record<string, React.ElementType> = {
  "Tien Hiep": Sparkles,
  "Kiem Hiep": Swords,
  "Ngon Tinh": Heart,
  "Do Thi": Building2,
  "Huyen Huyen": Flame,
  "Lich Su": Scroll,
  "Khoa Huyen": Rocket,
  "Kinh Di": Ghost,
}

export function CategoryGrid() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await genreService.getAll()
        setCategories(response.data || [])
      } catch (error) {
        console.error("Failed to fetch genres:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchGenres()
  }, [])

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-secondary/50" />
        ))}
      </div>
    </div>
  )

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            The Loai Truyen
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kham pha truyen theo the loai yeu thich
          </p>
        </div>
        <Link to="/category/all"
          className="text-sm font-medium text-primary hover:underline"
        >
          Xem tat ca
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {categories.map((cat: any) => {
          const Icon = iconMap[cat.name] || Sparkles
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {cat.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Xem ngay
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
