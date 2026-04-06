package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLDelete(sql = "UPDATE transactions SET deleted = true WHERE id=?")
@org.hibernate.annotations.Where(clause = "deleted=false")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private boolean deleted = false;

    private String transactionId; // From Momo/VNPay

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "package_id")
    private PremiumPackage premiumPackage;

    private BigDecimal amount;

    private String paymentMethod; // MOMO, VNPAY

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum TransactionStatus {
        PENDING, SUCCESS, FAILED
    }
}
