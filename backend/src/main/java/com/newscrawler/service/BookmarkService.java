package com.newscrawler.service;

import com.newscrawler.dto.ArticleDto;
import com.newscrawler.entity.Bookmark;
import com.newscrawler.entity.Article;
import com.newscrawler.entity.User;
import com.newscrawler.repository.ArticleRepository;
import com.newscrawler.repository.BookmarkRepository;
import com.newscrawler.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Transactional
    public void addBookmark(Long userId, Long articleId) {
        if (bookmarkRepository.existsByUserIdAndArticleId(userId, articleId)) {
            return;
        }
        User user = userRepository.getReferenceById(userId);
        Article article = articleRepository.getReferenceById(articleId);

        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .article(article)
                .build();
        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(Long userId, Long articleId) {
        bookmarkRepository.deleteByUserIdAndArticleId(userId, articleId);
    }

    @Transactional(readOnly = true)
    public Page<ArticleDto> getBookmarks(Long userId, Pageable pageable) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(bookmark -> {
                    Article a = bookmark.getArticle();
                    return ArticleDto.builder()
                            .id(a.getId())
                            .slug(a.getSlug())
                            .title(a.getTitle())
                            .url(a.getUrl())
                            .sourceName(a.getSource() != null ? a.getSource().getName() : null)
                            .sourceId(a.getSource() != null ? a.getSource().getId() : null)
                            .metadata(a.getMetadata())
                            .summary(a.getSummary())
                            .status(a.getStatus().name())
                            .viewCount(a.getViewCount())
                            .crawledAt(a.getCrawledAt())
                            .summarizedAt(a.getSummarizedAt())
                            .bookmarked(true)
                            .build();
                });
    }

    @Transactional(readOnly = true)
    public boolean isBookmarked(Long userId, Long articleId) {
        return bookmarkRepository.existsByUserIdAndArticleId(userId, articleId);
    }
}
