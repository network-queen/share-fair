package com.sharefair.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "sharefair.embedding")
public class EmbeddingProperties {
    private double similarityThreshold = 0.8;
}
