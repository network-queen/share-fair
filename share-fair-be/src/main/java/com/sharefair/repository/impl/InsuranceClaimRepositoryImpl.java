package com.sharefair.repository.impl;

import com.sharefair.entity.InsuranceClaim;
import com.sharefair.repository.InsuranceClaimRepository;
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
public class InsuranceClaimRepositoryImpl implements InsuranceClaimRepository {

    private final DSLContext dsl;
    private static final String TABLE = "insurance_claims";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("policy_id"),
            DSL.field("claimant_id"),
            DSL.field("description"),
            DSL.field("claim_amount"),
            DSL.field("status"),
            DSL.field("resolution_notes"),
            DSL.field("created_at"),
            DSL.field("resolved_at")
    };

    public InsuranceClaimRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public InsuranceClaim save(InsuranceClaim c) {
        if (c.getId() == null) c.setId(UUID.randomUUID().toString());
        if (c.getCreatedAt() == null) c.setCreatedAt(LocalDateTime.now());
        if (c.getStatus() == null) c.setStatus("SUBMITTED");

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(c.getId()),
                        UUID.fromString(c.getPolicyId()),
                        UUID.fromString(c.getClaimantId()),
                        c.getDescription(),
                        c.getClaimAmount(),
                        c.getStatus(),
                        c.getResolutionNotes(),
                        c.getCreatedAt(),
                        c.getResolvedAt()
                )
                .execute();
        return c;
    }

    @Override
    public Optional<InsuranceClaim> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::map);
    }

    @Override
    public List<InsuranceClaim> findByPolicyId(String policyId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("policy_id").eq(UUID.fromString(policyId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::map);
    }

    @Override
    public InsuranceClaim update(InsuranceClaim c) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("status"), c.getStatus())
                .set(DSL.field("resolution_notes"), c.getResolutionNotes())
                .set(DSL.field("resolved_at"), c.getResolvedAt())
                .where(DSL.field("id").eq(UUID.fromString(c.getId())))
                .execute();
        return c;
    }

    private InsuranceClaim map(Record r) {
        return InsuranceClaim.builder()
                .id(r.get(DSL.field("id"), String.class))
                .policyId(r.get(DSL.field("policy_id"), String.class))
                .claimantId(r.get(DSL.field("claimant_id"), String.class))
                .description(r.get(DSL.field("description"), String.class))
                .claimAmount(r.get(DSL.field("claim_amount"), BigDecimal.class))
                .status(r.get(DSL.field("status"), String.class))
                .resolutionNotes(r.get(DSL.field("resolution_notes"), String.class))
                .createdAt(JooqUtils.toLocalDateTime(r.get(DSL.field("created_at"))))
                .resolvedAt(JooqUtils.toLocalDateTime(r.get(DSL.field("resolved_at"))))
                .build();
    }
}
