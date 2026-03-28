package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "stories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String coverImage;

    private String author;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StoryStatus status = StoryStatus.ONGOING;

    @Builder.Default
    private boolean isPremium = false;

    @Builder.Default
    private long viewCount = 0;

    @ManyToMany
    @JoinTable(name = "story_genres", joinColumns = @JoinColumn(name = "story_id"), inverseJoinColumns = @JoinColumn(name = "genre_id"))
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator; // The Staff member who uploaded it

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum StoryStatus {
        ONGOING, COMPLETED, DROPPED, COMING_SOON
    }
}
