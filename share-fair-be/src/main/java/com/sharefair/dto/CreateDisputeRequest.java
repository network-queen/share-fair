package com.sharefair.dto;

import lombok.Data;

@Data
public class CreateDisputeRequest {
    private String transactionId;
    private String reason;  // ITEM_NOT_RETURNED, ITEM_DAMAGED, NO_SHOW, PAYMENT_ISSUE, MISREPRESENTATION, OTHER
    private String details;
}
