package com.sharefair.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sharefair.dto.AuthResponse;
import com.sharefair.dto.OAuthCallbackRequest;
import com.sharefair.dto.TokenRefreshRequest;
import com.sharefair.dto.UserDto;
import com.sharefair.entity.User;
import com.sharefair.exception.GlobalExceptionHandler;
import com.sharefair.exception.OAuthException;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
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
    void initiateOAuth_redirectsToProviderAuthUrl() throws Exception {
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
    void handleCallback_success_returnsAuthResponse() throws Exception {
        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("access-token-123")
                .refreshToken("refresh-token-456")
                .user(testUserDto)
                .build();

        when(oAuthService.handleCallback(eq("google"), eq("auth-code"), any()))
                .thenReturn(authResponse);

        OAuthCallbackRequest request = new OAuthCallbackRequest("auth-code", "google");

        mockMvc.perform(post("/api/v1/auth/oauth/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", is("access-token-123")))
                .andExpect(jsonPath("$.data.refreshToken", is("refresh-token-456")))
                .andExpect(jsonPath("$.data.user.email", is("test@example.com")));
    }

    @Test
    void handleCallback_oauthFailure_returns400() throws Exception {
        when(oAuthService.handleCallback(any(), any(), any()))
                .thenThrow(new OAuthException("Failed to authenticate with Google"));

        OAuthCallbackRequest request = new OAuthCallbackRequest("bad-code", "google");

        mockMvc.perform(post("/api/v1/auth/oauth/callback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error", is("OAUTH_ERROR")));
    }

    // --- Token Refresh ---

    @Test
    void refreshToken_validToken_returnsNewAccessToken() throws Exception {
        when(tokenProvider.validateToken("valid-refresh-token")).thenReturn(true);
        when(tokenProvider.getUserIdFromToken("valid-refresh-token")).thenReturn("user-123");
        when(userRepository.findById("user-123")).thenReturn(Optional.of(testUser));
        when(tokenProvider.generateAccessToken("user-123", "test@example.com"))
                .thenReturn("new-access-token");

        TokenRefreshRequest request = new TokenRefreshRequest("valid-refresh-token");

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", is("new-access-token")))
                .andExpect(jsonPath("$.data.refreshToken", is("valid-refresh-token")))
                .andExpect(jsonPath("$.data.user.id", is("user-123")));
    }

    @Test
    void refreshToken_invalidToken_returns401() throws Exception {
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
    void refreshToken_userNotFound_returns401() throws Exception {
        when(tokenProvider.validateToken("valid-refresh-token")).thenReturn(true);
        when(tokenProvider.getUserIdFromToken("valid-refresh-token")).thenReturn("deleted-user");
        when(userRepository.findById("deleted-user")).thenReturn(Optional.empty());

        TokenRefreshRequest request = new TokenRefreshRequest("valid-refresh-token");

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
    void logout_returnsSuccess() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
