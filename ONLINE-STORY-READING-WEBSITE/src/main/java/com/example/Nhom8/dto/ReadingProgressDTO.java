package com.example.Nhom8.dto;

import com.example.Nhom8.models.ReadingProgress;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReadingProgressDTO {
    private Long id;
    private Long storyId;
    private String storyTitle;
    private String storyCover;
    private Long lastChapterId;
    private String lastChapterTitle;
    private Integer lastChapterNumber;
    private LocalDateTime updatedAt;

    public static ReadingProgressDTO fromEntity(ReadingProgress progress) {
        return ReadingProgressDTO.builder()
                .id(progress.getId())
                .storyId(progress.getStory().getId())
                .storyTitle(progress.getStory().getTitle())
                .storyCover(progress.getStory().getCoverImage())
                .lastChapterId(progress.getLastChapter() != null ? progress.getLastChapter().getId() : null)
                .lastChapterTitle(progress.getLastChapter() != null ? progress.getLastChapter().getTitle() : null)
                .lastChapterNumber(
                        progress.getLastChapter() != null ? progress.getLastChapter().getChapterNumber() : null)
                .updatedAt(progress.getUpdatedAt())
                .build();
    }
}
