package com.example.Nhom8.controllers;

import com.example.Nhom8.dto.ChapterDTO;
import com.example.Nhom8.models.Chapter;
import com.example.Nhom8.service.ChapterService;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
public class ChapterController {
    private final ChapterService chapterService;
    private final UserRepository userRepository;
    private final SystemLogService systemLogService;

    private boolean isUserPremium(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        
        return userRepository.findByUsername(authentication.getName())
                .map(user -> user.isPremium() && user.getPremiumExpiry() != null && user.getPremiumExpiry().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    @GetMapping("/story/{storyId}")
    public ResponseEntity<Page<ChapterDTO>> getChaptersByStory(@PathVariable Long storyId, Pageable pageable) {
        Page<Chapter> chapters = chapterService.getChaptersByStory(storyId, pageable);
        return ResponseEntity.ok(chapters.map(ChapterDTO::fromEntity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getChapterById(@PathVariable Long id) {
        Chapter chapter = chapterService.getChapterById(id);
        
        if (chapter.getStory().isPremium()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isUserPremium(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Truyện này đã được khóa. Vui lòng mua gói Premium để tiếp tục đọc.");
            }
        }
        
        return ResponseEntity.ok(ChapterDTO.fromEntity(chapter));
    }

    @GetMapping("/story/{storyId}/number/{number}")
    public ResponseEntity<?> getChapterByNumber(@PathVariable Long storyId, @PathVariable int number) {
        Chapter chapter = chapterService.getChapterByNumber(storyId, number);
        
        if (chapter.getStory().isPremium()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (!isUserPremium(auth)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Truyện này đã được khóa. Vui lòng mua gói Premium để tiếp tục đọc.");
            }
        }
        
        return ResponseEntity.ok(ChapterDTO.fromEntity(chapter));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ChapterDTO> createChapter(@RequestBody Chapter chapter) {
        Chapter createdChapter = chapterService.createChapter(chapter);
        systemLogService.log("CREATE_CHAPTER", "Đã thêm chương: " + createdChapter.getTitle() + " cho truyện IDs: " + createdChapter.getStory().getId());
        return ResponseEntity.ok(ChapterDTO.fromEntity(createdChapter));
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ChapterDTO> updateChapter(@PathVariable Long id, @RequestBody Chapter chapterDetails) {
        Chapter updatedChapter = chapterService.updateChapter(id, chapterDetails);
        systemLogService.log("UPDATE_CHAPTER", "Đã cập nhật chương: " + updatedChapter.getTitle());
        return ResponseEntity.ok(ChapterDTO.fromEntity(updatedChapter));
    }

    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        Chapter chapter = chapterService.getChapterById(id);
        String name = (chapter != null) ? chapter.getTitle() : id.toString();
        chapterService.deleteChapter(id);
        systemLogService.log("DELETE_CHAPTER", "Đã xóa chương: " + name);
        return ResponseEntity.noContent().build();
    }
}
