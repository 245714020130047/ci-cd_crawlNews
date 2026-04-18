package com.newscrawler.repository;

import com.newscrawler.entity.CrawlLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CrawlLogRepository extends JpaRepository<CrawlLog, Long> {
    Page<CrawlLog> findBySourceIdOrderByStartedAtDesc(Long sourceId, Pageable pageable);
    Page<CrawlLog> findAllByOrderByStartedAtDesc(Pageable pageable);
}
