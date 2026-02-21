package com.sharefair.repository;

import com.sharefair.entity.InsurancePolicy;

import java.util.List;
import java.util.Optional;

public interface InsurancePolicyRepository {
    InsurancePolicy save(InsurancePolicy policy);
    Optional<InsurancePolicy> findById(String id);
    Optional<InsurancePolicy> findByTransactionId(String transactionId);
    List<InsurancePolicy> findByUserId(String userId);
    void updateStatus(String id, String status);
}
