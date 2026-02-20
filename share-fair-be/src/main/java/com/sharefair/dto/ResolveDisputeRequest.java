package com.sharefair.dto;

import lombok.Data;

@Data
public class ResolveDisputeRequest {
    private String status;      // RESOLVED or CLOSED
    private String resolution;  // Explanation of the resolution
}
