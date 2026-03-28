package com.example.Nhom8.repository;

import com.example.Nhom8.models.SupportConversation;
import com.example.Nhom8.models.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    List<SupportMessage> findByConversationOrderByCreatedAtAsc(SupportConversation conversation);
}

