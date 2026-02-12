package com.sharefair.dto;

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
public class TrustScoreDto {
    private String userId;
    private BigDecimal score;
    private String tier;
    private Integer completedTransactions;
    private BigDecimal averageRating;
    private LocalDateTime updatedAt;
}
