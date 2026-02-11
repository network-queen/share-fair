package com.sharefair.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private String id;
    private String listingId;
    private String listingTitle;
    private String borrowerId;
    private String borrowerName;
    private String ownerId;
    private String ownerName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private BigDecimal serviceFee;
    private String paymentStatus;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
