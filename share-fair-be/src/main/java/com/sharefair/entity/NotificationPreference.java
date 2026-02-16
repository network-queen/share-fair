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
public class NotificationPreference {
    private String userId;
    @Builder.Default
    private Boolean emailTransactions = true;
    @Builder.Default
    private Boolean emailReviews = true;
    @Builder.Default
    private Boolean emailMarketing = false;
    @Builder.Default
    private Boolean inAppTransactions = true;
    @Builder.Default
    private Boolean inAppReviews = true;
    private LocalDateTime updatedAt;
}
