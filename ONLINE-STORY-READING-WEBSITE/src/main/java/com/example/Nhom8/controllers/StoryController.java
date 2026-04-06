package com.example.Nhom8.controllers;

import com.example.Nhom8.dto.StoryDTO;
import com.example.Nhom8.models.Story;
import com.example.Nhom8.service.StoryService;
import com.example.Nhom8.service.SystemLogService;
import com.example.Nhom8.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.repository.GenreRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.*;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {
    private final StoryService storyService;
    private final ChapterService chapterService;
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final SystemLogService systemLogService;

    @GetMapping
    public ResponseEntity<Page<StoryDTO>> getAllStories(Pageable pageable) {
        Page<Story> stories = storyService.getAllStories(pageable);
        return ResponseEntity.ok(stories.map(StoryDTO::fromEntity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoryDTO> getStoryById(@PathVariable Long id) {
        Story story = storyService.getStoryById(id);
        return ResponseEntity.ok(StoryDTO.fromEntity(story));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<StoryDTO>> searchStories(@RequestParam String q, Pageable pageable) {
        Page<Story> stories = storyService.searchStories(q, pageable);
        return ResponseEntity.ok(stories.map(StoryDTO::fromEntity));
    }

    @GetMapping("/genre/{genreSlug}")
    public ResponseEntity<Page<StoryDTO>> getStoriesByGenre(@PathVariable String genreSlug, Pageable pageable) {
        Page<Story> stories = storyService.filterByGenreSlug(genreSlug, pageable);
        return ResponseEntity.ok(stories.map(StoryDTO::fromEntity));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<StoryDTO>> getStoriesByStatus(@PathVariable String status, Pageable pageable) {
        try {
            Story.StoryStatus storyStatus = Story.StoryStatus.valueOf(status.toUpperCase());
            Page<Story> stories = storyService.filterByStatus(storyStatus, pageable);
            return ResponseEntity.ok(stories.map(StoryDTO::fromEntity));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/premium")
    public ResponseEntity<Page<StoryDTO>> getPremiumStories(Pageable pageable) {
        Page<Story> stories = storyService.filterByPremium(true, pageable);
        return ResponseEntity.ok(stories.map(StoryDTO::fromEntity));
    }

    @GetMapping("/new")
    public ResponseEntity<Page<StoryDTO>> getNewStories(Pageable pageable) {
        // Just return stories ordered by createdAt desc
        Page<Story> stories = storyService.getAllStories(
                org.springframework.data.domain.PageRequest.of(
                        pageable.getPageNumber(),
                        pageable.getPageSize(),
                        org.springframework.data.domain.Sort.by("createdAt").descending()));
        return ResponseEntity.ok(stories.map(StoryDTO::fromEntity));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<java.util.List<StoryDTO>> getTopRatedStories(@RequestParam(defaultValue = "10") int limit) {
        java.util.List<Story> stories = storyService.getTopRatedStories(limit);
        return ResponseEntity
                .ok(stories.stream().map(StoryDTO::fromEntity).collect(java.util.stream.Collectors.toList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<StoryDTO> createStory(@RequestBody java.util.Map<String, Object> data) {
        String slug = (String) data.get("slug");
        if (slug != null) {
            java.util.Optional<Story> existing = storyService.getBySlug(slug);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(null);
            }
        }

        Story story = new Story();
        mapDataToStory(data, story);

        // Set creator from current auth
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            userRepository.findByUsername(auth.getName()).ifPresent(story::setCreator);
        }

        Story createdStory = storyService.createStory(story);
        return ResponseEntity.ok(StoryDTO.fromEntity(createdStory));
    }

    private void mapDataToStory(java.util.Map<String, Object> data, Story story) {
        if (data.containsKey("title"))
            story.setTitle((String) data.get("title"));
        if (data.containsKey("slug"))
            story.setSlug((String) data.get("slug"));
        if (data.containsKey("author"))
            story.setAuthor((String) data.get("author"));
        if (data.containsKey("description"))
            story.setDescription((String) data.get("description"));
        if (data.containsKey("coverImage"))
            story.setCoverImage((String) data.get("coverImage"));

        if (data.containsKey("status")) {
            try {
                story.setStatus(Story.StoryStatus.valueOf((String) data.get("status")));
            } catch (Exception e) {
            }
        }

        if (data.containsKey("isPremium")) {
            Object premium = data.get("isPremium");
            if (premium instanceof Boolean)
                story.setPremium((Boolean) premium);
            else
                story.setPremium(Boolean.parseBoolean(String.valueOf(premium)));
        }

        if (data.containsKey("genres")) {
            Object genresObj = data.get("genres");
            if (genresObj instanceof java.util.List) {
                java.util.List<String> genreNames = (java.util.List<String>) genresObj;
                java.util.Set<com.example.Nhom8.models.Genre> genres = new java.util.HashSet<>();
                for (String gName : genreNames) {
                    com.example.Nhom8.models.Genre genre = genreRepository.findByName(gName)
                            .orElseGet(() -> {
                                com.example.Nhom8.models.Genre newG = new com.example.Nhom8.models.Genre();
                                newG.setName(gName);
                                newG.setSlug(com.example.Nhom8.utils.SlugUtils.toSlug(gName));
                                return genreRepository.save(newG);
                            });
                    genres.add(genre);
                }
                story.setGenres(genres);
            }
        }
    }

    @PostMapping("/import")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<StoryDTO> importStory(@RequestBody java.util.Map<String, Object> data) {
        String slug = (String) data.get("slug");
        if (slug == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if already exists
        if (storyService.getBySlug(slug).isPresent()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).build();
        }

        Story story = new Story();
        story.setTitle((String) data.get("title"));
        story.setSlug(slug);
        story.setAuthor((String) data.get("author"));
        story.setDescription((String) data.get("description"));
        story.setCoverImage((String) data.get("coverImage"));
        story.setStatus(Story.StoryStatus.valueOf((String) data.get("status")));
        story.setPremium(data.get("isPremium") != null && (boolean) data.get("isPremium"));
        story.setViewCount(0L);

        // Handle genres
        java.util.List<String> genreNames = (java.util.List<String>) data.get("genres");
        if (genreNames != null) {
            java.util.Set<com.example.Nhom8.models.Genre> genres = new java.util.HashSet<>();
            for (String gName : genreNames) {
                com.example.Nhom8.models.Genre genre = genreRepository.findByName(gName)
                        .orElseGet(() -> {
                            com.example.Nhom8.models.Genre newG = new com.example.Nhom8.models.Genre();
                            newG.setName(gName);
                            newG.setSlug(com.example.Nhom8.utils.SlugUtils.toSlug(gName));
                            return genreRepository.save(newG);
                        });
                genres.add(genre);
            }
            story.setGenres(genres);
        }

        // Set creator from current auth
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            userRepository.findByUsername(username).ifPresent(story::setCreator);
        }

        Story createdStory = storyService.createStory(story);

        // Handle chapters if present
        Object chaptersObj = data.get("chapters");
        if (chaptersObj instanceof java.util.List) {
            java.util.List<?> servers = (java.util.List<?>) chaptersObj;
            if (!servers.isEmpty()) {
                Object firstServerObj = servers.get(0);
                if (firstServerObj instanceof java.util.Map) {
                    java.util.Map<String, Object> firstServer = (java.util.Map<String, Object>) firstServerObj;
                    Object serverDataObj = firstServer.get("server_data");
                    if (serverDataObj instanceof java.util.List) {
                        java.util.List<java.util.Map<String, Object>> chaptersRaw = (java.util.List<java.util.Map<String, Object>>) serverDataObj;
                        for (java.util.Map<String, Object> chData : chaptersRaw) {
                            com.example.Nhom8.models.Chapter chapter = new com.example.Nhom8.models.Chapter();
                            String chNameStr = String.valueOf(chData.get("chapter_name"));
                            try {
                                double num = Double.parseDouble(chNameStr);
                                chapter.setChapterNumber((int) num);
                            } catch (Exception e) {
                                chapter.setChapterNumber(0);
                            }
                            String chTitle = (String) chData.get("chapter_title");
                            chapter.setTitle((chTitle == null || chTitle.isEmpty()) ? "Chương " + chNameStr : chTitle);
                            chapter.setContent((String) chData.get("chapter_api_data"));
                            chapter.setStory(createdStory);
                            chapterService.createChapter(chapter);
                        }
                    }
                }
            }
        }
        systemLogService.log("CREATE_STORY", "Đã tạo truyện mới: " + createdStory.getTitle());

        return ResponseEntity.ok(StoryDTO.fromEntity(createdStory));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<StoryDTO> updateStory(@PathVariable Long id,
            @RequestBody java.util.Map<String, Object> data) {
        Story existingStory = storyService.getStoryById(id);
        mapDataToStory(data, existingStory);
        Story updatedStory = storyService.createStory(existingStory); 
        systemLogService.log("UPDATE_STORY", "Đã cập nhật thông tin truyện: " + updatedStory.getTitle());
        return ResponseEntity.ok(StoryDTO.fromEntity(updatedStory));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id) {
        Story story = storyService.getStoryById(id);
        String title = (story != null) ? story.getTitle() : id.toString();
        storyService.deleteStory(id);
        systemLogService.log("DELETE_STORY", "Đã xóa truyện: " + title);
        return ResponseEntity.noContent().build();
    }
}
