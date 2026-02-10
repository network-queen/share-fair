package com.sharefair.controller;

import com.sharefair.dto.*;
import com.sharefair.entity.User;
import com.sharefair.exception.InvalidTokenException;
import com.sharefair.repository.UserRepository;
import com.sharefair.security.JwtTokenProvider;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.OAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final OAuthService oAuthService;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthController(OAuthService oAuthService, JwtTokenProvider tokenProvider, UserRepository userRepository) {
        this.oAuthService = oAuthService;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @GetMapping("/oauth/{provider}")
    public void initiateOAuth(@PathVariable String provider,
                              @RequestParam("redirect_uri") String redirectUri,
                              @RequestParam String state,
                              HttpServletResponse response) throws IOException {
        log.info("Initiating OAuth flow for provider: {}", provider);
        String authUrl = oAuthService.getAuthorizationUrl(provider, redirectUri, state);
        response.sendRedirect(authUrl);
    }

    @PostMapping("/oauth/callback")
    public ResponseEntity<ApiResponse<AuthResponse>> handleCallback(@RequestBody OAuthCallbackRequest request) {
        log.info("Handling OAuth callback for provider: {}", request.getProvider());

        String redirectUri = frontendUrl + "/auth/callback";
        AuthResponse authResponse = oAuthService.handleCallback(
                request.getProvider(),
                request.getCode(),
                redirectUri
        );

        return ResponseEntity.ok(ApiResponse.success(authResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody TokenRefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new InvalidTokenException("Invalid or expired refresh token");
        }

        String userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidTokenException("User not found for refresh token"));

        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());

        AuthResponse response = AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .user(toDto(user))
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }

        var userOpt = userRepository.findById(principal.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error("User not found"));
        }

        return ResponseEntity.ok(ApiResponse.success(toDto(userOpt.get())));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .data("Logged out successfully")
                .build());
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
