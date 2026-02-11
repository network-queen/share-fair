package com.sharefair.service;

import com.sharefair.config.EmbeddingProperties;
import com.sharefair.entity.Listing;
import com.sharefair.repository.ListingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchService.class);

    private final ListingRepository listingRepository;
    private final EmbeddingModel embeddingModel;
    private final EmbeddingProperties embeddingProperties;

    public SearchService(ListingRepository listingRepository,
                         EmbeddingModel embeddingModel,
                         EmbeddingProperties embeddingProperties) {
        this.listingRepository = listingRepository;
        this.embeddingModel = embeddingModel;
        this.embeddingProperties = embeddingProperties;
    }

    public List<Listing> semanticSearch(String query, String neighborhood,
                                         String category, int limit, int offset) {
        if (query == null || query.isBlank()) {
            return listingRepository.findByFilters(neighborhood, category, limit, offset);
        }

        try {
            float[] queryEmbedding = embeddingModel.embed(query);
            return listingRepository.findBySimilarity(
                    queryEmbedding,
                    neighborhood,
                    category,
                    embeddingProperties.getSimilarityThreshold(),
                    limit,
                    offset
            );
        } catch (Exception e) {
            log.warn("Embedding generation failed for query '{}', falling back to keyword search: {}",
                    query, e.getMessage());
            return listingRepository.findByKeyword(query, neighborhood, category, limit, offset);
        }
    }

    @Async
    public void generateEmbedding(String listingId) {
        try {
            Optional<Listing> listing = listingRepository.findById(listingId);
            if (listing.isEmpty()) {
                return;
            }

            String text = buildEmbeddingText(listing.get());
            float[] embedding = embeddingModel.embed(text);
            listingRepository.updateEmbedding(listingId, embedding);
            log.debug("Updated embedding for listing {}", listingId);
        } catch (Exception e) {
            log.warn("Failed to generate embedding for listing {}: {}", listingId, e.getMessage());
        }
    }

    public int backfillEmbeddings(int batchSize) {
        List<Listing> listings = listingRepository.findWithoutEmbedding(batchSize);
        if (listings.isEmpty()) {
            return 0;
        }

        int count = 0;
        for (Listing listing : listings) {
            try {
                String text = buildEmbeddingText(listing);
                float[] embedding = embeddingModel.embed(text);
                listingRepository.updateEmbedding(listing.getId(), embedding);
                count++;
            } catch (Exception e) {
                log.warn("Failed to generate embedding for listing {}: {}",
                        listing.getId(), e.getMessage());
            }
        }

        log.info("Backfilled embeddings for {} listings", count);
        return count;
    }

    public List<Listing> searchByLocation(double lat, double lng, double radiusKm, int limit, int offset) {
        return listingRepository.findByLocation(lat, lng, radiusKm, limit, offset);
    }

    private String buildEmbeddingText(Listing listing) {
        StringBuilder sb = new StringBuilder();
        if (listing.getTitle() != null) {
            sb.append(listing.getTitle());
        }
        if (listing.getDescription() != null) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(listing.getDescription());
        }
        if (listing.getCategory() != null) {
            if (!sb.isEmpty()) sb.append(" ");
            sb.append(listing.getCategory());
        }
        return sb.toString();
    }
}
