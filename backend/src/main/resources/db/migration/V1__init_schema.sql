-- =============================================
-- V1: Init Schema - News Crawler
-- =============================================

-- Enum types
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE article_status AS ENUM ('PENDING', 'SUMMARIZED', 'FAILED', 'DEAD');

-- Users table
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(20) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'USER',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- News sources table
CREATE TABLE news_sources (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    base_url        VARCHAR(500) NOT NULL,
    crawl_config    JSONB NOT NULL DEFAULT '{}',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Articles table
CREATE TABLE articles (
    id              BIGSERIAL PRIMARY KEY,
    source_id       BIGINT NOT NULL REFERENCES news_sources(id),
    url             TEXT NOT NULL UNIQUE,
    slug            VARCHAR(500) NOT NULL UNIQUE,
    title           VARCHAR(1000) NOT NULL,
    content         TEXT,
    raw_html        TEXT,
    metadata        JSONB NOT NULL DEFAULT '{}',
    summary         JSONB,
    status          article_status NOT NULL DEFAULT 'PENDING',
    view_count      INTEGER NOT NULL DEFAULT 0,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    crawled_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    summarized_at   TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Article indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_source_id ON articles(source_id);
CREATE INDEX idx_articles_crawled_at ON articles(crawled_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_view_count ON articles(view_count DESC);
CREATE INDEX idx_articles_pending ON articles(id) WHERE status = 'PENDING';
CREATE INDEX idx_metadata_category ON articles USING GIN ((metadata->'category'));
CREATE INDEX idx_summary_gin ON articles USING GIN (summary) WHERE summary IS NOT NULL;

-- Bookmarks table
CREATE TABLE bookmarks (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id      BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, article_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- Crawl logs table
CREATE TABLE crawl_logs (
    id              BIGSERIAL PRIMARY KEY,
    source_id       BIGINT NOT NULL REFERENCES news_sources(id),
    started_at      TIMESTAMP NOT NULL,
    finished_at     TIMESTAMP,
    articles_found  INTEGER NOT NULL DEFAULT 0,
    articles_new    INTEGER NOT NULL DEFAULT 0,
    errors          JSONB DEFAULT '[]'
);

CREATE INDEX idx_crawl_logs_source_id ON crawl_logs(source_id);
CREATE INDEX idx_crawl_logs_started_at ON crawl_logs(started_at DESC);
