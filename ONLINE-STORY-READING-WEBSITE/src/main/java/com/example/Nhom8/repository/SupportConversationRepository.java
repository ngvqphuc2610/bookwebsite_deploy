package com.example.Nhom8.repository;

import com.example.Nhom8.models.SupportConversation;
import com.example.Nhom8.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SupportConversationRepository extends JpaRepository<SupportConversation, Long> {
    List<SupportConversation> findByStatusOrderByUpdatedAtDesc(SupportConversation.ConversationStatus status);

    List<SupportConversation> findByUserOrderByUpdatedAtDesc(User user);

    Optional<SupportConversation> findByUserAndStatus(User user, SupportConversation.ConversationStatus status);

    List<SupportConversation> findByStatusInOrderByUpdatedAtDesc(List<SupportConversation.ConversationStatus> statuses);
}

