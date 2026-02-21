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
public class InsurancePolicy {
    private String id;
    private String transactionId;
    private String userId;
    private String coverageType;    // BASIC, STANDARD, PREMIUM
    private BigDecimal premiumAmount;
    private BigDecimal maxCoverage;
    private String status;          // ACTIVE, EXPIRED, CLAIMED
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
