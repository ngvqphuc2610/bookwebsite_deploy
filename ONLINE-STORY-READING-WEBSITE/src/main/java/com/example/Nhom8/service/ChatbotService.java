package com.example.Nhom8.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Chatbot service — uses Ollama for AI responses, with hybrid search context.
 * When AI chat is disabled via feature flag, returns fallback responses only.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final OllamaService ollamaService;
    private final HybridSearchService hybridSearchService;

    @Value("${app.features.ai-chat-enabled:true}")
    private boolean aiChatEnabled;

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI của website **Nhom8 Story** – nền tảng đọc truyện tranh online (manga/manhwa/manhua).

            ## Phạm vi hỗ trợ:
            1. TÌM KIẾM & GỢI Ý truyện theo tên, tác giả, thể loại, từ khoá.
            2. TÀI KHOẢN: đăng ký, đăng nhập, đổi mật khẩu.
            3. GÓI PREMIUM: giải thích quyền lợi và hướng dẫn mua/nâng cấp.
               - Quyền lợi Premium: đọc tất cả truyện khóa, không quảng cáo, ưu tiên chương mới.
               - Thanh toán qua VNPay, Momo, thẻ ngân hàng nội địa/quốc tế.
               - Nâng cấp tại mục "Tài khoản > Nâng cấp Premium".

            ## Quy tắc trả lời:
            - Chỉ trả lời trong 3 phạm vi trên. Với câu hỏi ngoài phạm vi, lịch sự từ chối và gợi ý điều bạn có thể giúp.
            - Trả lời bằng tiếng Việt, thân thiện, ngắn gọn (tối đa 3-4 câu).
            - Nếu có kết quả tìm kiếm truyện được cung cấp, dựa vào đó để đề xuất, không bịa tên truyện.
            - Hỏi thêm nếu yêu cầu chưa rõ ràng.""";

    public String getResponse(String message) {
        return getResponse(message, List.of());
    }

    public String getResponse(String message, List<Map<String, String>> history) {
        String safeMessage = message == null ? "" : message.trim();

        // When AI chat is disabled, use fallback responses only
        if (!aiChatEnabled) {
            log.debug("AI chat disabled — using fallback response");
            return getFallbackResponse(safeMessage);
        }

        String context = buildSearchContext(safeMessage);

        try {
            return ollamaService.chatWithHistory(SYSTEM_PROMPT, safeMessage + context, history);
        } catch (Exception e) {
            log.warn("Ollama chat failed, using fallback: {}", e.getMessage());
            return getFallbackResponse(safeMessage);
        }
    }

    private String buildSearchContext(String message) {
        if (message == null || message.isBlank()) {
            return "";
        }

        try {
            List<HybridSearchService.SearchResult> results = hybridSearchService.hybridSearch(message, 5);
            if (results.isEmpty()) {
                return "";
            }

            return "\n\nKết quả tìm kiếm liên quan:\n" + results.stream()
                    .map(r -> String.format("- %s (by %s) [%s] — %s",
                            r.getTitle(),
                            r.getAuthor(),
                            r.getGenres() != null ? String.join(", ", r.getGenres()) : "",
                            r.getStatus()))
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            log.warn("Hybrid search context unavailable, continuing without context: {}", e.getMessage());
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
