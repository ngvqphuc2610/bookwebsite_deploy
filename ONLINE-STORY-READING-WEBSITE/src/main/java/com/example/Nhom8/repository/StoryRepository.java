package com.example.Nhom8.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.Nhom8.models.Genre;
import com.example.Nhom8.models.Story;

import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {
    Page<Story> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Story> findByGenresIn(List<Genre> genres, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT s FROM Story s JOIN s.genres g WHERE g.slug = :slug")
    Page<Story> findByGenreSlug(@org.springframework.data.repository.query.Param("slug") String slug,
            Pageable pageable);

    java.util.Optional<Story> findBySlug(String slug);

    Page<Story> findByStatus(Story.StoryStatus status, Pageable pageable);

    Page<Story> findByIsPremium(boolean isPremium, Pageable pageable);

    // For Statistics
    List<Story> findTop10ByOrderByViewCountDesc();


    /**
     * MySQL FULLTEXT search on title, description, author.
     * Returns Object[] = {story_id (Long), ft_score (Double)}.
     * Requires FULLTEXT index: idx_ft_stories(title, description, author).
     */
    @Query(value = "SELECT s.id, MATCH(s.title, s.description, s.author) AGAINST(:query) AS ft_score "
            + "FROM stories s WHERE MATCH(s.title, s.description, s.author) AGAINST(:query) "
            + "ORDER BY ft_score DESC LIMIT :lim", nativeQuery = true)
    List<Object[]> fulltextSearch(@Param("query") String query, @Param("lim") int lim);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM Story s LEFT JOIN Rating r ON s.id = r.story.id GROUP BY s.id ORDER BY COALESCE(AVG(r.stars), 0) DESC")
    List<Story> findTopRatedStories(org.springframework.data.domain.Pageable pageable);

}
