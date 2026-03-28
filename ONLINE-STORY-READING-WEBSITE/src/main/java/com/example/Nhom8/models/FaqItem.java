package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "faq_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaqItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String questionPattern;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answerText;

    @Builder.Default
    private int priority = 0;

    @Builder.Default
    private boolean active = true;
}

