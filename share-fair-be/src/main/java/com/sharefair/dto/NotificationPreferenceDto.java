package com.sharefair.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceDto {
    private Boolean emailTransactions;
    private Boolean emailReviews;
    private Boolean emailMarketing;
    private Boolean inAppTransactions;
    private Boolean inAppReviews;
}
