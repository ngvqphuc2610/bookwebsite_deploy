package com.example.Nhom8.service;

import com.example.Nhom8.models.Chapter;
import com.example.Nhom8.repository.ChapterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChapterService {
    private final ChapterRepository chapterRepository;

    public Page<Chapter> getChaptersByStory(Long storyId, Pageable pageable) {
        return chapterRepository.findByStoryIdOrderByChapterNumberAsc(storyId, pageable);
    }

    public Chapter getChapterById(Long id) {
        return chapterRepository.findById(id).orElseThrow(() -> new RuntimeException("Chapter not found"));
    }

    public Chapter getChapterByNumber(Long storyId, int chapterNumber) {
        return chapterRepository.findByStoryIdAndChapterNumber(storyId, chapterNumber)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
    }

    public Chapter createChapter(Chapter chapter) {
        return chapterRepository.save(chapter);
    }

    public Chapter updateChapter(Long id, Chapter chapterDetails) {
        Chapter chapter = getChapterById(id);
        chapter.setTitle(chapterDetails.getTitle());
        chapter.setContent(chapterDetails.getContent());
        chapter.setChapterNumber(chapterDetails.getChapterNumber());
        return chapterRepository.save(chapter);
    }

    public void deleteChapter(Long id) {
        chapterRepository.deleteById(id);
    }
}
