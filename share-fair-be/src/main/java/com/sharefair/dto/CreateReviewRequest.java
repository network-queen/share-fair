package com.sharefair.dto;

import lombok.Data;

@Data
public class CreateReviewRequest {
    private String transactionId;
    private String revieweeId;
    private Integer rating;
    private String comment;
}
