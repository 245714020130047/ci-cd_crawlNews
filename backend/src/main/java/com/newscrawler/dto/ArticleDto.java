package com.newscrawler.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDto {
    private Long id;
    private String slug;
    private String title;
    private String content;
    private String url;
    private String sourceName;
    private Long sourceId;
    private Map<String, Object> metadata;
    private Map<String, Object> summary;
    private String status;
    private Integer viewCount;
    private LocalDateTime crawledAt;
    private LocalDateTime summarizedAt;
    private boolean bookmarked;
}
