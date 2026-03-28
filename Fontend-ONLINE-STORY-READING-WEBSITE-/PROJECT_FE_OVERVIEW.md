# Frontend – Online Story Reading Website

> Cập nhật: 05/03/2026

---

## 1. Tech Stack

| Loại | Thư viện / Công cụ | Phiên bản |
|---|---|---|
| Framework UI | React | 19.x |
| Build Tool | Vite | 7.x |
| Routing | React Router DOM | 7.x |
| HTTP Client | Axios | 1.x |
| Animation | Framer Motion | 12.x |
| Icon | Lucide React | 0.564.x |
| CSS Utility | clsx + tailwind-merge | latest |
| Styling | CSS Modules thuần (per-page .css) | — |
| Linting | ESLint 9 + eslint-plugin-react-hooks | 9.x |
| Language | JavaScript (JSX) | ES Module |

**Backend kết nối:** Spring Boot tại `http://localhost:8080/api` (JWT Bearer Token)

---

## 2. Cấu trúc thư mục

```
src/
├── App.jsx               # Router chính, layout wrapper
├── App.css               # Global style, biến CSS
├── index.css             # Reset, font
├── main.jsx              # Entry point
├── assets/               # Tài nguyên tĩnh
├── components/
│   ├── Navbar.jsx        # Thanh điều hướng toàn cục
│   └── Navbar.css
├── pages/
│   ├── Home.jsx          # Trang chủ
│   ├── Home.css
│   ├── Login.jsx         # Đăng nhập / Đăng ký (dùng chung 1 file)
│   ├── Auth.css
│   ├── AdminUserManagement.jsx  # Quản lý người dùng (ADMIN)
│   ├── AdminUserManagement.css
│   ├── AdminDashboard.jsx       # Quản lý truyện – CRUD (STAFF/ADMIN)
│   ├── AdminDashboard.css
│   ├── StaffDashboard.jsx       # Import truyện từ nguồn ngoài (STAFF)
│   └── StaffDashboard.css
└── services/
    └── api.js            # Tầng gọi API tập trung (axios instance + services)
```

---

## 3. Những tính năng đã xây dựng

### 3.1 Navbar (`/components/Navbar.jsx`)
- Logo + tên site **Nhom8 Story**
- Thanh tìm kiếm (UI placeholder, chưa có logic)
- Navigation links: Thể loại · Admin · Staff · Premium
- Hiển thị / ẩn link Admin và Staff theo vai trò lưu trong `localStorage`
- Avatar + tên người dùng sau đăng nhập
- Nút Đăng xuất (xoá token, redirect về `/login`)
- Nút mobile menu (UI, chưa có logic mở sidebar)

### 3.2 Trang chủ (`/`)
- **Hero section** với CTA "Bắt đầu đọc" và "Gói Premium"
- **Trending Stories grid** – gọi `GET /api/stories?page=0&size=8`
- Fallback mock data nếu backend trả về rỗng hoặc lỗi kết nối
- Hiển thị bìa, tên truyện, tác giả, rating, lượt đọc

### 3.3 Đăng nhập / Đăng ký (`/login`)
- Một trang duy nhất, chuyển đổi qua tab
- **Đăng nhập:** gửi `POST /api/auth/login`, lưu JWT và thông tin user vào `localStorage`
- **Đăng ký:** hỗ trợ upload avatar (`multipart/form-data`), gửi `POST /api/auth/register`
- Redirect về trang chủ sau khi đăng nhập thành công

### 3.4 Quản lý người dùng (`/admin`) – Chỉ ADMIN
- Danh sách toàn bộ người dùng, có tìm kiếm với debounce 500ms
- **Modal Phân quyền:** chọn vai trò từ danh sách `GET /api/admin/roles`
- **Modal Sửa thông tin:** cập nhật username, email, fullName
- **Toggle trạng thái** khoá / mở khoá tài khoản
- Thông báo slide-in (success / error) tự tắt sau 3 giây

### 3.5 Quản lý truyện – CRUD (`/staff`) – STAFF + ADMIN
- Danh sách truyện với tìm kiếm
- **Modal thêm / sửa truyện:** title, slug, author, description, cover image URL, status (ONGOING / COMPLETED), flag isPremium
- Xoá truyện với gọi `DELETE /api/stories/:id`
- Sidebar điều hướng nội bộ Staff Panel

