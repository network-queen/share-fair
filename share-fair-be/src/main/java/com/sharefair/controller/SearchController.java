package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.ListingDto;
import com.sharefair.dto.ListingMapper;
import com.sharefair.entity.Listing;
import com.sharefair.repository.NeighborhoodRepository;
import com.sharefair.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {
    private final NeighborhoodRepository neighborhoodRepository;
    private final SearchService searchService;

    public SearchController(NeighborhoodRepository neighborhoodRepository,
                            SearchService searchService) {
        this.neighborhoodRepository = neighborhoodRepository;
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String neighborhood,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer radius,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(defaultValue = "relevance") String sortBy,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {

        limit = Math.max(1, Math.min(limit, 100));
        offset = Math.max(0, offset);

        List<Listing> listings;
        if (lat != null && lng != null && "distance".equals(sortBy)) {
            double radiusKm = radius != null ? radius : 10;
            listings = searchService.searchByLocation(lat, lng, radiusKm, limit, offset);
        } else {
            listings = searchService.semanticSearch(query, neighborhood, category, sortBy, limit, offset);
        }

        List<ListingDto> dtos = listings.stream()
                .map(ListingMapper::toDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("listings", dtos);
        response.put("total", dtos.size());
        response.put("hasMore", dtos.size() == limit);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/backfill-embeddings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> backfillEmbeddings(
            @RequestParam(defaultValue = "100") int batchSize) {
        batchSize = Math.max(1, Math.min(batchSize, 1000));
        int processed = searchService.backfillEmbeddings(batchSize);
        Map<String, Object> result = new HashMap<>();
        result.put("processed", processed);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/location")
    public ResponseEntity<ApiResponse<Map<String, Object>>> searchByLocation(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5") double radius,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset) {

        limit = Math.max(1, Math.min(limit, 100));
        offset = Math.max(0, offset);
        radius = Math.max(0.5, Math.min(radius, 50));

        List<Listing> listings = searchService.searchByLocation(latitude, longitude, radius, limit, offset);

        List<ListingDto> dtos = listings.stream()
                .map(ListingMapper::toDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("listings", dtos);
        response.put("total", dtos.size());
        response.put("hasMore", dtos.size() == limit);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/neighborhoods")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getNeighborhoods() {
        List<Map<String, String>> neighborhoods = neighborhoodRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(neighborhoods));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = neighborhoodRepository.findDistinctCategoriesInListings();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<ApiResponse<List<String>>> autocomplete(@RequestParam String query) {
        List<String> suggestions = neighborhoodRepository.searchListingTitles(query);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }

}
