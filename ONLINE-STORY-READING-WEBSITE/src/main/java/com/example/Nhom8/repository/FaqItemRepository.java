package com.example.Nhom8.repository;

import com.example.Nhom8.models.FaqItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FaqItemRepository extends JpaRepository<FaqItem, Long> {
    List<FaqItem> findByActiveTrueOrderByPriorityDesc();
}

