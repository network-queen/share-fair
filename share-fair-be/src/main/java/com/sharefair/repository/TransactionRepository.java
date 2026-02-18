package com.sharefair.repository;

import com.sharefair.entity.Transaction;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository {
    Transaction save(Transaction transaction);
    Optional<Transaction> findById(String id);
    List<Transaction> findByBorrowerId(String borrowerId);
    List<Transaction> findByOwnerId(String ownerId);
    List<Transaction> findByListingId(String listingId);
    void updateStatus(String id, String status);
    void updatePaymentStatus(String id, String paymentStatus, String stripePaymentId);
    int countByBorrowerIdAndStatus(String borrowerId, String status);
    int countByOwnerIdAndStatus(String ownerId, String status);
}
