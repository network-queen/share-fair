package com.sharefair.repository.impl;

import com.sharefair.entity.TrustScore;
import com.sharefair.repository.TrustScoreRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public class TrustScoreRepositoryImpl implements TrustScoreRepository {

    private final DSLContext dsl;
    private static final String TABLE = "trust_scores";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("user_id"),
            DSL.field("score"),
            DSL.field("tier"),
            DSL.field("completed_transactions"),
            DSL.field("average_rating"),
            DSL.field("updated_at")
    };

    public TrustScoreRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Optional<TrustScore> findByUserId(String userId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .fetchOptional()
                .map(this::mapToTrustScore);
    }

    @Override
    public void upsert(TrustScore ts) {
        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(ts.getUserId()),
                        ts.getScore(),
                        ts.getTier(),
                        ts.getCompletedTransactions(),
                        ts.getAverageRating(),
                        ts.getUpdatedAt()
                )
                .onConflict(DSL.field("user_id"))
                .doUpdate()
                .set(DSL.field("score"), ts.getScore())
                .set(DSL.field("tier"), ts.getTier())
                .set(DSL.field("completed_transactions"), ts.getCompletedTransactions())
                .set(DSL.field("average_rating"), ts.getAverageRating())
                .set(DSL.field("updated_at"), ts.getUpdatedAt())
                .execute();
    }

    private TrustScore mapToTrustScore(org.jooq.Record record) {
        return TrustScore.builder()
                .userId(record.get(DSL.field("user_id"), String.class))
                .score(record.get(DSL.field("score"), BigDecimal.class))
                .tier(record.get(DSL.field("tier"), String.class))
                .completedTransactions(record.get(DSL.field("completed_transactions"), Integer.class))
                .averageRating(record.get(DSL.field("average_rating"), BigDecimal.class))
                .updatedAt(toLocalDateTime(record.get(DSL.field("updated_at"))))
                .build();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof Timestamp) return ((Timestamp) value).toLocalDateTime();
        return null;
    }
}
