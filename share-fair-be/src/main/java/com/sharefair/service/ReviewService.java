package com.sharefair.service;

import com.sharefair.dto.CreateReviewRequest;
import com.sharefair.dto.ReviewDto;
import com.sharefair.entity.Review;
import com.sharefair.entity.Transaction;
import com.sharefair.entity.User;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.ReviewRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TrustScoreService trustScoreService;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository,
                         TransactionRepository transactionRepository,
                         UserRepository userRepository,
                         TrustScoreService trustScoreService,
                         NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.trustScoreService = trustScoreService;
        this.notificationService = notificationService;
    }

    public ReviewDto createReview(CreateReviewRequest request, String reviewerId) {
        Transaction tx = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!"COMPLETED".equals(tx.getStatus())) {
            throw new IllegalArgumentException("Can only review completed transactions");
        }

        if (!tx.getBorrowerId().equals(reviewerId) && !tx.getOwnerId().equals(reviewerId)) {
            throw new IllegalArgumentException("You are not part of this transaction");
        }

        if (reviewerId.equals(request.getRevieweeId())) {
            throw new IllegalArgumentException("You cannot review yourself");
        }

        if (!tx.getBorrowerId().equals(request.getRevieweeId()) && !tx.getOwnerId().equals(request.getRevieweeId())) {
            throw new IllegalArgumentException("Reviewee is not part of this transaction");
        }

        if (reviewRepository.existsByTransactionIdAndReviewerId(request.getTransactionId(), reviewerId)) {
            throw new IllegalArgumentException("You have already reviewed this transaction");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Review review = Review.builder()
                .transactionId(request.getTransactionId())
                .reviewerId(reviewerId)
                .revieweeId(request.getRevieweeId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);

        trustScoreService.recalculateTrustScore(request.getRevieweeId());

        String reviewerName = userRepository.findById(reviewerId).map(User::getName).orElse("Someone");
        notificationService.notifyNewReview(request.getRevieweeId(), reviewerName, request.getRating(), request.getTransactionId());

        return enrichDto(saved);
    }

    public List<ReviewDto> getReviewsForUser(String userId) {
        return reviewRepository.findByRevieweeId(userId).stream()
                .map(this::enrichDto)
                .collect(Collectors.toList());
    }

    public List<ReviewDto> getReviewsByUser(String userId) {
        return reviewRepository.findByReviewerId(userId).stream()
                .map(this::enrichDto)
                .collect(Collectors.toList());
    }

    public Optional<ReviewDto> getReviewForTransaction(String transactionId, String reviewerId) {
        List<Review> reviews = reviewRepository.findByTransactionId(transactionId);
        return reviews.stream()
                .filter(r -> r.getReviewerId().equals(reviewerId))
                .findFirst()
                .map(this::enrichDto);
    }

    private ReviewDto enrichDto(Review review) {
        User reviewer = userRepository.findById(review.getReviewerId()).orElse(null);
        String reviewerName = reviewer != null ? reviewer.getName() : "Unknown";
        String reviewerAvatar = reviewer != null ? reviewer.getAvatar() : null;
        String revieweeName = userRepository.findById(review.getRevieweeId())
                .map(User::getName).orElse("Unknown");

        return ReviewDto.builder()
                .id(review.getId())
                .transactionId(review.getTransactionId())
                .reviewerId(review.getReviewerId())
                .reviewerName(reviewerName)
                .reviewerAvatar(reviewerAvatar)
                .revieweeId(review.getRevieweeId())
                .revieweeName(revieweeName)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
