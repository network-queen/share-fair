package com.sharefair.dto;

import com.sharefair.entity.User;

public final class UserMapper {

    private UserMapper() {}

    public static UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatar(user.getAvatar())
                .neighborhood(user.getNeighborhood())
                .trustScore(user.getTrustScore())
                .carbonSaved(user.getCarbonSaved())
                .verificationStatus(user.getVerificationStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
