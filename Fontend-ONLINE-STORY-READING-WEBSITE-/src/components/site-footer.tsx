import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"
import { categories } from "@/lib/data"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-serif text-xl font-bold text-foreground">
                AlexStore
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Kho truyen online lon nhat Viet Nam. Doc truyen mien phi voi hang ngan dau truyen hay duoc cap nhat lien tuc.
            </p>
          </div>

          {/* The Loai */}
          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold text-foreground">
              The Loai
            </h3>
            <ul className="flex flex-col gap-2">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/category/${cat.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lien ket */}
          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold text-foreground">
              Lien Ket
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Trang Chu
                </Link>
              </li>
              <li>
                <Link to="/category/all"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Truyen Moi Cap Nhat
                </Link>
              </li>
              <li>
                <Link to="/category/all"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Truyen Hoan Thanh
                </Link>
              </li>
              <li>
                <Link to="/category/all"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Bang Xep Hang
                </Link>
              </li>
            </ul>
          </div>

          {/* Ho Tro */}
          <div>
            <h3 className="mb-4 font-serif text-sm font-semibold text-foreground">
              Ho Tro
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <span className="text-sm text-muted-foreground">
                  Dieu Khoan Su Dung
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Chinh Sach Bao Mat
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Lien He
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  FAQ
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; 2026 AlexStore. Moi quyen duoc bao luu.
          </p>
        </div>
      </div>
    </footer>
  )
}
