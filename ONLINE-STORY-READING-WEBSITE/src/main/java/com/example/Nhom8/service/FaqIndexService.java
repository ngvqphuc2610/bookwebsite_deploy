package com.example.Nhom8.service;

import com.example.Nhom8.models.FaqItem;
import com.example.Nhom8.repository.FaqItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Manages FAQ indexing and retrieval via Qdrant vector database.
 * FAQs are stored in a separate "faqs" collection to keep manga and FAQ vectors separate.
 * Provides semantic FAQ retrieval (top-K nearest) for RAG context injection.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FaqIndexService {

    private final OllamaService ollamaService;
    private final QdrantService qdrantService;
    private final FaqItemRepository faqItemRepository;

    @Value("${qdrant.url:http://localhost:6335}")
    private String qdrantUrl;

    @Value("${app.features.vector-search-enabled:true}")
    private boolean vectorSearchEnabled;

    private static final String FAQ_COLLECTION = "faqs";

    // ──────────── Index FAQs ────────────

    /**
     * Index all active FAQs into Qdrant "faqs" collection.
     * Creates the collection if it doesn't exist.
     *
     * @return number of FAQs indexed
     */
    public int indexAllFaqs() {
        if (!vectorSearchEnabled) {
            log.warn("Vector search disabled — FAQ indexing skipped");
            return 0;
        }

        List<FaqItem> faqs = faqItemRepository.findByActiveTrueOrderByPriorityDesc();
        if (faqs.isEmpty()) {
            // Use default FAQs if none in DB
            faqs = CustomerCareService.buildDefaultFaqs();
        }

        // Ensure collection exists (nomic-embed-text = 768)
        qdrantService.ensureCollection(FAQ_COLLECTION, 768);

        // Build texts for embedding
        List<String> texts = faqs.stream()
                .map(f -> f.getQuestionPattern() + " " + f.getAnswerText())
                .collect(Collectors.toList());

        List<List<Double>> vectors = ollamaService.embedBatch(texts);

        List<Map<String, Object>> points = new ArrayList<>();
        for (int i = 0; i < faqs.size(); i++) {
            FaqItem faq = faqs.get(i);
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("question_pattern", faq.getQuestionPattern());
            payload.put("answer_text", faq.getAnswerText());
            payload.put("priority", faq.getPriority());
            payload.put("faq_id", faq.getId() != null ? faq.getId() : i + 1);

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("id", faq.getId() != null ? faq.getId() : i + 1);
            point.put("vector", vectors.get(i));
            point.put("payload", payload);
            points.add(point);
        }

        qdrantService.upsert(FAQ_COLLECTION, points);
        log.info("Indexed {} FAQs into Qdrant collection '{}'", faqs.size(), FAQ_COLLECTION);
        return faqs.size();
    }

    /**
     * Index a single FAQ item.
     */
    public void indexFaq(FaqItem faq) {
        if (!vectorSearchEnabled || faq.getId() == null) return;

        String text = faq.getQuestionPattern() + " " + faq.getAnswerText();
        List<Double> vector = ollamaService.embed(text);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("question_pattern", faq.getQuestionPattern());
        payload.put("answer_text", faq.getAnswerText());
        payload.put("priority", faq.getPriority());
        payload.put("faq_id", faq.getId());

        Map<String, Object> point = new LinkedHashMap<>();
        point.put("id", faq.getId());
        point.put("vector", vector);
        point.put("payload", payload);

        qdrantService.ensureCollection(FAQ_COLLECTION, 768);
        qdrantService.upsert(FAQ_COLLECTION, List.of(point));
        log.info("Indexed FAQ id={}", faq.getId());
    }

    /**
     * Remove a single FAQ point from Qdrant.
     */
    public void removeFaqVector(Long id) {
        if (!vectorSearchEnabled || id == null) return;
        try {
            qdrantService.deletePoints(FAQ_COLLECTION, List.of(id));
            log.info("Removed FAQ vector id={} from Qdrant", id);
        } catch (Exception e) {
            log.warn("Failed to remove FAQ vector {} from Qdrant: {}", id, e.getMessage());
        }
    }

    // ──────────── Semantic Search ────────────

    /**
     * Find the top-K FAQs most semantically similar to the user query.
     */
    @SuppressWarnings("unchecked")
    public List<FaqSearchResult> findRelevantFaqs(String query, int topK) {
        if (!vectorSearchEnabled) {
            return List.of();
        }

        try {
            List<Double> queryVector = ollamaService.embed(query);
            List<Map<String, Object>> results = qdrantService.search(FAQ_COLLECTION, queryVector, topK);

            return results.stream()
                    .filter(hit -> ((Number) hit.get("score")).doubleValue() > 0.3) // threshold
                    .map(hit -> {
                        Map<String, Object> payload = (Map<String, Object>) hit.get("payload");
                        return new FaqSearchResult(
                                (String) payload.get("question_pattern"),
                                (String) payload.get("answer_text"),
                                ((Number) hit.get("score")).doubleValue());
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("FAQ vector search failed: {}", e.getMessage());
            return List.of();
        }
    }

    // Collection management logic is now in QdrantService
    @Deprecated
    private void ensureFaqCollection() {}

    @Deprecated
    private void upsertFaqPoints(List<Map<String, Object>> points) {}

    // ──────────── Result DTO ────────────

    public record FaqSearchResult(String questionPattern, String answerText, double score) {
    }
}
