package com.newscrawler.service.crawler;

import com.newscrawler.entity.NewsSource;
import com.newscrawler.repository.NewsSourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CrawlerScheduler {

    private final NewsSourceRepository newsSourceRepository;
    private final ArticleCrawlerService articleCrawlerService;
    private final StringRedisTemplate redisTemplate;

    private static final String SCHEDULER_ENABLED_KEY = "crawler:scheduler:enabled";

    @Scheduled(fixedDelayString = "${app.crawler.interval-ms:1800000}")
    public void scheduledCrawl() {
        log.info("check redis");

        String enabled = redisTemplate.opsForValue().get(SCHEDULER_ENABLED_KEY);
        if (!"true".equalsIgnoreCase(enabled)) {
            log.info("check	 scheduler is disabled");

            log.debug("Crawler scheduler is disabled");
            return;
        }

        log.info("Starting scheduled crawl...");
        List<NewsSource> sources = newsSourceRepository.findByActiveTrue();

        for (NewsSource source : sources) {
            // Check per-source flag
            String sourceKey = "crawler:source:" + source.getId() + ":enabled";
            String sourceEnabled = redisTemplate.opsForValue().get(sourceKey);
            if ("false".equalsIgnoreCase(sourceEnabled)) {
                log.debug("Skipping disabled source: {}", source.getName());
                continue;
            }

            try {
                var result = articleCrawlerService.crawlSource(source);
                log.info("Crawled {}: {} new out of {} found",
                        source.getName(), result.getArticlesNew(), result.getArticlesFound());
            } catch (Exception e) {
                log.error("Error crawling source {}: {}", source.getName(), e.getMessage());
            }
        }

        log.info("Scheduled crawl completed");
    }

    public void manualCrawl(Long sourceId) {
        NewsSource source = newsSourceRepository.findById(sourceId)
                .orElseThrow(() -> new IllegalArgumentException("Source not found"));
        articleCrawlerService.crawlSource(source);
    }

    public void manualCrawlAll() {
        List<NewsSource> sources = newsSourceRepository.findByActiveTrue();
        for (NewsSource source : sources) {
            try {
                articleCrawlerService.crawlSource(source);
            } catch (Exception e) {
                log.error("Error crawling source {}: {}", source.getName(), e.getMessage());
            }
        }
    }

    public void setSchedulerEnabled(boolean enabled) {
        redisTemplate.opsForValue().set(SCHEDULER_ENABLED_KEY, String.valueOf(enabled));
    }

    public boolean isSchedulerEnabled() {
        String enabled = redisTemplate.opsForValue().get(SCHEDULER_ENABLED_KEY);
        return "true".equalsIgnoreCase(enabled);
    }
}
