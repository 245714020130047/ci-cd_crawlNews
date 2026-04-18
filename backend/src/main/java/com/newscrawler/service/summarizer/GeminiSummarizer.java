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
public class GeminiSummarizer implements AiProvider {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${app.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${app.ai.gemini.model:gemini-2.5-flash}")
    private String model;

    public GeminiSummarizer(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
        this.objectMapper = objectMapper;
    }

    @Override
    public String getName() {
        return "gemini";
    }

    @Override
    public Map<String, Object> summarize(String content, String title) {
        String prompt = buildPrompt(content, title);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                ),
                "generationConfig", Map.of(
                        "temperature", 0.3,
                        "maxOutputTokens", 2048
                )
        );

        try {
            String response = webClient.post()
                    .uri("/v1beta/models/{model}:generateContent?key={key}", model, apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseGeminiResponse(response);
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            throw new RuntimeException("Failed to summarize with Gemini: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> parseGeminiResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty()) {
                throw new RuntimeException("No candidates in Gemini response");
            }

            String text = candidates.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            // Try to parse as JSON first
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
            log.warn("Failed to parse Gemini response as structured JSON, returning raw: {}", e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("summary", response);
            fallback.put("provider", "gemini");
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
                - "provider": "gemini"
                
                Article title: %s
                
                Article content:
                %s
                
                Return ONLY valid JSON, no additional text.
                """.formatted(title, content.length() > 8000 ? content.substring(0, 8000) : content);
    }
}
