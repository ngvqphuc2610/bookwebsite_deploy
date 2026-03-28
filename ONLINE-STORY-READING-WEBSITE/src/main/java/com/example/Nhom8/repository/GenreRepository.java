package com.example.Nhom8.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Nhom8.models.Genre;

import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {
    Optional<Genre> findBySlug(String slug);

    Optional<Genre> findByName(String name);
}
