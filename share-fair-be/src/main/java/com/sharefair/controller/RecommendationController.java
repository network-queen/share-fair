package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.ListingDto;
import com.sharefair.dto.ListingMapper;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    /**
     * Personalized recommendations for the authenticated user based on transaction history.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ListingDto>>> getPersonalized(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "10") int limit) {
        List<ListingDto> listings = recommendationService
                .getPersonalized(principal.getId(), Math.min(limit, 20))
                .stream()
                .map(ListingMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    /**
     * Listings similar to the given listing (public endpoint for listing detail page).
     */
    @GetMapping("/similar/{listingId}")
    public ResponseEntity<ApiResponse<List<ListingDto>>> getSimilar(
            @PathVariable String listingId,
            @RequestParam(defaultValue = "6") int limit) {
        List<ListingDto> listings = recommendationService
                .getSimilar(listingId, Math.min(limit, 12))
                .stream()
                .map(ListingMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(listings));
    }
}
