package com.sharefair.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sharefair.dto.AuthResponse;
import com.sharefair.dto.OAuthCallbackRequest;
import com.sharefair.dto.TokenRefreshRequest;
import com.sharefair.dto.UserDto;
import com.sharefair.entity.RefreshToken;
import com.sharefair.entity.User;
import com.sharefair.exception.GlobalExceptionHandler;
import com.sharefair.exception.OAuthException;
import com.sharefair.repository.RefreshTokenRepository;
import com.sharefair.repository.UserRepository;
import com.sharefair.security.JwtTokenProvider;
import com.sharefair.security.UserPrincipal;
import com.sharefair.service.OAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrlPattern;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private OAuthService oAuthService;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private AuthController authController;

    private User testUser;
    private UserDto testUserDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();

        testUser = User.builder()
                .id("user-123")
                .email("test@example.com")
                .name("Test User")
                .avatar("https://example.com/avatar.jpg")
                .neighborhood("Brooklyn")
                .trustScore(50)
                .carbonSaved(10)
                .verificationStatus("EMAIL_VERIFIED")
                .createdAt(LocalDateTime.of(2026, 1, 1, 0, 0))
                .build();

        testUserDto = UserDto.builder()
                .id("user-123")
                .email("test@example.com")
                .name("Test User")
                .avatar("https://example.com/avatar.jpg")
                .neighborhood("Brooklyn")
                .trustScore(50)
                .carbonSaved(10)
                .verificationStatus("EMAIL_VERIFIED")
                .createdAt(LocalDateTime.of(2026, 1, 1, 0, 0))
                .build();
    }

    // --- OAuth Initiation ---

    @Test
    void initiateOAuth_google_redirectsToGoogleAuthUrl() throws Exception {
        String expectedUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=test";
        when(oAuthService.getAuthorizationUrl(eq("google"), any(), eq("random-state")))
                .thenReturn(expectedUrl);

        mockMvc.perform(get("/api/v1/auth/oauth/google")
                        .param("redirect_uri", "http://localhost:5173/auth/callback")
                        .param("state", "random-state"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("https://accounts.google.com/**"));
    }

    @Test
    void initiateOAuth_github_redirectsToGithubAuthUrl() throws Exception {
        String expectedUrl = "https://github.com/login/oauth/authorize?client_id=gh-client&scope=user%3Aemail";
        when(oAuthService.getAuthorizationUrl(eq("github"), any(), eq("csrf-state")))
                .thenReturn(expectedUrl);

        mockMvc.perform(get("/api/v1/auth/oauth/github")
                        .param("redirect_uri", "http://localhost:5173/auth/callback")
                        .param("state", "csrf-state"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("https://github.com/**"));
    }

    @Test
    void initiateOAuth_unsupportedProvider_returns400() throws Exception {
        when(oAuthService.getAuthorizationUrl(eq("twitter"), any(), any()))
                .thenThrow(new OAuthException("Unsupported OAuth provider: twitter"));

        mockMvc.perform(get("/api/v1/auth/oauth/twitter")
                        .param("redirect_uri", "http://localhost:5173/auth/callback")
                        .param("state", "random-state"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("OAUTH_ERROR")));
    }

    // --- OAuth Callback ---

    @Test
    void handleCallback_google_success_returnsAuthResponse() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("access-token-123")
                .refreshToken("refresh-token-456")
                .user(testUserDto)
                .build();

        when(oAuthService.handleCallback(eq("google"), eq("auth-code"), any()))
                .thenReturn(authResponse);
        when(tokenProvider.hashToken("refresh-token-456")).thenReturn("hash-456");
        when(tokenProvider.getRefreshTokenExpiresAt()).thenReturn(LocalDateTime.now().plusDays(7));

        OAuthCallbackRequest request = new OAuthCallbackRequest("auth-code", "google", "https://localhost/auth/callback");

        mockMvc.perform(post("/api/v1/auth/oauth/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", is("access-token-123")))
                .andExpect(jsonPath("$.data.refreshToken", is("refresh-token-456")))
                .andExpect(jsonPath("$.data.user.email", is("test@example.com")));

        verify(refreshTokenRepository).save(any());
    }

    @Test
    void handleCallback_github_success_returnsAuthResponse() throws Exception {
        UserDto githubUserDto = UserDto.builder()
                .id("gh-user-456")
                .email("ghuser@example.com")
                .name("GitHub User")
                .avatar("https://avatars.githubusercontent.com/u/999")
                .neighborhood("Unknown")
                .trustScore(0)
                .carbonSaved(0)
                .verificationStatus("EMAIL_VERIFIED")
                .createdAt(LocalDateTime.of(2026, 1, 2, 0, 0))
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("gh-access-token-789")
                .refreshToken("gh-refresh-token-012")
                .user(githubUserDto)
                .build();

        when(oAuthService.handleCallback(eq("github"), eq("gh-auth-code"), any()))
                .thenReturn(authResponse);
        when(tokenProvider.hashToken("gh-refresh-token-012")).thenReturn("gh-hash-012");
        when(tokenProvider.getRefreshTokenExpiresAt()).thenReturn(LocalDateTime.now().plusDays(7));

        OAuthCallbackRequest request = new OAuthCallbackRequest("gh-auth-code", "github",
                "https://localhost/auth/callback");

        mockMvc.perform(post("/api/v1/auth/oauth/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", is("gh-access-token-789")))
                .andExpect(jsonPath("$.data.refreshToken", is("gh-refresh-token-012")))
                .andExpect(jsonPath("$.data.user.email", is("ghuser@example.com")))
                .andExpect(jsonPath("$.data.user.name", is("GitHub User")));
    }

    @Test
    void handleCallback_github_noEmailProvided_returns400() throws Exception {
        when(oAuthService.handleCallback(eq("github"), eq("no-email-code"), any()))
                .thenThrow(new OAuthException(
                        "Email not provided by OAuth provider. Please ensure your github account has a verified email."));

        OAuthCallbackRequest request = new OAuthCallbackRequest("no-email-code", "github",
                "https://localhost/auth/callback");

        mockMvc.perform(post("/api/v1/auth/oauth/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("OAUTH_ERROR")));
    }

    @Test
    void handleCallback_oauthFailure_returns400() throws Exception {
        when(oAuthService.handleCallback(any(), any(), any()))
                .thenThrow(new OAuthException("Failed to authenticate with Google"));

        OAuthCallbackRequest request = new OAuthCallbackRequest("bad-code", "google", "https://localhost/auth/callback");

        mockMvc.perform(post("/api/v1/auth/oauth/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("OAUTH_ERROR")));
    }

    // --- Token Refresh (with rotation) ---

    @Test
    void refreshToken_validToken_rotatesAndReturnsNewTokens() throws Exception {
        String oldRefreshToken = "old-refresh-token";
        String oldHash = "old-hash";

        RefreshToken stored = RefreshToken.builder()
                .id("rt-1")
                .userId("user-123")
                .tokenHash(oldHash)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        when(tokenProvider.validateToken(oldRefreshToken)).thenReturn(true);
        when(tokenProvider.hashToken(oldRefreshToken)).thenReturn(oldHash);
        when(refreshTokenRepository.findByTokenHash(oldHash)).thenReturn(Optional.of(stored));
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateAccessToken("user-123", "test@example.com"))
                .thenReturn("new-access-token");
        when(tokenProvider.generateRefreshToken("user-123")).thenReturn("new-refresh-token");
        when(tokenProvider.hashToken("new-refresh-token")).thenReturn("new-hash");
        when(tokenProvider.getRefreshTokenExpiresAt()).thenReturn(LocalDateTime.now().plusDays(7));

        TokenRefreshRequest request = new TokenRefreshRequest(oldRefreshToken);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", is("new-access-token")))
                .andExpect(jsonPath("$.data.refreshToken", is("new-refresh-token")))
                .andExpect(jsonPath("$.data.refreshToken", not(is(oldRefreshToken))))
                .andExpect(jsonPath("$.data.user.id", is("user-123")));

        verify(refreshTokenRepository).revoke(oldHash);
        verify(refreshTokenRepository).save(any());
    }

    @Test
    void refreshToken_revokedToken_revokeAllSessionsAndReturns401() throws Exception {
        String revokedToken = "revoked-refresh-token";
        String revokedHash = "revoked-hash";

        RefreshToken stored = RefreshToken.builder()
                .id("rt-2")
                .userId("user-123")
                .tokenHash(revokedHash)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(true)  // already revoked — token reuse
                .build();

        when(tokenProvider.validateToken(revokedToken)).thenReturn(true);
        when(tokenProvider.hashToken(revokedToken)).thenReturn(revokedHash);
        when(refreshTokenRepository.findByTokenHash(revokedHash)).thenReturn(Optional.of(stored));

        TokenRefreshRequest request = new TokenRefreshRequest(revokedToken);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("INVALID_TOKEN")));

        // All sessions for the user should be revoked on reuse detection
        verify(refreshTokenRepository).revokeAllForUser("user-123");
    }

    @Test
    void refreshToken_invalidJwt_returns401() throws Exception {
        when(tokenProvider.validateToken("expired-token")).thenReturn(false);

        TokenRefreshRequest request = new TokenRefreshRequest("expired-token");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("INVALID_TOKEN")));
    }

    @Test
    void refreshToken_unknownToken_returns401() throws Exception {
        when(tokenProvider.validateToken("unknown-token")).thenReturn(true);
        when(tokenProvider.hashToken("unknown-token")).thenReturn("unknown-hash");
        when(refreshTokenRepository.findByTokenHash("unknown-hash")).thenReturn(Optional.empty());

        TokenRefreshRequest request = new TokenRefreshRequest("unknown-token");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("INVALID_TOKEN")));
    }

    // --- Get Current User ---

    @Test
    void getCurrentUser_authenticated_returnsUserData() throws Exception {
        UserPrincipal principal = UserPrincipal.create(testUser);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/api/v1/auth/me")
                        .principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is("user-123")))
                .andExpect(jsonPath("$.data.email", is("test@example.com")))
                .andExpect(jsonPath("$.data.name", is("Test User")));
    }

    @Test
    void getCurrentUser_unauthenticated_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void getCurrentUser_userNotInDb_returns404() throws Exception {
        UserPrincipal principal = UserPrincipal.create(testUser);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        when(userRepository.findById("user-123")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/auth/me")
                        .principal(auth))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    // --- Logout ---

    @Test
    void logout_revokesAllUserSessions() throws Exception {
        UserPrincipal principal = UserPrincipal.create(testUser);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        mockMvc.perform(post("/api/v1/auth/logout").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        verify(refreshTokenRepository).revokeAllForUser("user-123");
    }

    @Test
    void logout_withoutPrincipal_returnsSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
