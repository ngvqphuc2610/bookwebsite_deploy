package com.example.Nhom8.controllers;

import com.example.Nhom8.service.HybridSearchService;
import com.example.Nhom8.service.QdrantService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-only endpoints for reindexing Qdrant.
 * Protected by SecurityConfig: /api/admin/** → ADMIN authority.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class ReindexController {

    private final HybridSearchService hybridSearchService;
    private final QdrantService qdrantService;

    @Value("${qdrant.embed-dim:768}")
    private int embedDim;

    /**
     * Reindex a single story.
     * POST /api/admin/reindex?storyId=123
     */
    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindexStory(@RequestParam Long storyId) {
        hybridSearchService.reindexStory(storyId);
        return ResponseEntity.ok(Map.of(
                "message", "Reindexed story " + storyId,
                "storyId", storyId));
    }

    /**
     * Reindex ALL stories. Can be slow for large datasets.
     * POST /api/admin/reindex/all
     */
    @PostMapping("/reindex/all")
    public ResponseEntity<Map<String, Object>> reindexAll() {
        qdrantService.ensureCollection(embedDim);
        int count = hybridSearchService.reindexAll();
        return ResponseEntity.ok(Map.of(
                "message", "Reindexed all stories",
                "count", count));
    }

    /**
     * Delete a story from the Qdrant index.
     * DELETE /api/admin/reindex?storyId=123
     */
    @DeleteMapping("/reindex")
    public ResponseEntity<Map<String, Object>> deleteFromIndex(@RequestParam Long storyId) {
        hybridSearchService.deleteFromIndex(storyId);
        return ResponseEntity.ok(Map.of(
                "message", "Deleted story " + storyId + " from index",
                "storyId", storyId));
    }
}
