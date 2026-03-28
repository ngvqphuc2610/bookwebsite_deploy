package com.example.Nhom8.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Nhom8.models.FavoriteStory;

import java.util.Optional;

public interface FavoriteStoryRepository extends JpaRepository<FavoriteStory, Long> {
    Page<FavoriteStory> findByUserId(Long userId, Pageable pageable);

    Optional<FavoriteStory> findByUserIdAndStoryId(Long userId, Long storyId);

    boolean existsByUserIdAndStoryId(Long userId, Long storyId);
}
