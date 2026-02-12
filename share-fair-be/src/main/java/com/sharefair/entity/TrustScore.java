package com.sharefair.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrustScore {
    private String userId;
    private BigDecimal score;
    private String tier;
    private Integer completedTransactions;
    private BigDecimal averageRating;
    private LocalDateTime updatedAt;
}
