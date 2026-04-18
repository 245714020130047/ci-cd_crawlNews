-- =============================================
-- V2: Seed admin account + default news sources
-- Password: admin123 (bcrypt hash)
-- =============================================

INSERT INTO users (username, email, password_hash, role, active)
VALUES ('admin', 'admin@newscrawler.local',
        '$2a$10$l/Vdk3SU3QbUUIYdcfjZoO2sxxApemUrf.x4plnIcDu6mkS.9Qt9G',
        'ADMIN', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Seed VnExpress source
INSERT INTO news_sources (name, base_url, crawl_config, active)
VALUES ('VnExpress', 'https://vnexpress.net', '{
    "index_url": "https://vnexpress.net/rss/tin-moi-nhat.rss",
    "title_selector": "h1.title-detail",
    "content_selector": "article.fck_detail p",
    "author_selector": ".author_mail, .author",
    "category_selector": ".breadcrumb a:last-child",
    "image_selector": "meta[property=og:image]",
    "crawl_interval_minutes": 30,
    "max_articles_per_run": 20
}', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Seed Tuoi Tre source
INSERT INTO news_sources (name, base_url, crawl_config, active)
VALUES ('Tuoi Tre', 'https://tuoitre.vn', '{
    "index_url": "https://tuoitre.vn/rss/tin-moi-nhat.rss",
    "title_selector": "h1.article-title",
    "content_selector": ".detail-content p",
    "author_selector": ".author-info .name",
    "category_selector": ".breadcrumb li:last-child a",
    "image_selector": "meta[property=og:image]",
    "crawl_interval_minutes": 30,
    "max_articles_per_run": 20
}', TRUE)
ON CONFLICT (name) DO NOTHING;
