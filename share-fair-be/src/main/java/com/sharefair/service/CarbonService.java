package com.sharefair.service;

import com.sharefair.dto.CarbonSavedDto;
import com.sharefair.entity.CarbonSaved;
import com.sharefair.entity.Listing;
import com.sharefair.entity.Transaction;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.CarbonSavedRepository;
import com.sharefair.repository.ListingRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CarbonService {

    private static final Map<String, BigDecimal> CATEGORY_CO2_KG = Map.of(
            "Electronics", BigDecimal.valueOf(50),
            "Tools", BigDecimal.valueOf(20),
            "Sports", BigDecimal.valueOf(15),
            "Furniture", BigDecimal.valueOf(100),
            "Books", BigDecimal.valueOf(5),
            "Clothing", BigDecimal.valueOf(10),
            "Other", BigDecimal.valueOf(10)
    );

    private static final BigDecimal DEFAULT_CO2_KG = BigDecimal.valueOf(10);
    private static final BigDecimal BORROWER_SHARE = BigDecimal.valueOf(0.70);
    private static final BigDecimal OWNER_SHARE = BigDecimal.valueOf(0.30);

    private final CarbonSavedRepository carbonSavedRepository;
    private final TransactionRepository transactionRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    public CarbonService(CarbonSavedRepository carbonSavedRepository,
                         TransactionRepository transactionRepository,
                         ListingRepository listingRepository,
                         UserRepository userRepository) {
        this.carbonSavedRepository = carbonSavedRepository;
        this.transactionRepository = transactionRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
    }

    public void createCarbonRecord(String transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (carbonSavedRepository.findByTransactionId(transactionId).isPresent()) {
            return;
        }

        Listing listing = listingRepository.findById(tx.getListingId())
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        BigDecimal estimatedCo2 = CATEGORY_CO2_KG.getOrDefault(listing.getCategory(), DEFAULT_CO2_KG);

        BigDecimal borrowerSaved = estimatedCo2.multiply(BORROWER_SHARE).setScale(2, RoundingMode.HALF_UP);
        CarbonSaved borrowerRecord = CarbonSaved.builder()
                .transactionId(transactionId)
                .userId(tx.getBorrowerId())
                .carbonSavedKg(borrowerSaved)
                .estimatedNewProductCarbon(estimatedCo2)
                .build();
        carbonSavedRepository.save(borrowerRecord);

        BigDecimal ownerSaved = estimatedCo2.multiply(OWNER_SHARE).setScale(2, RoundingMode.HALF_UP);
        CarbonSaved ownerRecord = CarbonSaved.builder()
                .transactionId(transactionId)
                .userId(tx.getOwnerId())
                .carbonSavedKg(ownerSaved)
                .estimatedNewProductCarbon(estimatedCo2)
                .build();
        carbonSavedRepository.save(ownerRecord);

        BigDecimal borrowerTotal = carbonSavedRepository.getTotalByUserId(tx.getBorrowerId());
        userRepository.updateCarbonSaved(tx.getBorrowerId(), borrowerTotal.intValue());

        BigDecimal ownerTotal = carbonSavedRepository.getTotalByUserId(tx.getOwnerId());
        userRepository.updateCarbonSaved(tx.getOwnerId(), ownerTotal.intValue());
    }

    public List<CarbonSavedDto> getUserHistory(String userId) {
        return carbonSavedRepository.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public BigDecimal getUserTotal(String userId) {
        return carbonSavedRepository.getTotalByUserId(userId);
    }

    public List<Map<String, Object>> getLeaderboard(int limit) {
        return carbonSavedRepository.getLeaderboard(limit);
    }

    private CarbonSavedDto toDto(CarbonSaved cs) {
        return CarbonSavedDto.builder()
                .id(cs.getId())
                .transactionId(cs.getTransactionId())
                .userId(cs.getUserId())
                .carbonSavedKg(cs.getCarbonSavedKg())
                .estimatedNewProductCarbon(cs.getEstimatedNewProductCarbon())
                .createdAt(cs.getCreatedAt())
                .build();
    }
}
