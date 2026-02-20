package com.sharefair.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeDto {
    private String id;
    private String transactionId;
    private String reporterId;
    private String reporterName;
    private String reason;
    private String details;
    private String status;
    private String resolution;
    private String resolvedByName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
