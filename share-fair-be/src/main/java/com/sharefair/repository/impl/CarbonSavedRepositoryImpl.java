package com.sharefair.repository.impl;

import com.sharefair.entity.CarbonSaved;
import com.sharefair.repository.CarbonSavedRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public class CarbonSavedRepositoryImpl implements CarbonSavedRepository {

    private final DSLContext dsl;
    private static final String TABLE = "carbon_saved";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("transaction_id"),
            DSL.field("user_id"),
            DSL.field("carbon_saved_kg"),
            DSL.field("estimated_new_product_carbon"),
            DSL.field("created_at")
    };

    public CarbonSavedRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public CarbonSaved save(CarbonSaved cs) {
        if (cs.getId() == null) {
            cs.setId(UUID.randomUUID().toString());
        }
        if (cs.getCreatedAt() == null) {
            cs.setCreatedAt(LocalDateTime.now());
        }

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(cs.getId()),
                        UUID.fromString(cs.getTransactionId()),
                        UUID.fromString(cs.getUserId()),
                        cs.getCarbonSavedKg(),
                        cs.getEstimatedNewProductCarbon(),
                        cs.getCreatedAt()
                )
                .execute();

        return cs;
    }

    @Override
    public Optional<CarbonSaved> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::mapToCarbonSaved);
    }

    @Override
    public List<CarbonSaved> findByUserId(String userId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::mapToCarbonSaved);
    }

    @Override
    public Optional<CarbonSaved> findByTransactionId(String transactionId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("transaction_id").eq(UUID.fromString(transactionId)))
                .fetchOptional()
                .map(this::mapToCarbonSaved);
    }

    @Override
    public BigDecimal getTotalByUserId(String userId) {
        BigDecimal total = dsl.select(DSL.sum(DSL.field("carbon_saved_kg", BigDecimal.class)))
                .from(DSL.table(TABLE))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .fetchOne(0, BigDecimal.class);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Override
    public List<Map<String, Object>> getLeaderboard(int limit) {
        return dsl.select(
                        DSL.field("cs.user_id"),
                        DSL.field("u.name"),
                        DSL.sum(DSL.field("cs.carbon_saved_kg", BigDecimal.class)).as("total_carbon_saved")
                )
                .from(DSL.table(TABLE + " cs"))
                .join(DSL.table("users u")).on(DSL.field("cs.user_id").eq(DSL.field("u.id")))
                .groupBy(DSL.field("cs.user_id"), DSL.field("u.name"))
                .orderBy(DSL.field("total_carbon_saved").desc())
                .limit(limit)
                .fetch()
                .map(record -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("userId", record.get(DSL.field("cs.user_id"), String.class));
                    entry.put("name", record.get(DSL.field("u.name"), String.class));
                    entry.put("totalCarbonSaved", record.get("total_carbon_saved", BigDecimal.class));
                    return entry;
                });
    }

    private CarbonSaved mapToCarbonSaved(org.jooq.Record record) {
        return CarbonSaved.builder()
                .id(record.get(DSL.field("id"), String.class))
                .transactionId(record.get(DSL.field("transaction_id"), String.class))
                .userId(record.get(DSL.field("user_id"), String.class))
                .carbonSavedKg(record.get(DSL.field("carbon_saved_kg"), BigDecimal.class))
                .estimatedNewProductCarbon(record.get(DSL.field("estimated_new_product_carbon"), BigDecimal.class))
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
