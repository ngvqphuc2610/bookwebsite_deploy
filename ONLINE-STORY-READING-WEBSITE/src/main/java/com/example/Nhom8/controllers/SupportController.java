package com.example.Nhom8.controllers;

import com.example.Nhom8.models.*;
import com.example.Nhom8.repository.UserRepository;
import com.example.Nhom8.service.CustomerCareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class SupportController {

    private final CustomerCareService careService;
    private final UserRepository userRepository;

    // ── User endpoints ──

    @PostMapping("/api/support/conversations")
    public ResponseEntity<?> openConversation(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        String username = authentication.getName();
        Long userId = userRepository.findByUsername(username).map(User::getId).orElse(null);
        
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot resolve userId"));
        }
        SupportConversation conv = careService.getOrCreateConversation(userId);
        return ResponseEntity.ok(toConvMap(conv));
    }

    @GetMapping("/api/support/conversations/{id}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        // Verify ownership to prevent IDOR
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        
        if (!isAdmin) {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) return ResponseEntity.status(403).build();

            // Need to verify if this user owns the conversation
            SupportConversation conv = careService.getConversationById(id);
            if (conv == null || !conv.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("message", "Forbidden: You do not own this conversation"));
            }
        }

        List<SupportMessage> msgs = careService.getMessages(id);
        return ResponseEntity.ok(msgs.stream().map(this::toMsgMap).collect(Collectors.toList()));
    }

    // ── Admin endpoints ──

    @GetMapping("/api/admin/support/conversations")
    public ResponseEntity<?> listConversations(@RequestParam(required = false) String status) {
        List<SupportConversation.ConversationStatus> statuses;
        if (status != null && !status.isEmpty()) {
            statuses = List.of(SupportConversation.ConversationStatus.valueOf(status));
        } else {
            statuses = List.of(SupportConversation.ConversationStatus.OPEN,
                    SupportConversation.ConversationStatus.PENDING_ADMIN);
        }
        return ResponseEntity.ok(careService.getConversationsByStatus(statuses)
                .stream().map(this::toConvMap).collect(Collectors.toList()));
    }

    @PostMapping("/api/admin/support/conversations/{id}/assign")
    public ResponseEntity<?> assign(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(toConvMap(careService.assignAdmin(id, body.get("adminId"))));
    }

    @PostMapping("/api/admin/support/conversations/{id}/close")
    public ResponseEntity<?> close(@PathVariable Long id) {
        return ResponseEntity.ok(toConvMap(careService.closeConversation(id)));
    }

    @PostMapping("/api/admin/support/conversations/{id}/reply")
    public ResponseEntity<?> adminReply(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long adminId = ((Number) body.get("adminId")).longValue();
        String content = (String) body.get("content");
        SupportMessage msg = careService.handleAdminReply(id, adminId, content);
        return ResponseEntity.ok(toMsgMap(msg));
    }

    // ── FAQ CRUD (Admin) ──

    @GetMapping("/api/admin/support/faq")
    public ResponseEntity<?> listFaq() {
        return ResponseEntity.ok(careService.getAllFaqs());
    }

    @PostMapping("/api/admin/support/faq")
    public ResponseEntity<?> createFaq(@RequestBody FaqItem faq) {
        return ResponseEntity.ok(careService.saveFaq(faq));
    }

    @PutMapping("/api/admin/support/faq/{id}")
    public ResponseEntity<?> updateFaq(@PathVariable Long id, @RequestBody FaqItem faq) {
        faq.setId(id);
        return ResponseEntity.ok(careService.saveFaq(faq));
    }

    @DeleteMapping("/api/admin/support/faq/{id}")
    public ResponseEntity<?> deleteFaq(@PathVariable Long id) {
        careService.deleteFaq(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    // ── WebSocket handler: user sends a support message ──

    @MessageMapping("/support.send")
    public void handleSupportMessage(@Payload Map<String, Object> payload) {
        Long conversationId = ((Number) payload.get("conversationId")).longValue();
        Long userId = payload.get("userId") instanceof Number n ? n.longValue() : null;
        String content = (String) payload.get("content");
        careService.handleUserMessage(conversationId, userId, content);
    }

    // ── WebSocket handler: admin replies to user ──
    @MessageMapping("/admin.support.reply")
    public void handleAdminReplyMessage(@Payload Map<String, Object> payload) {
        Long conversationId = ((Number) payload.get("conversationId")).longValue();
        Long adminId = ((Number) payload.get("adminId")).longValue();
        String content = (String) payload.get("content");
        careService.handleAdminReply(conversationId, adminId, content);
    }

    // ── DTO helpers ──

    private Map<String, Object> toConvMap(SupportConversation c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("userId", c.getUser().getId());
        m.put("username", c.getUser().getUsername());
        m.put("assignedAdminId", c.getAssignedAdmin() != null ? c.getAssignedAdmin().getId() : null);
        m.put("status", c.getStatus().name());
        m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : null);
        m.put("updatedAt", c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null);
        return m;
    }

    private Map<String, Object> toMsgMap(SupportMessage msg) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", msg.getId());
        m.put("conversationId", msg.getConversation().getId());
        m.put("senderType", msg.getSenderType().name());
        m.put("senderId", msg.getSenderId());
        m.put("content", msg.getContent());
        m.put("source", msg.getSource().name());
        m.put("createdAt", msg.getCreatedAt() != null ? msg.getCreatedAt().toString() : null);
        return m;
    }
}
