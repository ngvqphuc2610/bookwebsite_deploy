# 🛠️ Hướng dẫn Kiểm tra và Sửa lỗi 502 Bad Gateway

File này tổng hợp các bước kiểm tra (testing) và xử lý lỗi 502 khi triển khai website `alexdev.software` lên Google Cloud VPS qua Cloudflare.

---

## 🏗️ 1. Kiểm tra Hạ tầng Giao tiếp (Cloudflare & VPS)

### 🩺 Bước 1.1: Chế độ SSL trên Cloudflare (Ưu tiên số 1)
Lỗi 502 thường do Cloudflare yêu cầu HTTPS (cổng 443) nhưng VPS chỉ đang nhận HTTP (cổng 80).
- [ ] Truy cập Cloudflare Dashboard -> Tên miền `alexdev.software`.
- [ ] Chọn **SSL/TLS** -> **Overview**.
- [ ] **Test**: Chuyển từ "Full" sang **"Flexible"**.
- [ ] **Kết quả mong đợi**: Sau 1-2 phút, truy cập web không còn hiện lỗi 502 của Cloudflare.

### 🩺 Bước 1.2: Tường lửa Google Cloud (Firewall)
Đảm bảo cổng 80 đã mở để Cloudflare có thể "đi vào" VPS.
- [ ] Vào Google Cloud Console -> Compute Engine -> VM Instances.
- [ ] Nhấp vào máy ảo của bạn, chọn **Edit**.
- [ ] **Test**: Đảm bảo đã tích chọn:
    - [x] **Allow HTTP traffic**
    - [x] **Allow HTTPS traffic**
- [ ] **Kết quả mong đợi**: Có thể truy cập trực tiếp bằng IP của VPS (vd: `http://<IP-Static>`) mà không bị quay vòng tròn (timeout).

---

## 🐳 2. Kiểm tra Trạng thái Container (Docker)

Kết nối SSH vào VPS và chạy các lệnh sau:

### 🩺 Bước 2.1: Kiểm tra container có đang chạy không?
- [ ] Chạy lệnh: `docker ps`
- [ ] **Kết quả mong đợi**: Có đủ 3 service đang `Up`:
    - `bookwebsite-frontend-1`
    - `bookwebsite-backend-1`
    - `bookwebsite-mysql-1`
- [ ] **Nếu không thấy?**: Chạy `docker ps -a` để xem container nào bị "Exited" (thoát do lỗi).

### 🩺 Bước 2.2: Kiểm tra Log lỗi của Backend
- [ ] Chạy lệnh: `docker logs bookwebsite-backend-1 --tail 100`
- [ ] **Test**: Tìm kiếm các dòng chữ màu đỏ hoặc từ khóa `ERROR`. 
    - Nếu thấy: `Access denied for user 'nhom8_user'@'%'`: Sai mật khẩu DB trong file `.env`.
    - Nếu thấy: `Communications link failure`: Backend khởi động trước MySQL (hệ thống sẽ tự thử lại sau vài giây).

---

## 🌐 3. Kiểm tra Nginx và Đường dẫn API (Frontend)

### 🩺 Bước 3.1: Gọi thử API trực tiếp
- [ ] **Test**: Truy cập vào đường dẫn: `https://alexdev.software/api/stories` (hoặc `/api/genres`).
- [ ] **Kết quả mong đợi**: Trả về dữ liệu JSON (danh sách truyện/thể loại).
    - Nếu hiện 502: Do Nginx trong container frontend không kết nối được tới container backend.
    - Nếu hiện 404: Do sai đường dẫn cấu hình trong `default.conf`.

### 🩺 Bước 3.2: Kiểm tra "Mixed Content"
- [ ] Nhấn **F12** trên trình duyệt, chuyển sang tab **Console**.
- [ ] **Test**: Tìm các dòng báo đỏ có chữ: `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'`.
- [ ] **Xử lý**: Đảm bảo các biến môi trường `VITE_API_URL` trong Docker Compose đang là `/api` (dùng relative path) để nó tự động đi theo giao thức HTTPS của domain chính.

---

## 📝 4. Cấu hình DNS nâng cao (Nếu dùng Subdomain)

Nếu bạn cấu hình API chạy trên subdomain riêng (`api.alexdev.software`):
- [ ] Kiểm tra DNS trên Cloudflare đã có bản ghi A cho `api` trỏ về IP VPS chưa.
- [ ] **Test**: Chuyển đám mây từ Vàng sang **Xám (DNS Only)** cho subdomain `api` để tránh Cloudflare can thiệp vào port 8080 (nếu bạn mở port này ra ngoài).
- [ ] **Khuyên dùng**: Nên dùng chung 1 domain `alexdev.software/api/` như chúng ta đã cấu hình trong Nginx để dễ quản lý SSL hơn.

---

### 💡 Mẹo nhỏ:
Sau khi sửa bất kỳ file `.env` hay `default.conf` nào trên VPS, hãy nhớ chạy lệnh này để cập nhật:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
