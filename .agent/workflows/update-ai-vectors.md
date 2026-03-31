---
description: Hướng dẫn cập nhật và chuẩn hóa dữ liệu Vector (FAQs & Truyện) lên Qdrant cho hệ thống AI Chatbot Nhom8 Story.
---

Quy trình này giúp Agent (hoặc Developer) tự động hóa việc cập nhật dữ liệu từ MySQL lên cơ sở dữ liệu Qdrant để đảm bảo AI Chatbot và tính năng Hybrid Search hoạt động chính xác.

## Bước 1: Thu thập bộ lưu trữ đăng nhập (Admin Credentials)
Để gọi các API `/api/admin/**`, hệ thống cần có quyền ADMIN. Agent cần yêu cầu người dùng nhập thông tin account Admin (Username / Password) hoặc trực tiếp cung cấp chuỗi `JWT Token`.

Nếu có Username và Password, Agent sẽ chạy lệnh cURL sau để lấy Token:
```bash
curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "<ADMIN_EMAIL>", "password": "<ADMIN_PASSWORD>"}'
```
*(Nếu người dùng đã có sẵn Token thì có thể bỏ qua bước này).*

## Bước 2: Đồng bộ dữ liệu FAQ lên Qdrant 
Tiến hành nạp danh sách các câu hỏi thường gặp (Momo, Premium, Đăng nhập...) vào collection `faqs`.

// turbo
```bash
curl -X POST http://localhost:8080/api/admin/reindex/faqs \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Bước 3: Đồng bộ dữ liệu Truyện lên Qdrant (Khuyến nghị khi có truyện mới)
Tiến hành nạp hoặc cập nhật dữ liệu của Toàn Bộ Truyện vào collection vector để tính năng Semantic / Hybrid Search đề xuất các truyện chính xác nhất.

// turbo
```bash
curl -X POST http://localhost:8080/api/admin/reindex/all \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
```

## Bước 4: Kiểm tra và Báo cáo
Agent sẽ phân tích kết quả JSON trả về từ các lệnh cURL trên:
- Quá trình chạy thành công cần có mã `200 OK`.
- Báo cáo số lượng bản ghi đã được cập nhật (ví dụ: `"count": 15`).
- Nếu thất bại (Lỗi `403 Forbidden` hoặc `503 Service Unavailable`), Agent đề xuất kiểm tra xem Qdrant đã lên chưa hoặc Token còn mồi hạn không.
