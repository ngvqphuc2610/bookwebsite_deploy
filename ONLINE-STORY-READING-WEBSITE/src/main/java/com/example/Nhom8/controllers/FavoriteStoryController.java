package com.example.Nhom8.controllers;

import com.example.Nhom8.dto.StoryDTO;
import com.example.Nhom8.models.FavoriteStory;
import com.example.Nhom8.models.Story;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.FavoriteStoryRepository;
import com.example.Nhom8.repository.StoryRepository;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.service.SystemLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteStoryController {

    private final FavoriteStoryRepository favoriteStoryRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final SystemLogService systemLogService;

    @GetMapping
    public ResponseEntity<Page<StoryDTO>> getMyFavorites(Authentication authentication, Pageable pageable) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Page<FavoriteStory> favorites = favoriteStoryRepository.findByUserId(user.getId(), pageable);
        return ResponseEntity.ok(favorites.map(f -> StoryDTO.fromEntity(f.getStory())));
    }

    @PostMapping("/toggle/{storyId}")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long storyId, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));

        Optional<FavoriteStory> existing = favoriteStoryRepository.findByUserIdAndStoryId(user.getId(), storyId);
        if (existing.isPresent()) {
            favoriteStoryRepository.delete(existing.get());
            systemLogService.log("UNFAVORITE_STORY", "Đã bỏ yêu thích truyện: " + story.getTitle());
            return ResponseEntity.ok(false); // Unfavorited
        } else {
            FavoriteStory favorite = FavoriteStory.builder()
                    .user(user)
                    .story(story)
                    .build();
            favoriteStoryRepository.save(favorite);
            systemLogService.log("FAVORITE_STORY", "Đã yêu thích truyện: " + story.getTitle());
            return ResponseEntity.ok(true); // Favorited
        }
    }

    @GetMapping("/check/{storyId}")
    public ResponseEntity<Boolean> checkFavorite(@PathVariable Long storyId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return ResponseEntity.ok(false);
        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) return ResponseEntity.ok(false);

        return ResponseEntity.ok(favoriteStoryRepository.existsByUserIdAndStoryId(user.getId(), storyId));
    }
}
