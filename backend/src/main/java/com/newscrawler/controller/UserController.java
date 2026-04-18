package com.newscrawler.controller;

import com.newscrawler.dto.ArticleDto;
import com.newscrawler.security.JwtTokenProvider;
import com.newscrawler.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final BookmarkService bookmarkService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/bookmarks")
    public ResponseEntity<Page<ArticleDto>> getBookmarks(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(bookmarkService.getBookmarks(userId, PageRequest.of(page, size)));
    }

    @PostMapping("/bookmarks/{articleId}")
    public ResponseEntity<Void> addBookmark(
            Authentication authentication,
            @PathVariable Long articleId) {
        Long userId = getUserId(authentication);
        bookmarkService.addBookmark(userId, articleId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/bookmarks/{articleId}")
    public ResponseEntity<Void> removeBookmark(
            Authentication authentication,
            @PathVariable Long articleId) {
        Long userId = getUserId(authentication);
        bookmarkService.removeBookmark(userId, articleId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/bookmarks/{articleId}/check")
    public ResponseEntity<Map<String, Boolean>> isBookmarked(
            Authentication authentication,
            @PathVariable Long articleId) {
        Long userId = getUserId(authentication);
        boolean bookmarked = bookmarkService.isBookmarked(userId, articleId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    private Long getUserId(Authentication authentication) {
        return Long.parseLong(authentication.getName());
    }
}
