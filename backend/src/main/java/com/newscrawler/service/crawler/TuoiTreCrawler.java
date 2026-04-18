package com.newscrawler.service.crawler;

import com.newscrawler.entity.Article;
import com.newscrawler.entity.NewsSource;
import com.newscrawler.entity.enums.ArticleStatus;
import com.newscrawler.util.SlugUtils;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class TuoiTreCrawler implements CrawlerStrategy {

    private static final String SOURCE_NAME = "Tuoi Tre";
    private static final String RSS_URL = "https://tuoitre.vn/rss/tin-moi-nhat.rss";

    @Override
    public boolean supports(String sourceName) {
        return SOURCE_NAME.equalsIgnoreCase(sourceName) || "TuoiTre".equalsIgnoreCase(sourceName);
    }

    @Override
    public List<String> fetchArticleUrls(NewsSource source) {
        List<String> urls = new ArrayList<>();
        try {
            Document rss = Jsoup.connect(RSS_URL)
                    .timeout(15000)
                    .userAgent("Mozilla/5.0")
                    .get();

            Elements items = rss.select("item");
            for (Element item : items) {
                String link = item.select("link").text().trim();
                if (link.isEmpty()) {
                    link = item.selectFirst("link") != null
                            ? item.selectFirst("link").nextSibling().toString().trim()
                            : "";
                }
                if (!link.isEmpty() && link.startsWith("https://tuoitre.vn")) {
                    urls.add(link);
                }
            }
        } catch (Exception e) {
            log.error("Error fetching TuoiTre RSS: {}", e.getMessage());
        }
        return urls;
    }

    @Override
    public Article parseArticle(String url, NewsSource source) {
        try {
            Document doc = Jsoup.connect(url)
                    .timeout(15000)
                    .userAgent("Mozilla/5.0")
                    .get();

            String title = extractText(doc, "h1.article-title");
            if (title.isEmpty()) {
                title = extractText(doc, "h1.news-title");
            }
            if (title.isEmpty()) return null;

            String description = extractText(doc, "h2.sapo");
            if (description.isEmpty()) {
                description = extractText(doc, "h2.detail-sapo");
            }
            String content = extractContent(doc, "div.detail__content p");
            if (content.isEmpty()) {
                content = extractContent(doc, "div.detail-cmain p");
            }
            if (content.isEmpty()) {
                content = extractContent(doc, "div#main-detail-body p");
            }
            if (content.isEmpty()) {
                content = extractContent(doc, "div.content.fck p");
            }
            if (content.isEmpty()) {
                content = extractContent(doc, "article p");
            }

            String thumbnail = extractThumbnail(doc);
            String category = extractCategory(url);
            String author = extractText(doc, "div.author-info a");

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("category", category);
            metadata.put("description", description);
            metadata.put("thumbnail", thumbnail);
            metadata.put("author", author);

            return Article.builder()
                    .source(source)
                    .url(url)
                    .slug(SlugUtils.toSlug(title))
                    .title(title)
                    .content(content)
                    .rawHtml(doc.body().html())
                    .metadata(metadata)
                    .status(ArticleStatus.PENDING)
                    .viewCount(0)
                    .retryCount(0)
                    .crawledAt(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            log.error("Error parsing TuoiTre article {}: {}", url, e.getMessage());
            return null;
        }
    }

    private String extractText(Document doc, String selector) {
        Element el = doc.selectFirst(selector);
        return el != null ? el.text().trim() : "";
    }

    private String extractContent(Document doc, String selector) {
        Elements elements = doc.select(selector);
        StringBuilder sb = new StringBuilder();
        for (Element el : elements) {
            String text = el.text().trim();
            if (!text.isEmpty()) {
                sb.append(text).append("\n\n");
            }
        }
        return sb.toString().trim();
    }

    private String extractThumbnail(Document doc) {
        Element meta = doc.selectFirst("meta[property=og:image]");
        if (meta != null) return meta.attr("content");
        Element img = doc.selectFirst("div.detail__content img[src]");
        if (img != null) return img.attr("src");
        img = doc.selectFirst("div.content.fck img[src]");
        if (img != null) return img.attr("src");
        return "";
    }

    private String extractCategory(String url) {
        try {
            String path = url.replace("https://tuoitre.vn/", "");
            if (path.contains("/")) {
                return path.substring(0, path.indexOf("/"));
            }
        } catch (Exception ignored) {}
        return "general";
    }
}
