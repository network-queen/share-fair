package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.ListingDto;
import com.sharefair.dto.ListingMapper;
import com.sharefair.entity.Listing;
import com.sharefair.entity.Review;
import com.sharefair.repository.ListingRepository;
import com.sharefair.repository.ReviewRepository;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.SearchService;
import com.sharefair.service.ImageStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {
    private final ListingRepository listingRepository;
    private final SearchService searchService;
    private final ReviewRepository reviewRepository;
    private final ImageStorageService imageStorageService;

    public ListingController(ListingRepository listingRepository, SearchService searchService,
                             ReviewRepository reviewRepository, ImageStorageService imageStorageService) {
        this.listingRepository = listingRepository;
        this.searchService = searchService;
        this.reviewRepository = reviewRepository;
        this.imageStorageService = imageStorageService;
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
        if ("FREE".equals(listing.getListingType())) {
            listing.setPrice(BigDecimal.ZERO);
            listing.setPricePerDay(BigDecimal.ZERO);
        }
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
            @RequestBody ListingDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return listingRepository.findById(id)
                .map(existing -> {
                    if (!existing.getOwnerId().equals(principal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .<ApiResponse<ListingDto>>body((ApiResponse<ListingDto>) ApiResponse.error("You can only edit your own listings"));
                    }
                    Listing listing = fromDto(dto);
                    listing.setId(id);
                    listing.setOwnerId(existing.getOwnerId());
                    listing.setCreatedAt(existing.getCreatedAt());
                    Listing updated = listingRepository.update(listing);
                    searchService.generateEmbedding(updated.getId());
                    return ResponseEntity.ok(ApiResponse.success(toDto(updated)));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ApiResponse<ListingDto>) ApiResponse.error("Listing not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteListing(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return listingRepository.findById(id)
                .map(existing -> {
                    if (!existing.getOwnerId().equals(principal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(ApiResponse.error("You can only delete your own listings"));
                    }
                    listingRepository.delete(id);
                    return ResponseEntity.ok(ApiResponse.success("Listing deleted successfully"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Listing not found")));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ListingDto>> updateListingStatus(
            @PathVariable String id,
            @RequestParam String status,
            @AuthenticationPrincipal UserPrincipal principal) {
        return listingRepository.findById(id)
                .map(existing -> {
                    if (!existing.getOwnerId().equals(principal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .<ApiResponse<ListingDto>>body((ApiResponse<ListingDto>) ApiResponse.error("You can only update your own listings"));
                    }
                    existing.setStatus(status);
                    existing.setAvailable("ACTIVE".equals(status));
                    Listing updated = listingRepository.update(existing);
                    return ResponseEntity.ok(ApiResponse.success(toDto(updated)));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ApiResponse<ListingDto>) ApiResponse.error("Listing not found")));
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal principal) {
        return listingRepository.findById(id)
                .map(existing -> {
                    if (!existing.getOwnerId().equals(principal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .<ApiResponse<List<String>>>body((ApiResponse<List<String>>) ApiResponse.error("You can only upload images to your own listings"));
                    }
                    if (files.size() > 5) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .<ApiResponse<List<String>>>body((ApiResponse<List<String>>) ApiResponse.error("Maximum 5 images allowed"));
                    }
                    List<String> urls = imageStorageService.uploadImages(id, files);
                    // Append new URLs to existing images
                    List<String> allImages = new ArrayList<>(existing.getImages() != null ? existing.getImages() : List.of());
                    allImages.addAll(urls);
                    // Cap at 5 images total
                    if (allImages.size() > 5) {
                        allImages = allImages.subList(0, 5);
                    }
                    existing.setImages(allImages);
                    listingRepository.update(existing);
                    return ResponseEntity.ok(ApiResponse.success(allImages));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ApiResponse<List<String>>) ApiResponse.error("Listing not found")));
    }

    @DeleteMapping("/{id}/images")
    public ResponseEntity<ApiResponse<List<String>>> deleteImage(
            @PathVariable String id,
            @RequestParam String imageUrl,
            @AuthenticationPrincipal UserPrincipal principal) {
        return listingRepository.findById(id)
                .map(existing -> {
                    if (!existing.getOwnerId().equals(principal.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .<ApiResponse<List<String>>>body((ApiResponse<List<String>>) ApiResponse.error("You can only delete images from your own listings"));
                    }
                    imageStorageService.deleteImage(imageUrl);
                    List<String> updatedImages = new ArrayList<>(existing.getImages() != null ? existing.getImages() : List.of());
                    updatedImages.remove(imageUrl);
                    existing.setImages(updatedImages);
                    listingRepository.update(existing);
                    return ResponseEntity.ok(ApiResponse.success(updatedImages));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((ApiResponse<List<String>>) ApiResponse.error("Listing not found")));
    }

    private ListingDto toDto(Listing listing) {
        List<Review> ownerReviews = reviewRepository.findByRevieweeId(listing.getOwnerId());
        return ListingMapper.toDtoWithReviews(listing, ownerReviews);
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
                .status(dto.getStatus())
                .listingType(dto.getListingType() != null ? dto.getListingType() : "RENTAL")
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
