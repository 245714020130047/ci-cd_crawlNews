package com.newscrawler.service.crawler;

import com.newscrawler.entity.Article;
import com.newscrawler.entity.CrawlLog;
import com.newscrawler.entity.NewsSource;
import com.newscrawler.repository.ArticleRepository;
import com.newscrawler.repository.CrawlLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleCrawlerService {

    private final List<CrawlerStrategy> crawlerStrategies;
    private final ArticleRepository articleRepository;
    private final CrawlLogRepository crawlLogRepository;
    private final StringRedisTemplate redisTemplate;

    private static final String DEDUP_SET_KEY = "crawler:dedup:urls";
    private static final long DEDUP_TTL_DAYS = 30;

    @Transactional
    public CrawlLog crawlSource(NewsSource source) {
        LocalDateTime startTime = LocalDateTime.now();
        int newCount = 0;
        int skipCount = 0;
        int errorCount = 0;
        List<String> errors = new ArrayList<>();

        CrawlerStrategy strategy = findStrategy(source.getName());
        if (strategy == null) {
            log.warn("No crawler strategy found for source: {}", source.getName());
            return saveCrawlLog(source, startTime, 0, 0, 1,
                    List.of("No crawler strategy found for: " + source.getName()));
        }

        try {
            List<String> urls = strategy.fetchArticleUrls(source);
            log.info("Found {} article URLs from {}", urls.size(), source.getName());

            for (String url : urls) {
                try {
                    // Dedup check: Redis SET
                    Boolean isNew = redisTemplate.opsForSet().isMember(DEDUP_SET_KEY, url);
                    if (Boolean.TRUE.equals(isNew)) {
                        skipCount++;
                        continue;
                    }

                    // Dedup check: Database
                    if (articleRepository.existsByUrl(url)) {
                        redisTemplate.opsForSet().add(DEDUP_SET_KEY, url);
                        skipCount++;
                        continue;
                    }

                    Article article = strategy.parseArticle(url, source);
                    if (article != null) {
                        articleRepository.save(article);
                        redisTemplate.opsForSet().add(DEDUP_SET_KEY, url);
                        newCount++;
                        log.debug("Saved new article: {}", article.getTitle());
                    } else {
                        skipCount++;
                    }
                } catch (Exception e) {
                    errorCount++;
                    errors.add(url + ": " + e.getMessage());
                    log.error("Error crawling article {}: {}", url, e.getMessage());
                }
            }

            // Set TTL on dedup set
            redisTemplate.expire(DEDUP_SET_KEY, DEDUP_TTL_DAYS, TimeUnit.DAYS);

        } catch (Exception e) {
            errorCount++;
            errors.add("Global error: " + e.getMessage());
            log.error("Error crawling source {}: {}", source.getName(), e.getMessage());
        }

        return saveCrawlLog(source, startTime, newCount, skipCount, errorCount, errors);
    }

    private CrawlerStrategy findStrategy(String sourceName) {
        return crawlerStrategies.stream()
                .filter(s -> s.supports(sourceName))
                .findFirst()
                .orElse(null);
    }

    private CrawlLog saveCrawlLog(NewsSource source, LocalDateTime startTime,
                                   int newCount, int skipCount, int errorCount,
                                   List<String> errors) {
        Map<String, Object> errorsMap = new HashMap<>();
        errorsMap.put("errors", errors);

        CrawlLog crawlLog = CrawlLog.builder()
                .source(source)
                .startedAt(startTime)
                .finishedAt(LocalDateTime.now())
                .articlesFound(newCount + skipCount + errorCount)
                .articlesNew(newCount)
                .errors(List.of(errorsMap))
                .build();

        return crawlLogRepository.save(crawlLog);
    }
}
