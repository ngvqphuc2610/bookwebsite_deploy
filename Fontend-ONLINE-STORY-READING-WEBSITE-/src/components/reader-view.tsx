
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  Settings,
  X,
  Sun,
  Moon,
  Minus,
  Plus,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Story } from "@/lib/data"



const sampleContent = [
  "Binh minh le loi tren dinh nui Thuong Thanh, nhung tia nang vang ruc chieu xuong khu rung co thu, lam nhung giot suong mai lap lanh nhu nhung vien ngoc. Tu Minh dung tren mot mom da, nhin xuong tham cung phia duoi, noi tieng gio ru ri nhu loi thi tham cua nguoi xua.",
  "Da hon ba nam ke tu ngay cau roi khoi lang Vong Nguyet, mot ngoi lang nho nam o tan cung phia nam cua luc dia. Ba nam, du dai du de cau tu mot thieu nien binh thuong tro thanh mot ke lang thang, nhung chua du de cau quen di loi hua nam xua.",
  "\"Ta se quay ve,\" cau da noi voi Tieu Lan nhu vay, truoc khi buoc chan len con duong vo dinh. Co gai ay da khoc, nuoc mat roi tren nhung canh hoa dao vua no, nhung cau van quyet tam ra di. Boi vi cau biet, chi co tro nen manh me hon, cau moi co the bao ve nhung nguoi minh yeu thuong.",
  "Con duong tu luyen chua bao gio de dang. Tu Minh da hoc duoc dieu do qua nhung lan suyt mat mang. Lan dau tien la khi cau doi mat voi mot con yeu thu cap Tam o rung Huyen Am. Neu khong co su giup do bat ngo cua mot vi cao nhan bi an, co le cau da tro thanh bua an cua con quai vat ay tu lau.",
  "Vi cao nhan ay tu xung la Phong Lao, mot lao nhan gop lung voi mai toc bac trang nhu tuyet. Ong da truyen cho Tu Minh ba chieu thuc co ban cua Phong Van Kiem Phap, mot mon kiem thuat da that truyen tu hang tram nam truoc. \"Kiem la su keo dai cua tam hon,\" Phong Lao da noi, \"Khi tam tinh, kiem sac. Khi tam loan, kiem guc.\"",
  "Tu do, Tu Minh bat dau hanh trinh tu luyen that su cua minh. Ban ngay, cau luyen kiem. Ban dem, cau ngoi thien dinh, cam nhan linh khi cua troi dat. Moi ngay troi qua, cau cam thay suc manh trong co the minh tang len tu tu, nhu mot dong suoi nho dan hoi tu thanh mot dong song.",
  "Nhung su that ve than the cua cau con bi an hon nhieu. Vao mot dem trang tron, khi dang ngoi thien, Tu Minh bat ngo roi vao mot trang thai ky la. Cau nhin thay mot khong gian bao la, noi hang ngan vi tinh dang toa sang. Mot giong noi vang len tu hu khong: \"Nguoi da den...\"",
  "Tu Minh giat minh tinh giac, mo hoi uot dam. Cau nhin xuong ban tay minh - mot dieu gi do da thay doi. Tren long ban tay trai cua cau, mot van ky la da xuat hien, toa ra anh sang yeu ot trong dem toi. Cau khong biet van do la gi, nhung cau cam nhan duoc mot suc manh vi dai dang an nau ben trong.",
  "Sang hom sau, Phong Lao nhin thay van tren tay Tu Minh va khuon mat lao nhan bien sac. \"Thien Menh An...\" ong thi tham, giong run run. \"Khong the nao... ta tuong no da bien mat tu van nam truoc...\" Roi ong quay sang Tu Minh, anh mat day phuc tap: \"Con a, tu nay tro di, con duong cua con se khong con binh yen nua.\"",
  "Tu Minh khong hieu het y nghia cua nhung loi do, nhung cau cam nhan duoc su nghiem trong trong giong noi cua Phong Lao. Cau nam chat nam tay, nhin ra phia chan troi xa xam. Du phai doi mat voi bat cu dieu gi, cau se khong lui buoc. Vi Tieu Lan, vi lang Vong Nguyet, va vi chinh ban than minh.",
]

export function ReaderView({ story, currentChapter }: ReaderViewProps) {
  const [fontSize, setFontSize] = useState(18)
  const [isDark, setIsDark] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNav, setShowNav] = useState(true)
  const [lineHeight, setLineHeight] = useState(1.8)

  const totalChapters = Math.min(story.chapters, 50)
  const hasPrev = currentChapter > 1
  const hasNext = currentChapter < totalChapters

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    return () => {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  // Auto-hide nav on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false)
        setShowSettings(false)
      } else {
        setShowNav(true)
      }
      lastScrollY = currentScrollY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const chapterTitle = `Chuong ${currentChapter}`

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div
        className={`fixed left-0 right-0 top-0 z-50 border-b border-border bg-card/95 backdrop-blur transition-transform duration-300 ${
          showNav ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
              <Link to={`/story/${story.id}`}>
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Quay lai</span>
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {story.title}
              </p>
              <p className="text-xs text-muted-foreground">{chapterTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
              <Link to="/">
                <Home className="h-4 w-4" />
                <span className="sr-only">Trang chu</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
              <Link to={`/story/${story.id}`}>
                <List className="h-4 w-4" />
                <span className="sr-only">Danh sach chuong</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-muted-foreground"
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Cai dat</span>
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="border-t border-border bg-card px-4 py-4">
            <div className="mx-auto max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Cai Dat Doc</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="h-7 w-7 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col gap-4">
                {/* Font Size */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Type className="h-4 w-4" />
                    <span>Co chu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium text-foreground">
                      {fontSize}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setFontSize(Math.min(28, fontSize + 2))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Line Height */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>Giãn dong</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setLineHeight(Math.max(1.4, lineHeight - 0.2))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium text-foreground">
                      {lineHeight.toFixed(1)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setLineHeight(Math.min(2.4, lineHeight + 0.2))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Theme */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    <span>Giao dien</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDark(!isDark)}
                    className="text-sm"
                  >
                    {isDark ? "Toi" : "Sang"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-20">
        {/* Chapter Title */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            {chapterTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {story.title} - {story.author}
          </p>
        </div>

        {/* Chapter Content */}
        <div
          className="space-y-4 text-foreground"
          style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
        >
          {sampleContent.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Chapter Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          {hasPrev ? (
            <Button asChild variant="outline" className="font-medium">
              <Link to={`/story/${story.id}/read/${currentChapter - 1}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Chuong truoc
              </Link>
            </Button>
          ) : (
            <div />
          )}
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link to={`/story/${story.id}`}>
              <List className="mr-1 h-4 w-4" />
              Muc luc
            </Link>
          </Button>
          {hasNext ? (
            <Button asChild variant="outline" className="font-medium">
              <Link to={`/story/${story.id}/read/${currentChapter + 1}`}>
                Chuong sau
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </article>

      {/* Bottom Navigation (Fixed) */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur transition-transform duration-300 ${
          showNav ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
          {hasPrev ? (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to={`/story/${story.id}/read/${currentChapter - 1}`}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Truoc
              </Link>
            </Button>
          ) : (
            <div className="w-20" />
          )}
          <span className="text-xs text-muted-foreground">
            {currentChapter} / {totalChapters}
          </span>
          {hasNext ? (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to={`/story/${story.id}/read/${currentChapter + 1}`}>
                Sau
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="w-20" />
          )}
        </div>
      </div>
    </div>
  )
}
