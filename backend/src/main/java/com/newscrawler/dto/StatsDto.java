package com.newscrawler.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsDto {
    private long totalArticles;
    private long summarizedArticles;
    private long pendingArticles;
    private long failedArticles;
}
