
Thứ tự triển khai sẽ là: **GĐ1 (UI/UX) -> GĐ4 (Brain) -> GĐ3 (Search) -> GĐ2 (Log) -> GĐ5 (Final Sync)**. 

### Giai đoạn 1: Output Parsing & "Manga Card" UI (Ưu tiên số 1)

> [!IMPORTANT]
> **Mục tiêu:** Tách biệt rõ Data và View. AI đóng vai trò "Người chọn lọc", Frontend là "Người hiển thị".

- **Backend (`ChatbotService.java`)**:
  - Cập nhật `SYSTEM_PROMPT` với directive rõ ràng: 
    *"Khi gợi ý truyện, viết nhận xét ngắn gọn, sau đó liệt kê ID truyện vào cuối phản hồi theo định dạng: `[SEARCH_RESULT: [id1, id2, id3]]`"* (VD: dựa vào kết quả Hybrid Search truyền vào Context, AI sẽ lấy ID).
  - Viết Regex Parser để bóc tách cái tag `[SEARCH_RESULT...]` ra khỏi câu trả lời của AI.
  - API thay vì trả về String, sẽ trả về JSON:
    ```json
    {
      "response": "Đây là một số truyện bạn có thể thích...",
      "suggestedMangaIds": [1, 2, 3]
    }
    ```
- **Frontend (`ChatBox.jsx`)**:
  - Nhận mảng `suggestedMangaIds`.
  - Nếu mảng có giá trị, fetch details của các truyện đó (hoặc tận dụng dữ liệu search) để render các `StoryCard` Component (có hover, lazy-load) hiển thị ngay dưới bong bóng chat.

---

### Giai đoạn 4: FAQ Context & Chuẩn hóa RAG (Tối ưu Brain)

> [!TIP]
> **Vấn đề Token Limit:** Qwen2.5:3b có giới hạn token. Quét tất cả FAQ vào prompt sẽ gây quá tải và làm AI bị "loãng" thông tin.

- **Vector hóa FAQ:** Đưa dữ liệu từ `FaqItem` vào Qdrant (có thể chung collection `manga` với field `type="faq"` hoặc tạo tag riêng `collection="faqs"`).
- **Retrieval-Augmented Generation (RAG) Chuẩn:** 
  - Khi người dùng nhắn tin, dùng câu user query chọc vào Qdrant để lấy ra **Top 3 - 5 FAQ gần nghĩa nhất**.
  - Chỉ tiêm 3-5 câu FAQ này vào Context của AI. 
  - AI đọc Context, nếu thấy câu trả lời thì dùng, nếu là câu hỏi "Out-of-scope" (ngoài lề) thì từ chối khéo léo.

---

### Giai đoạn 3: Tối ưu Hybrid Search với Metadata Filter 

> [!NOTE]
> Khai thác khả năng Pre-filtering của Qdrant DB để thu hẹp không gian Vector, giúp tìm cực nhanh.

- **Cấu hình Payload trong Qdrant:** Hiện tại Code đã có `status`, `isPremium`, `genres`.
- **Backend (`HybridSearchService` & `QdrantService`)**:
  - Mở rộng API search để nhận query params kiểu `?q=...&status=COMPLETED&premium=true&genres=Hành Động`.
  - Chuyển config thành Filter Model của Qdrant (ví dụ `Must` match `status=COMPLETED`). Qdrant sẽ lọc trước khi tính Cost/Vector match.
  - *(Ghi chú: Adult filter tương lai có thể dùng logic `genres.contains("Adult")` để lọc)*.

---

### Giai đoạn 2: Tracking & Analytics Loop (Observation)

> [!NOTE]
> Sau khi hệ thống Chat và Filter chạy ổn định, ta sẽ bắt đầu thu thập dữ liệu "khoảng trống" (Gaps) của Chatbot.

- **Tạo Entity `UnresolvedQueryLog` (MySQL)**: 
  - Bảng gồm: `id`, `query`, `hitCount`, `lastSeenAt`.
  - Khi `ChatbotService` rơi vào `getFallbackResponse()` hoặc AI phản hồi "Tôi không biết", ghi lại câu hỏi vào bảng.
  - Nếu câu hỏi tương tự xuất hiện, tăng `hitCount` +1 thay vì tạo dòng mới.
- **Giá trị:** Admin vào xem bảng này, thấy câu nào có `hitCount` = 10 -> Cấp bách -> Chuyển thành 1 `FaqItem` mới -> Index vào Qdrant -> AI tự động khôn lên.

---

### Giai đoạn 5: Nâng cấp Thanh Tìm Kiếm Chính (Final Sync)

- **Frontend (`site-header.tsx`, `CategoryPage.jsx`)**:
  - Chuyển Input Search Header gọi API Hybrid Search mới (thay vì SQL Query LIKE cũ kỹ).
  - Tích hợp Dropdown/Checkboxes để user truyền các Filter (`status`, `premium`) xuống Backend.

---

## ✅ Xác nhận & Triển khai

Bản Đánh giá và Lộ trình này đã khớp hoàn hảo với tư duy hệ thống Product. Nếu bạn đồng ý với kế hoạch trên, tôi sẽ tiến hành **Thực hiện Giai đoạn 1 (Output Parsing Backend & Frontend)** ngay bây giờ.
