package com.example.Nhom8.utils;

import java.text.Normalizer;

public class SlugUtils {
    public static String toSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        // Convert to lowercase
        String slug = input.toLowerCase();

        // Remove accents
        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);
        slug = slug.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // Replace 'đ' with 'd'
        slug = slug.replace('đ', 'd');

        // Replace non-alphanumeric characters with hyphens
        slug = slug.replaceAll("[^a-z0-9\\s]", "");

        // Replace spaces with hyphens
        slug = slug.replaceAll("\\s+", "-");

        // Remove trailing and leading hyphens
        slug = slug.replaceAll("^-+|-+$", "");

        return slug;
    }
}
