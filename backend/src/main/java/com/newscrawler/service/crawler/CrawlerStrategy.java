package com.newscrawler.service.crawler;

import com.newscrawler.entity.Article;
import com.newscrawler.entity.NewsSource;

import java.util.List;

public interface CrawlerStrategy {

    boolean supports(String sourceName);

    List<String> fetchArticleUrls(NewsSource source);

    Article parseArticle(String url, NewsSource source);
}
