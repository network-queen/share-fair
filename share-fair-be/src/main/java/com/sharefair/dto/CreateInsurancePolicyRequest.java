package com.sharefair.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInsurancePolicyRequest {
    private String transactionId;
    private String coverageType;    // BASIC, STANDARD, PREMIUM
}
