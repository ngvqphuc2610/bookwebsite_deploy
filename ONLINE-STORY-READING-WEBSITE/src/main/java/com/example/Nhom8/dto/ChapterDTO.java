package com.example.Nhom8.dto;

import com.example.Nhom8.models.Chapter;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChapterDTO {
    private Long id;
    private String title;
    private int chapterNumber;
    private String content;
    private LocalDateTime createdAt;

    public static ChapterDTO fromEntity(Chapter chapter) {
        ChapterDTO dto = new ChapterDTO();
        dto.setId(chapter.getId());
        dto.setTitle(chapter.getTitle());
        dto.setChapterNumber(chapter.getChapterNumber());
        dto.setContent(chapter.getContent());
        dto.setCreatedAt(chapter.getCreatedAt());
        return dto;
    }
}
