package com.sharefair.repository;

import com.sharefair.entity.Review;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository {
    Review save(Review review);
    Optional<Review> findById(String id);
    List<Review> findByRevieweeId(String revieweeId);
    List<Review> findByReviewerId(String reviewerId);
    List<Review> findByTransactionId(String transactionId);
    boolean existsByTransactionIdAndReviewerId(String transactionId, String reviewerId);
}
