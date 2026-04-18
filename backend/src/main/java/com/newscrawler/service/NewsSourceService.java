package com.newscrawler.service;

import com.newscrawler.dto.NewsSourceDto;
import com.newscrawler.entity.NewsSource;
import com.newscrawler.repository.NewsSourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NewsSourceService {

    private final NewsSourceRepository newsSourceRepository;
    private final StringRedisTemplate redisTemplate;

    @Transactional(readOnly = true)
    public List<NewsSourceDto> findAllActive() {
        return newsSourceRepository.findByActiveTrue()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NewsSourceDto> findAll() {
        return newsSourceRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public NewsSourceDto create(NewsSourceDto dto) {
        NewsSource source = NewsSource.builder()
                .name(dto.getName())
                .baseUrl(dto.getBaseUrl())
                .crawlConfig(dto.getCrawlConfig())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        newsSourceRepository.save(source);
        return toDto(source);
    }

    @Transactional
    public NewsSourceDto update(Long id, NewsSourceDto dto) {
        NewsSource source = newsSourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Source not found"));

        if (dto.getName() != null) source.setName(dto.getName());
        if (dto.getBaseUrl() != null) source.setBaseUrl(dto.getBaseUrl());
        if (dto.getCrawlConfig() != null) source.setCrawlConfig(dto.getCrawlConfig());
        if (dto.getActive() != null) source.setActive(dto.getActive());

        newsSourceRepository.save(source);
        return toDto(source);
    }

    @Transactional
    public void toggleActive(Long id, boolean active) {
        NewsSource source = newsSourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Source not found"));
        source.setActive(active);
        newsSourceRepository.save(source);

        // Update Redis flag for crawler scheduler
        String key = "crawler:source:" + id + ":enabled";
        redisTemplate.opsForValue().set(key, String.valueOf(active));
    }

    @Transactional
    public void delete(Long id) {
        newsSourceRepository.deleteById(id);
    }

    private NewsSourceDto toDto(NewsSource source) {
        return NewsSourceDto.builder()
                .id(source.getId())
                .name(source.getName())
                .baseUrl(source.getBaseUrl())
                .crawlConfig(source.getCrawlConfig())
                .active(source.getActive())
                .build();
    }
}
