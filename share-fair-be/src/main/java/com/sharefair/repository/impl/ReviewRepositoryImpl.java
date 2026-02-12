package com.sharefair.repository.impl;

import com.sharefair.entity.Review;
import com.sharefair.repository.ReviewRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ReviewRepositoryImpl implements ReviewRepository {

    private final DSLContext dsl;
    private static final String TABLE = "reviews";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("transaction_id"),
            DSL.field("reviewer_id"),
            DSL.field("reviewee_id"),
            DSL.field("rating"),
            DSL.field("comment"),
            DSL.field("created_at")
    };

    public ReviewRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Review save(Review review) {
        if (review.getId() == null) {
            review.setId(UUID.randomUUID().toString());
        }
        if (review.getCreatedAt() == null) {
            review.setCreatedAt(LocalDateTime.now());
        }

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(review.getId()),
                        UUID.fromString(review.getTransactionId()),
                        UUID.fromString(review.getReviewerId()),
                        UUID.fromString(review.getRevieweeId()),
                        review.getRating(),
                        review.getComment(),
                        review.getCreatedAt()
                )
                .execute();

        return review;
    }

    @Override
    public Optional<Review> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::mapToReview);
    }

    @Override
    public List<Review> findByRevieweeId(String revieweeId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("reviewee_id").eq(UUID.fromString(revieweeId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::mapToReview);
    }

    @Override
    public List<Review> findByReviewerId(String reviewerId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("reviewer_id").eq(UUID.fromString(reviewerId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::mapToReview);
    }

    @Override
    public List<Review> findByTransactionId(String transactionId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("transaction_id").eq(UUID.fromString(transactionId)))
                .fetch()
                .map(this::mapToReview);
    }

    @Override
    public boolean existsByTransactionIdAndReviewerId(String transactionId, String reviewerId) {
        return dsl.fetchCount(
                DSL.selectFrom(DSL.table(TABLE))
                        .where(DSL.field("transaction_id").eq(UUID.fromString(transactionId)))
                        .and(DSL.field("reviewer_id").eq(UUID.fromString(reviewerId)))
        ) > 0;
    }

    private Review mapToReview(org.jooq.Record record) {
        return Review.builder()
                .id(record.get(DSL.field("id"), String.class))
                .transactionId(record.get(DSL.field("transaction_id"), String.class))
                .reviewerId(record.get(DSL.field("reviewer_id"), String.class))
                .revieweeId(record.get(DSL.field("reviewee_id"), String.class))
                .rating(record.get(DSL.field("rating"), Integer.class))
                .comment(record.get(DSL.field("comment"), String.class))
                .createdAt(toLocalDateTime(record.get(DSL.field("created_at"))))
                .build();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime();
        return null;
    }
}
