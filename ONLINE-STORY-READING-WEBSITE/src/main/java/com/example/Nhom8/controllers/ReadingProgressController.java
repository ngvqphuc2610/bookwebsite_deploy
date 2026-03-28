package com.example.Nhom8.controllers;

import com.example.Nhom8.dto.ReadingProgressDTO;
import com.example.Nhom8.models.Chapter;
import com.example.Nhom8.models.ReadingProgress;
import com.example.Nhom8.models.Story;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.ChapterRepository;
import com.example.Nhom8.repository.ReadingProgressRepository;
import com.example.Nhom8.repository.StoryRepository;
import com.example.Nhom8.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reading-progress")
@RequiredArgsConstructor
public class ReadingProgressController {

    private final ReadingProgressRepository readingProgressRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;
    private final ChapterRepository chapterRepository;

    @GetMapping
    public ResponseEntity<List<ReadingProgressDTO>> getUserReadingProgress(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        List<ReadingProgress> progresses = readingProgressRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
        List<ReadingProgressDTO> dtos = progresses.stream()
                .map(ReadingProgressDTO::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{storyId}")
    public ResponseEntity<ReadingProgressDTO> getProgressForStory(
            @PathVariable Long storyId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok().build();
        }
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Optional<ReadingProgress> progress = readingProgressRepository.findByUserIdAndStoryId(user.getId(), storyId);
        return progress.map(p -> ResponseEntity.ok(ReadingProgressDTO.fromEntity(p)))
                .orElse(ResponseEntity.ok().build());
    }

    @PostMapping("/{storyId}/{chapterId}")
    public ResponseEntity<ReadingProgressDTO> saveProgress(
            @PathVariable Long storyId,
            @PathVariable Long chapterId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Story story = storyRepository.findById(storyId).orElse(null);
        Chapter chapter = chapterRepository.findById(chapterId).orElse(null);

        if (story == null || chapter == null) {
            return ResponseEntity.badRequest().build();
        }

        ReadingProgress progress = readingProgressRepository.findByUserIdAndStoryId(user.getId(), storyId)
                .orElse(new ReadingProgress());

        progress.setUser(user);
        progress.setStory(story);
        progress.setLastChapter(chapter);
        if (progress.getId() == null) {
            progress.setUpdatedAt(LocalDateTime.now());
        }

        ReadingProgress saved = readingProgressRepository.save(progress);

        return ResponseEntity.ok(ReadingProgressDTO.fromEntity(saved));
    }
}
