package com.newscrawler.util;

import java.text.Normalizer;
import java.util.UUID;
import java.util.regex.Pattern;

public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern DASHES = Pattern.compile("-{2,}");

    private SlugUtils() {}

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return UUID.randomUUID().toString().substring(0, 8);
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Remove diacritical marks (Vietnamese, etc.)
        normalized = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        // Convert đ/Đ
        normalized = normalized.replace("đ", "d").replace("Đ", "D");

        String slug = WHITESPACE.matcher(normalized.toLowerCase().trim()).replaceAll("-");
        slug = NON_LATIN.matcher(slug).replaceAll("");
        slug = DASHES.matcher(slug).replaceAll("-");
        slug = slug.replaceAll("^-|-$", "");

        // Append short unique id
        String shortId = UUID.randomUUID().toString().substring(0, 8);
        return slug.isEmpty() ? shortId : slug + "-" + shortId;
    }
}
