package com.sharefair.config;

import com.sharefair.service.SearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class EmbeddingBackfillRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingBackfillRunner.class);

    private final SearchService searchService;

    public EmbeddingBackfillRunner(SearchService searchService) {
        this.searchService = searchService;
    }

    @Override
    @Async
    public void run(ApplicationArguments args) {
        log.info("Starting automatic embedding backfill on startup...");
        int processed = searchService.backfillEmbeddings(500);
        if (processed > 0) {
            log.info("Backfilled embeddings for {} listings on startup", processed);
        } else {
            log.info("No listings need embedding backfill");
        }
    }
}
