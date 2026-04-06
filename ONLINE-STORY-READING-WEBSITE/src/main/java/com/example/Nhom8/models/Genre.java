package com.example.Nhom8.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "genres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@org.hibernate.annotations.SQLDelete(sql = "UPDATE genres SET deleted = true WHERE id=?")
@org.hibernate.annotations.Where(clause = "deleted=false")
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private boolean deleted = false;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    @Column(unique = true)
    private String slug;
}
