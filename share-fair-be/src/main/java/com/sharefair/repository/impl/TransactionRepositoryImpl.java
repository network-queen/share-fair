package com.sharefair.repository.impl;

import com.sharefair.entity.Transaction;
import com.sharefair.repository.TransactionRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class TransactionRepositoryImpl implements TransactionRepository {

    private final DSLContext dsl;
    private static final String TABLE = "transactions";

    private static final org.jooq.Field<?>[] FIELDS = {
            DSL.field("id"),
            DSL.field("listing_id"),
            DSL.field("borrower_id"),
            DSL.field("owner_id"),
            DSL.field("status"),
            DSL.field("start_date"),
            DSL.field("end_date"),
            DSL.field("total_amount"),
            DSL.field("service_fee"),
            DSL.field("payment_status"),
            DSL.field("stripe_payment_id"),
            DSL.field("created_at"),
            DSL.field("completed_at")
    };

    public TransactionRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Transaction save(Transaction tx) {
        if (tx.getId() == null) {
            tx.setId(UUID.randomUUID().toString());
        }
        if (tx.getCreatedAt() == null) {
            tx.setCreatedAt(LocalDateTime.now());
        }

        dsl.insertInto(DSL.table(TABLE))
                .columns(FIELDS)
                .values(
                        UUID.fromString(tx.getId()),
                        UUID.fromString(tx.getListingId()),
                        UUID.fromString(tx.getBorrowerId()),
                        UUID.fromString(tx.getOwnerId()),
                        tx.getStatus(),
                        tx.getStartDate(),
                        tx.getEndDate(),
                        tx.getTotalAmount(),
                        tx.getServiceFee(),
                        tx.getPaymentStatus(),
                        tx.getStripePaymentId(),
                        tx.getCreatedAt(),
                        tx.getCompletedAt()
                )
                .execute();

        return tx;
    }

    @Override
    public Optional<Transaction> findById(String id) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::mapToTransaction);
    }

    @Override
    public List<Transaction> findByBorrowerId(String borrowerId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("borrower_id").eq(UUID.fromString(borrowerId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::mapToTransaction);
    }

    @Override
    public List<Transaction> findByOwnerId(String ownerId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("owner_id").eq(UUID.fromString(ownerId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::mapToTransaction);
    }

    @Override
    public List<Transaction> findByListingId(String listingId) {
        return dsl.select(FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("listing_id").eq(UUID.fromString(listingId)))
                .orderBy(DSL.field("created_at").desc())
                .fetch()
                .map(this::mapToTransaction);
    }

    @Override
    public void updateStatus(String id, String status) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("status"), status)
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .execute();
    }

    @Override
    public void updatePaymentStatus(String id, String paymentStatus, String stripePaymentId) {
        dsl.update(DSL.table(TABLE))
                .set(DSL.field("payment_status"), paymentStatus)
                .set(DSL.field("stripe_payment_id"), stripePaymentId)
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .execute();
    }

    @Override
    public int countByBorrowerIdAndStatus(String borrowerId, String status) {
        return dsl.fetchCount(
                DSL.selectFrom(DSL.table(TABLE))
                        .where(DSL.field("borrower_id").eq(UUID.fromString(borrowerId)))
                        .and(DSL.field("status").eq(status))
        );
    }

    @Override
    public int countByOwnerIdAndStatus(String ownerId, String status) {
        return dsl.fetchCount(
                DSL.selectFrom(DSL.table(TABLE))
                        .where(DSL.field("owner_id").eq(UUID.fromString(ownerId)))
                        .and(DSL.field("status").eq(status))
        );
    }

    private Transaction mapToTransaction(org.jooq.Record record) {
        return Transaction.builder()
                .id(record.get(DSL.field("id"), String.class))
                .listingId(record.get(DSL.field("listing_id"), String.class))
                .borrowerId(record.get(DSL.field("borrower_id"), String.class))
                .ownerId(record.get(DSL.field("owner_id"), String.class))
                .status(record.get(DSL.field("status"), String.class))
                .startDate(JooqUtils.toLocalDate(record.get(DSL.field("start_date"))))
                .endDate(JooqUtils.toLocalDate(record.get(DSL.field("end_date"))))
                .totalAmount(record.get(DSL.field("total_amount"), BigDecimal.class))
                .serviceFee(record.get(DSL.field("service_fee"), BigDecimal.class))
                .paymentStatus(record.get(DSL.field("payment_status"), String.class))
                .stripePaymentId(record.get(DSL.field("stripe_payment_id"), String.class))
                .createdAt(JooqUtils.toLocalDateTime(record.get(DSL.field("created_at"))))
                .completedAt(JooqUtils.toLocalDateTime(record.get(DSL.field("completed_at"))))
                .build();
    }
}
