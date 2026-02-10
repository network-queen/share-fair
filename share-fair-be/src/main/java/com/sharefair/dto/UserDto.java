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
public class UserDto {
    private String id;
    private String email;
    private String name;
    private String avatar;
    private String neighborhood;
    private Integer trustScore;
    private Integer carbonSaved;
    private LocalDateTime createdAt;
    private String verificationStatus;
}
