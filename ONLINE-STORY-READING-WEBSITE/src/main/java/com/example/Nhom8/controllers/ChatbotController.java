package com.example.Nhom8.controllers;

import com.example.Nhom8.models.ChatMessage;
import com.example.Nhom8.models.User;
import com.example.Nhom8.repository.ChatMessageRepository;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {
    private final ChatbotService chatbotService;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @PostMapping("/ask")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> ask(@RequestBody Map<String, Object> request, Authentication authentication) {
        String message = (String) request.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) request.getOrDefault("history", List.of());

        // Find current user if authenticated
        User currentUser = null;
        if (authentication != null) {
            currentUser = userRepository.findByUsername(authentication.getName()).orElse(null);
        }

        // 1. Save User Message to DB
        if (currentUser != null && message != null && !message.isBlank()) {
            ChatMessage userMsg = ChatMessage.builder()
                    .user(currentUser)
                    .content(message)
                    .role("user")
                    .build();
            chatMessageRepository.save(userMsg);
        }

        // 2. Get AI Response
        String response = chatbotService.getResponse(message, history);

        // 3. Save AI Message to DB
        if (currentUser != null && response != null && !response.isBlank()) {
            ChatMessage aiMsg = ChatMessage.builder()
                    .user(currentUser)
                    .content(response)
                    .role("assistant")
                    .build();
            chatMessageRepository.save(aiMsg);
        }

        return ResponseEntity.ok(Map.of("response", response));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        List<ChatMessage> messages = chatMessageRepository.findByUserOrderByCreatedAtAsc(user);
        List<Map<String, String>> history = messages.stream()
                .map(m -> Map.of(
                        "role", m.getRole(),
                        "content", m.getContent(),
                        "createdAt", m.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        User user = userRepository.findByUsername(authentication.getName()).orElse(null);
        if (user != null) {
            chatMessageRepository.deleteByUser(user);
        }

        return ResponseEntity.ok(Map.of("message", "History cleared"));
    }
}
