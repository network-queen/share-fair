package com.sharefair.service;

import com.sharefair.dto.CreateTransactionRequest;
import com.sharefair.dto.TransactionDto;
import com.sharefair.entity.Listing;
import com.sharefair.entity.Transaction;
import com.sharefair.entity.User;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.ListingRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.UserRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final DSLContext dsl;
    private final CarbonService carbonService;
    private final TrustScoreService trustScoreService;

    public TransactionService(TransactionRepository transactionRepository,
                              ListingRepository listingRepository,
                              UserRepository userRepository,
                              DSLContext dsl,
                              CarbonService carbonService,
                              TrustScoreService trustScoreService) {
        this.transactionRepository = transactionRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.dsl = dsl;
        this.carbonService = carbonService;
        this.trustScoreService = trustScoreService;
    }

    public TransactionDto createTransaction(CreateTransactionRequest request, String borrowerId) {
        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (!Boolean.TRUE.equals(listing.getAvailable())) {
            throw new IllegalArgumentException("Listing is not available");
        }

        if (listing.getOwnerId().equals(borrowerId)) {
            throw new IllegalArgumentException("You cannot rent your own listing");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        if (days < 1) days = 1;

        BigDecimal pricePerDay = listing.getPricePerDay() != null ? listing.getPricePerDay() : listing.getPrice();
        BigDecimal totalAmount = pricePerDay.multiply(BigDecimal.valueOf(days));

        BigDecimal feePercentage = getActiveServiceFeePercentage();
        BigDecimal serviceFee = totalAmount.multiply(feePercentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        Transaction transaction = Transaction.builder()
                .listingId(listing.getId())
                .borrowerId(borrowerId)
                .ownerId(listing.getOwnerId())
                .status("PENDING")
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalAmount(totalAmount)
                .serviceFee(serviceFee)
                .paymentStatus("PENDING")
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return enrichDto(saved);
    }

    public TransactionDto getTransaction(String id, String principalId) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!tx.getBorrowerId().equals(principalId) && !tx.getOwnerId().equals(principalId)) {
            throw new AccessDeniedException("You do not have access to this transaction");
        }

        return enrichDto(tx);
    }

    public List<TransactionDto> getUserTransactions(String userId) {
        List<Transaction> asBorrower = transactionRepository.findByBorrowerId(userId);
        List<Transaction> asOwner = transactionRepository.findByOwnerId(userId);

        Set<String> seen = asBorrower.stream().map(Transaction::getId).collect(Collectors.toSet());
        List<Transaction> all = new ArrayList<>(asBorrower);
        for (Transaction tx : asOwner) {
            if (!seen.contains(tx.getId())) {
                all.add(tx);
            }
        }

        all.sort(Comparator.comparing(Transaction::getCreatedAt).reversed());

        return all.stream().map(this::enrichDto).collect(Collectors.toList());
    }

    public TransactionDto updateStatus(String id, String newStatus, String principalId) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!tx.getBorrowerId().equals(principalId) && !tx.getOwnerId().equals(principalId)) {
            throw new AccessDeniedException("You do not have access to this transaction");
        }

        validateStatusTransition(tx, newStatus, principalId);

        transactionRepository.updateStatus(id, newStatus);
        tx.setStatus(newStatus);

        if ("COMPLETED".equals(newStatus)) {
            tx.setCompletedAt(LocalDateTime.now());
            carbonService.createCarbonRecord(id);
            trustScoreService.recalculateTrustScore(tx.getBorrowerId());
            trustScoreService.recalculateTrustScore(tx.getOwnerId());
        }

        return enrichDto(tx);
    }

    private void validateStatusTransition(Transaction tx, String newStatus, String principalId) {
        String current = tx.getStatus();
        boolean isOwner = tx.getOwnerId().equals(principalId);

        switch (current) {
            case "PENDING" -> {
                if ("ACTIVE".equals(newStatus) && !isOwner) {
                    throw new IllegalArgumentException("Only the owner can accept a transaction");
                }
                if (!"ACTIVE".equals(newStatus) && !"CANCELLED".equals(newStatus)) {
                    throw new IllegalArgumentException("Pending transactions can only be accepted or cancelled");
                }
            }
            case "ACTIVE" -> {
                if (!"COMPLETED".equals(newStatus) && !"DISPUTED".equals(newStatus)) {
                    throw new IllegalArgumentException("Active transactions can only be completed or disputed");
                }
            }
            default -> throw new IllegalArgumentException("Cannot change status of a " + current + " transaction");
        }
    }

    private TransactionDto enrichDto(Transaction tx) {
        String listingTitle = listingRepository.findById(tx.getListingId())
                .map(Listing::getTitle).orElse("Unknown Listing");
        String borrowerName = userRepository.findById(tx.getBorrowerId())
                .map(User::getName).orElse("Unknown User");
        String ownerName = userRepository.findById(tx.getOwnerId())
                .map(User::getName).orElse("Unknown User");

        return TransactionDto.builder()
                .id(tx.getId())
                .listingId(tx.getListingId())
                .listingTitle(listingTitle)
                .borrowerId(tx.getBorrowerId())
                .borrowerName(borrowerName)
                .ownerId(tx.getOwnerId())
                .ownerName(ownerName)
                .status(tx.getStatus())
                .startDate(tx.getStartDate())
                .endDate(tx.getEndDate())
                .totalAmount(tx.getTotalAmount())
                .serviceFee(tx.getServiceFee())
                .paymentStatus(tx.getPaymentStatus())
                .createdAt(tx.getCreatedAt())
                .completedAt(tx.getCompletedAt())
                .build();
    }

    private BigDecimal getActiveServiceFeePercentage() {
        return dsl.select(DSL.field("percentage"))
                .from(DSL.table("service_fees"))
                .where(DSL.field("is_active").eq(true))
                .orderBy(DSL.field("created_at").desc())
                .limit(1)
                .fetchOptional()
                .map(r -> r.get(DSL.field("percentage"), BigDecimal.class))
                .orElse(BigDecimal.TEN);
    }
}
