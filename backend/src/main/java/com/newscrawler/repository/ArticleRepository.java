package com.newscrawler.repository;

import com.newscrawler.entity.Article;
import com.newscrawler.entity.enums.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    Optional<Article> findBySlug(String slug);

    boolean existsByUrl(String url);

    @Query("SELECT a FROM Article a WHERE a.status = :status ORDER BY a.crawledAt DESC")
    List<Article> findByStatus(@Param("status") ArticleStatus status, Pageable pageable);

    @Query(value = """
        SELECT a.* FROM articles a
        WHERE (CAST(:category AS TEXT) IS NULL OR a.metadata->>'category' = CAST(:category AS TEXT))
        AND (CAST(:sourceId AS BIGINT) IS NULL OR a.source_id = CAST(:sourceId AS BIGINT))
        AND (CAST(:query AS TEXT) IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', CAST(:query AS TEXT), '%')))
        ORDER BY a.crawled_at DESC
    """, countQuery = """
        SELECT COUNT(*) FROM articles a
        WHERE (CAST(:category AS TEXT) IS NULL OR a.metadata->>'category' = CAST(:category AS TEXT))
        AND (CAST(:sourceId AS BIGINT) IS NULL OR a.source_id = CAST(:sourceId AS BIGINT))
        AND (CAST(:query AS TEXT) IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', CAST(:query AS TEXT), '%')))
    """, nativeQuery = true)
    Page<Article> findArticles(
        @Param("category") String category,
        @Param("sourceId") Long sourceId,
        @Param("query") String query,
        Pageable pageable
    );

    @Query("SELECT a FROM Article a WHERE a.summary IS NOT NULL ORDER BY a.crawledAt DESC")
    List<Article> findFeatured(Pageable pageable);

    @Query("SELECT a FROM Article a WHERE a.summary IS NOT NULL ORDER BY a.summarizedAt DESC")
    List<Article> findAiPicks(Pageable pageable);

    @Query("SELECT a FROM Article a ORDER BY a.viewCount DESC")
    List<Article> findMostRead(Pageable pageable);

    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);

    long countByStatus(ArticleStatus status);

    @Query("SELECT COUNT(a) FROM Article a WHERE a.summary IS NOT NULL")
    long countSummarized();

    @Query("SELECT a FROM Article a WHERE a.status IN :statuses ORDER BY a.crawledAt DESC")
    Page<Article> findByStatusIn(@Param("statuses") List<ArticleStatus> statuses, Pageable pageable);
}
