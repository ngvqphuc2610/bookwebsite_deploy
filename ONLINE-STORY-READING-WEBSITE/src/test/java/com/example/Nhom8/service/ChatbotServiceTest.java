package com.example.Nhom8.service;

import com.example.Nhom8.dto.ChatbotResponse;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ChatbotServiceTest {

    private final FaqIndexService faqIndexService = mock(FaqIndexService.class);
    private final com.example.Nhom8.repository.UnresolvedQueryLogRepository unresolvedQueryRepo = mock(com.example.Nhom8.repository.UnresolvedQueryLogRepository.class);

    // ──── Existing behaviour tests (updated for ChatbotResponse) ────

    @Test
    void getResponse_stillCallsAiWhenHybridSearchFails() {
        OllamaService ollamaService = mock(OllamaService.class);
        HybridSearchService hybridSearchService = mock(HybridSearchService.class);
        when(hybridSearchService.hybridSearch("hello", 5)).thenThrow(new RuntimeException("search down"));
        when(ollamaService.chatWithHistory(anyString(), eq("hello"), anyList())).thenReturn("Xin chào!");

        ChatbotService service = new ChatbotService(ollamaService, hybridSearchService, faqIndexService, unresolvedQueryRepo);
        ReflectionTestUtils.setField(service, "aiChatEnabled", true);

        ChatbotResponse resp = service.getResponse("hello");
        assertEquals("Xin chào!", resp.getResponse());
        assertTrue(resp.getSuggestedMangaIds().isEmpty());
        verify(ollamaService).chatWithHistory(anyString(), eq("hello"), eq(List.of()));
    }

    @Test
    void getResponse_returnsFallbackWhenAiChatFails() {
        OllamaService ollamaService = mock(OllamaService.class);
        HybridSearchService hybridSearchService = mock(HybridSearchService.class);
        when(hybridSearchService.hybridSearch("premium", 5)).thenThrow(new RuntimeException("search down"));
        when(ollamaService.chatWithHistory(anyString(), eq("premium"), anyList()))
                .thenThrow(new RuntimeException("chat down"));

        ChatbotService service = new ChatbotService(ollamaService, hybridSearchService, faqIndexService, unresolvedQueryRepo);
        ReflectionTestUtils.setField(service, "aiChatEnabled", true);

        ChatbotResponse resp = service.getResponse("premium");
        assertEquals(
                "Gói Premium cho phép bạn đọc tất cả truyện khóa, không quảng cáo, và ưu tiên chương mới. Vào mục Tài khoản > Nâng cấp Premium để đăng ký!",
                resp.getResponse());
        assertTrue(resp.getSuggestedMangaIds().isEmpty());
    }

    @Test
    void getResponse_returnsFallbackWhenAiChatDisabled() {
        OllamaService ollamaService = mock(OllamaService.class);
        HybridSearchService hybridSearchService = mock(HybridSearchService.class);

        ChatbotService service = new ChatbotService(ollamaService, hybridSearchService, faqIndexService, unresolvedQueryRepo);
        ReflectionTestUtils.setField(service, "aiChatEnabled", false);

        ChatbotResponse resp = service.getResponse("premium");
        assertEquals(
                "Gói Premium cho phép bạn đọc tất cả truyện khóa, không quảng cáo, và ưu tiên chương mới. Vào mục Tài khoản > Nâng cấp Premium để đăng ký!",
                resp.getResponse());
        assertTrue(resp.getSuggestedMangaIds().isEmpty());
    }

    // ──── New: parseResponse / regex tests ────

    @Test
    void parseResponse_extractsIdsAndStripsTag() {
        ChatbotService service = new ChatbotService(null, null, null, null);

        ChatbotResponse resp = service.parseResponse(
                "Đây là một số truyện hay cho bạn! [SEARCH_RESULT: [5, 12, 23]]");

        assertEquals("Đây là một số truyện hay cho bạn!", resp.getResponse());
        assertEquals(List.of(5L, 12L, 23L), resp.getSuggestedMangaIds());
    }

    @Test
    void parseResponse_handlesNoTag() {
        ChatbotService service = new ChatbotService(null, null, null, null);

        ChatbotResponse resp = service.parseResponse("Xin chào! Tôi có thể giúp gì cho bạn?");

        assertEquals("Xin chào! Tôi có thể giúp gì cho bạn?", resp.getResponse());
        assertTrue(resp.getSuggestedMangaIds().isEmpty());
    }

    @Test
    void parseResponse_handlesSingleId() {
        ChatbotService service = new ChatbotService(null, null, null, null);

        ChatbotResponse resp = service.parseResponse(
                "Bạn nên đọc truyện này: [SEARCH_RESULT: [42]]");

        assertEquals("Bạn nên đọc truyện này:", resp.getResponse());
        assertEquals(List.of(42L), resp.getSuggestedMangaIds());
    }

    @Test
    void parseResponse_handlesEmptyBrackets() {
        ChatbotService service = new ChatbotService(null, null, null, null);

        ChatbotResponse resp = service.parseResponse(
                "Không tìm thấy truyện phù hợp. [SEARCH_RESULT: []]");

        assertEquals("Không tìm thấy truyện phù hợp.", resp.getResponse());
        assertTrue(resp.getSuggestedMangaIds().isEmpty());
    }

    @Test
    void parseResponse_handlesNullAndBlank() {
        ChatbotService service = new ChatbotService(null, null, null, null);

        ChatbotResponse nullResp = service.parseResponse(null);
        assertEquals("Xin lỗi, tôi không hiểu câu hỏi của bạn.", nullResp.getResponse());
        assertTrue(nullResp.getSuggestedMangaIds().isEmpty());

        ChatbotResponse blankResp = service.parseResponse("  ");
        assertEquals("Xin lỗi, tôi không hiểu câu hỏi của bạn.", blankResp.getResponse());
    }

    @Test
    void parseResponse_skipsInvalidIds() {
        ChatbotService service = new ChatbotService(null, null, null, null);

        ChatbotResponse resp = service.parseResponse(
                "Gợi ý: [SEARCH_RESULT: [5, abc, 12]]");

        assertEquals("Gợi ý:", resp.getResponse());
        assertEquals(List.of(5L, 12L), resp.getSuggestedMangaIds());
    }
}