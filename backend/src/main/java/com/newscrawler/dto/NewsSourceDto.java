package com.newscrawler.dto;

import jakarta.validation.constraints.NotBlank;
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
public class NewsSourceDto {
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    private String baseUrl;

    private Map<String, Object> crawlConfig;
    private Boolean active;
    private LocalDateTime createdAt;
}
