package com.example.Nhom8.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * HTTP client for Ollama API — embedding and chat.
 */
@Service
@Slf4j
public class OllamaService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ollama.embed-model:nomic-embed-text}")
    private String embedModel;

    @Value("${ollama.chat-model:qwen2.5:3b}")
    private String chatModel;

    // ──────────── Embedding ────────────

    /**
     * Get embedding vector for a single text.
     */
    public List<Double> embed(String text) {
        return embedBatch(List.of(text)).get(0);
    }

    /**
     * Get embeddings for multiple texts in one Ollama call.
     */
    @SuppressWarnings("unchecked")
    public List<List<Double>> embedBatch(List<String> texts) {
        String url = ollamaUrl + "/api/embed";
        Map<String, Object> body = Map.of(
                "model", embedModel,
                "input", texts);

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
                log.error("Ollama embed failed. Status: {}, Body: {}", resp.getStatusCode(), resp.getBody());
                throw new RuntimeException("Ollama embed failed: " + resp.getStatusCode());
            }

            List<List<Double>> embeddings = (List<List<Double>>) resp.getBody().get("embeddings");
            if (embeddings == null || embeddings.size() != texts.size()) {
                log.error("Ollama returned invalid embeddings. Expected {}, got {}", texts.size(), (embeddings == null ? 0 : embeddings.size()));
                throw new RuntimeException(
                        "Ollama returned " + (embeddings == null ? 0 : embeddings.size())
                                + " embeddings, expected " + texts.size());
            }
            return embeddings;
        } catch (Exception e) {
            log.error("Error during Ollama embedding: {}", e.getMessage());
            throw e;
        }
    }

    // ──────────── Chat ────────────

    /**
     * Non-streaming chat with Ollama (single turn).
     *
     * @param systemPrompt system-role message (nullable)
     * @param userMessage  user-role message
     * @return assistant response text
     */
    public String chat(String systemPrompt, String userMessage) {
        return chatWithHistory(systemPrompt, userMessage, List.of());
    }

    /**
     * Non-streaming chat with Ollama, supporting multi-turn conversation history.
     *
     * @param systemPrompt system-role message (nullable)
     * @param userMessage  current user message
     * @param history      previous turns: each map must have "role"
     *                     ("user"/"assistant") and "content"
     * @return assistant response text
     */
    @SuppressWarnings("unchecked")
    public String chatWithHistory(String systemPrompt, String userMessage,
            List<Map<String, String>> history) {
        String url = ollamaUrl + "/api/chat";

        List<Map<String, String>> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }
        // Append previous conversation turns (cap at last 10 to avoid token overflow)
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 10);
            messages.addAll(history.subList(start, history.size()));
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> body = new HashMap<>();
        body.put("model", chatModel);
        body.put("messages", messages);
        body.put("stream", false);

        ResponseEntity<Map> resp = restTemplate.postForEntity(url, body, Map.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new RuntimeException("Ollama chat failed: " + resp.getStatusCode());
        }

        Map<String, Object> message = (Map<String, Object>) resp.getBody().get("message");
        return message != null ? (String) message.get("content") : "";
    }
}
