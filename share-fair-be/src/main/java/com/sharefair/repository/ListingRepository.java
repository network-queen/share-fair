package com.sharefair.repository;

import com.sharefair.entity.Listing;
import java.util.List;
import java.util.Optional;

public interface ListingRepository {
    Listing save(Listing listing);
    Optional<Listing> findById(String id);
    List<Listing> findAll();
    List<Listing> findByOwnerId(String ownerId);
    List<Listing> findByCategory(String category);
    List<Listing> findByNeighborhood(String neighborhood);
    List<Listing> findAvailable();
    List<Listing> findByNeighborhoodAndCategory(String neighborhood, String category);
    void delete(String id);
    long count();

    List<Listing> findBySimilarity(float[] queryEmbedding, String neighborhood,
                                    String category, double similarityThreshold,
                                    int limit, int offset);
    List<Listing> findByKeyword(String query, String neighborhood,
                                 String category, int limit, int offset);
    List<Listing> findByFilters(String neighborhood, String category,
                                 int limit, int offset);
    void updateEmbedding(String listingId, float[] embedding);
    List<Listing> findWithoutEmbedding(int limit);
}
