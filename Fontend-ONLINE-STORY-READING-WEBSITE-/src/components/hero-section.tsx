
import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, Users, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt=""
         
          className="absolute inset-0 w-full h-full object-cover"
         
         
         />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/70 to-foreground/40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            Doc truyen online mien phi
          </p>
          <h1 className="font-serif text-4xl font-bold leading-tight text-card md:text-5xl lg:text-6xl">
            <span className="text-balance">
              Kho Truyen
              <br />
              Khong Lo
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-card/80 md:text-lg">
            Hang ngan cau truyen hay tu nhieu the loai khac nhau. Tu tien hiep, kiem hiep den ngon tinh, do thi - tat ca deu o day.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="font-medium">
              <Link to="/category/all">
                Kham Pha Ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-card/30 bg-transparent font-medium text-card hover:bg-card/10 hover:text-card"
            >
              <Link to="/category/all">Truyen Hot</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap items-center gap-6 md:gap-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/15">
                <BookOpen className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold text-card">10,000+</p>
                <p className="text-xs text-card/60">Dau truyen</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/15">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold text-card">500K+</p>
                <p className="text-xs text-card/60">Doc gia</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/15">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold text-card">24/7</p>
                <p className="text-xs text-card/60">Cap nhat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
