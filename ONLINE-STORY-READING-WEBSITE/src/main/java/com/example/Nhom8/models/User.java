package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLDelete(sql = "UPDATE users SET deleted = true WHERE id=?")
@org.hibernate.annotations.Where(clause = "deleted=false")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private boolean deleted = false;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    private String fullName;

    private String avatar;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    private LocalDateTime premiumExpiry;

    @Builder.Default
    private boolean isPremium = false;

    @Builder.Default
    private boolean isActive = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Builder.Default
    private boolean enabled = true;

    private LocalDateTime createdAt;

    private String resetPasswordToken;
    private LocalDateTime tokenExpiration;

    @Builder.Default
    private int failedOtpAttempts = 0;

    private LocalDateTime otpLockoutUntil;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum AuthProvider {
        LOCAL, GOOGLE, FACEBOOK
    }
}
