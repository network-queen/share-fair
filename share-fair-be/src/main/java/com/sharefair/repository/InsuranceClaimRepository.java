package com.sharefair.repository;

import com.sharefair.entity.InsuranceClaim;

import java.util.List;
import java.util.Optional;

public interface InsuranceClaimRepository {
    InsuranceClaim save(InsuranceClaim claim);
    Optional<InsuranceClaim> findById(String id);
    List<InsuranceClaim> findByPolicyId(String policyId);
    InsuranceClaim update(InsuranceClaim claim);
}
