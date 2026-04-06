package com.example.Nhom8.repository;

import com.example.Nhom8.models.ChatMessage;
import com.example.Nhom8.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByUserOrderByCreatedAtAsc(User user);
    void deleteByUser(User user);
}
