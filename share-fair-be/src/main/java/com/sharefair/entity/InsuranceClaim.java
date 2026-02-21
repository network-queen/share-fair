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
public class InsuranceClaim {
    private String id;
    private String policyId;
    private String claimantId;
    private String description;
    private BigDecimal claimAmount;
    private String status;          // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