### 3.6 Import truyện từ nguồn ngoài (`/staff/import`) – STAFF + ADMIN
- Tìm kiếm truyện qua **OTruyenAPI** (`https://otruyenapi.com/v1/api/tim-kiem`)
- Lấy chi tiết đầy đủ rồi map sang schema nội bộ (title, slug, author, description, coverImage, status, genres)
- Gửi `POST /api/stories/import` để lưu vào database
- Tracking trạng thái import từng mục: loading / success / error riêng biệt

### 3.7 Tầng Service (`/services/api.js`)
| Service | Endpoints |
|---|---|
| `storyService` | getAll, getById, search, create, update, delete |
| `authService` | login, register (multipart) |
| `userService` | getAll, create, update, delete, toggleStatus, getRoles, updateRole |
| `otruyenService` | search (external), getDetail (external), importStory |

Tất cả request đều tự động đính JWT từ `localStorage` qua **Axios interceptor**.

---

## 4. Routes hiện tại

| Path | Component | Trạng thái |
|---|---|---|
| `/` | Home | ✅ Hoạt động |
| `/login` | Login (+ Register) | ✅ Hoạt động |
| `/admin` | AdminUserManagement | ✅ Hoạt động |
| `/staff` | AdminDashboard (Story CRUD) | ✅ Hoạt động |
| `/staff/import` | StaffDashboard (Import) | ✅ Hoạt động |
| `/genres` | Placeholder | 🚧 Đang phát triển |
| `/premium` | Placeholder | 🚧 Đang phát triển |

---

## 5. Định hướng phát triển

Dựa trên cấu trúc backend (`ONLINE-STORY-READING-WEBSITE`) và các placeholder trong frontend, các tính năng tiếp theo dự kiến gồm:

### 5.1 Phía người dùng (Reader)
- [ ] Trang **Thể loại** – duyệt truyện theo genre
- [ ] Trang **Chi tiết truyện** – bìa, mô tả, danh sách chương, rating, bình luận
- [ ] Trang **Đọc chương** – trình đọc văn bản / hình ảnh
- [ ] **Lưu tiến độ đọc** (ReadingProgress model đã có ở backend)
- [ ] **Yêu thích truyện** (FavoriteStory model đã có)
- [ ] Bình luận (Comment model đã có)
- [ ] Đánh giá sao (Rating model đã có)

### 5.2 Premium & Thanh toán
- [ ] Trang **Gói Premium** – gói đăng ký, giá cả
- [ ] Tích hợp thanh toán (Transaction model đã có ở backend)
- [ ] Khoá nội dung truyện `isPremium = true` với người dùng thường

### 5.3 Chatbot
- [ ] Nút floating chatbot đã có placeholder trong `App.jsx`
- [ ] Kết nối `ChatbotController` và `ChatController` (đã có ở backend)
- [ ] Giao diện chat nổi

### 5.4 Cải thiện kỹ thuật
- [ ] **Route Guard** – bảo vệ `/admin`, `/staff` bằng role check thực sự (hiện chỉ ẩn link)
- [ ] **State Management** – xem xét Context API hoặc Zustand khi state phức tạp hơn
- [ ] Tích hợp **Framer Motion** (đã cài nhưng chưa dùng nhiều) cho page transitions
- [ ] Thanh tìm kiếm Navbar kết nối `storyService.search()`
- [ ] Xử lý **WebSocket** cho chat / thông báo real-time (`WebSocketConfig` đã có ở backend)
- [ ] Mobile menu sidebar

---

## 6. Hệ thống vai trò (Role-based Access)

```
ADMIN  → Quản lý người dùng + toàn bộ tính năng Staff
STAFF  → Quản lý truyện (CRUD) + Import từ nguồn ngoài
USER   → Đọc truyện, bình luận, yêu thích, mua Premium
```

---

## 7. Ghi chú kỹ thuật

- Giao diện theo phong cách **glassmorphism** (class `glass` dùng backdrop-filter)
- Mỗi page có file CSS riêng, không dùng Tailwind trực tiếp (chỉ dùng `tailwind-merge` để merge class)
- Chưa có **error boundary** toàn cục
- JWT được lưu trong `localStorage` (cân nhắc HttpOnly Cookie cho production)
- Rating trên trang chủ hiện là **mock random** – cần kết nối Rating API
