package com.sharefair.repository;

import com.sharefair.entity.RefreshToken;

import java.util.Optional;

public interface RefreshTokenRepository {
    void save(RefreshToken token);
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void revoke(String tokenHash);
    void revokeAllForUser(String userId);
    void deleteExpired();
}
