package com.newscrawler.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newscrawler.dto.ArticleDto;
import com.newscrawler.dto.StatsDto;
import com.newscrawler.entity.Article;
import com.newscrawler.entity.enums.ArticleStatus;
import com.newscrawler.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper redisObjectMapper;

    @Transactional(readOnly = true)
    public ArticleDto findBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        return toDto(article);
    }

    @Transactional
    public ArticleDto findBySlugAndIncrementView(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        articleRepository.incrementViewCount(article.getId());
        article.setViewCount(article.getViewCount() + 1);
        return toDto(article);
    }

    @Transactional(readOnly = true)
    public Page<ArticleDto> findArticles(String category, Long sourceId, String query, Pageable pageable) {
        return articleRepository.findArticles(category, sourceId, query, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<ArticleDto> getFeatured(int limit) {
        String cacheKey = "articles:featured:" + limit;
        List<ArticleDto> cached = readCache(cacheKey);
        if (cached != null) return cached;

        List<ArticleDto> result = articleRepository.findFeatured(PageRequest.of(0, limit))
                .stream().map(this::toDto).toList();
        writeCache(cacheKey, result, 5, TimeUnit.MINUTES);
        return result;
    }

    @Transactional(readOnly = true)
    public List<ArticleDto> getAiPicks(int limit) {
        String cacheKey = "articles:ai-picks:" + limit;
        List<ArticleDto> cached = readCache(cacheKey);
        if (cached != null) return cached;

        List<ArticleDto> result = articleRepository.findAiPicks(PageRequest.of(0, limit))
                .stream().map(this::toDto).toList();
        writeCache(cacheKey, result, 5, TimeUnit.MINUTES);
        return result;
    }

    @Transactional(readOnly = true)
    public List<ArticleDto> getMostRead(int limit) {
        String cacheKey = "articles:most-read:" + limit;
        List<ArticleDto> cached = readCache(cacheKey);
        if (cached != null) return cached;

        List<ArticleDto> result = articleRepository.findMostRead(PageRequest.of(0, limit))
                .stream().map(this::toDto).toList();
        writeCache(cacheKey, result, 10, TimeUnit.MINUTES);
        return result;
    }

    @Transactional(readOnly = true)
    public StatsDto getStats() {
        long total = articleRepository.count();
        long summarized = articleRepository.countByStatus(ArticleStatus.SUMMARIZED);
        long pending = articleRepository.countByStatus(ArticleStatus.PENDING);
        long failed = articleRepository.countByStatus(ArticleStatus.FAILED);

        return StatsDto.builder()
                .totalArticles(total)
                .summarizedArticles(summarized)
                .pendingArticles(pending)
                .failedArticles(failed)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ArticleDto> findByStatus(ArticleStatus status, Pageable pageable) {
        return articleRepository.findByStatusIn(List.of(status), pageable)
                .map(this::toDto);
    }

    private ArticleDto toDto(Article article) {
        return ArticleDto.builder()
                .id(article.getId())
                .slug(article.getSlug())
                .title(article.getTitle())
                .url(article.getUrl())
                .sourceName(article.getSource() != null ? article.getSource().getName() : null)
                .sourceId(article.getSource() != null ? article.getSource().getId() : null)
                .content(article.getContent())
                .metadata(article.getMetadata())
                .summary(article.getSummary())
                .status(article.getStatus().name())
                .viewCount(article.getViewCount())
                .crawledAt(article.getCrawledAt())
                .summarizedAt(article.getSummarizedAt())
                .build();
    }

    private List<ArticleDto> readCache(String key) {
        try {
            String json = redisTemplate.opsForValue().get(key);
            if (json != null) {
                return redisObjectMapper.readValue(json, new TypeReference<List<ArticleDto>>() {});
            }
        } catch (Exception e) {
            log.warn("Redis read error for key {}: {}", key, e.getMessage());
            redisTemplate.delete(key);
        }
        return null;
    }

    private void writeCache(String key, List<ArticleDto> data, long timeout, TimeUnit unit) {
        try {
            String json = redisObjectMapper.writeValueAsString(data);
            redisTemplate.opsForValue().set(key, json, timeout, unit);
        } catch (Exception e) {
            log.warn("Redis write error for key {}: {}", key, e.getMessage());
        }
    }
}
