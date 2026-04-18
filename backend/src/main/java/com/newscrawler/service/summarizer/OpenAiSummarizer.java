package com.newscrawler.service.summarizer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class OpenAiSummarizer implements AiProvider {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.openai.api-key:}")
    private String apiKey;

    @Value("${app.ai.openai.model:gpt-3.5-turbo}")
    private String model;

    public OpenAiSummarizer(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.openai.com")
                .build();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getName() {
        return "openai";
    }

    @Override
    public Map<String, Object> summarize(String content, String title) {
        String prompt = buildPrompt(content, title);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are a news summarizer. Return only valid JSON."),
                        Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.3,
                "max_tokens", 2048
        );

        try {
            String response = webClient.post()
                    .uri("/v1/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseOpenAiResponse(response);
        } catch (Exception e) {
            log.error("OpenAI API error: {}", e.getMessage());
            throw new RuntimeException("Failed to summarize with OpenAI: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> parseOpenAiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            String text = root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            String cleaned = text.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            }
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();

            return objectMapper.readValue(cleaned, new TypeReference<>() {});
        } catch (Exception e) {
            log.warn("Failed to parse OpenAI response as structured JSON: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("summary", response);
            fallback.put("provider", "openai");
            return fallback;
        }
    }

    private String buildPrompt(String content, String title) {
        return """
                Summarize the following Vietnamese news article. Return a JSON object with these fields:
                - "summary": A concise summary in Vietnamese (2-3 paragraphs)
                - "key_points": An array of 3-5 key points in Vietnamese
                - "sentiment": One of "positive", "negative", "neutral"
                - "categories": An array of relevant category tags
                - "provider": "openai"
                
                Article title: %s
                
                Article content:
                %s
                
                Return ONLY valid JSON, no additional text.
                """.formatted(title, content.length() > 8000 ? content.substring(0, 8000) : content);
    }
}
