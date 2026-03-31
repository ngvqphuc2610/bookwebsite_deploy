
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { BookOpen, Search, Menu, X, User, ChevronDown, LogOut, LayoutDashboard, Settings, Crown, Heart, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { genreService, getServerUrl, mangaSearchService } from "@/services/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  
  const [user, setUser] = useState(null)
  const [categories, setCategories] = useState([])
  
  const navigate = useNavigate()
  const searchRef = useRef(null)
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Predictive Search: Debounce UI Input -> call API
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          // Lấy nhanh 5 kết quả
          const response = await mangaSearchService.search(searchQuery.trim(), 5)
          setSearchResults(response.data.results || [])
          setShowDropdown(true)
        } catch (error) {
          console.error("Predictive search failed:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 400) // 400ms delay

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])
  
  const hasRole = (roleNames) => {
    if (!user || !user.roles || !Array.isArray(user.roles)) return false;
    return user.roles.some(r => {
      const name = typeof r === 'string' ? r : r?.name;
      if (!name) return false;
      const upperName = name.toUpperCase();
      return roleNames.some(target => {
        const upperTarget = target.toUpperCase();
        return upperName === upperTarget || upperName === `ROLE_${upperTarget}`;
      });
    });
  };

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }

    const fetchGenres = async () => {
      try {
        const response = await genreService.getAll()
        setCategories(response.data || [])
      } catch (error) {
        console.error("Failed to fetch genres:", error)
      }
    }
    fetchGenres()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [window.location.search]);

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  }

  const navigateToStory = (slug) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/story/${slug}`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl text-slate-900 tracking-tight leading-none uppercase">
              Truyen<span className="text-indigo-600">Hay</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premium Reading</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link to="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Trang Chu
          </Link>
          <div className="group relative">
            <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              The Loai
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-64 rounded-lg border border-border bg-card p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/category/all?type=ongoing"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Truyen Moi
          </Link>
          <Link to="/category/all?type=completed"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Hoan Thanh
          </Link>
          <Link to="/premium"
            className="rounded-md px-3 py-2 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 font-bold"
          >
            Premium
          </Link>
          <Link to="/favorites"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground flex items-center gap-1.5"
          >
            Yêu thích
          </Link>
          <Link to="/support"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Hỗ trợ
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              placeholder="Tim truyen..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value.trim().length > 0) setShowDropdown(true)
              }}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowDropdown(true)
              }}
              onKeyDown={handleSearch}
              className="w-56 bg-secondary text-foreground pl-9 text-sm focus-visible:ring-indigo-500 transition-all border-transparent focus:border-indigo-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent pt-1"></div>
              </div>
            )}
            
            {/* Desktop Predictive Search Dropdown */}
            {showDropdown && searchQuery.trim().length >= 2 && (
              <div className="absolute top-12 left-0 w-[320px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-border bg-secondary/50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kết quả tìm kiếm</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">✨ AI Match</span>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto p-1">
                  {searchResults.length > 0 ? (
                    searchResults.map((story) => (
                      <div 
                        key={story.storyId} 
                        onClick={() => navigateToStory(story.slug || story.storyId)}
                        className="flex items-start gap-3 p-2 hover:bg-secondary rounded-lg cursor-pointer transition-colors group"
                      >
                          <img 
                            src={getServerUrl(story.coverImage)} 
                            alt={story.title} 
                            className="w-10 h-14 object-cover rounded shadow-sm border border-border group-hover:border-indigo-200 transition-all"
                            onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x150?text=No+Cover' }}
                          />
                        <div className="flex flex-col flex-1 overflow-hidden">
                          <span className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-indigo-600 transition-colors">{story.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">{story.author || 'Đang cập nhật'}</span>
                          <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                            {story.genres?.join(', ') || 'Chưa cập nhật'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : !isSearching ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Không tìm thấy kết quả nào.
                    </div>
                  ) : null}
                </div>
                
                {searchResults.length > 0 && (
                  <div 
                    onClick={() => handleSearch({ key: 'Enter' })} // trigger view all
                    className="p-3 bg-card border-t border-border hover:bg-secondary text-center cursor-pointer transition-colors"
                  >
                    <span className="text-xs font-bold text-indigo-600">Xem tất cả kết quả ({searchQuery}) &rarr;</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={getServerUrl(user.avatar)} alt={user.username} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal font-sans">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.roles?.map(r => r.name).join(', ')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ của tôi</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4 text-rose-500" />
                    <span>Truyện yêu thích</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/support" className="cursor-pointer">
                    <Headphones className="mr-2 h-4 w-4 text-indigo-500" />
                    <span>Trung tâm hỗ trợ</span>
                  </Link>
                </DropdownMenuItem>
                {hasRole(['ADMIN', 'STAFF']) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Quản trị viên</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/staff/premium" className="cursor-pointer">
                        <Crown className="mr-2 h-4 w-4 text-amber-500" />
                        <span>Quản lý Premium</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
              <Link to="/login">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="text-muted-foreground"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-muted-foreground"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search */}
      {isSearchOpen && (
        <div className="border-t border-border px-4 py-3 lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tim truyen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-secondary pl-9"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-border lg:hidden">
          <nav className="flex flex-col px-4 py-2">
            <Link to="/"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang Chu
            </Link>
            <Link to="/category/all"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Truyen Moi
            </Link>
            <Link to="/category/all"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Hoan Thanh
            </Link>
            <Link to="/favorites"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Yêu thích
            </Link>
            <div className="py-1">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                The Loai
              </p>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {user ? (
              <div className="mt-4 border-t border-border pt-4 px-3">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getServerUrl(user.avatar)} alt={user.username} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {user.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.roles?.map(r => r.name).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link to="/profile" className="flex items-center py-2 text-sm font-medium text-muted-foreground" onClick={() => setIsMenuOpen(false)}>
                    <User className="mr-2 h-4 w-4" /> Hồ sơ của tôi
                  </Link>
                  <Link to="/support" className="flex items-center py-2 text-sm font-medium text-muted-foreground" onClick={() => setIsMenuOpen(false)}>
                    <Headphones className="mr-2 h-4 w-4" /> Hỗ trợ khách hàng
                  </Link>
                  {hasRole(['ADMIN', 'STAFF']) && (
                    <Link to="/admin" className="flex items-center py-2 text-sm font-medium text-muted-foreground" onClick={() => setIsMenuOpen(false)}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Quản trị viên
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center py-2 text-sm font-medium text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t border-border pt-4 px-3">
                <Link to="/login" className="flex items-center py-2 text-sm font-medium text-primary" onClick={() => setIsMenuOpen(false)}>
                  <User className="mr-2 h-4 w-4" /> Đăng nhập / Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
