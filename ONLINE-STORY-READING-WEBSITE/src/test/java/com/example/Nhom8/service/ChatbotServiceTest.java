package com.example.Nhom8.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChatbotServiceTest {

    @Test
    void getResponse_stillCallsAiWhenHybridSearchFails() {
        OllamaService ollamaService = mock(OllamaService.class);
        HybridSearchService hybridSearchService = mock(HybridSearchService.class);
        when(hybridSearchService.hybridSearch("hello", 5)).thenThrow(new RuntimeException("search down"));
        when(ollamaService.chatWithHistory(anyString(), eq("hello"), anyList())).thenReturn("Xin chào!");

        ChatbotService service = new ChatbotService(ollamaService, hybridSearchService);

        assertEquals("Xin chào!", service.getResponse("hello"));
        verify(ollamaService).chatWithHistory(anyString(), eq("hello"), eq(java.util.List.of()));
    }

    @Test
    void getResponse_returnsFallbackWhenAiChatFails() {
        OllamaService ollamaService = mock(OllamaService.class);
        HybridSearchService hybridSearchService = mock(HybridSearchService.class);
        when(hybridSearchService.hybridSearch("premium", 5)).thenThrow(new RuntimeException("search down"));
        when(ollamaService.chatWithHistory(anyString(), eq("premium"), anyList()))
                .thenThrow(new RuntimeException("chat down"));

        ChatbotService service = new ChatbotService(ollamaService, hybridSearchService);

        assertEquals(
                "Gói Premium cho phép bạn đọc tất cả truyện khóa, không quảng cáo, và ưu tiên chương mới. Vào mục Tài khoản > Nâng cấp Premium để đăng ký!",
                service.getResponse("premium"));
    }
}