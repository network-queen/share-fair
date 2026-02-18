package com.sharefair.service;

import com.sharefair.entity.Review;
import com.sharefair.entity.TrustScore;
import com.sharefair.entity.User;
import com.sharefair.repository.ReviewRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.TrustScoreRepository;
import com.sharefair.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrustScoreServiceTest {

    @Mock private TrustScoreRepository trustScoreRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private ReviewRepository reviewRepository;
    @Mock private UserRepository userRepository;

    private TrustScoreService trustScoreService;

    private static final String USER_ID = "user-1";

    @BeforeEach
    void setUp() {
        trustScoreService = new TrustScoreService(
                trustScoreRepository, transactionRepository, reviewRepository, userRepository);
    }

    @Test
    void recalculate_noTransactionsNoReviewsNoVerification_returnsBronzeZero() {
        when(transactionRepository.countByBorrowerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(0);
        when(transactionRepository.countByOwnerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(0);
        when(reviewRepository.findByRevieweeId(USER_ID)).thenReturn(Collections.emptyList());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(
                User.builder().id(USER_ID).verificationStatus("UNVERIFIED").build()));

        TrustScore result = trustScoreService.recalculateTrustScore(USER_ID);

        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getTier()).isEqualTo("BRONZE");
        assertThat(result.getCompletedTransactions()).isZero();
        verify(trustScoreRepository).upsert(result);
        verify(userRepository).updateTrustScore(USER_ID, 0);
    }

    @Test
    void recalculate_withTransactionsAndReviews_calculatesCorrectScore() {
        // 5 borrower + 3 owner = 8 completed → 8 * 2 = 16
        when(transactionRepository.countByBorrowerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(5);
        when(transactionRepository.countByOwnerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(3);

        // avg rating = 4.0 → 4.0 * 10 = 40
        when(reviewRepository.findByRevieweeId(USER_ID)).thenReturn(List.of(
                Review.builder().rating(3).build(),
                Review.builder().rating(5).build()));

        // EMAIL_VERIFIED → +5
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(
                User.builder().id(USER_ID).verificationStatus("EMAIL_VERIFIED").build()));

        // total = 16 + 40 + 5 = 61 → GOLD
        TrustScore result = trustScoreService.recalculateTrustScore(USER_ID);

        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.valueOf(61));
        assertThat(result.getTier()).isEqualTo("GOLD");
        assertThat(result.getCompletedTransactions()).isEqualTo(8);
        assertThat(result.getAverageRating()).isEqualByComparingTo(BigDecimal.valueOf(4.00));
    }

    @Test
    void recalculate_identityVerified_getsFifteenBonus() {
        when(transactionRepository.countByBorrowerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(0);
        when(transactionRepository.countByOwnerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(0);
        when(reviewRepository.findByRevieweeId(USER_ID)).thenReturn(Collections.emptyList());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(
                User.builder().id(USER_ID).verificationStatus("IDENTITY_VERIFIED").build()));

        TrustScore result = trustScoreService.recalculateTrustScore(USER_ID);

        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.valueOf(15));
        assertThat(result.getTier()).isEqualTo("BRONZE");
    }

    @Test
    void recalculate_scoreExceeding100_isCappedAt100() {
        // 20 + 20 = 40 completed → 40 * 2 = 80
        when(transactionRepository.countByBorrowerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(20);
        when(transactionRepository.countByOwnerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(20);

        // avg rating 5.0 → 5.0 * 10 = 50
        when(reviewRepository.findByRevieweeId(USER_ID)).thenReturn(List.of(
                Review.builder().rating(5).build()));

        // +15 → total = 80 + 50 + 15 = 145 → capped at 100
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(
                User.builder().id(USER_ID).verificationStatus("IDENTITY_VERIFIED").build()));

        TrustScore result = trustScoreService.recalculateTrustScore(USER_ID);

        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.valueOf(100));
        assertThat(result.getTier()).isEqualTo("PLATINUM");
    }

    @Test
    void recalculate_tierBoundaries() {
        // 13 completed → 13 * 2 = 26, no reviews, no verification → 26 = SILVER
        when(transactionRepository.countByBorrowerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(13);
        when(transactionRepository.countByOwnerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(0);
        when(reviewRepository.findByRevieweeId(USER_ID)).thenReturn(Collections.emptyList());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(
                User.builder().id(USER_ID).verificationStatus("UNVERIFIED").build()));

        TrustScore result = trustScoreService.recalculateTrustScore(USER_ID);

        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.valueOf(26));
        assertThat(result.getTier()).isEqualTo("SILVER");
    }

    @Test
    void recalculate_phoneVerified_getsTenBonus() {
        when(transactionRepository.countByBorrowerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(0);
        when(transactionRepository.countByOwnerIdAndStatus(USER_ID, "COMPLETED")).thenReturn(0);
        when(reviewRepository.findByRevieweeId(USER_ID)).thenReturn(Collections.emptyList());
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(
                User.builder().id(USER_ID).verificationStatus("PHONE_VERIFIED").build()));

        TrustScore result = trustScoreService.recalculateTrustScore(USER_ID);

        assertThat(result.getScore()).isEqualByComparingTo(BigDecimal.valueOf(10));
    }

    @Test
    void getTrustScore_returnsDto_whenExists() {
        TrustScore ts = TrustScore.builder()
                .userId(USER_ID).score(BigDecimal.valueOf(50)).tier("SILVER")
                .completedTransactions(10).averageRating(BigDecimal.valueOf(4.5)).build();
        when(trustScoreRepository.findByUserId(USER_ID)).thenReturn(Optional.of(ts));

        var dto = trustScoreService.getTrustScore(USER_ID);

        assertThat(dto).isPresent();
        assertThat(dto.get().getTier()).isEqualTo("SILVER");
        assertThat(dto.get().getScore()).isEqualByComparingTo(BigDecimal.valueOf(50));
    }

    @Test
    void getTrustScore_returnsEmpty_whenNotFound() {
        when(trustScoreRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        assertThat(trustScoreService.getTrustScore(USER_ID)).isEmpty();
    }
}
