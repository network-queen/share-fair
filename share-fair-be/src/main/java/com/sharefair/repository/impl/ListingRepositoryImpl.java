package com.sharefair.repository.impl;

import com.sharefair.entity.Listing;
import com.sharefair.repository.ListingRepository;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.sql.Array;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class ListingRepositoryImpl implements ListingRepository {
    private final DSLContext dsl;
    private static final String TABLE = "listings";

    private static final org.jooq.Field<?>[] LISTING_FIELDS = {
            DSL.field("id"),
            DSL.field("title"),
            DSL.field("description"),
            DSL.field("category"),
            DSL.field("condition"),
            DSL.field("owner_id"),
            DSL.field("price"),
            DSL.field("price_per_day"),
            DSL.field("images"),
            DSL.field("latitude"),
            DSL.field("longitude"),
            DSL.field("neighborhood"),
            DSL.field("available"),
            DSL.field("created_at"),
            DSL.field("updated_at")
    };

    public ListingRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public Listing save(Listing listing) {
        if (listing.getId() == null) {
            listing.setId(UUID.randomUUID().toString());
            listing.setCreatedAt(LocalDateTime.now());
        }
        listing.setUpdatedAt(LocalDateTime.now());

        dsl.insertInto(DSL.table(TABLE))
                .columns(LISTING_FIELDS)
                .values(
                        UUID.fromString(listing.getId()),
                        listing.getTitle(),
                        listing.getDescription(),
                        listing.getCategory(),
                        listing.getCondition(),
                        UUID.fromString(listing.getOwnerId()),
                        listing.getPrice(),
                        listing.getPricePerDay(),
                        listing.getImages() != null ? listing.getImages().toArray(new String[0]) : null,
                        listing.getLatitude(),
                        listing.getLongitude(),
                        listing.getNeighborhood(),
                        listing.getAvailable(),
                        listing.getCreatedAt(),
                        listing.getUpdatedAt()
                )
                .onDuplicateKeyIgnore()
                .execute();

        return listing;
    }

    @Override
    public Optional<Listing> findById(String id) {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .fetchOptional()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findAll() {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findByOwnerId(String ownerId) {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("owner_id").eq(UUID.fromString(ownerId)))
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findByCategory(String category) {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("category").eq(category))
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findByNeighborhood(String neighborhood) {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("neighborhood").eq(neighborhood))
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findAvailable() {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("available").eq(true))
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findByNeighborhoodAndCategory(String neighborhood, String category) {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("neighborhood").eq(neighborhood))
                .and(DSL.field("category").eq(category))
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public void delete(String id) {
        dsl.deleteFrom(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(id)))
                .execute();
    }

    @Override
    public long count() {
        Integer count = dsl.selectCount()
                .from(DSL.table(TABLE))
                .fetchOne()
                .getValue(0, Integer.class);
        return count != null ? count : 0L;
    }

    @Override
    public List<Listing> findBySimilarity(float[] queryEmbedding, String neighborhood,
                                           String category, double similarityThreshold,
                                           int limit, int offset) {
        String vectorString = toVectorString(queryEmbedding);

        List<Condition> conditions = new ArrayList<>();
        conditions.add(DSL.field("available").eq(true));
        conditions.add(DSL.field("embedding").isNotNull());

        if (neighborhood != null && !neighborhood.isBlank()) {
            conditions.add(DSL.field("neighborhood").eq(neighborhood));
        }
        if (category != null && !category.isBlank()) {
            conditions.add(DSL.field("category").eq(category));
        }

        Field<Object> distanceField = DSL.field(
                "embedding <=> {0}::vector",
                Object.class,
                DSL.val(vectorString)
        );

        conditions.add(DSL.condition(
                "embedding <=> {0}::vector < {1}",
                DSL.val(vectorString),
                DSL.val(similarityThreshold)
        ));

        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(conditions)
                .orderBy(distanceField.asc())
                .limit(limit)
                .offset(offset)
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findByKeyword(String query, String neighborhood,
                                        String category, int limit, int offset) {
        String pattern = "%" + query.toLowerCase() + "%";

        List<Condition> conditions = new ArrayList<>();
        conditions.add(DSL.field("available").eq(true));
        conditions.add(
                DSL.lower(DSL.field("title", String.class)).like(pattern)
                        .or(DSL.lower(DSL.field("description", String.class)).like(pattern))
        );

        if (neighborhood != null && !neighborhood.isBlank()) {
            conditions.add(DSL.field("neighborhood").eq(neighborhood));
        }
        if (category != null && !category.isBlank()) {
            conditions.add(DSL.field("category").eq(category));
        }

        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(conditions)
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .offset(offset)
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public List<Listing> findByFilters(String neighborhood, String category,
                                        int limit, int offset) {
        List<Condition> conditions = new ArrayList<>();
        conditions.add(DSL.field("available").eq(true));

        if (neighborhood != null && !neighborhood.isBlank()) {
            conditions.add(DSL.field("neighborhood").eq(neighborhood));
        }
        if (category != null && !category.isBlank()) {
            conditions.add(DSL.field("category").eq(category));
        }

        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(conditions)
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .offset(offset)
                .fetch()
                .map(this::mapToListing);
    }

    @Override
    public void updateEmbedding(String listingId, float[] embedding) {
        String vectorString = toVectorString(embedding);
        dsl.execute(
                "UPDATE " + TABLE + " SET embedding = CAST(? AS vector), updated_at = NOW() WHERE id = CAST(? AS uuid)",
                vectorString, listingId
        );
    }

    @Override
    public List<Listing> findWithoutEmbedding(int limit) {
        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("embedding").isNull())
                .limit(limit)
                .fetch()
                .map(this::mapToListing);
    }

    private String toVectorString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    private Listing mapToListing(org.jooq.Record record) {
        List<String> imageList = extractStringArray(record.get(DSL.field("images")));
        return Listing.builder()
                .id(record.get(DSL.field("id"), String.class))
                .title(record.get(DSL.field("title"), String.class))
                .description(record.get(DSL.field("description"), String.class))
                .category(record.get(DSL.field("category"), String.class))
                .condition(record.get(DSL.field("condition"), String.class))
                .ownerId(record.get(DSL.field("owner_id"), String.class))
                .price(record.get(DSL.field("price"), BigDecimal.class))
                .pricePerDay(record.get(DSL.field("price_per_day"), BigDecimal.class))
                .images(imageList)
                .latitude(record.get(DSL.field("latitude"), Double.class))
                .longitude(record.get(DSL.field("longitude"), Double.class))
                .neighborhood(record.get(DSL.field("neighborhood"), String.class))
                .available(record.get(DSL.field("available"), Boolean.class))
                .createdAt(toLocalDateTime(record.get(DSL.field("created_at"))))
                .updatedAt(toLocalDateTime(record.get(DSL.field("updated_at"))))
                .build();
    }

    private LocalDateTime toLocalDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDateTime) {
            return (LocalDateTime) value;
        }
        if (value instanceof Timestamp) {
            return ((Timestamp) value).toLocalDateTime();
        }
        return null;
    }

    private List<String> extractStringArray(Object value) {
        if (value == null) {
            return Collections.emptyList();
        }
        if (value instanceof String[]) {
            return Arrays.asList((String[]) value);
        }
        if (value instanceof Array) {
            try {
                Object arr = ((Array) value).getArray();
                if (arr instanceof String[]) {
                    return Arrays.asList((String[]) arr);
                }
            } catch (SQLException e) {
                return Collections.emptyList();
            }
        }
        return Collections.emptyList();
    }
}
