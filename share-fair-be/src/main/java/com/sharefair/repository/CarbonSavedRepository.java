package com.sharefair.repository;

import com.sharefair.entity.CarbonSaved;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CarbonSavedRepository {
    CarbonSaved save(CarbonSaved carbonSaved);
    Optional<CarbonSaved> findById(String id);
    List<CarbonSaved> findByUserId(String userId);
    Optional<CarbonSaved> findByTransactionId(String transactionId);
    BigDecimal getTotalByUserId(String userId);
    List<Map<String, Object>> getLeaderboard(int limit);
}
