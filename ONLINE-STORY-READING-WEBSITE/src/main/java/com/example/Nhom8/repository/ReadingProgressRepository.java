package com.example.Nhom8.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Nhom8.models.ReadingProgress;

import java.util.Optional;

public interface ReadingProgressRepository extends JpaRepository<ReadingProgress, Long> {
    Optional<ReadingProgress> findByUserIdAndStoryId(Long userId, Long storyId);

    java.util.List<ReadingProgress> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
