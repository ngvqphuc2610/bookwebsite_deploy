package com.example.Nhom8.controllers;

import com.example.Nhom8.models.Rating;
import com.example.Nhom8.models.Story;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.RatingRepository;
import com.example.Nhom8.repository.StoryRepository;
import com.example.Nhom8.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingRepository ratingRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    @PostMapping("/{storyId}")
    public ResponseEntity<?> rateStory(@PathVariable Long storyId, @RequestParam int stars, Authentication authentication) {
        if (stars < 1 || stars > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5 stars");
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found"));

        Optional<Rating> existingRating = ratingRepository.findByUserIdAndStoryId(user.getId(), storyId);
        
        Rating rating;
        if (existingRating.isPresent()) {
            rating = existingRating.get();
            rating.setStars(stars);
        } else {
            rating = Rating.builder()
                    .user(user)
                    .story(story)
                    .stars(stars)
                    .build();
        }
        
        ratingRepository.save(rating);
        
        // Return new average and count
        return getStoryRating(storyId);
    }

    @GetMapping("/{storyId}")
    public ResponseEntity<?> getStoryRating(@PathVariable Long storyId) {
        Double avgRating = ratingRepository.findAverageRatingByStoryId(storyId);
        Long count = ratingRepository.countByStoryId(storyId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("averageRating", avgRating != null ? avgRating : 0.0);
        result.put("ratingCount", count);
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{storyId}/my-rating")
    public ResponseEntity<?> getMyRating(@PathVariable Long storyId, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(0);
        }
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(ratingRepository.findByUserIdAndStoryId(user.getId(), storyId)
                .map(Rating::getStars)
                .orElse(0));
    }
}
