package com.newscrawler.service.summarizer;

import com.newscrawler.entity.Article;
import com.newscrawler.entity.enums.ArticleStatus;
import com.newscrawler.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SummarizationService {

    private final ArticleRepository articleRepository;
    private final AiProviderFactory aiProviderFactory;

    @Transactional
    public Article summarizeArticle(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        log.info("start summarize: {}", article.toString());

        return doSummarize(article);
    }

    @Transactional
    public Article summarizeBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));

        return doSummarize(article);
    }

    private Article doSummarize(Article article) {
        if (article.getContent() == null || article.getContent().isBlank()) {
            article.setStatus(ArticleStatus.FAILED);
            article.setRetryCount(article.getRetryCount() + 1);
            log.warn("Content null summarize: {}", article);

            return articleRepository.save(article);
        }

        AiProvider provider = aiProviderFactory.getProvider();
        try {
            Map<String, Object> summary = provider.summarize(article.getContent(), article.getTitle());
            article.setSummary(summary);
            article.setStatus(ArticleStatus.SUMMARIZED);
            log.info("Summarized article {} with {}", article.getSlug(), provider.getName());
        } catch (Exception e) {
            log.warn("Primary provider {} failed, trying fallback: {}", provider.getName(), e.getMessage());

            // Try fallback provider
            AiProvider fallback = aiProviderFactory.getFallbackProvider();
            if (fallback != null) {
                try {
                    Map<String, Object> summary = fallback.summarize(article.getContent(), article.getTitle());
                    article.setSummary(summary);
                    article.setStatus(ArticleStatus.SUMMARIZED);
                    log.info("Summarized article {} with fallback {}", article.getSlug(), fallback.getName());
                } catch (Exception fe) {
                    log.error("Fallback provider {} also failed: {}", fallback.getName(), fe.getMessage());
                    article.setStatus(ArticleStatus.FAILED);
                    article.setRetryCount(article.getRetryCount() + 1);
                }
            } else {
                article.setStatus(ArticleStatus.FAILED);
                article.setRetryCount(article.getRetryCount() + 1);
            }
        }

        return articleRepository.save(article);
    }
}
