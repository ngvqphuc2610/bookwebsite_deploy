package com.example.Nhom8.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Nhom8.models.Chapter;
import com.example.Nhom8.models.Story;

import java.util.List;
import java.util.Optional;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {
    Page<Chapter> findByStoryIdOrderByChapterNumberAsc(Long storyId, Pageable pageable);

    List<Chapter> findByStoryOrderByChapterNumberAsc(Story story);

    Optional<Chapter> findByStoryIdAndChapterNumber(Long storyId, int chapterNumber);
}
