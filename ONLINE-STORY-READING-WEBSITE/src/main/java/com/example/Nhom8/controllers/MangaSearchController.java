package com.example.Nhom8.controllers;

import com.example.Nhom8.service.HybridSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Public API for manga hybrid search and recommendations.
 */
@RestController
@RequestMapping("/api/manga")
@RequiredArgsConstructor
public class MangaSearchController {

    private final HybridSearchService hybridSearchService;

    /**
     * Hybrid search: MySQL fulltext + Qdrant vector → merge.
     * GET /api/manga/search?q=...&limit=10
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {

        List<HybridSearchService.SearchResult> results = hybridSearchService.hybridSearch(q, limit);

        return ResponseEntity.ok(Map.of(
                "query", q,
                "count", results.size(),
                "results", results));
    }

    /**
     * Recommend similar stories by vector nearest neighbors.
     * GET /api/manga/{id}/recommend?limit=10
     */
    @GetMapping("/{id}/recommend")
    public ResponseEntity<Map<String, Object>> recommend(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit) {

        List<HybridSearchService.SearchResult> results = hybridSearchService.recommend(id, limit);

        return ResponseEntity.ok(Map.of(
                "storyId", id,
                "count", results.size(),
                "recommendations", results));
    }
}
