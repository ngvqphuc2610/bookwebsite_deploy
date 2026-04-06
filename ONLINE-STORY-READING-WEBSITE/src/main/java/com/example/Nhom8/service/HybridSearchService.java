package com.example.Nhom8.service;

import com.example.Nhom8.dto.StoryDTO;
import com.example.Nhom8.models.Story;
import com.example.Nhom8.repository.StoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

/**
 * Hybrid search: MySQL FULLTEXT + Qdrant vector → weighted merge → rerank.
 * Also handles recommendation and reindexing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HybridSearchService {

    private final OllamaService ollamaService;
    private final QdrantService qdrantService;
    private final StoryRepository storyRepository;

    private static final double VECTOR_WEIGHT = 0.7;
    private static final double MYSQL_WEIGHT = 0.3;
    private static final int DEFAULT_LIMIT = 20;

    // ──────────── Hybrid search ────────────

    /**
     * Hybrid search combining MySQL FULLTEXT and Qdrant vector similarity.
     */
    @SuppressWarnings("unchecked")
    public List<SearchResult> hybridSearch(String query, int limit) {
        if (limit <= 0)
            limit = DEFAULT_LIMIT;

        String cleanedQuery = query.trim();

        // 1. MySQL fulltext search
        List<Object[]> fulltextResults = storyRepository.fulltextSearch(cleanedQuery, limit);
        Map<Long, Double> mysqlScores = new LinkedHashMap<>();
        double maxFt = 0;
        for (Object[] row : fulltextResults) {
            Long id = ((Number) row[0]).longValue();
            double score = ((Number) row[1]).doubleValue();
            mysqlScores.put(id, score);
            if (score > maxFt)
                maxFt = score;
        }

        // 1b. Exact match boost (Title or Author)
        List<Story> exactMatches = storyRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(cleanedQuery, cleanedQuery);
        for (Story s : exactMatches) {
            double boost = s.getTitle().equalsIgnoreCase(cleanedQuery) || s.getAuthor().equalsIgnoreCase(cleanedQuery) ? 2.0 : 1.2;
            mysqlScores.put(s.getId(), mysqlScores.getOrDefault(s.getId(), 0.0) + boost);
            if (mysqlScores.get(s.getId()) > maxFt) maxFt = mysqlScores.get(s.getId());
        }

        // Normalize MySQL scores to 0..1
        if (maxFt > 0) {
            for (Map.Entry<Long, Double> e : mysqlScores.entrySet()) {
                e.setValue(e.getValue() / maxFt);
            }
        }

        // 2. Qdrant vector search
        List<Double> queryVector = ollamaService.embed(cleanedQuery);
        List<Map<String, Object>> vectorResults = qdrantService.search(queryVector, limit);
        Map<Long, Double> qdrantScores = new LinkedHashMap<>();
        Map<Long, Map<String, Object>> qdrantPayloads = new HashMap<>();
        for (Map<String, Object> hit : vectorResults) {
            Long id = ((Number) hit.get("id")).longValue();
            double score = ((Number) hit.get("score")).doubleValue(); // cosine similarity 0..1
            qdrantScores.put(id, score);
            qdrantPayloads.put(id, (Map<String, Object>) hit.get("payload"));
        }

        // 3. Merge — weighted sum
        Set<Long> allIds = new LinkedHashSet<>();
        allIds.addAll(qdrantScores.keySet());
        allIds.addAll(mysqlScores.keySet());

        List<SearchResult> merged = new ArrayList<>();
        for (Long id : allIds) {
            double vs = qdrantScores.getOrDefault(id, 0.0);
            double ms = mysqlScores.getOrDefault(id, 0.0);
            double combined = VECTOR_WEIGHT * vs + MYSQL_WEIGHT * ms;

            SearchResult sr = new SearchResult();
            sr.setStoryId(id);
            sr.setVectorScore(vs);
            sr.setMysqlScore(ms);
            sr.setCombinedScore(combined);
            sr.setInVector(qdrantScores.containsKey(id));
            sr.setInMysql(mysqlScores.containsKey(id));

            // Attach payload from Qdrant if available
            if (qdrantPayloads.containsKey(id)) {
                fillFromPayload(sr, qdrantPayloads.get(id));
            }
            merged.add(sr);
        }

        // 4. Sort by combined score descending, take top limit
        merged.sort(Comparator.comparingDouble(SearchResult::getCombinedScore).reversed());
        if (merged.size() > limit) {
            merged = merged.subList(0, limit);
        }

        // 5. Fill missing data from DB for MySQL-only results
        List<Long> missingIds = merged.stream()
                .filter(r -> r.getTitle() == null)
                .map(SearchResult::getStoryId)
                .collect(Collectors.toList());
        if (!missingIds.isEmpty()) {
            List<Story> stories = storyRepository.findAllById(missingIds);
            Map<Long, Story> storyMap = stories.stream()
                    .collect(Collectors.toMap(Story::getId, s -> s));
            for (SearchResult r : merged) {
                if (r.getTitle() == null && storyMap.containsKey(r.getStoryId())) {
                    fillFromStory(r, storyMap.get(r.getStoryId()));
                }
            }
        }

        return merged;
    }

    // ──────────── Recommendation ────────────

    /**
     * Recommend similar stories based on vector nearest neighbors.
     */
    @SuppressWarnings("unchecked")
    public List<SearchResult> recommend(Long storyId, int limit) {
        if (limit <= 0)
            limit = 10;

        // Get the story's vector from Qdrant
        Map<String, Object> point = qdrantService.getPoint(storyId);
        List<Double> vector;

        if (point != null && point.get("vector") != null) {
            vector = (List<Double>) point.get("vector");
        } else {
            // Fallback: compose text from DB and embed
            Story story = storyRepository.findById(storyId)
                    .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));
            vector = ollamaService.embed(composeSearchText(story));
        }

        // Search Qdrant (limit+1 to account for self)
        List<Map<String, Object>> results = qdrantService.search(vector, limit + 1);

        List<SearchResult> recommendations = new ArrayList<>();
        for (Map<String, Object> hit : results) {
            Long id = ((Number) hit.get("id")).longValue();
            if (id.equals(storyId))
                continue; // skip self

            double score = ((Number) hit.get("score")).doubleValue();
            Map<String, Object> payload = (Map<String, Object>) hit.get("payload");

            SearchResult sr = new SearchResult();
            sr.setStoryId(id);
            sr.setVectorScore(score);
            sr.setCombinedScore(score);
            sr.setInVector(true);
            sr.setInMysql(false);

            if (payload != null) {
                fillFromPayload(sr, payload);
            }
            recommendations.add(sr);
            if (recommendations.size() >= limit)
                break;
        }

        return recommendations;
    }

    // ──────────── Reindex ────────────

    /**
     * Reindex a single story in Qdrant.
     */
    public void reindexStory(Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        String text = composeSearchText(story);
        List<Double> vector = ollamaService.embed(text);
        Map<String, Object> point = buildPoint(story, vector);

        qdrantService.upsert(List.of(point));
        log.info("Reindexed story id={} title='{}'", storyId, story.getTitle());
    }

    /**
     * Reindex all stories in batches of 50.
     *
     * @return number of stories indexed
     */
    public int reindexAll() {
        int count = 0;
        int batchSize = 50;
        int page = 0;
        Page<Story> storyPage;

        do {
            storyPage = storyRepository.findAll(PageRequest.of(page, batchSize));
            List<Story> batch = storyPage.getContent();
            
            if (batch.isEmpty()) break;

            List<String> texts = batch.stream()
                    .map(this::composeSearchText)
                    .collect(Collectors.toList());

            List<List<Double>> vectors = ollamaService.embedBatch(texts);

            List<Map<String, Object>> points = new ArrayList<>();
            for (int j = 0; j < batch.size(); j++) {
                points.add(buildPoint(batch.get(j), vectors.get(j)));
            }

            qdrantService.upsert(points);
            count += batch.size();
            log.info("Reindexed batch: {}/{} total stories", count, storyPage.getTotalElements());
            page++;
        } while (storyPage.hasNext());

        return count;
    }

    /**
     * Delete a story from Qdrant.
     */
    public void deleteFromIndex(Long storyId) {
        qdrantService.deletePoints(List.of(storyId));
        log.info("Deleted story id={} from Qdrant index", storyId);
    }

    // ──────────── Helpers ────────────

    String composeSearchText(Story story) {
        StringBuilder sb = new StringBuilder();
        sb.append("Title: ").append(story.getTitle());
        if (story.getAuthor() != null) {
            sb.append("\nAuthor: ").append(story.getAuthor());
        }
        if (story.getGenres() != null && !story.getGenres().isEmpty()) {
            String genres = story.getGenres().stream()
                    .map(g -> g.getName())
                    .collect(Collectors.joining(", "));
            sb.append("\nGenres: ").append(genres);
        }
        if (story.getStatus() != null) {
            sb.append("\nStatus: ").append(story.getStatus().name());
        }
        if (story.getDescription() != null) {
            String desc = story.getDescription().replaceAll("<[^>]+>", ""); // strip HTML
            if (desc.length() > 500)
                desc = desc.substring(0, 500) + "...";
            sb.append("\nDescription: ").append(desc);
        }
        return sb.toString();
    }

    private Map<String, Object> buildPoint(Story story, List<Double> vector) {
        StoryDTO dto = StoryDTO.fromEntity(story);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("story_id", story.getId());
        payload.put("slug", dto.getSlug());
        payload.put("title", dto.getTitle());
        payload.put("author", dto.getAuthor());
        payload.put("genres", new ArrayList<>(dto.getGenres()));
        payload.put("status", dto.getStatus());
        payload.put("is_premium", dto.isPremium());
        payload.put("view_count", dto.getViewCount());
        payload.put("cover_image", dto.getCoverImage());
        payload.put("updated_at", story.getUpdatedAt() != null ? story.getUpdatedAt().toString() : "");

        Map<String, Object> point = new LinkedHashMap<>();
        point.put("id", story.getId());
        point.put("vector", vector);
        point.put("payload", payload);
        return point;
    }

    @SuppressWarnings("unchecked")
    private void fillFromPayload(SearchResult sr, Map<String, Object> p) {
        sr.setTitle((String) p.get("title"));
        sr.setSlug((String) p.get("slug"));
        sr.setAuthor((String) p.get("author"));
        sr.setGenres((List<String>) p.get("genres"));
        sr.setStatus((String) p.get("status"));
        sr.setCoverImage((String) p.get("cover_image"));
        sr.setViewCount(p.get("view_count") != null ? ((Number) p.get("view_count")).longValue() : 0);
    }

    private void fillFromStory(SearchResult sr, Story story) {
        StoryDTO dto = StoryDTO.fromEntity(story);
        sr.setTitle(dto.getTitle());
        sr.setSlug(dto.getSlug());
        sr.setAuthor(dto.getAuthor());
        sr.setGenres(new ArrayList<>(dto.getGenres()));
        sr.setStatus(dto.getStatus());
        sr.setCoverImage(dto.getCoverImage());
        sr.setViewCount(dto.getViewCount());
    }

    // ──────────── Result DTO ────────────

    @lombok.Data
    public static class SearchResult {
        private Long storyId;
        private String title;
        private String slug;
        private String author;
        private List<String> genres;
        private String status;
        private String coverImage;
        private long viewCount;
        private double vectorScore;
        private double mysqlScore;
        private double combinedScore;
        private boolean inVector;
        private boolean inMysql;
    }
}
