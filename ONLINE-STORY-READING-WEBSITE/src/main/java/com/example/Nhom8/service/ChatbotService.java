package com.example.Nhom8.service;

import com.example.Nhom8.models.PremiumPackage;
import com.example.Nhom8.models.Story;
import com.example.Nhom8.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Chatbot service — uses Ollama for AI responses, with hybrid search context.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final OllamaService ollamaService;
    private final HybridSearchService hybridSearchService;
    private final PremiumPackageService premiumPackageService;
    private final StoryRepository storyRepository;

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI thông minh của website **Nhom8 Story** – nền tảng đọc truyện tranh online.

            ## QUY TẮC QUAN TRỌNG:
            1. LUÔN DỰA VÀO PHẦN [DỮ LIỆU THẬT TỪ HỆ THỐNG] ĐƯỢC CUNG CẤP Ở ĐẦU CÂU HỎI ĐỂ TRẢ LỜI.
            2. Nếu dữ liệu có tên truyện, hãy liệt kê kèm theo tác giả, lượt xem hoặc thể loại nếu có.
            3. Nếu dữ liệu có thông tin Premium (giá, gói, khuyến mãi), hãy tư vấn cụ thể các lựa chọn đó cho người dùng.
            4. Tuyệt đối KHÔNG tự bịa ra tên truyện, giá tiền hoặc thông tin không có trong dữ liệu được cung cấp.
            5. Nếu không tìm thấy thông tin phù hợp trong dữ liệu hệ thống, hãy lịch sự thông báo là "Hệ thống Nhom8 Story hiện chưa cập nhật dữ liệu này" và gợi ý người dùng xem trực tiếp trên web.
            6. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện và chuyên nghiệp.""";

    public String getResponse(String message) {
        return getResponse(message, List.of());
    }

    public String getResponse(String message, List<Map<String, String>> history) {
        String safeMessage = message == null ? "" : message.trim();
        String lowerMessage = safeMessage.toLowerCase();

        // 1. Build context from Database based on Intent (Premium, Hot stories, etc.)
        String dbContext = buildDatabaseContext(lowerMessage);

        // 2. Build Search Context (via Hybrid Search) for story discovery
        String searchContext = "";
        if (!isPureSystemQuery(lowerMessage)) {
            String searchQuery = cleanSearchQuery(safeMessage);
            searchContext = buildSearchContext(searchQuery);
        }

        // 3. Combine contexts
        String finalContext = (dbContext + "\n" + searchContext).trim();

        try {
            String promptPrefix = finalContext.isEmpty()
                    ? "Lưu ý: Hệ thống chưa tìm thấy dữ liệu cụ thể cho yêu cầu này. Hãy trả lời là hiện tại chưa cập nhật thông tin và gợi ý người dùng xem trên web.\n\n"
                    : "[DỮ LIỆU THẬT TỪ HỆ THỐNG]:\n" + finalContext + "\n\n";

            String userPrompt = promptPrefix + "Câu hỏi của người dùng: " + safeMessage;
            return ollamaService.chatWithHistory(SYSTEM_PROMPT, userPrompt, history);
        } catch (Exception e) {
            log.warn("Ollama chat failed, using fallback: {}", e.getMessage());
            return getFallbackResponse(safeMessage);
        }
    }

    private String buildDatabaseContext(String lowerMsg) {
        StringBuilder sb = new StringBuilder();

        // Check for Premium info intent
        if (lowerMsg.contains("premium") || lowerMsg.contains("gói") || lowerMsg.contains("mua")
                || lowerMsg.contains("nâng cấp")) {
            List<PremiumPackage> packages = premiumPackageService.getAllPackages();
            if (!packages.isEmpty()) {
                sb.append("\n--- DANH SÁCH GÓI PREMIUM HIỆN CÓ ---\n");
                for (PremiumPackage p : packages) {
                    sb.append(String.format("- Gói: %s | Giá: %,.0f VNĐ | Thời hạn: %d ngày | Ưu đãi: %s\n",
                            p.getName(), p.getPrice(), p.getDurationDays(), p.getDescription()));
                }
            }
        }

        // Check for Hot/Top stories intent
        if (lowerMsg.contains("hot") || lowerMsg.contains("nhiều người đọc nhất") || lowerMsg.contains("nổi bật")
                || lowerMsg.contains("phổ biến")) {
            List<Story> hotStories = storyRepository.findTop10ByOrderByViewCountDesc();
            if (!hotStories.isEmpty()) {
                sb.append("\n--- DANH SÁCH TRUYỆN ĐANG XEM NHIỀU NHẤT (HOT) ---\n");
                for (Story s : hotStories) {
                    sb.append(String.format("- %s (Lượt xem: %d | Tác giả: %s)\n", s.getTitle(), s.getViewCount(),
                            s.getAuthor()));
                }
            }
        }

        return sb.toString();
    }

    private boolean isPureSystemQuery(String msg) {
        // Returns true if the query is strictly about accounts/payments without looking
        // for stories
        return (msg.contains("thanh toán") || msg.contains("vnpay") || msg.contains("momo") ||
                msg.contains("đăng ký") || msg.contains("đăng nhập") || msg.contains("mật khẩu") ||
                msg.contains("tài khoản"))
                && !msg.contains("truyện") && !msg.contains("bộ") && !msg.contains("đọc");
    }

    private String cleanSearchQuery(String message) {
        if (message == null)
            return "";
        String clean = message.toLowerCase()
                .replace("đề xuất", "")
                .replace("tìm giúp", "")
                .replace("tìm kiếm", "")
                .replace("thể loại:", "")
                .replace("thể loại", "")
                .replace("truyện", "")
                .replace("cho tôi hỏi", "")
                .replace("cho tôi", "")
                .replace("cho hỏi", "")
                .replace("hãy giúp", "")
                .replace("hãy", "")
                .replace("xem giúp", "")
                .replace("xem", "")
                .replace("giúp mình", "")
                .replace("giúp", "")
                .replace("cần tìm", "")
                .replace("cần", "")
                .replace("có nội dung gì", "")
                .replace("có hay không", "")
                .replace("là gì", "")
                .replace("thông tin về", "")
                .replace("thông tin", "")
                .replace("như thế nào", "")
                .replace("về bộ", "")
                .replace("review", "")
                .replace("kể về", "")
                .replace("tại sao", "")
                .replace("không đọc được", "")
                .replace("đọc được", "")
                .replace("db", "")
                .replace("?", "")
                .trim();

        // Remove extra spaces
        return clean.replaceAll("\\s+", " ");
    }

    private String buildSearchContext(String message) {
        if (message == null || message.isBlank())
            return "";

        String searchQuery = cleanSearchQuery(message);
        if (searchQuery.isBlank())
            return "";

        StringBuilder context = new StringBuilder("\n--- KẾT QUẢ TÌM KIẾM TRUYỆN ---\n");
        boolean found = false;

        try {
            // 1. Precise/Partial Search
            List<Story> directMatches = storyRepository
                    .findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(searchQuery, searchQuery);

            // If still no results, try search with just the first 2 words (often the main
            // name)
            if (directMatches.isEmpty() && searchQuery.split(" ").length > 2) {
                String shortQuery = searchQuery.split(" ")[0] + " " + searchQuery.split(" ")[1];
                directMatches = storyRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(shortQuery,
                        shortQuery);
            }

            if (!directMatches.isEmpty()) {
                found = true;
                for (Story s : directMatches) {
                    String genres = s.getGenres() != null
                            ? s.getGenres().stream().map(g -> g.getName()).collect(Collectors.joining(", "))
                            : "Chưa rõ";
                    context.append(String.format(
                            "- Tên: %s | Tác giả: %s | Thể loại: %s | Trạng thái: %s | Lượt xem: %d\n  Nội dung: %s\n",
                            s.getTitle(), s.getAuthor(), genres, s.getStatus(), s.getViewCount(),
                            s.getDescription() != null ? s.getDescription().replaceAll("<[^>]+>", "").substring(0,
                                    Math.min(s.getDescription().length(), 300)) + "..." : "Đang cập nhật."));
                }
            }

            // 2. Hybrid/Vector Search (as backup)
            List<HybridSearchService.SearchResult> hybridResults = hybridSearchService.hybridSearch(searchQuery, 3);
            if (!hybridResults.isEmpty()) {
                for (HybridSearchService.SearchResult r : hybridResults) {
                    if (directMatches.stream().noneMatch(s -> s.getId().equals(r.getStoryId()))) {
                        found = true;
                        context.append(String.format("- Truyện liên quan: %s (Tác giả: %s) [%s]\n",
                                r.getTitle(), r.getAuthor(),
                                r.getGenres() != null ? String.join(", ", r.getGenres()) : "Chưa rõ"));
                    }
                }
            }

            return found ? context.toString() : "";
        } catch (Exception e) {
            log.warn("Search failed: {}", e.getMessage());
            return "";
        }
    }

    private String getFallbackResponse(String message) {
        String msg = message.toLowerCase();
        if (msg.contains("premium") || msg.contains("vip") || msg.contains("nâng cấp")) {
            return "Gói Premium cho phép bạn đọc tất cả truyện khóa, không quảng cáo, và ưu tiên chương mới. Vào mục Tài khoản > Nâng cấp Premium để đăng ký!";
        }
        if (msg.contains("thanh toán") || msg.contains("momo") || msg.contains("vnpay") || msg.contains("mua")) {
            return "Gói Premium hỗ trợ thanh toán qua VNPay, Momo và thẻ ngân hàng nội địa/quốc tế. 💳";
        }
        if (msg.contains("đăng ký") || msg.contains("đăng nhập") || msg.contains("mật khẩu")
                || msg.contains("tài khoản")) {
            return "Bạn có thể đăng ký/đăng nhập bằng email hoặc Google ở góc trên bên phải. Nếu quên mật khẩu, dùng chức năng 'Quên mật khẩu' ở trang đăng nhập nhé!";
        }
        if (msg.contains("tìm") || msg.contains("truyện") || msg.contains("manga") || msg.contains("manhwa")) {
            return "Bạn có thể dùng thanh tìm kiếm ở trên cùng để tìm truyện theo tên, tác giả hoặc thể loại. 🔍";
        }
        return "Xin lỗi, hệ thống AI đang tạm thời không khả dụng. Vui lòng thử lại sau! 🙏";
    }
}
