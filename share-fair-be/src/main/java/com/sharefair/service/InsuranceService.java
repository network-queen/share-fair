package com.sharefair.service;

import com.sharefair.dto.CreateInsurancePolicyRequest;
import com.sharefair.dto.FileInsuranceClaimRequest;
import com.sharefair.dto.InsuranceClaimDto;
import com.sharefair.dto.InsurancePolicyDto;
import com.sharefair.entity.InsuranceClaim;
import com.sharefair.entity.InsurancePolicy;
import com.sharefair.entity.Transaction;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.InsuranceClaimRepository;
import com.sharefair.repository.InsurancePolicyRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class InsuranceService {

    private static final Set<String> VALID_COVERAGE_TYPES = Set.of("BASIC", "STANDARD", "PREMIUM");

    // Premium rates as percentage of transaction total
    private static final BigDecimal BASIC_RATE    = new BigDecimal("0.02");
    private static final BigDecimal STANDARD_RATE = new BigDecimal("0.05");
    private static final BigDecimal PREMIUM_RATE  = new BigDecimal("0.08");

    // Coverage multipliers
    private static final BigDecimal BASIC_MULTIPLIER    = new BigDecimal("1.0");
    private static final BigDecimal STANDARD_MULTIPLIER = new BigDecimal("2.0");
    private static final BigDecimal PREMIUM_MULTIPLIER  = new BigDecimal("3.0");

    private static final BigDecimal MIN_PREMIUM = new BigDecimal("1.00");

    private final InsurancePolicyRepository policyRepository;
    private final InsuranceClaimRepository claimRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public InsuranceService(InsurancePolicyRepository policyRepository,
                            InsuranceClaimRepository claimRepository,
                            TransactionRepository transactionRepository,
                            UserRepository userRepository,
                            NotificationService notificationService) {
        this.policyRepository = policyRepository;
        this.claimRepository = claimRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public InsurancePolicyDto addInsurance(CreateInsurancePolicyRequest req, String userId) {
        if (!VALID_COVERAGE_TYPES.contains(req.getCoverageType())) {
            throw new IllegalArgumentException("Invalid coverage type: " + req.getCoverageType());
        }

        Transaction tx = transactionRepository.findById(req.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (!tx.getBorrowerId().equals(userId)) {
            throw new AccessDeniedException("Only the borrower can add insurance");
        }

        if (tx.getTotalAmount() == null || tx.getTotalAmount().compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalArgumentException("Insurance is not available for free transactions");
        }

        if (!"PENDING".equals(tx.getStatus()) && !"ACTIVE".equals(tx.getStatus())) {
            throw new IllegalArgumentException("Insurance can only be added to PENDING or ACTIVE transactions");
        }

        policyRepository.findByTransactionId(req.getTransactionId())
                .ifPresent(p -> { throw new IllegalStateException("Insurance policy already exists for this transaction"); });

        BigDecimal totalAmount = tx.getTotalAmount();
        BigDecimal premium = calculatePremium(totalAmount, req.getCoverageType());
        BigDecimal maxCoverage = calculateMaxCoverage(totalAmount, req.getCoverageType());

        InsurancePolicy policy = InsurancePolicy.builder()
                .transactionId(req.getTransactionId())
                .userId(userId)
                .coverageType(req.getCoverageType())
                .premiumAmount(premium)
                .maxCoverage(maxCoverage)
                .status("ACTIVE")
                .expiresAt(tx.getEndDate() != null
                        ? tx.getEndDate().atTime(23, 59, 59)
                        : LocalDateTime.now().plusDays(30))
                .build();

        policy = policyRepository.save(policy);
        notificationService.notifyInsurancePurchased(userId, req.getCoverageType(), req.getTransactionId());

        return toDto(policy);
    }

    public InsurancePolicyDto getPolicyForTransaction(String transactionId, String userId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        boolean isParty = tx.getOwnerId().equals(userId) || tx.getBorrowerId().equals(userId);
        if (!isParty) throw new AccessDeniedException("Access denied");

        return policyRepository.findByTransactionId(transactionId)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("No insurance policy for this transaction"));
    }

    public InsurancePolicyDto getPolicyById(String policyId, String userId) {
        InsurancePolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found"));

        if (!policy.getUserId().equals(userId)) {
            Transaction tx = transactionRepository.findById(policy.getTransactionId()).orElse(null);
            if (tx == null || (!tx.getOwnerId().equals(userId) && !tx.getBorrowerId().equals(userId))) {
                throw new AccessDeniedException("Access denied");
            }
        }
        return toDto(policy);
    }

    public InsuranceClaimDto fileClaim(String policyId, FileInsuranceClaimRequest req, String userId) {
        InsurancePolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found"));

        if (!policy.getUserId().equals(userId)) {
            throw new AccessDeniedException("Only the policyholder can file a claim");
        }

        if (!"ACTIVE".equals(policy.getStatus())) {
            throw new IllegalStateException("Policy is not active");
        }

        if (req.getClaimAmount().compareTo(policy.getMaxCoverage()) > 0) {
            throw new IllegalArgumentException("Claim amount exceeds maximum coverage of $" + policy.getMaxCoverage());
        }

        InsuranceClaim claim = InsuranceClaim.builder()
                .policyId(policyId)
                .claimantId(userId)
                .description(req.getDescription())
                .claimAmount(req.getClaimAmount())
                .status("SUBMITTED")
                .build();

        claim = claimRepository.save(claim);
        policyRepository.updateStatus(policyId, "CLAIMED");
        notificationService.notifyInsuranceClaimFiled(userId, policyId, policy.getTransactionId());

        return toClaimDto(claim);
    }

    public List<InsuranceClaimDto> getClaims(String policyId, String userId) {
        InsurancePolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance policy not found"));

        if (!policy.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied");
        }

        return claimRepository.findByPolicyId(policyId).stream()
                .map(this::toClaimDto)
                .collect(Collectors.toList());
    }

    public BigDecimal calculatePremium(BigDecimal totalAmount, String coverageType) {
        BigDecimal rate = switch (coverageType) {
            case "STANDARD" -> STANDARD_RATE;
            case "PREMIUM"  -> PREMIUM_RATE;
            default          -> BASIC_RATE;
        };
        BigDecimal premium = totalAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        return premium.compareTo(MIN_PREMIUM) < 0 ? MIN_PREMIUM : premium;
    }

    private BigDecimal calculateMaxCoverage(BigDecimal totalAmount, String coverageType) {
        BigDecimal multiplier = switch (coverageType) {
            case "STANDARD" -> STANDARD_MULTIPLIER;
            case "PREMIUM"  -> PREMIUM_MULTIPLIER;
            default          -> BASIC_MULTIPLIER;
        };
        return totalAmount.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    private InsurancePolicyDto toDto(InsurancePolicy p) {
        return InsurancePolicyDto.builder()
                .id(p.getId())
                .transactionId(p.getTransactionId())
                .userId(p.getUserId())
                .coverageType(p.getCoverageType())
                .premiumAmount(p.getPremiumAmount())
                .maxCoverage(p.getMaxCoverage())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .expiresAt(p.getExpiresAt())
                .build();
    }

    private InsuranceClaimDto toClaimDto(InsuranceClaim c) {
        String claimantName = userRepository.findById(c.getClaimantId())
                .map(u -> u.getName()).orElse("Unknown");
        return InsuranceClaimDto.builder()
                .id(c.getId())
                .policyId(c.getPolicyId())
                .claimantId(c.getClaimantId())
                .claimantName(claimantName)
                .description(c.getDescription())
                .claimAmount(c.getClaimAmount())
                .status(c.getStatus())
                .resolutionNotes(c.getResolutionNotes())
                .createdAt(c.getCreatedAt())
                .resolvedAt(c.getResolvedAt())
                .build();
    }
}
