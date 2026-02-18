package com.sharefair.service;

import com.sharefair.dto.AuthResponse;
import com.sharefair.dto.OAuthUserInfo;
import com.sharefair.dto.UserMapper;
import com.sharefair.entity.User;
import com.sharefair.exception.OAuthException;
import com.sharefair.repository.UserRepository;
import com.sharefair.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

@Service
public class OAuthService {

    private static final Logger log = LoggerFactory.getLogger(OAuthService.class);

    private final RestTemplate restTemplate;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    @Value("${oauth.google.client-id:}")
    private String googleClientId;
    @Value("${oauth.google.client-secret:}")
    private String googleClientSecret;

    @Value("${oauth.github.client-id:}")
    private String githubClientId;
    @Value("${oauth.github.client-secret:}")
    private String githubClientSecret;

    public OAuthService(RestTemplate restTemplate, UserRepository userRepository, JwtTokenProvider tokenProvider) {
        this.restTemplate = restTemplate;
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
    }

    public String getAuthorizationUrl(String provider, String redirectUri, String state) {
        return switch (provider.toLowerCase()) {
            case "google" -> buildGoogleAuthUrl(redirectUri, state);
            case "github" -> buildGitHubAuthUrl(redirectUri, state);
            default -> throw new OAuthException("Unsupported OAuth provider: " + provider);
        };
    }

    public AuthResponse handleCallback(String provider, String code, String redirectUri) {
        OAuthUserInfo userInfo = switch (provider.toLowerCase()) {
            case "google" -> handleGoogleCallback(code, redirectUri);
            case "github" -> handleGitHubCallback(code, redirectUri);
            default -> throw new OAuthException("Unsupported OAuth provider: " + provider);
        };

        User user = findOrCreateUser(provider.toLowerCase(), userInfo);

        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserMapper.toDto(user))
                .build();
    }

    // --- Google ---

    private String buildGoogleAuthUrl(String redirectUri, String state) {
        return UriComponentsBuilder.fromHttpUrl("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid email profile")
                .queryParam("state", state)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .build()
                .toUriString();
    }

    @SuppressWarnings("unchecked")
    private OAuthUserInfo handleGoogleCallback(String code, String redirectUri) {
        try {
            // Exchange code for token
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", googleClientId);
            params.add("client_secret", googleClientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                    "https://oauth2.googleapis.com/token",
                    HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    Map.class
            );

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // Fetch user info
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);

            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    HttpMethod.GET,
                    new HttpEntity<>(userHeaders),
                    Map.class
            );

            Map<String, Object> userData = userResponse.getBody();

            return OAuthUserInfo.builder()
                    .oauthId(String.valueOf(userData.get("id")))
                    .email((String) userData.get("email"))
                    .name((String) userData.get("name"))
                    .avatar((String) userData.get("picture"))
                    .build();
        } catch (Exception e) {
            log.error("Google OAuth callback failed", e);
            throw new OAuthException("Failed to authenticate with Google: " + e.getMessage(), e);
        }
    }

    // --- GitHub ---

    private String buildGitHubAuthUrl(String redirectUri, String state) {
        return UriComponentsBuilder.fromHttpUrl("https://github.com/login/oauth/authorize")
                .queryParam("client_id", githubClientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", "user:email")
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    @SuppressWarnings("unchecked")
    private OAuthUserInfo handleGitHubCallback(String code, String redirectUri) {
        try {
            // Exchange code for token
            Map<String, String> params = Map.of(
                    "client_id", githubClientId,
                    "client_secret", githubClientSecret,
                    "code", code,
                    "redirect_uri", redirectUri
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                    "https://github.com/login/oauth/access_token",
                    HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    Map.class
            );

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            if (accessToken == null) {
                throw new OAuthException("GitHub did not return an access token");
            }

            // Fetch user info
            HttpHeaders userHeaders = new HttpHeaders();
            userHeaders.setBearerAuth(accessToken);

            ResponseEntity<Map> userResponse = restTemplate.exchange(
                    "https://api.github.com/user",
                    HttpMethod.GET,
                    new HttpEntity<>(userHeaders),
                    Map.class
            );

            Map<String, Object> userData = userResponse.getBody();
            String email = (String) userData.get("email");

            // GitHub may not return email in user profile — fetch from emails endpoint
            if (email == null) {
                ResponseEntity<List> emailResponse = restTemplate.exchange(
                        "https://api.github.com/user/emails",
                        HttpMethod.GET,
                        new HttpEntity<>(userHeaders),
                        List.class
                );

                for (Object item : emailResponse.getBody()) {
                    Map<String, Object> emailEntry = (Map<String, Object>) item;
                    if (Boolean.TRUE.equals(emailEntry.get("primary")) && Boolean.TRUE.equals(emailEntry.get("verified"))) {
                        email = (String) emailEntry.get("email");
                        break;
                    }
                }
            }

            String name = (String) userData.get("name");
            if (name == null) {
                name = (String) userData.get("login");
            }

            return OAuthUserInfo.builder()
                    .oauthId(String.valueOf(userData.get("id")))
                    .email(email)
                    .name(name)
                    .avatar((String) userData.get("avatar_url"))
                    .build();
        } catch (OAuthException e) {
            throw e;
        } catch (Exception e) {
            log.error("GitHub OAuth callback failed", e);
            throw new OAuthException("Failed to authenticate with GitHub: " + e.getMessage(), e);
        }
    }

    // --- User management ---

    private User findOrCreateUser(String provider, OAuthUserInfo userInfo) {
        if (userInfo.getEmail() == null) {
            throw new OAuthException("Email not provided by OAuth provider. Please ensure your " + provider + " account has a verified email.");
        }

        // First try by OAuth provider + ID
        return userRepository.findByOauthProviderAndOauthId(provider, userInfo.getOauthId())
                .or(() -> userRepository.findByEmail(userInfo.getEmail()))
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(userInfo.getEmail())
                            .name(userInfo.getName())
                            .avatar(userInfo.getAvatar())
                            .neighborhood("Unknown")
                            .trustScore(0)
                            .carbonSaved(0)
                            .verificationStatus("EMAIL_VERIFIED")
                            .oauthProvider(provider)
                            .oauthId(userInfo.getOauthId())
                            .build();
                    return userRepository.save(newUser);
                });
    }
}
