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
public class Review {
    private String id;
    private String transactionId;
    private String reviewerId;
    private String revieweeId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
