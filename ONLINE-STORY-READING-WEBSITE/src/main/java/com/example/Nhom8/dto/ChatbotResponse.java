package com.example.Nhom8.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Structured chatbot response — separates AI text from suggested manga IDs
 * so the frontend can render rich StoryCards alongside the conversation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {
    /** Clean AI response text (with [SEARCH_RESULT...] tag stripped). */
    private String response;

    /** Story IDs the AI referenced — extracted via regex from the raw AI output. */
    @Builder.Default
    private List<Long> suggestedMangaIds = List.of();
}
