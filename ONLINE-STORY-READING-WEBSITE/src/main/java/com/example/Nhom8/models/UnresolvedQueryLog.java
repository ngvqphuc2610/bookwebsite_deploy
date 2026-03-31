package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Logs unresolved chatbot queries — questions the AI couldn't answer.
 * Admin can review these to discover "knowledge gaps" and create new FAQs.
 * Duplicate queries increment hitCount instead of creating new rows.
 */
@Entity
@Table(name = "unresolved_query_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnresolvedQueryLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user query that went unanswered. */
    @Column(nullable = false, length = 500)
    private String query;

    /** Normalized version of the query for deduplication. */
    @Column(nullable = false, length = 500)
    private String normalizedQuery;

    /** Number of times this (similar) query appeared. */
    @Builder.Default
    private int hitCount = 1;

    /** When this query was first seen. */
    @Builder.Default
    private LocalDateTime firstSeenAt = LocalDateTime.now();

    /** When this query was last seen. */
    @Builder.Default
    private LocalDateTime lastSeenAt = LocalDateTime.now();

    /** Whether an admin has reviewed / addressed this query. */
    @Builder.Default
    private boolean resolved = false;
}
