package com.example.Nhom8.dto;

import lombok.Data;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.Nhom8.models.Story;

@Data
public class StoryDTO {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String coverImage;
    private String author;
    private String status;
    @com.fasterxml.jackson.annotation.JsonProperty("isPremium")
    private boolean isPremium;
    private long viewCount;
    private Set<String> genres;

    public static StoryDTO fromEntity(Story story) {
        StoryDTO dto = new StoryDTO();
        dto.setId(story.getId());
        dto.setTitle(story.getTitle());
        dto.setSlug(story.getSlug());
        dto.setDescription(story.getDescription());
        dto.setCoverImage(story.getCoverImage());
        dto.setAuthor(story.getAuthor());
        dto.setStatus(story.getStatus().name());
        dto.setPremium(story.isPremium());
        dto.setViewCount(story.getViewCount());
        dto.setGenres(story.getGenres().stream().map(g -> g.getName()).collect(Collectors.toSet()));
        return dto;
    }
}
