package com.sharefair.service;

import com.sharefair.dto.CreateDisputeRequest;
import com.sharefair.dto.DisputeDto;
import com.sharefair.dto.ResolveDisputeRequest;
import com.sharefair.entity.Dispute;
import com.sharefair.entity.Transaction;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.DisputeRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DisputeService {

    private static final Set<String> VALID_REASONS = Set.of(
            "ITEM_NOT_RETURNED", "ITEM_DAMAGED", "NO_SHOW",
            "PAYMENT_ISSUE", "MISREPRESENTATION", "OTHER"
    );

    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public DisputeService(DisputeRepository disputeRepository,
                          TransactionRepository transactionRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.disputeRepository = disputeRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public DisputeDto createDispute(CreateDisputeRequest req, String reporterId) {
        if (!VALID_REASONS.contains(req.getReason())) {
            throw new IllegalArgumentException("Invalid dispute reason: " + req.getReason());
        }

        Transaction tx = transactionRepository.findById(req.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        boolean isParty = tx.getOwnerId().equals(reporterId) || tx.getBorrowerId().equals(reporterId);
        if (!isParty) {
            throw new AccessDeniedException("You are not a party to this transaction");
        }

        if (!"ACTIVE".equals(tx.getStatus()) && !"DISPUTED".equals(tx.getStatus())) {
            throw new IllegalArgumentException("Disputes can only be filed for ACTIVE transactions");
        }

        disputeRepository.findByTransactionId(req.getTransactionId())
                .filter(d -> "OPEN".equals(d.getStatus()) || "UNDER_REVIEW".equals(d.getStatus()))
                .ifPresent(d -> { throw new IllegalStateException("An open dispute already exists for this transaction"); });

        // Mark transaction as DISPUTED
        transactionRepository.updateStatus(tx.getId(), "DISPUTED");

        Dispute dispute = Dispute.builder()
                .transactionId(req.getTransactionId())
                .reporterId(reporterId)
                .reason(req.getReason())
                .details(req.getDetails())
                .status("OPEN")
                .build();

        dispute = disputeRepository.save(dispute);

        // Notify the other party
        String notifyUserId = tx.getOwnerId().equals(reporterId) ? tx.getBorrowerId() : tx.getOwnerId();
        notificationService.notifyDisputeFiled(notifyUserId, tx.getId());

        return toDto(dispute);
    }

    public DisputeDto getDispute(String id, String requesterId) {
        Dispute d = disputeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));

        Transaction tx = transactionRepository.findById(d.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        boolean isParty = tx.getOwnerId().equals(requesterId) || tx.getBorrowerId().equals(requesterId);
        if (!isParty && !d.getReporterId().equals(requesterId)) {
            throw new AccessDeniedException("Access denied");
        }

        return toDto(d);
    }

    public DisputeDto getDisputeByTransaction(String transactionId, String requesterId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        boolean isParty = tx.getOwnerId().equals(requesterId) || tx.getBorrowerId().equals(requesterId);
        if (!isParty) {
            throw new AccessDeniedException("Access denied");
        }

        Dispute d = disputeRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("No dispute found for this transaction"));

        return toDto(d);
    }

    public List<DisputeDto> getMyDisputes(String userId) {
        return disputeRepository.findByReporterId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DisputeDto resolveDispute(String id, ResolveDisputeRequest req, String resolverId) {
        Dispute d = disputeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));

        if ("RESOLVED".equals(d.getStatus()) || "CLOSED".equals(d.getStatus())) {
            throw new IllegalStateException("Dispute is already " + d.getStatus());
        }

        if (!"RESOLVED".equals(req.getStatus()) && !"CLOSED".equals(req.getStatus())) {
            throw new IllegalArgumentException("Status must be RESOLVED or CLOSED");
        }

        d.setStatus(req.getStatus());
        d.setResolution(req.getResolution());
        d.setResolvedById(resolverId);
        d.setResolvedAt(LocalDateTime.now());

        disputeRepository.update(d);

        // Notify reporter
        notificationService.notifyDisputeResolved(d.getReporterId(), req.getResolution(), d.getTransactionId());

        return toDto(d);
    }

    private DisputeDto toDto(Dispute d) {
        String reporterName = userRepository.findById(d.getReporterId())
                .map(u -> u.getName()).orElse("Unknown");
        String resolvedByName = d.getResolvedById() != null
                ? userRepository.findById(d.getResolvedById()).map(u -> u.getName()).orElse(null)
                : null;

        return DisputeDto.builder()
                .id(d.getId())
                .transactionId(d.getTransactionId())
                .reporterId(d.getReporterId())
                .reporterName(reporterName)
                .reason(d.getReason())
                .details(d.getDetails())
                .status(d.getStatus())
                .resolution(d.getResolution())
                .resolvedByName(resolvedByName)
                .createdAt(d.getCreatedAt())
                .resolvedAt(d.getResolvedAt())
                .build();
    }
}
