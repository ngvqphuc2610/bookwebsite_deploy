package com.example.Nhom8.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * HTTP client for Qdrant vector database — search, upsert, delete.
 */
@Service
@Slf4j
public class QdrantService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final HttpHeaders jsonHeaders;

    @Value("${qdrant.url:http://localhost:6335}")
    private String qdrantUrl;

    public QdrantService() {
        this.jsonHeaders = new HttpHeaders();
        this.jsonHeaders.setContentType(MediaType.APPLICATION_JSON);
    }

    // ──────────── Search ────────────

    /**
     * Vector search — returns list of {id, score, payload}.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> search(String collectionName, List<Double> vector, int limit) {
        String url = qdrantUrl + "/collections/" + collectionName + "/points/search";

        Map<String, Object> body = Map.of(
                "vector", vector,
                "limit", limit,
                "with_payload", true);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Qdrant search failed for " + collectionName + ": " + resp.getStatusCode());
        }

        List<Map<String, Object>> result = (List<Map<String, Object>>) resp.getBody().get("result");
        return result != null ? result : List.of();
    }

    /**
     * Vector search with optional payload filter.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> searchWithFilter(String collectionName, List<Double> vector, int limit,
            Map<String, Object> filter) {
        String url = qdrantUrl + "/collections/" + collectionName + "/points/search";

        Map<String, Object> body = new HashMap<>();
        body.put("vector", vector);
        body.put("limit", limit);
        body.put("with_payload", true);
        if (filter != null && !filter.isEmpty()) {
            body.put("filter", filter);
        }

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Qdrant search with filter failed for " + collectionName + ": " + resp.getStatusCode());
        }

        List<Map<String, Object>> result = (List<Map<String, Object>>) resp.getBody().get("result");
        return result != null ? result : List.of();
    }

    // ──────────── Upsert ────────────

    /**
     * Upsert (insert or update) points into collection.
     */
    public void upsert(String collectionName, List<Map<String, Object>> points) {
        String url = qdrantUrl + "/collections/" + collectionName + "/points?wait=true";
        Map<String, Object> body = Map.of("points", points);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, jsonHeaders);
        restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);
        log.info("Upserted {} points to Qdrant collection '{}'", points.size(), collectionName);
    }

    // ──────────── Delete ────────────

    /**
     * Delete points by their numeric ids.
     */
    public void deletePoints(String collectionName, List<Long> ids) {
        String url = qdrantUrl + "/collections/" + collectionName + "/points/delete?wait=true";
        Map<String, Object> body = Map.of("points", ids);

        restTemplate.postForEntity(url, body, Map.class);
        log.info("Deleted {} points from Qdrant collection '{}'", ids.size(), collectionName);
    }

    // ──────────── Point retrieval ────────────

    /**
     * Get a single point by id (including vector).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getPoint(String collectionName, Long id) {
        String url = qdrantUrl + "/collections/" + collectionName + "/points/" + id;
        try {
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return (Map<String, Object>) resp.getBody().get("result");
            }
        } catch (Exception e) {
            log.warn("Failed to get point {} from Qdrant collection {}: {}", id, collectionName, e.getMessage());
        }
        return null;
    }

    // ──────────── Collection management ────────────

    /**
     * Ensure the collection exists. Creates it if missing.
     */
    @SuppressWarnings("unchecked")
    public void ensureCollection(String collectionName, int vectorSize) {
        String url = qdrantUrl + "/collections/" + collectionName;
        try {
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (resp.getStatusCode().is2xxSuccessful()) {
                log.info("Qdrant collection '{}' already exists", collectionName);
                return;
            }
        } catch (Exception ignored) {
            // collection doesn't exist — create it below
        }

        Map<String, Object> body = Map.of(
                "vectors", Map.of("size", vectorSize, "distance", "Cosine"));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, jsonHeaders);
        restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);
        log.info("Created Qdrant collection '{}' (dim={})", collectionName, vectorSize);
    }
}
