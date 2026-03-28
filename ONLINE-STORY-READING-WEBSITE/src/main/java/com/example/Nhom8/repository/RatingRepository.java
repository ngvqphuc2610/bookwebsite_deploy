package com.example.Nhom8.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Nhom8.models.Rating;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserIdAndStoryId(Long userId, Long storyId);

    Long countByStoryId(Long storyId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(r.stars) FROM Rating r WHERE r.story.id = :storyId")
    Double findAverageRatingByStoryId(Long storyId);
}
