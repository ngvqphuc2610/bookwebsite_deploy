package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "premium_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLDelete(sql = "UPDATE premium_packages SET deleted = true WHERE id=?")
@org.hibernate.annotations.Where(clause = "deleted=false")
public class PremiumPackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    private int durationDays;

    @Builder.Default
    private boolean deleted = false;
}
