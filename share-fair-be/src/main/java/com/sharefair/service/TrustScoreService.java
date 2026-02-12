package com.sharefair.service;

import com.sharefair.dto.TrustScoreDto;
import com.sharefair.entity.Review;
import com.sharefair.entity.TrustScore;
import com.sharefair.entity.User;
import com.sharefair.repository.ReviewRepository;
import com.sharefair.repository.TrustScoreRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TrustScoreService {

    private final TrustScoreRepository trustScoreRepository;
    private final TransactionRepository transactionRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public TrustScoreService(TrustScoreRepository trustScoreRepository,
                             TransactionRepository transactionRepository,
                             ReviewRepository reviewRepository,
                             UserRepository userRepository) {
        this.trustScoreRepository = trustScoreRepository;
        this.transactionRepository = transactionRepository;
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
    }

    public TrustScore recalculateTrustScore(String userId) {
        int completedAsBorrower = (int) transactionRepository.findByBorrowerId(userId).stream()
                .filter(tx -> "COMPLETED".equals(tx.getStatus()))
                .count();
        int completedAsOwner = (int) transactionRepository.findByOwnerId(userId).stream()
                .filter(tx -> "COMPLETED".equals(tx.getStatus()))
                .count();
        int completedTransactions = completedAsBorrower + completedAsOwner;

        List<Review> reviews = reviewRepository.findByRevieweeId(userId);
        BigDecimal averageRating = BigDecimal.ZERO;
        if (!reviews.isEmpty()) {
            double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
            averageRating = BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP);
        }

        int verificationBonus = 0;
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            String status = userOpt.get().getVerificationStatus();
            if ("IDENTITY_VERIFIED".equals(status)) verificationBonus = 15;
            else if ("PHONE_VERIFIED".equals(status)) verificationBonus = 10;
            else if ("EMAIL_VERIFIED".equals(status)) verificationBonus = 5;
        }

        // Score formula: transactions * 2 + avgRating * 10 + verificationBonus, capped at 100
        BigDecimal score = BigDecimal.valueOf(completedTransactions * 2L)
                .add(averageRating.multiply(BigDecimal.TEN))
                .add(BigDecimal.valueOf(verificationBonus));
        if (score.compareTo(BigDecimal.valueOf(100)) > 0) {
            score = BigDecimal.valueOf(100);
        }

        String tier;
        int scoreInt = score.intValue();
        if (scoreInt >= 76) tier = "PLATINUM";
        else if (scoreInt >= 51) tier = "GOLD";
        else if (scoreInt >= 26) tier = "SILVER";
        else tier = "BRONZE";

        TrustScore trustScore = TrustScore.builder()
                .userId(userId)
                .score(score)
                .tier(tier)
                .completedTransactions(completedTransactions)
                .averageRating(averageRating)
                .updatedAt(LocalDateTime.now())
                .build();

        trustScoreRepository.upsert(trustScore);
        userRepository.updateTrustScore(userId, scoreInt);

        return trustScore;
    }

    public Optional<TrustScoreDto> getTrustScore(String userId) {
        return trustScoreRepository.findByUserId(userId)
                .map(ts -> TrustScoreDto.builder()
                        .userId(ts.getUserId())
                        .score(ts.getScore())
                        .tier(ts.getTier())
                        .completedTransactions(ts.getCompletedTransactions())
                        .averageRating(ts.getAverageRating())
                        .updatedAt(ts.getUpdatedAt())
                        .build());
    }
}
