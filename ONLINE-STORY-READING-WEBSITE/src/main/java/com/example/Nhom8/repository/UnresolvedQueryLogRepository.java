package com.example.Nhom8.repository;

import com.example.Nhom8.models.UnresolvedQueryLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UnresolvedQueryLogRepository extends JpaRepository<UnresolvedQueryLog, Long> {

    /** Find existing log by normalized query for deduplication. */
    Optional<UnresolvedQueryLog> findByNormalizedQuery(String normalizedQuery);

    /** List unresolved queries ordered by hit count (most frequent first). */
    List<UnresolvedQueryLog> findByResolvedFalseOrderByHitCountDesc();

    /** List all logs ordered by last seen. */
    List<UnresolvedQueryLog> findAllByOrderByLastSeenAtDesc();
}
