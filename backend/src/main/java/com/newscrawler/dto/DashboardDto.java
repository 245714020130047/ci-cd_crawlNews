package com.newscrawler.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private StatsDto stats;
    private List<NewsSourceDto> sources;
    private boolean crawlerEnabled;
    private boolean summarizerEnabled;
}
