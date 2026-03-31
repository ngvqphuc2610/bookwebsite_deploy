package com.example.Nhom8.service;

import com.example.Nhom8.models.*;
import com.example.Nhom8.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerCareService {

    private static final Pattern FAQ_DELIMITERS = Pattern.compile("\\s*(?:\\||,|;|/|\\n)\\s*");

    private final SupportConversationRepository conversationRepo;
    private final SupportMessageRepository messageRepo;
    private final FaqItemRepository faqItemRepo;
    private final UserRepository userRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final FaqIndexService faqIndexService;

    // ── Conversation management ──

    @Transactional
    public SupportConversation getOrCreateConversation(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        // Reuse an existing OPEN or PENDING_ADMIN conversation
        return conversationRepo.findByUserAndStatus(user, SupportConversation.ConversationStatus.OPEN)
                .or(() -> conversationRepo.findByUserAndStatus(user,
                        SupportConversation.ConversationStatus.PENDING_ADMIN))
                .orElseGet(() -> conversationRepo.save(SupportConversation.builder().user(user).build()));
    }

    public List<SupportConversation> getConversationsByStatus(List<SupportConversation.ConversationStatus> statuses) {
        return conversationRepo.findByStatusInOrderByUpdatedAtDesc(statuses);
    }

    public List<SupportConversation> getUserConversations(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        return conversationRepo.findByUserOrderByUpdatedAtDesc(user);
    }

    @Transactional
    public SupportConversation assignAdmin(Long conversationId, Long adminId) {
        SupportConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        User admin = userRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        conv.setAssignedAdmin(admin);
        conv.setStatus(SupportConversation.ConversationStatus.OPEN);
        return conversationRepo.save(conv);
    }

    @Transactional
    public SupportConversation closeConversation(Long conversationId) {
        SupportConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conv.setStatus(SupportConversation.ConversationStatus.CLOSED);
        conv.setClosedAt(LocalDateTime.now());
        return conversationRepo.save(conv);
    }

    // ── Message handling ──

    public List<SupportMessage> getMessages(Long conversationId) {
        SupportConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        return messageRepo.findByConversationOrderByCreatedAtAsc(conv);
    }

    @Transactional
    public SupportMessage handleUserMessage(Long conversationId, Long userId, String content) {
        SupportConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Long senderId = userId;
        if (senderId == null || !Objects.equals(senderId, conv.getUser().getId())) {
            senderId = conv.getUser().getId();
        }

        // Save user message
        SupportMessage userMsg = messageRepo.save(SupportMessage.builder()
                .conversation(conv).senderType(SupportMessage.SenderType.USER)
                .senderId(senderId).content(content).source(SupportMessage.MessageSource.MANUAL).build());
        broadcastMessage(conv.getId(), userMsg);

        // Try FAQ match
        String faqAnswer = matchFaq(content);
        if (faqAnswer != null) {
            SupportMessage botMsg = messageRepo.save(SupportMessage.builder()
                    .conversation(conv).senderType(SupportMessage.SenderType.BOT)
                    .content(faqAnswer).source(SupportMessage.MessageSource.FAQ_BOT).build());
            broadcastMessage(conv.getId(), botMsg);
            return botMsg;
        }

        // No FAQ match → escalate to admin
        conv.setStatus(SupportConversation.ConversationStatus.PENDING_ADMIN);
        conversationRepo.save(conv);
        notifyAdminPending(conv);
        return userMsg;
    }

    @Transactional
    public SupportMessage handleAdminReply(Long conversationId, Long adminId, String content) {
        SupportConversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (conv.getAssignedAdmin() == null) {
            assignAdmin(conversationId, adminId);
        }
        conv.setStatus(SupportConversation.ConversationStatus.OPEN);
        conversationRepo.save(conv);

        SupportMessage adminMsg = messageRepo.save(SupportMessage.builder()
                .conversation(conv).senderType(SupportMessage.SenderType.ADMIN)
                .senderId(adminId).content(content).source(SupportMessage.MessageSource.MANUAL).build());
        broadcastMessage(conv.getId(), adminMsg);
        return adminMsg;
    }

    // ── FAQ matching ──

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private String normalize(String text) {
        if (text == null)
            return "";
        String nfd = Normalizer.normalize(text.toLowerCase().trim(), Normalizer.Form.NFD);
        String normalized = DIACRITICS.matcher(nfd).replaceAll("").replace('đ', 'd');
        return normalized.replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    String matchFaq(String userMessage) {
        String normalized = normalize(userMessage);
        if (normalized.isBlank()) {
            return null;
        }

        List<FaqItem> faqs = faqItemRepo.findByActiveTrueOrderByPriorityDesc();
        if (faqs.isEmpty()) {
            faqs = buildDefaultFaqs();
        }

        for (FaqItem faq : faqs) {
            for (String candidate : extractPatterns(faq.getQuestionPattern())) {
                if (isFaqMatch(normalized, candidate)) {
                    return faq.getAnswerText();
                }
            }
        }
        return null;
    }

    public static List<FaqItem> buildDefaultFaqs() {
        return List.of(
                defaultFaq("xin chao|chao ban|hello|hi",
                        "Chào bạn! Mình đang hỗ trợ CSKH đây. Bạn cần hỗ trợ về thanh toán, Premium, hướng dẫn sử dụng hay báo lỗi ạ?",
                        100),
                defaultFaq("premium|goi premium|mua premium|nang cap premium",
                        "Bạn có thể vào trang Premium để xem gói và thanh toán. Sau khi thanh toán thành công, hệ thống sẽ tự cập nhật quyền Premium cho tài khoản của bạn.",
                        90),
                defaultFaq("thanh toan|payment|nap tien|mua goi",
                        "Hiện tại hệ thống hỗ trợ thanh toán trực tuyến cho gói Premium. Nếu thanh toán xong mà chưa nhận gói, bạn hãy gửi mã giao dịch để admin kiểm tra giúp nhé.",
                        80),
                defaultFaq("huong dan|huong dan su dung|cach su dung|doc truyen",
                        "Bạn chỉ cần đăng nhập, chọn truyện muốn đọc và mở chương tương ứng. Nếu muốn lưu truyện hoặc dùng Premium, hãy đăng nhập trước khi thao tác nhé.",
                        70),
                defaultFaq("bao loi|loi he thong|bug|khong vao duoc",
                        "Bạn vui lòng mô tả lỗi đang gặp, kèm ảnh chụp màn hình nếu có. Admin sẽ kiểm tra và phản hồi cho bạn sớm nhất.",
                        60));
    }

    private static FaqItem defaultFaq(String pattern, String answer, int priority) {
        return FaqItem.builder()
                .questionPattern(pattern)
                .answerText(answer)
                .priority(priority)
                .active(true)
                .build();
    }

    private List<String> extractPatterns(String rawPattern) {
        if (rawPattern == null || rawPattern.isBlank()) {
            return List.of();
        }

        return Arrays.stream(FAQ_DELIMITERS.split(rawPattern))
                .map(this::normalize)
                .filter(s -> !s.isBlank())
                .toList();
    }

    private boolean isFaqMatch(String normalizedMessage, String candidate) {
        if (candidate.isBlank()) {
            return false;
        }
        if (normalizedMessage.equals(candidate) || normalizedMessage.contains(candidate)) {
            return true;
        }

        String[] keywords = candidate.split("\\s+");
        long effectiveKeywordCount = Arrays.stream(keywords).filter(k -> k.length() > 1).count();
        if (effectiveKeywordCount == 0) {
            return normalizedMessage.equals(candidate);
        }

        long matched = Arrays.stream(keywords)
                .filter(k -> k.length() > 1)
                .filter(normalizedMessage::contains)
                .count();

        if (effectiveKeywordCount <= 2) {
            return matched == effectiveKeywordCount;
        }

        double ratio = (double) matched / effectiveKeywordCount;
        return ratio >= 0.6 || matched >= 2;
    }

    // ── WebSocket broadcasting ──

    private void broadcastMessage(Long conversationId, SupportMessage msg) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", msg.getId());
        payload.put("conversationId", conversationId);
        payload.put("senderType", msg.getSenderType().name());
        payload.put("senderId", msg.getSenderId());
        payload.put("content", msg.getContent());
        payload.put("source", msg.getSource().name());
        payload.put("createdAt", msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null);
        messagingTemplate.convertAndSend("/topic/support/" + conversationId, (Object) payload);
    }

    private void notifyAdminPending(SupportConversation conv) {
        Map<String, Object> notification = new LinkedHashMap<>();
        notification.put("conversationId", conv.getId());
        notification.put("userId", conv.getUser().getId());
        notification.put("username", conv.getUser().getUsername());
        notification.put("status", conv.getStatus().name());
        messagingTemplate.convertAndSend("/topic/support/pending", (Object) notification);
    }

    // ── FAQ CRUD ──

    public List<FaqItem> getAllFaqs() {
        return faqItemRepo.findAll();
    }

    public FaqItem saveFaq(FaqItem faq) {
        if (faq.getQuestionPattern() != null) {
            faq.setQuestionPattern(faq.getQuestionPattern().trim());
        }
        if (faq.getAnswerText() != null) {
            faq.setAnswerText(faq.getAnswerText().trim());
        }
        FaqItem savedFaq = faqItemRepo.save(faq);
        try {
            faqIndexService.indexFaq(savedFaq);
        } catch (Exception e) {
            log.warn("Failed to auto-index FAQ id={} in Qdrant: {}", savedFaq.getId(), e.getMessage());
        }
        return savedFaq;
    }

    public void deleteFaq(Long id) {
        faqItemRepo.deleteById(id);
        try {
            faqIndexService.removeFaqVector(id);
        } catch (Exception e) {
            log.warn("Failed to auto-remove FAQ id={} from Qdrant: {}", id, e.getMessage());
        }
    }
}
