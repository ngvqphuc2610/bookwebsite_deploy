# ONLINE STORY READING WEBSITE — Run Guide (A-Z)

Hướng dẫn này chạy đầy đủ **Qdrant + Ollama + Backend (Spring Boot) + Frontend (Vite)** trên Windows.

## 0) Prerequisites

- Java 21
- Maven Wrapper (đã có `mvnw.cmd` trong project)
- Node.js 18+ (khuyên dùng Node 20+)
- Python 3.10+ (cho indexer)
- MySQL/MariaDB đang chạy
- Docker Desktop (để chạy Qdrant)
- Ollama đã cài local

Workspace hiện có 2 thư mục:
- Backend: `ONLINE-STORY-READING-WEBSITE`
- Frontend: `Fontend-ONLINE-STORY-READING-WEBSITE-`

---

## 1) Chạy Qdrant

Mở terminal tại thư mục backend `ONLINE-STORY-READING-WEBSITE`:

```powershell
docker compose up -d qdrant
```

Kiểm tra dashboard:
- http://localhost:6335/dashboard#/collections

> Trong `docker-compose.yml`: `6335:6333` nên từ máy host dùng `http://localhost:6335`.

---

## 2) Chuẩn bị MySQL + chạy migration SQL

Database đang cấu hình trong backend:
- host: `localhost`
- port: `3307`
- db: `nhom8_db`
- user: `root`
- password: `123456`

Chạy migration (PowerShell):

```powershell
Set-Location "d:\2A2026\bookwebsite\ONLINE-STORY-READING-WEBSITE"
Get-Content .\sql\V1__add_fulltext_index.sql | mysql -u root -p nhom8_db
Get-Content .\sql\V2__support_chat_and_faq.sql | mysql -u root -p nhom8_db
```

> Lưu ý: PowerShell không dùng được cú pháp `< file.sql` như `cmd`.

---

## 3) Chuẩn bị Ollama

```powershell
ollama pull nomic-embed-text
ollama pull qwen2.5:3b
```

Đảm bảo Ollama service đang chạy tại `http://localhost:11434`.

---

## 4) Index dữ liệu vào Qdrant (lần đầu)

```powershell
Set-Location "d:\2A2026\bookwebsite\ONLINE-STORY-READING-WEBSITE\indexer"
py install -r requirements.txt
py qdrant_indexer.py
```

Kiểm tra file `indexer/.env`:

```env
QDRANT_URL=http://localhost:6335
QDRANT_COLLECTION=manga
OLLAMA_URL=http://localhost:11434
EMBED_MODEL=nomic-embed-text
EMBED_DIM=768
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=123456
MYSQL_DB=nhom8_db
```

---

## 5) Chạy Backend (Spring Boot)

Tại thư mục `ONLINE-STORY-READING-WEBSITE`:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend mặc định chạy ở:
- http://localhost:8080

---

## 6) Chạy Frontend (Vite)

Mở terminal mới, vào thư mục FE `Fontend-ONLINE-STORY-READING-WEBSITE-`:

```powershell
npm install
npm run dev
```

Frontend thường chạy ở:
- http://localhost:5173

---

## 7) Quick test sau khi chạy xong

1. Mở FE và đăng nhập.
2. Gọi danh sách truyện (FE sẽ gọi backend `/api/stories`).
3. Test tìm kiếm liên quan vector/hybrid qua màn hình chatbot/search.
4. Kiểm tra Qdrant collection có dữ liệu trên dashboard.

---

## 8) Ghi chú quan trọng

- Story CRUD đã được bật auto sync index ở backend:
	- Create/Update: tự reindex story vào Qdrant.
	- Delete: tự xóa point trong Qdrant.
- Nếu Qdrant/Ollama tạm thời lỗi, CRUD DB vẫn chạy; hệ thống log cảnh báo sync index.
- Có thể chạy reindex thủ công qua admin endpoints khi cần đồng bộ lại toàn bộ.

mvn spring-boot:run