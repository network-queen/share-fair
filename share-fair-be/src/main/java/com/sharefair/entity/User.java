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
public class User {
    private String id;
    private String email;
    private String name;
    private String avatar;
    private String neighborhood;
    private Integer trustScore;
    private Integer carbonSaved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String verificationStatus;
    private String oauthProvider;
    private String oauthId;
}
