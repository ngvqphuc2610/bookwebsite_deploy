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

    @Value("${qdrant.url:http://localhost:6333}")
    private String qdrantUrl;

    @Value("${qdrant.collection:manga}")
    private String collection;

    // ──────────── Search ────────────

    /**
     * Vector search — returns list of {id, score, payload}.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> search(List<Double> vector, int limit) {
        String url = qdrantUrl + "/collections/" + collection + "/points/search";

        Map<String, Object> body = Map.of(
                "vector", vector,
                "limit", limit,
                "with_payload", true);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Qdrant search failed: " + resp.getStatusCode());
        }

        List<Map<String, Object>> result = (List<Map<String, Object>>) resp.getBody().get("result");
        return result != null ? result : List.of();
    }

    /**
     * Vector search with optional payload filter.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> searchWithFilter(List<Double> vector, int limit,
            Map<String, Object> filter) {
        String url = qdrantUrl + "/collections/" + collection + "/points/search";

        Map<String, Object> body = new HashMap<>();
        body.put("vector", vector);
        body.put("limit", limit);
        body.put("with_payload", true);
        if (filter != null && !filter.isEmpty()) {
            body.put("filter", filter);
        }

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Qdrant search failed: " + resp.getStatusCode());
        }

        List<Map<String, Object>> result = (List<Map<String, Object>>) resp.getBody().get("result");
        return result != null ? result : List.of();
    }

    // ──────────── Upsert ────────────

    /**
     * Upsert (insert or update) points into collection.
     *
     * @param points list of maps each containing {id, vector, payload}
     */
    public void upsert(List<Map<String, Object>> points) {
        String url = qdrantUrl + "/collections/" + collection + "/points?wait=true";
        Map<String, Object> body = Map.of("points", points);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);
        log.info("Upserted {} points to Qdrant collection '{}'", points.size(), collection);
    }

    // ──────────── Delete ────────────

    /**
     * Delete points by their numeric ids.
     */
    public void deletePoints(List<Long> ids) {
        String url = qdrantUrl + "/collections/" + collection + "/points/delete?wait=true";
        Map<String, Object> body = Map.of("points", ids);

        restTemplate.postForEntity(url, body, Map.class);
        log.info("Deleted {} points from Qdrant collection '{}'", ids.size(), collection);
    }

    // ──────────── Point retrieval ────────────

    /**
     * Get a single point by id (including vector).
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getPoint(Long id) {
        String url = qdrantUrl + "/collections/" + collection + "/points/" + id;
        try {
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                return (Map<String, Object>) resp.getBody().get("result");
            }
        } catch (Exception e) {
            log.warn("Failed to get point {} from Qdrant: {}", id, e.getMessage());
        }
        return null;
    }

    // ──────────── Collection management ────────────

    /**
     * Ensure the collection exists. Creates it if missing.
     */
    @SuppressWarnings("unchecked")
    public void ensureCollection(int vectorSize) {
        String url = qdrantUrl + "/collections/" + collection;
        try {
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (resp.getStatusCode().is2xxSuccessful()) {
                log.info("Qdrant collection '{}' already exists", collection);
                return;
            }
        } catch (Exception ignored) {
            // collection doesn't exist — create it below
        }

        Map<String, Object> body = Map.of(
                "vectors", Map.of("size", vectorSize, "distance", "Cosine"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        restTemplate.exchange(url, HttpMethod.PUT, entity, Map.class);
        log.info("Created Qdrant collection '{}' (dim={})", collection, vectorSize);
    }
}
