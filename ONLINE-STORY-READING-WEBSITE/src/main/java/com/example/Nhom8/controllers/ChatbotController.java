package com.example.Nhom8.controllers;

import com.example.Nhom8.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {
    private final ChatbotService chatbotService;

    @PostMapping("/ask")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> ask(@RequestBody Map<String, Object> request) {
        String message = (String) request.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) request.getOrDefault("history", List.of());
        String response = chatbotService.getResponse(message, history);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
