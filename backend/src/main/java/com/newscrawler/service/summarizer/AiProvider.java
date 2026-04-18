package com.newscrawler.service.summarizer;

import java.util.Map;

public interface AiProvider {

    String getName();

    Map<String, Object> summarize(String content, String title);
}
