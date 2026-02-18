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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private UserRepository userRepository;
    @Mock private TrustScoreService trustScoreService;
    @Mock private NotificationService notificationService;

    private ReviewService reviewService;

    private static final String TX_ID = "tx-1";
    private static final String REVIEWER_ID = "borrower-1";
    private static final String REVIEWEE_ID = "owner-1";

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, transactionRepository,
                userRepository, trustScoreService, notificationService);
    }

    private Transaction completedTransaction() {
        return Transaction.builder()
                .id(TX_ID).borrowerId(REVIEWER_ID).ownerId(REVIEWEE_ID).status("COMPLETED").build();
    }

    private CreateReviewRequest validRequest() {
        CreateReviewRequest req = new CreateReviewRequest();
        req.setTransactionId(TX_ID);
        req.setRevieweeId(REVIEWEE_ID);
        req.setRating(4);
        req.setComment("Great experience");
        return req;
    }

    @Test
    void createReview_happyPath_savesAndTriggersNotification() {
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(completedTransaction()));
        when(reviewRepository.existsByTransactionIdAndReviewerId(TX_ID, REVIEWER_ID)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId("review-1");
            return r;
        });
        when(userRepository.findById(REVIEWER_ID)).thenReturn(Optional.of(
                User.builder().id(REVIEWER_ID).name("Alice").build()));
        when(userRepository.findById(REVIEWEE_ID)).thenReturn(Optional.of(
                User.builder().id(REVIEWEE_ID).name("Bob").build()));

        ReviewDto result = reviewService.createReview(validRequest(), REVIEWER_ID);

        assertThat(result.getRating()).isEqualTo(4);
        assertThat(result.getComment()).isEqualTo("Great experience");
        assertThat(result.getReviewerName()).isEqualTo("Alice");
        assertThat(result.getRevieweeName()).isEqualTo("Bob");

        verify(trustScoreService).recalculateTrustScore(REVIEWEE_ID);
        verify(notificationService).notifyNewReview(eq(REVIEWEE_ID), eq("Alice"), eq(4), eq(TX_ID));
    }

    @Test
    void createReview_transactionNotFound_throws() {
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reviewService.createReview(validRequest(), REVIEWER_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void createReview_transactionNotCompleted_throws() {
        Transaction tx = completedTransaction();
        tx.setStatus("ACTIVE");
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(tx));

        assertThatThrownBy(() -> reviewService.createReview(validRequest(), REVIEWER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("completed transactions");
    }

    @Test
    void createReview_reviewerNotPartOfTransaction_throws() {
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(completedTransaction()));

        assertThatThrownBy(() -> reviewService.createReview(validRequest(), "stranger-id"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not part of this transaction");
    }

    @Test
    void createReview_selfReview_throws() {
        CreateReviewRequest req = validRequest();
        req.setRevieweeId(REVIEWER_ID); // reviewing yourself
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(completedTransaction()));

        assertThatThrownBy(() -> reviewService.createReview(req, REVIEWER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot review yourself");
    }

    @Test
    void createReview_revieweeNotPartOfTransaction_throws() {
        CreateReviewRequest req = validRequest();
        req.setRevieweeId("stranger-id");
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(completedTransaction()));

        assertThatThrownBy(() -> reviewService.createReview(req, REVIEWER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Reviewee is not part");
    }

    @Test
    void createReview_alreadyReviewed_throws() {
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(completedTransaction()));
        when(reviewRepository.existsByTransactionIdAndReviewerId(TX_ID, REVIEWER_ID)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview(validRequest(), REVIEWER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already reviewed");
    }

    @Test
    void createReview_invalidRating_throws() {
        CreateReviewRequest req = validRequest();
        req.setRating(6);
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(completedTransaction()));
        when(reviewRepository.existsByTransactionIdAndReviewerId(TX_ID, REVIEWER_ID)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.createReview(req, REVIEWER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Rating must be between 1 and 5");
    }

    @Test
    void createReview_nullRating_throws() {
        CreateReviewRequest req = validRequest();
        req.setRating(null);
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(completedTransaction()));
        when(reviewRepository.existsByTransactionIdAndReviewerId(TX_ID, REVIEWER_ID)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.createReview(req, REVIEWER_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Rating must be between 1 and 5");
    }

    @Test
    void getReviewsForUser_returnsMappedDtos() {
        Review review = Review.builder()
                .id("r-1").transactionId(TX_ID).reviewerId(REVIEWER_ID).revieweeId(REVIEWEE_ID)
                .rating(5).comment("Excellent").build();
        when(reviewRepository.findByRevieweeId(REVIEWEE_ID)).thenReturn(List.of(review));
        when(userRepository.findById(REVIEWER_ID)).thenReturn(Optional.of(
                User.builder().id(REVIEWER_ID).name("Alice").avatar("alice.png").build()));
        when(userRepository.findById(REVIEWEE_ID)).thenReturn(Optional.of(
                User.builder().id(REVIEWEE_ID).name("Bob").build()));

        List<ReviewDto> result = reviewService.getReviewsForUser(REVIEWEE_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReviewerName()).isEqualTo("Alice");
        assertThat(result.get(0).getReviewerAvatar()).isEqualTo("alice.png");
        assertThat(result.get(0).getRevieweeName()).isEqualTo("Bob");
    }

    @Test
    void getReviewForTransaction_findsMatchingReview() {
        Review review = Review.builder()
                .id("r-1").transactionId(TX_ID).reviewerId(REVIEWER_ID).revieweeId(REVIEWEE_ID)
                .rating(4).build();
        when(reviewRepository.findByTransactionId(TX_ID)).thenReturn(List.of(review));
        when(userRepository.findById(REVIEWER_ID)).thenReturn(Optional.empty());
        when(userRepository.findById(REVIEWEE_ID)).thenReturn(Optional.empty());

        Optional<ReviewDto> result = reviewService.getReviewForTransaction(TX_ID, REVIEWER_ID);

        assertThat(result).isPresent();
        assertThat(result.get().getRating()).isEqualTo(4);
        assertThat(result.get().getReviewerName()).isEqualTo("Unknown");
    }

    @Test
    void getReviewForTransaction_noMatch_returnsEmpty() {
        when(reviewRepository.findByTransactionId(TX_ID)).thenReturn(Collections.emptyList());

        Optional<ReviewDto> result = reviewService.getReviewForTransaction(TX_ID, REVIEWER_ID);

        assertThat(result).isEmpty();
    }
}
