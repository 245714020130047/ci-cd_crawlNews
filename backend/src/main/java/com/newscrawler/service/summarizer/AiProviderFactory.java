package com.newscrawler.service.summarizer;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AiProviderFactory {

    private final List<AiProvider> providers;

    @Value("${app.ai.provider:gemini}")
    private String defaultProvider;

    public AiProvider getProvider() {
        return getProvider(defaultProvider);
    }

    public AiProvider getProvider(String providerName) {
        return providers.stream()
                .filter(p -> p.getName().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "AI provider not found: " + providerName));
    }

    public AiProvider getFallbackProvider() {
        String fallback = "gemini".equalsIgnoreCase(defaultProvider) ? "openai" : "gemini";
        return providers.stream()
                .filter(p -> p.getName().equalsIgnoreCase(fallback))
                .findFirst()
                .orElse(null);
    }
}
