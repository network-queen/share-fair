package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.ListingDto;
import com.sharefair.entity.Listing;
import com.sharefair.entity.Review;
import com.sharefair.repository.ListingRepository;
import com.sharefair.repository.ReviewRepository;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.SearchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/listings")
@CrossOrigin(origins = "*")
public class ListingController {
    private final ListingRepository listingRepository;
    private final SearchService searchService;
    private final ReviewRepository reviewRepository;

    public ListingController(ListingRepository listingRepository, SearchService searchService,
                             ReviewRepository reviewRepository) {
        this.listingRepository = listingRepository;
        this.searchService = searchService;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        page = Math.max(0, page);
        limit = Math.max(1, Math.min(limit, 100));
        List<Listing> allListings = listingRepository.findAll();
        int start = page * limit;
        int end = Math.min(start + limit, allListings.size());
        List<Listing> pageListings = allListings.subList(start, end);

        List<ListingDto> dtos = pageListings.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        int totalPages = (int) Math.ceil((double) allListings.size() / limit);

        Map<String, Object> response = new HashMap<>();
        response.put("content", dtos);
        response.put("currentPage", page);
        response.put("totalPages", totalPages);
        response.put("totalElements", allListings.size());
        response.put("pageSize", limit);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingDto>> getListing(@PathVariable String id) {
        return listingRepository.findById(id)
                .map(listing -> ResponseEntity.ok(ApiResponse.success(toDto(listing))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ApiResponse<ListingDto>) ApiResponse.error("Listing not found")));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ListingDto>> createListing(
            @RequestBody ListingDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        Listing listing = fromDto(dto);
        listing.setOwnerId(principal.getId());
        if (listing.getLatitude() == null) listing.setLatitude(0.0);
        if (listing.getLongitude() == null) listing.setLongitude(0.0);
        Listing saved = listingRepository.save(listing);
        searchService.generateEmbedding(saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toDto(saved)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ListingDto>>> getUserListings(@PathVariable String userId) {
        List<ListingDto> listings = listingRepository.findByOwnerId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(listings));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingDto>> updateListing(
            @PathVariable String id,
            @RequestBody ListingDto dto) {
        return listingRepository.findById(id)
                .map(existing -> {
                    Listing listing = fromDto(dto);
                    listing.setId(id);
                    Listing updated = listingRepository.save(listing);
                    searchService.generateEmbedding(updated.getId());
                    return ResponseEntity.ok(ApiResponse.success(toDto(updated)));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ApiResponse<ListingDto>) ApiResponse.error("Listing not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable String id) {
        if (listingRepository.findById(id).isPresent()) {
            listingRepository.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("Listing not found"));
    }

    private ListingDto toDto(Listing listing) {
        ListingDto dto = new ListingDto();
        dto.setId(listing.getId());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setCategory(listing.getCategory());
        dto.setCondition(listing.getCondition());
        dto.setOwnerId(listing.getOwnerId());
        dto.setPrice(listing.getPrice());
        dto.setPricePerDay(listing.getPricePerDay());
        dto.setImages(listing.getImages());
        dto.setLatitude(listing.getLatitude());
        dto.setLongitude(listing.getLongitude());
        dto.setNeighborhood(listing.getNeighborhood());
        dto.setAvailable(listing.getAvailable());
        dto.setCreatedAt(listing.getCreatedAt());
        dto.setUpdatedAt(listing.getUpdatedAt());

        List<Review> ownerReviews = reviewRepository.findByRevieweeId(listing.getOwnerId());
        if (!ownerReviews.isEmpty()) {
            double avgRating = ownerReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            dto.setRatings(avgRating);
            dto.setReviewCount(ownerReviews.size());
        }

        return dto;
    }

    private Listing fromDto(ListingDto dto) {
        return Listing.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .condition(dto.getCondition())
                .ownerId(dto.getOwnerId())
                .price(dto.getPrice())
                .pricePerDay(dto.getPricePerDay())
                .images(dto.getImages())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .neighborhood(dto.getNeighborhood())
                .available(dto.getAvailable())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
