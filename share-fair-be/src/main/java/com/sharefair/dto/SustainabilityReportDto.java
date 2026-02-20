package com.sharefair.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SustainabilityReportDto {

    // Community-wide totals
    private BigDecimal totalCarbonSavedKg;
    private long totalCompletedTransactions;
    private long totalActiveUsers;
    private BigDecimal avgCarbonPerTransaction;

    // Breakdown by category
    private List<Map<String, Object>> carbonByCategory;

    // Month-over-month trend (last 6 months)
    private List<Map<String, Object>> monthlyTrend;

    // Top contributors
    private List<Map<String, Object>> topContributors;

    // Per-user fields (null for community report)
    private BigDecimal userTotalCarbonSavedKg;
    private long userCompletedTransactions;
    private String userTier;
    private Integer userRank;
}
