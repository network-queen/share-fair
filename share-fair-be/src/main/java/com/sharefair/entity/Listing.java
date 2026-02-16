package com.sharefair.entity;

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
public class Listing {
    private String id;
    private String title;
    private String description;
    private String category;
    private String condition;
    private String ownerId;
    private BigDecimal price;
    private BigDecimal pricePerDay;
    private List<String> images;
    private Double latitude;
    private Double longitude;
    private String neighborhood;
    private Boolean available;
    private String status;
    @Builder.Default
    private String listingType = "RENTAL";
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Builder.Default
    private Double distanceKm = null;
}
