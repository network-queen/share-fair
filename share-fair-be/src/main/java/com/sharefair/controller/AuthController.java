package com.sharefair.controller;

import com.sharefair.dto.ApiResponse;
import com.sharefair.dto.UserDto;
import com.sharefair.entity.User;
import com.sharefair.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/oauth/callback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleOAuthCallback(
            @RequestBody Map<String, String> request) {
        // This endpoint receives the OAuth callback from the frontend
        String code = request.get("code");
        String provider = request.get("provider");
        String email = request.get("email");
        String name = request.get("name");

        // TODO: Exchange code for token with OAuth provider
        // For now, create or retrieve user from database
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .neighborhood("Unknown")
                            .trustScore(0)
                            .carbonSaved(0)
                            .verificationStatus("UNVERIFIED")
                            .build();
                    return userRepository.save(newUser);
                });

        // TODO: Generate proper JWT token
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", "jwt-token-here");
        response.put("refreshToken", "refresh-token-here");
        response.put("user", toDto(user));

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        // TODO: Retrieve current user from JWT token using authenticated user email
        if (authentication == null) {
            return ResponseEntity.status(401).body((ApiResponse<UserDto>) ApiResponse.error("Not authenticated"));
        }

        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(ApiResponse.success(toDto(user))))
                .orElseGet(() -> ResponseEntity.status(401)
                        .body((ApiResponse<UserDto>) ApiResponse.error("User not found")));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    private UserDto toDto(User user) {
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
