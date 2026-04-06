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
@org.hibernate.annotations.SQLDelete(sql = "UPDATE stories SET deleted = true WHERE id=?")
@org.hibernate.annotations.Where(clause = "deleted=false")
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

    @Builder.Default
    private boolean deleted = false;

    @ManyToMany
    @JoinTable(name = "story_genres", joinColumns = @JoinColumn(name = "story_id"), inverseJoinColumns = @JoinColumn(name = "genre_id"))
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    private Set<Chapter> chapters = new HashSet<>();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<FavoriteStory> favorites = new HashSet<>();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<ReadingProgress> readingProgresses = new HashSet<>();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Rating> ratings = new HashSet<>();

    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Comment> comments = new HashSet<>();

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
