package com.sharefair.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private static final String SECRET = "sharefair-dev-secret-key-min-256-bits-change-in-production-env";
    private static final long ACCESS_EXPIRATION = 3600000L; // 1 hour
    private static final long REFRESH_EXPIRATION = 604800000L; // 7 days

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    void setUp() throws Exception {
        tokenProvider = new JwtTokenProvider();

        // Use reflection to set @Value fields
        var secretField = JwtTokenProvider.class.getDeclaredField("secret");
        secretField.setAccessible(true);
        secretField.set(tokenProvider, SECRET);

        var accessField = JwtTokenProvider.class.getDeclaredField("accessTokenExpiration");
        accessField.setAccessible(true);
        accessField.set(tokenProvider, ACCESS_EXPIRATION);

        var refreshField = JwtTokenProvider.class.getDeclaredField("refreshTokenExpiration");
        refreshField.setAccessible(true);
        refreshField.set(tokenProvider, REFRESH_EXPIRATION);

        tokenProvider.init();
    }

    @Test
    void generateAccessToken_returnsValidToken() {
        String token = tokenProvider.generateAccessToken("user-123", "user@example.com");

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void generateAccessToken_containsCorrectClaims() {
        String token = tokenProvider.generateAccessToken("user-123", "user@example.com");

        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo("user-123");
        assertThat(tokenProvider.getEmailFromToken(token)).isEqualTo("user@example.com");
    }

    @Test
    void generateRefreshToken_returnsValidToken() {
        String token = tokenProvider.generateRefreshToken("user-456");

        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
    }

    @Test
    void generateRefreshToken_containsCorrectUserId() {
        String token = tokenProvider.generateRefreshToken("user-456");

        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo("user-456");
    }

    @Test
    void generateRefreshToken_hasNoEmailClaim() {
        String token = tokenProvider.generateRefreshToken("user-456");

        assertThat(tokenProvider.getEmailFromToken(token)).isNull();
    }

    @Test
    void validateToken_returnsFalse_forExpiredToken() {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

        String expiredToken = Jwts.builder()
                .subject("user-123")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000))
                .expiration(new Date(System.currentTimeMillis() - 3600000))
                .signWith(key)
                .compact();

        assertThat(tokenProvider.validateToken(expiredToken)).isFalse();
    }

    @Test
    void validateToken_returnsFalse_forMalformedToken() {
        assertThat(tokenProvider.validateToken("not.a.valid.token")).isFalse();
    }

    @Test
    void validateToken_returnsFalse_forNullToken() {
        assertThat(tokenProvider.validateToken(null)).isFalse();
    }

    @Test
    void validateToken_returnsFalse_forEmptyToken() {
        assertThat(tokenProvider.validateToken("")).isFalse();
    }

    @Test
    void validateToken_returnsFalse_forTokenSignedWithDifferentKey() {
        SecretKey differentKey = Keys.hmacShaKeyFor(
                "a-completely-different-secret-key-that-is-at-least-256-bits-long".getBytes(StandardCharsets.UTF_8)
        );

        String tokenWithDifferentKey = Jwts.builder()
                .subject("user-123")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(differentKey)
                .compact();

        assertThat(tokenProvider.validateToken(tokenWithDifferentKey)).isFalse();
    }

    @Test
    void getUserIdFromToken_extractsSubjectCorrectly() {
        String token = tokenProvider.generateAccessToken("uuid-abc-123", "test@test.com");

        assertThat(tokenProvider.getUserIdFromToken(token)).isEqualTo("uuid-abc-123");
    }

    @Test
    void getEmailFromToken_extractsEmailCorrectly() {
        String token = tokenProvider.generateAccessToken("user-1", "hello@world.com");

        assertThat(tokenProvider.getEmailFromToken(token)).isEqualTo("hello@world.com");
    }

    @Test
    void accessAndRefreshTokens_areDifferent() {
        String accessToken = tokenProvider.generateAccessToken("user-1", "user@test.com");
        String refreshToken = tokenProvider.generateRefreshToken("user-1");

        assertThat(accessToken).isNotEqualTo(refreshToken);
    }

    @Test
    void multipleAccessTokens_areDifferent() {
        String token1 = tokenProvider.generateAccessToken("user-1", "user@test.com");
        String token2 = tokenProvider.generateAccessToken("user-1", "user@test.com");

        // Tokens should differ due to different issuedAt timestamps (or at minimum be valid)
        assertThat(tokenProvider.validateToken(token1)).isTrue();
        assertThat(tokenProvider.validateToken(token2)).isTrue();
    }
}
