package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chapters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLDelete(sql = "UPDATE chapters SET deleted = true WHERE id=?")
@org.hibernate.annotations.Where(clause = "deleted=false")
public class Chapter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private int chapterNumber;

    @Builder.Default
    private boolean deleted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "story_id", nullable = false)
    private Story story;

    private LocalDateTime createdAt;

    // Hàm này sẽ tự động chạy trước khi entity được lưu lần đầu vào database
    // PrePersist: Trước khi INSERT
    // PreUpdate: Trước khi UPDATE
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
