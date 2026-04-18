package com.newscrawler.controller;

import com.newscrawler.dto.NewsSourceDto;
import com.newscrawler.service.NewsSourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sources")
@RequiredArgsConstructor
public class SourceController {

    private final NewsSourceService newsSourceService;

    @GetMapping
    public ResponseEntity<List<NewsSourceDto>> getActiveSources() {
        return ResponseEntity.ok(newsSourceService.findAllActive());
    }
}
