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
public class RefreshToken {
    private String id;
    private String userId;
    /** SHA-256 hex digest of the raw JWT refresh token string */
    private String tokenHash;
    private LocalDateTime expiresAt;
    private Boolean revoked;
    private LocalDateTime createdAt;
}
