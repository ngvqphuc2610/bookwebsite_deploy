package com.example.Nhom8.service;

import com.example.Nhom8.repository.StoryRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChatbotServiceTest {

    @Test
    void getResponse_stillCallsAiWhenHybridSearchFails() {
        OllamaService ollamaService = mock(OllamaService.class);
        HybridSearchService hybridSearchService = mock(HybridSearchService.class);
        PremiumPackageService premiumPackageService = mock(PremiumPackageService.class);
        StoryRepository storyRepository = mock(StoryRepository.class);

        when(hybridSearchService.hybridSearch(anyString(), anyInt())).thenThrow(new RuntimeException("search down"));
        when(ollamaService.chatWithHistory(anyString(), anyString(), anyList())).thenReturn("Xin chào!");

        ChatbotService service = new ChatbotService(ollamaService, hybridSearchService, premiumPackageService, storyRepository);

        assertEquals("Xin chào!", service.getResponse("hello"));
        verify(ollamaService).chatWithHistory(anyString(), contains("hello"), anyList());
    }

    @Test
    void getResponse_returnsFallbackWhenAiChatFails() {
        OllamaService ollamaService = mock(OllamaService.class);
        HybridSearchService hybridSearchService = mock(HybridSearchService.class);
        PremiumPackageService premiumPackageService = mock(PremiumPackageService.class);
        StoryRepository storyRepository = mock(StoryRepository.class);

        when(ollamaService.chatWithHistory(anyString(), anyString(), anyList())).thenThrow(new RuntimeException("chat down"));

        ChatbotService service = new ChatbotService(ollamaService, hybridSearchService, premiumPackageService, storyRepository);

        String response = service.getResponse("premium");
        assertEquals("Gói Premium cho phép bạn đọc tất cả truyện khóa, không quảng cáo, và ưu tiên chương mới. Vào mục Tài khoản > Nâng cấp Premium để đăng ký!",
                response);
    }
}