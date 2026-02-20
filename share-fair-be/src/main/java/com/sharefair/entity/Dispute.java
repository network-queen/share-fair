package com.sharefair.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Dispute {
    private String id;
    private String transactionId;
    private String reporterId;
    private String reason;
    private String details;
    private String status;   // OPEN, UNDER_REVIEW, RESOLVED, CLOSED
    private String resolution;
    private String resolvedById;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
