package com.sharefair.dto;

import com.sharefair.entity.Listing;
import com.sharefair.entity.Review;

import java.util.List;

public final class ListingMapper {

    private ListingMapper() {}

    public static ListingDto toDto(Listing listing) {
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
        dto.setStatus(listing.getStatus());
        dto.setListingType(listing.getListingType());
        dto.setCreatedAt(listing.getCreatedAt());
        dto.setUpdatedAt(listing.getUpdatedAt());
        dto.setDistanceKm(listing.getDistanceKm());
        return dto;
    }

    public static ListingDto toDtoWithReviews(Listing listing, List<Review> ownerReviews) {
        ListingDto dto = toDto(listing);
        if (ownerReviews != null && !ownerReviews.isEmpty()) {
            double avgRating = ownerReviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            dto.setRatings(avgRating);
            dto.setReviewCount(ownerReviews.size());
        }
        return dto;
    }
}
