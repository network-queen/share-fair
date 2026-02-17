package com.sharefair.repository.impl;

import com.sharefair.BaseIntegrationTest;
import com.sharefair.entity.Listing;
import com.sharefair.repository.ListingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class ListingRepositoryImplTest extends BaseIntegrationTest {

    @Autowired
    private ListingRepository listingRepository;

    // Seed data IDs from V2 migration
    private static final String ALICE_ID = "550e8400-e29b-41d4-a716-446655440001";
    private static final String MOUNTAIN_BIKE_ID = "660e8400-e29b-41d4-a716-446655440001";
    private static final String CAMPING_TENT_ID = "660e8400-e29b-41d4-a716-446655440002";
    private static final String GUITAR_AMP_ID = "660e8400-e29b-41d4-a716-446655440004"; // available=false

    @Test
    void save_createsNewListing() {
        Listing listing = Listing.builder()
                .title("Test Item")
                .description("A test listing for integration tests")
                .category("Electronics")
                .condition("Good")
                .ownerId(ALICE_ID)
                .price(new BigDecimal("50.00"))
                .pricePerDay(new BigDecimal("5.00"))
                .images(List.of("https://example.com/img.jpg"))
                .latitude(40.6782)
                .longitude(-73.9442)
                .neighborhood("Brooklyn")
                .available(true)
                .build();

        Listing saved = listingRepository.save(listing);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Test Item");
        assertThat(saved.getOwnerId()).isEqualTo(ALICE_ID);
    }

    @Test
    void findById_returnsListingWhenExists() {
        Optional<Listing> listing = listingRepository.findById(MOUNTAIN_BIKE_ID);

        assertThat(listing).isPresent();
        assertThat(listing.get().getTitle()).isEqualTo("Mountain Bike");
        assertThat(listing.get().getCategory()).isEqualTo("Sports");
        assertThat(listing.get().getNeighborhood()).isEqualTo("Brooklyn");
        assertThat(listing.get().getOwnerId()).isEqualTo(ALICE_ID);
    }

    @Test
    void findById_returnsEmptyWhenNotExists() {
        Optional<Listing> listing = listingRepository.findById("00000000-0000-0000-0000-000000000000");

        assertThat(listing).isEmpty();
    }

    @Test
    void findAll_returnsAllListings() {
        List<Listing> listings = listingRepository.findAll();

        // V2 has 6 listings, V4 adds 44 more = 50 total
        assertThat(listings).hasSizeGreaterThanOrEqualTo(50);
    }

    @Test
    void findByCategory_filtersCorrectly() {
        List<Listing> sportsListings = listingRepository.findByCategory("Sports");

        assertThat(sportsListings).isNotEmpty();
        assertThat(sportsListings).allSatisfy(listing ->
                assertThat(listing.getCategory()).isEqualTo("Sports")
        );
        // Mountain Bike is a Sports listing
        assertThat(sportsListings).extracting(Listing::getTitle)
                .contains("Mountain Bike");
    }

    @Test
    void findByNeighborhood_filtersCorrectly() {
        List<Listing> brooklynListings = listingRepository.findByNeighborhood("Brooklyn");

        assertThat(brooklynListings).isNotEmpty();
        assertThat(brooklynListings).allSatisfy(listing ->
                assertThat(listing.getNeighborhood()).isEqualTo("Brooklyn")
        );
        assertThat(brooklynListings).extracting(Listing::getTitle)
                .contains("Mountain Bike", "Yoga Mat");
    }

    @Test
    void findAvailable_returnsOnlyAvailableListings() {
        List<Listing> availableListings = listingRepository.findAvailable();

        assertThat(availableListings).isNotEmpty();
        assertThat(availableListings).allSatisfy(listing ->
                assertThat(listing.getAvailable()).isTrue()
        );
        // Guitar Amplifier (660e...0004) is not available
        assertThat(availableListings).extracting(Listing::getId)
                .doesNotContain(GUITAR_AMP_ID);
    }

    @Test
    void findByKeyword_matchesTitleAndDescription() {
        List<Listing> results = listingRepository.findByKeyword("bike", null, null, null, 10, 0);

        assertThat(results).isNotEmpty();
        assertThat(results).anySatisfy(listing ->
                assertThat(listing.getTitle().toLowerCase()).contains("bike")
        );
    }

    @Test
    void findByFilters_combinesNeighborhoodAndCategoryFilters() {
        List<Listing> results = listingRepository.findByFilters("Brooklyn", "Sports", null, 10, 0);

        assertThat(results).isNotEmpty();
        assertThat(results).allSatisfy(listing -> {
            assertThat(listing.getNeighborhood()).isEqualTo("Brooklyn");
            assertThat(listing.getCategory()).isEqualTo("Sports");
            assertThat(listing.getAvailable()).isTrue();
        });
    }

    @Test
    void count_returnsCorrectCount() {
        long count = listingRepository.count();

        // V2 has 6, V4 adds 44 = 50
        assertThat(count).isGreaterThanOrEqualTo(50);
    }
}
