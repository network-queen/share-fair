package com.sharefair.service;

import com.sharefair.config.EmbeddingProperties;
import com.sharefair.entity.Listing;
import com.sharefair.repository.ListingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.embedding.EmbeddingModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private ListingRepository listingRepository;

    @Mock
    private EmbeddingModel embeddingModel;

    private EmbeddingProperties embeddingProperties;

    private SearchService searchService;

    @BeforeEach
    void setUp() {
        embeddingProperties = new EmbeddingProperties();
        embeddingProperties.setSimilarityThreshold(0.8);
        searchService = new SearchService(listingRepository, embeddingModel, embeddingProperties);
    }

    @Test
    void semanticSearch_withNullQuery_callsFindByFilters() {
        List<Listing> expected = List.of(createTestListing("1", "Item A"));
        when(listingRepository.findByFilters(isNull(), isNull(), isNull(), eq(10), eq(0)))
                .thenReturn(expected);

        List<Listing> result = searchService.semanticSearch(null, null, null, null, 10, 0);

        assertThat(result).isEqualTo(expected);
        verify(listingRepository).findByFilters(isNull(), isNull(), isNull(), eq(10), eq(0));
        verify(embeddingModel, never()).embed(anyString());
    }

    @Test
    void semanticSearch_withBlankQuery_callsFindByFilters() {
        List<Listing> expected = List.of(createTestListing("1", "Item A"));
        when(listingRepository.findByFilters(eq("Brooklyn"), isNull(), isNull(), eq(10), eq(0)))
                .thenReturn(expected);

        List<Listing> result = searchService.semanticSearch("   ", "Brooklyn", null, null, 10, 0);

        assertThat(result).isEqualTo(expected);
        verify(listingRepository).findByFilters(eq("Brooklyn"), isNull(), isNull(), eq(10), eq(0));
        verify(embeddingModel, never()).embed(anyString());
    }

    @Test
    void semanticSearch_withQuery_usesEmbeddingWhenAvailable() {
        float[] mockEmbedding = new float[]{0.1f, 0.2f, 0.3f};
        List<Listing> expected = List.of(createTestListing("1", "Bike"));

        when(embeddingModel.embed("mountain bike")).thenReturn(mockEmbedding);
        when(listingRepository.findBySimilarity(
                eq(mockEmbedding), eq("Brooklyn"), isNull(), eq(0.8), eq(10), eq(0)
        )).thenReturn(expected);

        List<Listing> result = searchService.semanticSearch("mountain bike", "Brooklyn", null, null, 10, 0);

        assertThat(result).isEqualTo(expected);
        verify(embeddingModel).embed("mountain bike");
        verify(listingRepository).findBySimilarity(
                eq(mockEmbedding), eq("Brooklyn"), isNull(), eq(0.8), eq(10), eq(0)
        );
    }

    @Test
    void semanticSearch_fallsBackToKeywordSearch_whenEmbeddingFails() {
        List<Listing> expected = List.of(createTestListing("1", "Bike"));

        when(embeddingModel.embed("bike")).thenThrow(new RuntimeException("Ollama unavailable"));
        when(listingRepository.findByKeyword(eq("bike"), isNull(), isNull(), isNull(), eq(10), eq(0)))
                .thenReturn(expected);

        List<Listing> result = searchService.semanticSearch("bike", null, null, null, 10, 0);

        assertThat(result).isEqualTo(expected);
        verify(listingRepository).findByKeyword(eq("bike"), isNull(), isNull(), isNull(), eq(10), eq(0));
    }

    @Test
    void backfillEmbeddings_returnsZero_whenNoListingsNeedEmbedding() {
        when(listingRepository.findWithoutEmbedding(100)).thenReturn(Collections.emptyList());

        int count = searchService.backfillEmbeddings(100);

        assertThat(count).isEqualTo(0);
        verify(listingRepository).findWithoutEmbedding(100);
        verify(embeddingModel, never()).embed(anyString());
    }

    @Test
    void backfillEmbeddings_processesListingsAndReturnsCount() {
        Listing listing1 = createTestListing("id-1", "Mountain Bike");
        listing1.setDescription("Great bike for trails");
        listing1.setCategory("Sports");

        Listing listing2 = createTestListing("id-2", "Camping Tent");
        listing2.setDescription("Waterproof tent");
        listing2.setCategory("Outdoor");

        when(listingRepository.findWithoutEmbedding(100))
                .thenReturn(List.of(listing1, listing2));

        float[] embedding1 = new float[]{0.1f, 0.2f};
        float[] embedding2 = new float[]{0.3f, 0.4f};
        when(embeddingModel.embed("Mountain Bike Great bike for trails Sports")).thenReturn(embedding1);
        when(embeddingModel.embed("Camping Tent Waterproof tent Outdoor")).thenReturn(embedding2);

        int count = searchService.backfillEmbeddings(100);

        assertThat(count).isEqualTo(2);
        verify(listingRepository).updateEmbedding("id-1", embedding1);
        verify(listingRepository).updateEmbedding("id-2", embedding2);
    }

    private Listing createTestListing(String id, String title) {
        return Listing.builder()
                .id(id)
                .title(title)
                .description("Test description")
                .category("Electronics")
                .condition("Good")
                .ownerId("owner-1")
                .price(new BigDecimal("10.00"))
                .latitude(40.0)
                .longitude(-74.0)
                .neighborhood("Brooklyn")
                .available(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
