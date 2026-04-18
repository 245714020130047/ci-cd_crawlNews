package com.newscrawler.service.summarizer;

import com.newscrawler.entity.Article;
import com.newscrawler.entity.enums.ArticleStatus;
import com.newscrawler.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SummarizationScheduler {

    private final ArticleRepository articleRepository;
    private final SummarizationService summarizationService;
    private final StringRedisTemplate redisTemplate;

    private static final String SCHEDULER_ENABLED_KEY = "summarizer:scheduler:enabled";
    private static final int BATCH_SIZE = 5;

    @Scheduled(fixedDelayString = "${app.summarizer.interval-ms:60000}")
    public void scheduledSummarize() {
        String enabled = redisTemplate.opsForValue().get(SCHEDULER_ENABLED_KEY);
        if (!"true".equalsIgnoreCase(enabled)) {
            log.debug("Summarization scheduler is disabled");
            return;
        }

        log.info("Starting scheduled summarization...");

        List<Article> pending = articleRepository.findByStatusIn(
                List.of(ArticleStatus.PENDING),
                PageRequest.of(0, BATCH_SIZE)
        ).getContent();

        if (pending.isEmpty()) {
            log.debug("No pending articles to summarize");
            return;
        }

        for (Article article : pending) {
            try {
                summarizationService.summarizeArticle(article.getId());
            } catch (Exception e) {
                log.error("Error summarizing article {}: {}", article.getSlug(), e.getMessage());
            }
        }

        log.info("Scheduled summarization completed, processed {} articles", pending.size());
    }

    public void setSchedulerEnabled(boolean enabled) {
        redisTemplate.opsForValue().set(SCHEDULER_ENABLED_KEY, String.valueOf(enabled));
    }

    public boolean isSchedulerEnabled() {
        String enabled = redisTemplate.opsForValue().get(SCHEDULER_ENABLED_KEY);
        return "true".equalsIgnoreCase(enabled);
    }
}
