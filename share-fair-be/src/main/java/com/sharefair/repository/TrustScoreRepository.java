package com.sharefair.repository;

import com.sharefair.entity.TrustScore;

import java.util.Optional;

public interface TrustScoreRepository {
    Optional<TrustScore> findByUserId(String userId);
    void upsert(TrustScore trustScore);
}
