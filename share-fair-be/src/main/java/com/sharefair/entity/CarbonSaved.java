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
public class CarbonSaved {
    private String id;
    private String transactionId;
    private String userId;
    private BigDecimal carbonSavedKg;
    private BigDecimal estimatedNewProductCarbon;
    private LocalDateTime createdAt;
}
