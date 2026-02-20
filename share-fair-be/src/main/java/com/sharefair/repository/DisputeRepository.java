package com.sharefair.repository;

import com.sharefair.entity.Dispute;

import java.util.List;
import java.util.Optional;

public interface DisputeRepository {
    Dispute save(Dispute dispute);
    Optional<Dispute> findById(String id);
    Optional<Dispute> findByTransactionId(String transactionId);
    List<Dispute> findByReporterId(String reporterId);
    List<Dispute> findAll();
    Dispute update(Dispute dispute);
}
