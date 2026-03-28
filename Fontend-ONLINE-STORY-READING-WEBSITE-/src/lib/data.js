export const categories = [
    { name: "Tien Hiep", slug: "tien-hiep", icon: "sparkles", count: 1240 },
    { name: "Kiem Hiep", slug: "kiem-hiep", icon: "swords", count: 856 },
    { name: "Ngon Tinh", slug: "ngon-tinh", icon: "heart", count: 2103 },
    { name: "Do Thi", slug: "do-thi", icon: "building", count: 1567 },
    { name: "Huyen Huyen", slug: "huyen-huyen", icon: "flame", count: 943 },
    { name: "Lich Su", slug: "lich-su", icon: "scroll", count: 421 },
    { name: "Khoa Huyen", slug: "khoa-huyen", icon: "rocket", count: 312 },
    { name: "Kinh Di", slug: "kinh-di", icon: "ghost", count: 278 },
]

export const stories = [
    {
        id: "1",
        title: "Than Dao Dan Ton",
        author: "Co Don Phieu Luu",
        cover: "/images/cover-1.jpg",
        category: "Tien Hiep",
        categorySlug: "tien-hiep",
        description: "Mot cau truyen tu tien huyen ao, noi nhan vat chinh tu mot ke yeu duoi tro thanh cuong gia dinh cao, chinh phuc tam gioi va vuot qua muon van thu thach de dat duoc dao qua toi thuong.",
        chapters: 2456,
        views: 1250000,
        rating: 4.8,
        status: "ongoing",
        tags: ["Tien Hiep", "Tu Tien", "Huyen Ao"],
        updatedAt: "2 gio truoc",
    },
    {
        id: "2",
        title: "Tinh Yeu Giua Mua Hoa",
        author: "Lam Tuong Nhu",
        cover: "/images/cover-2.jpg",
        category: "Ngon Tinh",
        categorySlug: "ngon-tinh",
        description: "Cau chuyen tinh yeu lang man giua hai nguoi tre, tu nhung cuoc gap tinh co den tinh cam sau dam, vuot qua rao can xa hoi de den voi nhau.",
        chapters: 186,
        views: 890000,
        rating: 4.6,
        status: "completed",
        tags: ["Ngon Tinh", "Lang Man", "Hien Dai"],
        updatedAt: "1 ngay truoc",
    },
    {
        id: "3",
        title: "Kiem Thanh Vo Song",
        author: "Phong Van Ke",
        cover: "/images/cover-3.jpg",
        category: "Kiem Hiep",
        categorySlug: "kiem-hiep",
        description: "Mot thanh nien tinh co co duoc thanh kiem co, tu do buoc vao giang ho day song gio, tro thanh kiem thanh vo song thien ha.",
        chapters: 1024,
        views: 2100000,
        rating: 4.9,
        status: "ongoing",
        tags: ["Kiem Hiep", "Vo Thuat", "Giang Ho"],
        updatedAt: "3 gio truoc",
    },
    {
        id: "4",
        title: "Tong Tai Cuong Hoang",
        author: "Mac Than",
        cover: "/images/cover-4.jpg",
        category: "Do Thi",
        categorySlug: "do-thi",
        description: "Tu mot cau hoc sinh binh thuong, nhan vat chinh bat dau cuoc hanh trinh chinh phuc the gioi kinh doanh va tro thanh tong tai quyen luc nhat thanh pho.",
        chapters: 756,
        views: 1780000,
        rating: 4.5,
        status: "ongoing",
        tags: ["Do Thi", "He Thong", "Kinh Doanh"],
        updatedAt: "5 gio truoc",
    },
    {
        id: "5",
        title: "Huyen Gioi Chi Vuong",
        author: "Thien Ma Tien Sinh",
        cover: "/images/cover-5.jpg",
        category: "Huyen Huyen",
        categorySlug: "huyen-huyen",
        description: "Trong the gioi noi yeu thu hoanh hanh, mot trang trai tre mang trong minh huyet thong co dai, chien dau de bao ve nhan loai va kham pha bi mat cua huyen gioi.",
        chapters: 1890,
        views: 3200000,
        rating: 4.7,
        status: "ongoing",
        tags: ["Huyen Huyen", "Di Gioi", "Chien Dau"],
        updatedAt: "1 gio truoc",
    },
    {
        id: "6",
        title: "Hoang Hau Tro Ve Tu Tuong Lai",
        author: "Phuong Lam",
        cover: "/images/cover-6.jpg",
        category: "Lich Su",
        categorySlug: "lich-su",
        description: "Mot hoang hau thong minh xuyen khong tu tuong lai ve qua khu... ",
        chapters: 342,
        views: 670000,
        rating: 4.4,
        status: "completed",
        tags: ["Lich Su", "Xuyen Khong", "Cung Dau"],
        updatedAt: "3 ngay truoc",
    },
    {
        id: "7",
        title: "Am Duong Su Hoi Ky",
        author: "Tran Phong",
        cover: "/images/cover-7.jpg",
        category: "Kinh Di",
        categorySlug: "kinh-di",
        description: "Chuyen ve mot am duong su tre tuoi...",
        chapters: 489,
        views: 920000,
        rating: 4.3,
        status: "ongoing",
        tags: ["Kinh Di", "Linh Di", "Huyen Bi"],
        updatedAt: "6 gio truoc",
    },
    {
        id: "8",
        title: "Tinh Tu Huy Diet",
        author: "Vu Tru Hanh Gia",
        cover: "/images/cover-8.jpg",
        category: "Khoa Huyen",
        categorySlug: "khoa-huyen",
        description: "Cuoc chien ngoai vu tru...",
        chapters: 567,
        views: 450000,
        rating: 4.6,
        status: "ongoing",
        tags: ["Khoa Huyen", "Vu Tru", "Tuong Lai"],
        updatedAt: "12 gio truoc",
    },
]

export function generateChapters(totalChapters) {
    const chapters = []
    for (let i = 1; i <= Math.min(totalChapters, 50); i++) {
        chapters.push({
            id: i,
            title: `Chuong ${i}: ${getChapterTitle(i)}`,
            createdAt: getRandomDate(i),
            views: Math.floor(Math.random() * 50000) + 1000,
        })
    }
    return chapters
}

function getChapterTitle(index) {
    const titles = [
        "Khoi Dau Moi",
        "Cuoc Gap Go Dinh Menh",
        "Bi An Duoc He Lo",
        "Chien Dau Khong Ngung",
        "Con Duong Phia Truoc",
        "Suc Manh Thuc Tinh",
        "Doi Mat Ke Thu",
        "Giac Mo Va Hien Thuc",
        "Thach Thuc Moi",
        "Tam Quyet Sac Da",
        "Mat Tich",
        "Hoi Uc Xa Xam",
        "Anh Sang Va Bong Toi",
        "Noi Dau Chon Giau",
        "Phuong Bac",
        "Vuong Quoc Suy Tan",
        "Loi The Ngay Xua",
        "Suc Manh Bi An",
        "Mat Troi Lan",
        "Con Bao Sap Den",
    ]
    return titles[(index - 1) % titles.length]
}

function getRandomDate(index) {
    const daysAgo = Math.floor(index / 3)
    if (daysAgo === 0) return "Hom nay"
    if (daysAgo === 1) return "Hom qua"
    return `${daysAgo} ngay truoc`
}

export function formatViews(views) {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
}
