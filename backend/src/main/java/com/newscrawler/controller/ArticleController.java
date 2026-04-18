package com.newscrawler.controller;

import com.newscrawler.dto.ArticleDto;
import com.newscrawler.dto.StatsDto;
import com.newscrawler.service.ArticleService;
import com.newscrawler.service.summarizer.SummarizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final SummarizationService summarizationService;

    @GetMapping("/articles")
    public ResponseEntity<Page<ArticleDto>> getArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long sourceId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.findArticles(category, sourceId, q, pageable));
    }

    @GetMapping("/articles/{slug}")
    public ResponseEntity<ArticleDto> getArticle(@PathVariable String slug) {
        return ResponseEntity.ok(articleService.findBySlugAndIncrementView(slug));
    }

    @GetMapping("/home/featured")
    public ResponseEntity<List<ArticleDto>> getFeatured(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(articleService.getFeatured(limit));
    }

    @GetMapping("/home/latest")
    public ResponseEntity<Page<ArticleDto>> getLatest(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.findArticles(null, null, null, pageable));
    }

    @GetMapping("/home/ai-picks")
    public ResponseEntity<List<ArticleDto>> getAiPicks(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(articleService.getAiPicks(limit));
    }

    @GetMapping("/home/most-read")
    public ResponseEntity<List<ArticleDto>> getMostRead(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(articleService.getMostRead(limit));
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsDto> getStats() {
        return ResponseEntity.ok(articleService.getStats());
    }

    @PostMapping("/articles/{slug}/summarize")
    public ResponseEntity<ArticleDto> summarizeArticle(
            @PathVariable String slug, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        var article = summarizationService.summarizeBySlug(slug);
        return ResponseEntity.ok(articleService.findBySlug(slug));
    }
}
