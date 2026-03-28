package com.example.Nhom8.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Nhom8.models.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByStoryIdAndIsApprovedTrueOrderByCreatedAtDesc(Long storyId, Pageable pageable);

    Page<Comment> findByChapterIdAndIsApprovedTrueOrderByCreatedAtDesc(Long chapterId, Pageable pageable);

    Page<Comment> findByIsApprovedFalse(Pageable pageable); // For moderation
}
