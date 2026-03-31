package com.example.Nhom8.service;

import com.example.Nhom8.dto.ChatbotResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Chatbot service — uses Ollama for AI responses, with hybrid search context.
 * Returns structured {@link ChatbotResponse} with clean text + suggested manga IDs.
 * When AI chat is disabled via feature flag, returns fallback responses only.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final OllamaService ollamaService;
    private final HybridSearchService hybridSearchService;
    private final FaqIndexService faqIndexService;
    private final com.example.Nhom8.repository.UnresolvedQueryLogRepository unresolvedQueryRepo;

    @Value("${app.features.ai-chat-enabled:true}")
    private boolean aiChatEnabled;

    /**
     * Regex to extract the [SEARCH_RESULT: [id1, id2, id3]] tag from AI output.
     * Captures the comma-separated list of IDs inside the brackets.
     */
    static final Pattern SEARCH_RESULT_PATTERN =
            Pattern.compile("\\[SEARCH_RESULT:\\s*\\[([^\\]]*?)]]");

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
            - Nếu có kết quả tìm kiếm truyện được cung cấp, dựa vào đó để đề xuất, KHÔNG bịa tên truyện.
            - Hỏi thêm nếu yêu cầu chưa rõ ràng.

            ## Quy tắc gợi ý truyện (QUAN TRỌNG):
            Khi gợi ý truyện, hãy viết nhận xét ngắn gọn bằng ngôn ngữ tự nhiên.
            Sau đó, ở CUỐI phản hồi, liệt kê ID các truyện đã gợi ý theo định dạng CHÍNH XÁC sau:
            [SEARCH_RESULT: [id1, id2, id3]]

            Ví dụ: "Dựa trên sở thích của bạn, mình gợi ý những truyện sau đây... [SEARCH_RESULT: [5, 12, 23]]"
            CHỈ sử dụng ID từ kết quả tìm kiếm được cung cấp trong Context. KHÔNG tự bịa ID.""";

    /**
     * Simple single-message entry point (no history).
     */
    public ChatbotResponse getResponse(String message) {
        return getResponse(message, List.of());
    }

    /**
     * Main entry point — processes user message with conversation history.
     * Returns structured response with clean text + manga IDs.
     */
    public ChatbotResponse getResponse(String message, List<Map<String, String>> history) {
        String safeMessage = message == null ? "" : message.trim();

        // When AI chat is disabled, use fallback responses only
        if (!aiChatEnabled) {
            log.debug("AI chat disabled — using fallback response");
            return ChatbotResponse.builder()
                    .response(getFallbackResponse(safeMessage))
                    .suggestedMangaIds(List.of())
                    .build();
        }

        // Build search context and collect available story IDs
        List<HybridSearchService.SearchResult> searchResults = getSearchResults(safeMessage);
        String mangaContext = formatSearchContext(searchResults);

        // FAQ RAG: retrieve top-5 semantically relevant FAQs
        String faqContext = buildFaqContext(safeMessage);

        String fullContext = mangaContext + faqContext;

        try {
            String rawResponse = ollamaService.chatWithHistory(SYSTEM_PROMPT, safeMessage + fullContext, history);
            ChatbotResponse response = parseResponse(rawResponse);
            
            // If the AI explicitly says it doesn't know, treat as unresolved
            if (response.getResponse().toLowerCase().contains("tôi không biết") || 
                response.getResponse().toLowerCase().contains("xin lỗi, tôi không hiểu")) {
                logUnresolvedQuery(safeMessage);
            }
            
            return response;
        } catch (Exception e) {
            log.warn("Ollama chat failed, using fallback: {}", e.getMessage());
            return ChatbotResponse.builder()
                    .response(getFallbackResponse(safeMessage))
                    .suggestedMangaIds(List.of())
                    .build();
        }
    }

    // ──────────── Response parsing ────────────

    /**
     * Parse AI raw output:
     * 1) Extract [SEARCH_RESULT: [id1, id2, ...]] tag → list of IDs
     * 2) Strip the tag from the response text
     */
    ChatbotResponse parseResponse(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            return ChatbotResponse.builder()
                    .response("Xin lỗi, tôi không hiểu câu hỏi của bạn.")
                    .suggestedMangaIds(List.of())
                    .build();
        }

        List<Long> mangaIds = new ArrayList<>();
        String cleanResponse = rawResponse;

        Matcher matcher = SEARCH_RESULT_PATTERN.matcher(rawResponse);
        if (matcher.find()) {
            // Extract the IDs
            String idsStr = matcher.group(1).trim();
            if (!idsStr.isEmpty()) {
                for (String idPart : idsStr.split(",")) {
                    try {
                        mangaIds.add(Long.parseLong(idPart.trim()));
                    } catch (NumberFormatException e) {
                        log.debug("Skipping non-numeric ID in SEARCH_RESULT: '{}'", idPart.trim());
                    }
                }
            }
            // Strip the tag from visible response
            cleanResponse = rawResponse.substring(0, matcher.start())
                    + rawResponse.substring(matcher.end());
            cleanResponse = cleanResponse.trim();
        }

        return ChatbotResponse.builder()
                .response(cleanResponse.isEmpty() ? rawResponse.trim() : cleanResponse)
                .suggestedMangaIds(mangaIds)
                .build();
    }

    // ──────────── Search context ────────────

    /**
     * Execute hybrid search and return raw results.
     */
    private List<HybridSearchService.SearchResult> getSearchResults(String message) {
        if (message == null || message.isBlank()) {
            return List.of();
        }
        try {
            return hybridSearchService.hybridSearch(message, 5);
        } catch (Exception e) {
            log.warn("Hybrid search unavailable: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Format search results as context string for the AI, including story IDs
     * so the AI can reference them in [SEARCH_RESULT: [...]] tags.
     */
    private String formatSearchContext(List<HybridSearchService.SearchResult> results) {
        if (results.isEmpty()) {
            return "";
        }

        return "\n\nKết quả tìm kiếm liên quan:\n" + results.stream()
                .map(r -> String.format("- [ID:%d] %s (by %s) [%s] — %s",
                        r.getStoryId(),
                        r.getTitle(),
                        r.getAuthor(),
                        r.getGenres() != null ? String.join(", ", r.getGenres()) : "",
                        r.getStatus()))
                .collect(Collectors.joining("\n"));
    }

    // ──────────── FAQ RAG Context ────────────

    private static final double FAQ_THRESHOLD = 0.6;

    /**
     * Build FAQ context by querying the FAQ vector collection for the top 5
     * most semantically relevant FAQs. Only inject if results are found and match threshold.
     */
    private String buildFaqContext(String message) {
        try {
            List<FaqIndexService.FaqSearchResult> faqs = faqIndexService.findRelevantFaqs(message, 5);
            
            // Only take faqs that meet the relevance threshold
            List<FaqIndexService.FaqSearchResult> filteredFaqs = faqs.stream()
                    .filter(f -> f.score() >= FAQ_THRESHOLD)
                    .collect(Collectors.toList());

            if (filteredFaqs.isEmpty()) {
                return "";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("\n\nThông tin hỗ trợ khách hàng (FAQ):\n");
            for (FaqIndexService.FaqSearchResult faq : filteredFaqs) {
                sb.append("- Q: ").append(faq.questionPattern())
                  .append(" → A: ").append(faq.answerText()).append("\n");
            }
            return sb.toString();
        } catch (Exception e) {
            log.debug("FAQ context unavailable: {}", e.getMessage());
            return "";
        }
    }

    // ──────────── Fallback ────────────

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
        
        logUnresolvedQuery(message);
        return "Xin lỗi, hệ thống AI đang tạm thời không khả dụng hoặc tôi chưa hiểu ý bạn. Vui lòng thử lại sau! 🙏";
    }

    private void logUnresolvedQuery(String query) {
        if (query == null || query.isBlank()) return;
        
        String normalizedQuery = query.toLowerCase().trim()
                .replaceAll("[^a-z0-9\\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
                
        if (normalizedQuery.isBlank()) return;

        unresolvedQueryRepo.findByNormalizedQuery(normalizedQuery).ifPresentOrElse(
                log -> {
                    log.setHitCount(log.getHitCount() + 1);
                    log.setLastSeenAt(java.time.LocalDateTime.now());
                    unresolvedQueryRepo.save(log);
                },
                () -> {
                    com.example.Nhom8.models.UnresolvedQueryLog log = com.example.Nhom8.models.UnresolvedQueryLog.builder()
                            .query(query.length() > 500 ? query.substring(0, 500) : query)
                            .normalizedQuery(normalizedQuery.length() > 500 ? normalizedQuery.substring(0, 500) : normalizedQuery)
                            .build();
                    unresolvedQueryRepo.save(log);
                }
        );
    }
}
