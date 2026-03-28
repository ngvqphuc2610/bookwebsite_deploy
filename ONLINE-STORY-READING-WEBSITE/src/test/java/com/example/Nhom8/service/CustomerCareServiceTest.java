package com.example.Nhom8.service;

import com.example.Nhom8.models.FaqItem;
import com.example.Nhom8.repository.FaqItemRepository;
import com.example.Nhom8.repository.SupportConversationRepository;
import com.example.Nhom8.repository.SupportMessageRepository;
import com.example.Nhom8.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CustomerCareServiceTest {

    private final SupportConversationRepository conversationRepo = mock(SupportConversationRepository.class);
    private final SupportMessageRepository messageRepo = mock(SupportMessageRepository.class);
    private final FaqItemRepository faqItemRepo = mock(FaqItemRepository.class);
    private final UserRepository userRepo = mock(UserRepository.class);
    private final SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);

    private final CustomerCareService service = new CustomerCareService(
            conversationRepo,
            messageRepo,
            faqItemRepo,
            userRepo,
            messagingTemplate);

    @Test
    void matchFaq_supportsVietnameseAndAliasPatterns() {
        when(faqItemRepo.findByActiveTrueOrderByPriorityDesc()).thenReturn(List.of(
                FaqItem.builder()
                        .questionPattern("xin chao|hello|hi|huong dan su dung")
                        .answerText("Da tim thay FAQ")
                        .priority(100)
                        .active(true)
                        .build()));

        assertEquals("Da tim thay FAQ", service.matchFaq("Em cần hướng dẫn sử dụng ạ"));
        assertEquals("Da tim thay FAQ", service.matchFaq("hello admin"));
    }

    @Test
    void matchFaq_usesDefaultFaqsWhenDatabaseIsEmpty() {
        when(faqItemRepo.findByActiveTrueOrderByPriorityDesc()).thenReturn(List.of());

        String answer = service.matchFaq("xin chào");

        assertTrue(answer != null && answer.contains("Chào bạn"));
    }
}