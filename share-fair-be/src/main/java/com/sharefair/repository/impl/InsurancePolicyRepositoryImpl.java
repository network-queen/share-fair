package com.sharefair.repository.impl;

import com.sharefair.entity.InsurancePolicy;
import com.sharefair.repository.InsurancePolicyRepository;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class InsurancePolicyRepositoryImpl implements InsurancePolicyRepository {

    private final DSLContext dsl;
    private static final String TABLE = "insurance_policies";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("transaction_id"),
            DSL.field("user_id"),
            DSL.field("coverage_type"),
            DSL.field("premium_amount"),
            DSL.field("max_coverage"),
            DSL.field("status"),
            DSL.field("created_at"),
            DSL.field("expires_at")
    };

    public InsurancePolicyRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public InsurancePolicy save(InsurancePolicy p) {
        if (p.getId() == null) p.setId(UUID.randomUUID().toString());
        if (p.getCreatedAt() == null) p.setCreatedAt(LocalDateTime.now());
        if (p.getStatus() == null) p.setStatus("ACTIVE");

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(p.getId()),
                        UUID.fromString(p.getTransactionId()),
                        UUID.fromString(p.getUserId()),
                        p.getCoverageType(),
                        p.getPremiumAmount(),
                        p.getMaxCoverage(),
                        p.getStatus(),
                        p.getCreatedAt(),
                        p.getExpiresAt()
                )
                .execute();
        return p;
    }

    @Override
    public Optional<InsurancePolicy> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::map);
    }

    @Override
    public Optional<InsurancePolicy> findByTransactionId(String transactionId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("transaction_id").eq(UUID.fromString(transactionId)))
                .fetchOptional()
                .map(this::map);
    }

    @Override
    public List<InsurancePolicy> findByUserId(String userId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("user_id").eq(UUID.fromString(userId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::map);
    }

    @Override
    public void updateStatus(String id, String status) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("status"), status)
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .execute();
    }

    private InsurancePolicy map(Record r) {
        return InsurancePolicy.builder()
                .id(r.get(DSL.field("id"), String.class))
                .transactionId(r.get(DSL.field("transaction_id"), String.class))
                .userId(r.get(DSL.field("user_id"), String.class))
                .coverageType(r.get(DSL.field("coverage_type"), String.class))
                .premiumAmount(r.get(DSL.field("premium_amount"), BigDecimal.class))
                .maxCoverage(r.get(DSL.field("max_coverage"), BigDecimal.class))
                .status(r.get(DSL.field("status"), String.class))
                .createdAt(JooqUtils.toLocalDateTime(r.get(DSL.field("created_at"))))
                .expiresAt(JooqUtils.toLocalDateTime(r.get(DSL.field("expires_at"))))
                .build();
    }
}
