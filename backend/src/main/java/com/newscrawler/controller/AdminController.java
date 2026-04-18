package com.newscrawler.controller;

import com.newscrawler.dto.ArticleDto;
import com.newscrawler.dto.DashboardDto;
import com.newscrawler.dto.NewsSourceDto;
import com.newscrawler.dto.StatsDto;
import com.newscrawler.entity.CrawlLog;
import com.newscrawler.entity.enums.ArticleStatus;
import com.newscrawler.repository.CrawlLogRepository;
import com.newscrawler.service.ArticleService;
import com.newscrawler.service.NewsSourceService;
import com.newscrawler.service.crawler.CrawlerScheduler;
import com.newscrawler.service.summarizer.SummarizationScheduler;
import com.newscrawler.service.summarizer.SummarizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final NewsSourceService newsSourceService;
    private final ArticleService articleService;
    private final CrawlerScheduler crawlerScheduler;
    private final SummarizationScheduler summarizationScheduler;
    private final SummarizationService summarizationService;
    private final CrawlLogRepository crawlLogRepository;

    // --- Dashboard ---
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        StatsDto stats = articleService.getStats();
        List<NewsSourceDto> sources = newsSourceService.findAll();
        List<CrawlLog> recentLogs = crawlLogRepository.findAll(
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "startedAt"))
        ).getContent();

        DashboardDto dashboard = DashboardDto.builder()
                .stats(stats)
                .sources(sources)
                .crawlerEnabled(crawlerScheduler.isSchedulerEnabled())
                .summarizerEnabled(summarizationScheduler.isSchedulerEnabled())
                .build();

        return ResponseEntity.ok(dashboard);
    }

    // --- Source Management ---
    @GetMapping("/sources")
    public ResponseEntity<List<NewsSourceDto>> getAllSources() {
        return ResponseEntity.ok(newsSourceService.findAll());
    }

    @PostMapping("/sources")
    public ResponseEntity<NewsSourceDto> createSource(@RequestBody NewsSourceDto dto) {
        return ResponseEntity.ok(newsSourceService.create(dto));
    }

    @PutMapping("/sources/{id}")
    public ResponseEntity<NewsSourceDto> updateSource(@PathVariable Long id, @RequestBody NewsSourceDto dto) {
        return ResponseEntity.ok(newsSourceService.update(id, dto));
    }

    @PatchMapping("/sources/{id}/toggle")
    public ResponseEntity<Void> toggleSource(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        newsSourceService.toggleActive(id, body.getOrDefault("active", true));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/sources/{id}")
    public ResponseEntity<Void> deleteSource(@PathVariable Long id) {
        newsSourceService.delete(id);
        return ResponseEntity.ok().build();
    }

    // --- Article Management ---
    @GetMapping("/articles")
    public ResponseEntity<Page<ArticleDto>> getArticles(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (status != null && !status.isBlank() && !"undefined".equalsIgnoreCase(status)) {
            ArticleStatus articleStatus = ArticleStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(articleService.findByStatus(articleStatus,
                    PageRequest.of(page, size)));
        }

        return ResponseEntity.ok(articleService.findArticles(null, null, null,
                PageRequest.of(page, size)));
    }

    @PostMapping("/articles/{articleId}/summarize")
    public ResponseEntity<ArticleDto> summarizeArticle(@PathVariable Long articleId) {
        summarizationService.summarizeArticle(articleId);
        return ResponseEntity.ok().build();
    }

    // --- Crawler Control ---
    @PostMapping("/crawler/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleCrawler(@RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", false);
        crawlerScheduler.setSchedulerEnabled(enabled);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    @PostMapping("/crawler/run")
    public ResponseEntity<Void> runCrawlerNow(@RequestBody(required = false) Map<String, Long> body) {
        if (body != null && body.containsKey("sourceId")) {
            crawlerScheduler.manualCrawl(body.get("sourceId"));
        } else {
            crawlerScheduler.manualCrawlAll();
        }
        return ResponseEntity.ok().build();
    }

    // --- Summarizer Control ---
    @PostMapping("/summarizer/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleSummarizer(@RequestBody Map<String, Boolean> body) {
        boolean enabled = body.getOrDefault("enabled", false);
        summarizationScheduler.setSchedulerEnabled(enabled);
        return ResponseEntity.ok(Map.of("enabled", enabled));
    }

    // --- Crawl Logs ---
    @GetMapping("/crawl-logs")
    public ResponseEntity<List<CrawlLog>> getCrawlLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(crawlLogRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startedAt"))
        ).getContent());
    }
}
