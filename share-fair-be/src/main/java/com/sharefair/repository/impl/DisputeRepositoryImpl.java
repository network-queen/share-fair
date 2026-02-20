package com.sharefair.repository.impl;

import com.sharefair.entity.Dispute;
import com.sharefair.repository.DisputeRepository;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class DisputeRepositoryImpl implements DisputeRepository {

    private final DSLContext dsl;
    private static final String TABLE = "disputes";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("transaction_id"),
            DSL.field("reporter_id"),
            DSL.field("reason"),
            DSL.field("details"),
            DSL.field("status"),
            DSL.field("resolution"),
            DSL.field("resolved_by_id"),
            DSL.field("created_at"),
            DSL.field("resolved_at")
    };

    public DisputeRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Dispute save(Dispute d) {
        if (d.getId() == null) d.setId(UUID.randomUUID().toString());
        if (d.getCreatedAt() == null) d.setCreatedAt(LocalDateTime.now());
        if (d.getStatus() == null) d.setStatus("OPEN");

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(d.getId()),
                        UUID.fromString(d.getTransactionId()),
                        UUID.fromString(d.getReporterId()),
                        d.getReason(),
                        d.getDetails(),
                        d.getStatus(),
                        d.getResolution(),
                        d.getResolvedById() != null ? UUID.fromString(d.getResolvedById()) : null,
                        d.getCreatedAt(),
                        d.getResolvedAt()
                )
                .execute();
        return d;
    }

    @Override
    public Optional<Dispute> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::map);
    }

    @Override
    public Optional<Dispute> findByTransactionId(String transactionId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("transaction_id").eq(UUID.fromString(transactionId)))
                .orderBy(DSL.field("created_at").desc())
                .limit(1)
                .fetchOptional()
                .map(this::map);
    }

    @Override
    public List<Dispute> findByReporterId(String reporterId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("reporter_id").eq(UUID.fromString(reporterId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::map);
    }

    @Override
    public List<Dispute> findAll() {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::map);
    }

    @Override
    public Dispute update(Dispute d) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("status"), d.getStatus())
                .set(DSL.field("resolution"), d.getResolution())
                .set(DSL.field("resolved_by_id"), d.getResolvedById() != null ? UUID.fromString(d.getResolvedById()) : null)
                .set(DSL.field("resolved_at"), d.getResolvedAt())
                .where(DSL.field("id").eq(UUID.fromString(d.getId())))
                .execute();
        return d;
    }

    private Dispute map(Record r) {
        return Dispute.builder()
                .id(r.get(DSL.field("id"), String.class))
                .transactionId(r.get(DSL.field("transaction_id"), String.class))
                .reporterId(r.get(DSL.field("reporter_id"), String.class))
                .reason(r.get(DSL.field("reason"), String.class))
                .details(r.get(DSL.field("details"), String.class))
                .status(r.get(DSL.field("status"), String.class))
                .resolution(r.get(DSL.field("resolution"), String.class))
                .resolvedById(r.get(DSL.field("resolved_by_id"), String.class))
                .createdAt(JooqUtils.toLocalDateTime(r.get(DSL.field("created_at"))))
                .resolvedAt(JooqUtils.toLocalDateTime(r.get(DSL.field("resolved_at"))))
                .build();
    }
}
