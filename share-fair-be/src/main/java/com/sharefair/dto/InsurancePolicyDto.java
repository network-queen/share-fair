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
public class InsurancePolicyDto {
    private String id;
    private String transactionId;
    private String userId;
    private String coverageType;
    private BigDecimal premiumAmount;
    private BigDecimal maxCoverage;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
