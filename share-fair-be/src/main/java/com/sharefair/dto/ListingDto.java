package com.sharefair.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingDto {
    private String id;
    private String title;
    private String description;
    private String category;
    private String condition;
    private String ownerId;
    private UserDto owner;
    private BigDecimal price;
    private BigDecimal pricePerDay;
    private List<String> images;
    private Double latitude;
    private Double longitude;
    private String neighborhood;
    private Boolean available;
    private String status;
    private String listingType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double ratings;
    private Integer reviewCount;
    private Double distanceKm;
}
