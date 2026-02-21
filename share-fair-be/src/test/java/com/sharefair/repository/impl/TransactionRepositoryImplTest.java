package com.sharefair.repository.impl;

import com.sharefair.BaseIntegrationTest;
import com.sharefair.entity.Transaction;
import com.sharefair.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class TransactionRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private TransactionRepository transactionRepository;

    // Seed data IDs from V2 migration
    private static final String ALICE_ID   = "550e8400-e29b-41d4-a716-446655440001";
    private static final String BOB_ID     = "550e8400-e29b-41d4-a716-446655440002";
    private static final String MOUNTAIN_BIKE_ID = "660e8400-e29b-41d4-a716-446655440001";
    private static final String TX1_ID     = "880e8400-e29b-41d4-a716-446655440001"; // Bob → Alice (bike)
    private static final String TX2_ID     = "880e8400-e29b-41d4-a716-446655440002"; // Alice → Bob (tent)

    // ── findById ─────────────────────────────────────────────────────────────

    @Test
    void findById_returnsTransactionWhenExists() {
        Optional<Transaction> result = transactionRepository.findById(TX1_ID);

        assertThat(result).isPresent();
        Transaction tx = result.get();
        assertThat(tx.getId()).isEqualTo(TX1_ID);
        assertThat(tx.getListingId()).isEqualTo(MOUNTAIN_BIKE_ID);
        assertThat(tx.getBorrowerId()).isEqualTo(BOB_ID);
        assertThat(tx.getOwnerId()).isEqualTo(ALICE_ID);
        assertThat(tx.getStatus()).isEqualTo("COMPLETED");
        assertThat(tx.getTotalAmount()).isEqualByComparingTo(new BigDecimal("105.00"));
    }

    @Test
    void findById_returnsEmptyForNonExistentId() {
        assertThat(transactionRepository.findById("00000000-0000-0000-0000-000000000000"))
                .isEmpty();
    }

    // ── save ─────────────────────────────────────────────────────────────────

    @Test
    void save_persistsNewTransaction() {
        Transaction tx = Transaction.builder()
                .listingId(MOUNTAIN_BIKE_ID)
                .borrowerId(BOB_ID)
                .ownerId(ALICE_ID)
                .status("PENDING")
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .totalAmount(new BigDecimal("60.00"))
                .serviceFee(new BigDecimal("6.00"))
                .paymentStatus("UNPAID")
                .build();

        Transaction saved = transactionRepository.save(tx);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();

        Optional<Transaction> fetched = transactionRepository.findById(saved.getId());
        assertThat(fetched).isPresent();
        assertThat(fetched.get().getStatus()).isEqualTo("PENDING");
        assertThat(fetched.get().getTotalAmount()).isEqualByComparingTo(new BigDecimal("60.00"));
    }

    // ── findByBorrowerId ──────────────────────────────────────────────────────

    @Test
    void findByBorrowerId_returnsTransactionsForBorrower() {
        List<Transaction> bobs = transactionRepository.findByBorrowerId(BOB_ID);

        assertThat(bobs).isNotEmpty();
        assertThat(bobs).allSatisfy(t -> assertThat(t.getBorrowerId()).isEqualTo(BOB_ID));
        assertThat(bobs.stream().map(Transaction::getId)).contains(TX1_ID);
    }

    @Test
    void findByBorrowerId_returnsEmptyListForUnknownUser() {
        assertThat(transactionRepository.findByBorrowerId("00000000-0000-0000-0000-000000000000"))
                .isEmpty();
    }

    @Test
    void findByBorrowerId_aliceAppearsBothAsBorrowerAndOwner() {
        // TX2: Alice is the borrower (she borrowed the tent from Bob)
        List<Transaction> aliceAsBorrower = transactionRepository.findByBorrowerId(ALICE_ID);
        assertThat(aliceAsBorrower.stream().map(Transaction::getId)).contains(TX2_ID);
    }

    // ── findByOwnerId ─────────────────────────────────────────────────────────

    @Test
    void findByOwnerId_returnsTransactionsForOwner() {
        List<Transaction> alicesTransactions = transactionRepository.findByOwnerId(ALICE_ID);

        assertThat(alicesTransactions).isNotEmpty();
        assertThat(alicesTransactions).allSatisfy(t -> assertThat(t.getOwnerId()).isEqualTo(ALICE_ID));
        assertThat(alicesTransactions.stream().map(Transaction::getId)).contains(TX1_ID);
    }

    // ── findByListingId ───────────────────────────────────────────────────────

    @Test
    void findByListingId_returnsTransactionsForListing() {
        List<Transaction> forBike = transactionRepository.findByListingId(MOUNTAIN_BIKE_ID);

        assertThat(forBike).isNotEmpty();
        assertThat(forBike).allSatisfy(t -> assertThat(t.getListingId()).isEqualTo(MOUNTAIN_BIKE_ID));
    }

    // ── updateStatus ──────────────────────────────────────────────────────────

    @Test
    void updateStatus_changesTransactionStatus() {
        // Save a fresh PENDING transaction to update
        Transaction tx = Transaction.builder()
                .listingId(MOUNTAIN_BIKE_ID)
                .borrowerId(BOB_ID)
                .ownerId(ALICE_ID)
                .status("PENDING")
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(4))
                .totalAmount(new BigDecimal("30.00"))
                .serviceFee(new BigDecimal("3.00"))
                .paymentStatus("UNPAID")
                .build();
        Transaction saved = transactionRepository.save(tx);

        transactionRepository.updateStatus(saved.getId(), "ACTIVE");

        Optional<Transaction> updated = transactionRepository.findById(saved.getId());
        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo("ACTIVE");
    }

    // ── updatePaymentStatus ───────────────────────────────────────────────────

    @Test
    void updatePaymentStatus_recordsPaymentId() {
        Transaction tx = Transaction.builder()
                .listingId(MOUNTAIN_BIKE_ID)
                .borrowerId(BOB_ID)
                .ownerId(ALICE_ID)
                .status("PENDING")
                .startDate(LocalDate.now().plusDays(3))
                .endDate(LocalDate.now().plusDays(6))
                .totalAmount(new BigDecimal("45.00"))
                .serviceFee(new BigDecimal("4.50"))
                .paymentStatus("UNPAID")
                .build();
        Transaction saved = transactionRepository.save(tx);

        transactionRepository.updatePaymentStatus(saved.getId(), "PAID", "pi_test_999");

        Optional<Transaction> updated = transactionRepository.findById(saved.getId());
        assertThat(updated).isPresent();
        assertThat(updated.get().getPaymentStatus()).isEqualTo("PAID");
        assertThat(updated.get().getStripePaymentId()).isEqualTo("pi_test_999");
    }

    // ── countBy ───────────────────────────────────────────────────────────────

    @Test
    void countByBorrowerIdAndStatus_returnsCorrectCount() {
        int completed = transactionRepository.countByBorrowerIdAndStatus(BOB_ID, "COMPLETED");
        assertThat(completed).isGreaterThanOrEqualTo(1); // TX1 is COMPLETED
    }

    @Test
    void countByOwnerIdAndStatus_returnsCorrectCount() {
        int completed = transactionRepository.countByOwnerIdAndStatus(ALICE_ID, "COMPLETED");
        assertThat(completed).isGreaterThanOrEqualTo(1); // TX1 is COMPLETED, Alice is owner
    }
}
