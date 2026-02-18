package com.sharefair.service;

import com.sharefair.entity.CarbonSaved;
import com.sharefair.entity.Listing;
import com.sharefair.entity.Transaction;
import com.sharefair.exception.ResourceNotFoundException;
import com.sharefair.repository.CarbonSavedRepository;
import com.sharefair.repository.ListingRepository;
import com.sharefair.repository.TransactionRepository;
import com.sharefair.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CarbonServiceTest {

    @Mock private CarbonSavedRepository carbonSavedRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private ListingRepository listingRepository;
    @Mock private UserRepository userRepository;

    private CarbonService carbonService;

    private static final String TX_ID = "tx-1";
    private static final String BORROWER_ID = "borrower-1";
    private static final String OWNER_ID = "owner-1";
    private static final String LISTING_ID = "listing-1";

    @BeforeEach
    void setUp() {
        carbonService = new CarbonService(carbonSavedRepository, transactionRepository, listingRepository, userRepository);
    }

    @Test
    void createCarbonRecord_electronicsCategory_calculatesCorrectSplit() {
        Transaction tx = Transaction.builder()
                .id(TX_ID).listingId(LISTING_ID).borrowerId(BORROWER_ID).ownerId(OWNER_ID).build();
        Listing listing = Listing.builder().id(LISTING_ID).category("Electronics").build();

        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(tx));
        when(carbonSavedRepository.findByTransactionId(TX_ID)).thenReturn(Optional.empty());
        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(carbonSavedRepository.getTotalByUserId(BORROWER_ID)).thenReturn(BigDecimal.valueOf(35));
        when(carbonSavedRepository.getTotalByUserId(OWNER_ID)).thenReturn(BigDecimal.valueOf(15));

        carbonService.createCarbonRecord(TX_ID);

        // Electronics = 50kg CO2. Borrower 70% = 35.00, Owner 30% = 15.00
        ArgumentCaptor<CarbonSaved> captor = ArgumentCaptor.forClass(CarbonSaved.class);
        verify(carbonSavedRepository, times(2)).save(captor.capture());

        CarbonSaved borrowerRecord = captor.getAllValues().get(0);
        assertThat(borrowerRecord.getUserId()).isEqualTo(BORROWER_ID);
        assertThat(borrowerRecord.getCarbonSavedKg()).isEqualByComparingTo(BigDecimal.valueOf(35.00));
        assertThat(borrowerRecord.getEstimatedNewProductCarbon()).isEqualByComparingTo(BigDecimal.valueOf(50));

        CarbonSaved ownerRecord = captor.getAllValues().get(1);
        assertThat(ownerRecord.getUserId()).isEqualTo(OWNER_ID);
        assertThat(ownerRecord.getCarbonSavedKg()).isEqualByComparingTo(BigDecimal.valueOf(15.00));

        verify(userRepository).updateCarbonSaved(BORROWER_ID, 35);
        verify(userRepository).updateCarbonSaved(OWNER_ID, 15);
    }

    @Test
    void createCarbonRecord_furnitureCategory_uses100kgBase() {
        Transaction tx = Transaction.builder()
                .id(TX_ID).listingId(LISTING_ID).borrowerId(BORROWER_ID).ownerId(OWNER_ID).build();
        Listing listing = Listing.builder().id(LISTING_ID).category("Furniture").build();

        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(tx));
        when(carbonSavedRepository.findByTransactionId(TX_ID)).thenReturn(Optional.empty());
        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(carbonSavedRepository.getTotalByUserId(any())).thenReturn(BigDecimal.ZERO);

        carbonService.createCarbonRecord(TX_ID);

        // Furniture = 100kg CO2. Borrower 70% = 70.00
        ArgumentCaptor<CarbonSaved> captor = ArgumentCaptor.forClass(CarbonSaved.class);
        verify(carbonSavedRepository, times(2)).save(captor.capture());
        assertThat(captor.getAllValues().get(0).getCarbonSavedKg())
                .isEqualByComparingTo(BigDecimal.valueOf(70.00));
        assertThat(captor.getAllValues().get(1).getCarbonSavedKg())
                .isEqualByComparingTo(BigDecimal.valueOf(30.00));
    }

    @Test
    void createCarbonRecord_unknownCategory_usesDefaultOf10kg() {
        Transaction tx = Transaction.builder()
                .id(TX_ID).listingId(LISTING_ID).borrowerId(BORROWER_ID).ownerId(OWNER_ID).build();
        Listing listing = Listing.builder().id(LISTING_ID).category("UnknownCategory").build();

        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(tx));
        when(carbonSavedRepository.findByTransactionId(TX_ID)).thenReturn(Optional.empty());
        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.of(listing));
        when(carbonSavedRepository.getTotalByUserId(any())).thenReturn(BigDecimal.ZERO);

        carbonService.createCarbonRecord(TX_ID);

        ArgumentCaptor<CarbonSaved> captor = ArgumentCaptor.forClass(CarbonSaved.class);
        verify(carbonSavedRepository, times(2)).save(captor.capture());
        // Default 10kg → borrower 7.00, owner 3.00
        assertThat(captor.getAllValues().get(0).getCarbonSavedKg())
                .isEqualByComparingTo(BigDecimal.valueOf(7.00));
        assertThat(captor.getAllValues().get(1).getCarbonSavedKg())
                .isEqualByComparingTo(BigDecimal.valueOf(3.00));
    }

    @Test
    void createCarbonRecord_alreadyExists_skips() {
        Transaction tx = Transaction.builder().id(TX_ID).listingId(LISTING_ID).build();
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(tx));
        when(carbonSavedRepository.findByTransactionId(TX_ID)).thenReturn(Optional.of(CarbonSaved.builder().build()));

        carbonService.createCarbonRecord(TX_ID);

        verify(carbonSavedRepository, never()).save(any());
        verify(listingRepository, never()).findById(any());
    }

    @Test
    void createCarbonRecord_transactionNotFound_throws() {
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carbonService.createCarbonRecord(TX_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Transaction not found");
    }

    @Test
    void createCarbonRecord_listingNotFound_throws() {
        Transaction tx = Transaction.builder().id(TX_ID).listingId(LISTING_ID).build();
        when(transactionRepository.findById(TX_ID)).thenReturn(Optional.of(tx));
        when(carbonSavedRepository.findByTransactionId(TX_ID)).thenReturn(Optional.empty());
        when(listingRepository.findById(LISTING_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> carbonService.createCarbonRecord(TX_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Listing not found");
    }

    @Test
    void getUserTotal_delegatesToRepository() {
        when(carbonSavedRepository.getTotalByUserId("user-1")).thenReturn(BigDecimal.valueOf(42));

        BigDecimal total = carbonService.getUserTotal("user-1");

        assertThat(total).isEqualByComparingTo(BigDecimal.valueOf(42));
    }

    @Test
    void getUserHistory_returnsMappedDtos() {
        CarbonSaved record = CarbonSaved.builder()
                .id("cs-1").transactionId(TX_ID).userId("user-1")
                .carbonSavedKg(BigDecimal.valueOf(35)).estimatedNewProductCarbon(BigDecimal.valueOf(50))
                .build();
        when(carbonSavedRepository.findByUserId("user-1")).thenReturn(List.of(record));

        var result = carbonService.getUserHistory("user-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCarbonSavedKg()).isEqualByComparingTo(BigDecimal.valueOf(35));
        assertThat(result.get(0).getTransactionId()).isEqualTo(TX_ID);
    }
}
