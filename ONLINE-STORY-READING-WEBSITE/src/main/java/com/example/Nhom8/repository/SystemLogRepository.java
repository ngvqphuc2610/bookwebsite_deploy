package com.example.Nhom8.repository;

import com.example.Nhom8.models.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findAllByOrderByCreatedAtDesc();
}
