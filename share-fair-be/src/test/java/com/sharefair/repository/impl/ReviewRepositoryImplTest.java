package com.sharefair.repository.impl;

import com.sharefair.BaseIntegrationTest;
import com.sharefair.entity.Review;
import com.sharefair.repository.ReviewRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ReviewRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ReviewRepository reviewRepository;

    // Seed data IDs from V2 migration
    private static final String ALICE_ID   = "550e8400-e29b-41d4-a716-446655440001";
    private static final String BOB_ID     = "550e8400-e29b-41d4-a716-446655440002";
    private static final String TX1_ID     = "880e8400-e29b-41d4-a716-446655440001"; // Bob borrowed bike from Alice
    private static final String TX2_ID     = "880e8400-e29b-41d4-a716-446655440002"; // Alice borrowed tent from Bob
    private static final String REVIEW1_ID = "770e8400-e29b-41d4-a716-446655440001"; // Alice reviewed Bob for TX1
    private static final String REVIEW2_ID = "770e8400-e29b-41d4-a716-446655440002"; // Bob reviewed Alice for TX2

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    void findById_returnsReviewWhenExists() {
        Optional<Review> result = reviewRepository.findById(REVIEW1_ID);

        assertThat(result).isPresent();
        Review review = result.get();
        assertThat(review.getId()).isEqualTo(REVIEW1_ID);
        assertThat(review.getTransactionId()).isEqualTo(TX1_ID);
        assertThat(review.getReviewerId()).isEqualTo(ALICE_ID);
        assertThat(review.getRevieweeId()).isEqualTo(BOB_ID);
        assertThat(review.getRating()).isEqualTo(5);
        assertThat(review.getComment()).isEqualTo("Great item and prompt delivery!");
    }

    @Test
    void findById_returnsEmptyForNonExistentId() {
        assertThat(reviewRepository.findById("00000000-0000-0000-0000-000000000000"))
                .isEmpty();
    }

    // ── save ─────────────────────────────────────────────────────────────────

    @Test
    void save_persistsNewReview() {
        // Charlie (550e8400-...0003) hasn't reviewed anyone yet — use Bob/Alice and a new TX
        // For simplicity use the existing TX2 but a new reviewer (no duplicate check violation
        // because we check a different reviewer id)
        Review review = Review.builder()
                .transactionId(TX1_ID)
                .reviewerId(BOB_ID)       // Bob reviews Alice for TX1 (different reviewer from seed)
                .revieweeId(ALICE_ID)
                .rating(4)
                .comment("Smooth transaction, would borrow again")
                .build();

        Review saved = reviewRepository.save(review);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();

        Optional<Review> fetched = reviewRepository.findById(saved.getId());
        assertThat(fetched).isPresent();
        assertThat(fetched.get().getRating()).isEqualTo(4);
        assertThat(fetched.get().getComment()).isEqualTo("Smooth transaction, would borrow again");
    }

    // ── findByRevieweeId ──────────────────────────────────────────────────────

    @Test
    void findByRevieweeId_returnsBobsReceivedReviews() {
        List<Review> bobsReviews = reviewRepository.findByRevieweeId(BOB_ID);

        assertThat(bobsReviews).isNotEmpty();
        assertThat(bobsReviews).allSatisfy(r -> assertThat(r.getRevieweeId()).isEqualTo(BOB_ID));
        assertThat(bobsReviews.stream().map(Review::getId)).contains(REVIEW1_ID);
    }

    @Test
    void findByRevieweeId_returnsEmptyForUserWithNoReviews() {
        // User 3 (Charlie) has no reviews in seed data
        String charlieId = "550e8400-e29b-41d4-a716-446655440003";
        assertThat(reviewRepository.findByRevieweeId(charlieId)).isEmpty();
    }

    // ── findByReviewerId ──────────────────────────────────────────────────────

    @Test
    void findByReviewerId_returnsReviewsWrittenByAlice() {
        List<Review> alicesWritten = reviewRepository.findByReviewerId(ALICE_ID);

        assertThat(alicesWritten).isNotEmpty();
        assertThat(alicesWritten).allSatisfy(r -> assertThat(r.getReviewerId()).isEqualTo(ALICE_ID));
        assertThat(alicesWritten.stream().map(Review::getId)).contains(REVIEW1_ID);
    }

    @Test
    void findByReviewerId_returnsReviewsWrittenByBob() {
        List<Review> bobsWritten = reviewRepository.findByReviewerId(BOB_ID);

        assertThat(bobsWritten).isNotEmpty();
        assertThat(bobsWritten.stream().map(Review::getId)).contains(REVIEW2_ID);
    }

    // ── findByTransactionId ───────────────────────────────────────────────────

    @Test
    void findByTransactionId_returnsReviewsForTransaction() {
        List<Review> forTx1 = reviewRepository.findByTransactionId(TX1_ID);

        assertThat(forTx1).isNotEmpty();
        assertThat(forTx1).allSatisfy(r -> assertThat(r.getTransactionId()).isEqualTo(TX1_ID));
    }

    @Test
    void findByTransactionId_returnsEmptyForTransactionWithNoReviews() {
        // A brand-new transaction ID that has no reviews
        assertThat(reviewRepository.findByTransactionId("00000000-0000-0000-0000-000000000000"))
                .isEmpty();
    }

    // ── existsByTransactionIdAndReviewerId ────────────────────────────────────

    @Test
    void existsByTransactionIdAndReviewerId_returnsTrueWhenReviewExists() {
        // Alice reviewed for TX1
        assertThat(reviewRepository.existsByTransactionIdAndReviewerId(TX1_ID, ALICE_ID)).isTrue();
    }

    @Test
    void existsByTransactionIdAndReviewerId_returnsFalseWhenNoReview() {
        // Bob has not reviewed for TX1 (only Alice has in the seed data)
        assertThat(reviewRepository.existsByTransactionIdAndReviewerId(TX1_ID, BOB_ID)).isFalse();
    }

    @Test
    void existsByTransactionIdAndReviewerId_returnsTrueForSecondSeedReview() {
        // Bob reviewed for TX2
        assertThat(reviewRepository.existsByTransactionIdAndReviewerId(TX2_ID, BOB_ID)).isTrue();
    }
}
