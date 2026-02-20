package com.sharefair.service;

import com.sharefair.entity.Listing;
import com.sharefair.repository.impl.JooqUtils;
import org.jooq.Condition;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.impl.DSL;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Array;
import java.sql.SQLException;
import java.util.*;

@Service
public class RecommendationService {

    private static final Logger log = LoggerFactory.getLogger(RecommendationService.class);
    private static final String TABLE = "listings";

    private static final Field<?>[] LISTING_FIELDS = {
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
            DSL.field("status"),
            DSL.field("listing_type"),
            DSL.field("created_at"),
            DSL.field("updated_at")
    };

    private final DSLContext dsl;

    public RecommendationService(DSLContext dsl) {
        this.dsl = dsl;
    }

    /**
     * Returns personalized listing recommendations for the given user based on their
     * transaction history. Falls back to popular listings for new users.
     */
    public List<Listing> getPersonalized(String userId, int limit) {
        List<String> preferredCategories = getPreferredCategories(userId);
        List<UUID> transactedIds = getTransactedListingIds(userId);

        if (preferredCategories.isEmpty()) {
            return getPopular(userId, limit);
        }

        List<Condition> conditions = new ArrayList<>();
        conditions.add(DSL.field("status").eq("ACTIVE"));
        conditions.add(DSL.field("category").in(preferredCategories));
        conditions.add(DSL.field("owner_id").ne(UUID.fromString(userId)));

        if (!transactedIds.isEmpty()) {
            conditions.add(DSL.field("id").notIn(transactedIds));
        }

        List<Listing> results = dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(conditions)
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .fetch()
                .map(this::mapToListing);

        // Top up with popular listings if not enough results
        if (results.size() < limit) {
            List<UUID> excludeIds = new ArrayList<>(transactedIds);
            results.stream().map(l -> UUID.fromString(l.getId())).forEach(excludeIds::add);
            List<Listing> popular = getPopularExcluding(userId, excludeIds, limit - results.size());
            results = new ArrayList<>(results);
            results.addAll(popular);
        }

        return results;
    }

    /**
     * Returns listings similar to the given listing using pgvector cosine similarity.
     * Falls back to same-category listings if the source has no embedding.
     */
    public List<Listing> getSimilar(String listingId, int limit) {
        // Try pgvector similarity first
        try {
            String sql =
                    "SELECT id, title, description, category, condition, owner_id, price, price_per_day, " +
                    "images, latitude, longitude, neighborhood, available, status, listing_type, created_at, updated_at " +
                    "FROM listings " +
                    "WHERE id != ?::uuid AND status = 'ACTIVE' AND embedding IS NOT NULL " +
                    "AND (SELECT embedding FROM listings WHERE id = ?::uuid LIMIT 1) IS NOT NULL " +
                    "ORDER BY embedding <=> (SELECT embedding FROM listings WHERE id = ?::uuid LIMIT 1) " +
                    "LIMIT ?";

            List<Listing> results = dsl.fetch(sql,
                            UUID.fromString(listingId),
                            UUID.fromString(listingId),
                            UUID.fromString(listingId),
                            limit)
                    .map(this::mapToListing);

            if (!results.isEmpty()) {
                return results;
            }
        } catch (Exception e) {
            log.warn("pgvector similar lookup failed for listing {}: {}", listingId, e.getMessage());
        }

        // Fallback: same category
        String category = dsl.select(DSL.field("category", String.class))
                .from(DSL.table(TABLE))
                .where(DSL.field("id").eq(UUID.fromString(listingId)))
                .fetchOne(DSL.field("category", String.class));

        if (category == null) {
            return Collections.emptyList();
        }

        return dsl.select(LISTING_FIELDS)
                .from(DSL.table(TABLE))
                .where(DSL.field("id").ne(UUID.fromString(listingId)))
                .and(DSL.field("status").eq("ACTIVE"))
                .and(DSL.field("category").eq(category))
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .fetch()
                .map(this::mapToListing);
    }

    private List<String> getPreferredCategories(String userId) {
        try {
            return dsl.selectDistinct(DSL.field("l.category", String.class))
                    .from(DSL.table("transactions t"))
                    .join(DSL.table("listings l")).on(DSL.field("t.listing_id").eq(DSL.field("l.id")))
                    .where(DSL.field("t.borrower_id").eq(UUID.fromString(userId))
                            .or(DSL.field("t.owner_id").eq(UUID.fromString(userId))))
                    .and(DSL.field("t.status").eq("COMPLETED"))
                    .limit(5)
                    .fetch(DSL.field("l.category", String.class));
        } catch (Exception e) {
            log.warn("Failed to fetch preferred categories for user {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<UUID> getTransactedListingIds(String userId) {
        try {
            return dsl.selectDistinct(DSL.field("listing_id", UUID.class))
                    .from(DSL.table("transactions"))
                    .where(DSL.field("borrower_id").eq(UUID.fromString(userId))
                            .or(DSL.field("owner_id").eq(UUID.fromString(userId))))
                    .fetch(DSL.field("listing_id", UUID.class));
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private List<Listing> getPopular(String userId, int limit) {
        return getPopularExcluding(userId, Collections.emptyList(), limit);
    }

    private List<Listing> getPopularExcluding(String userId, List<UUID> excludeIds, int limit) {
        List<Condition> conditions = new ArrayList<>();
        conditions.add(DSL.field("l.status").eq("ACTIVE"));
        conditions.add(DSL.field("l.owner_id").ne(UUID.fromString(userId)));
        if (!excludeIds.isEmpty()) {
            conditions.add(DSL.field("l.id").notIn(excludeIds));
        }

        return dsl.select(
                        DSL.field("l.id"), DSL.field("l.title"), DSL.field("l.description"),
                        DSL.field("l.category"), DSL.field("l.condition"), DSL.field("l.owner_id"),
                        DSL.field("l.price"), DSL.field("l.price_per_day"), DSL.field("l.images"),
                        DSL.field("l.latitude"), DSL.field("l.longitude"), DSL.field("l.neighborhood"),
                        DSL.field("l.available"), DSL.field("l.status"), DSL.field("l.listing_type"),
                        DSL.field("l.created_at"), DSL.field("l.updated_at"))
                .from(DSL.table("listings l"))
                .leftJoin(DSL.table("transactions t")).on(DSL.field("t.listing_id").eq(DSL.field("l.id")))
                .where(conditions)
                .groupBy(
                        DSL.field("l.id"), DSL.field("l.title"), DSL.field("l.description"),
                        DSL.field("l.category"), DSL.field("l.condition"), DSL.field("l.owner_id"),
                        DSL.field("l.price"), DSL.field("l.price_per_day"), DSL.field("l.images"),
                        DSL.field("l.latitude"), DSL.field("l.longitude"), DSL.field("l.neighborhood"),
                        DSL.field("l.available"), DSL.field("l.status"), DSL.field("l.listing_type"),
                        DSL.field("l.created_at"), DSL.field("l.updated_at"))
                .orderBy(DSL.count(DSL.field("t.id")).desc(), DSL.field("l.created_at").desc())
                .limit(limit)
                .fetch()
                .map(record -> Listing.builder()
                        .id(record.get(DSL.field("l.id"), String.class))
                        .title(record.get(DSL.field("l.title"), String.class))
                        .description(record.get(DSL.field("l.description"), String.class))
                        .category(record.get(DSL.field("l.category"), String.class))
                        .condition(record.get(DSL.field("l.condition"), String.class))
                        .ownerId(record.get(DSL.field("l.owner_id"), String.class))
                        .price(record.get(DSL.field("l.price"), BigDecimal.class))
                        .pricePerDay(record.get(DSL.field("l.price_per_day"), BigDecimal.class))
                        .images(extractStringArray(record.get(DSL.field("l.images"))))
                        .latitude(record.get(DSL.field("l.latitude"), Double.class))
                        .longitude(record.get(DSL.field("l.longitude"), Double.class))
                        .neighborhood(record.get(DSL.field("l.neighborhood"), String.class))
                        .available(record.get(DSL.field("l.available"), Boolean.class))
                        .status(record.get(DSL.field("l.status"), String.class))
                        .listingType(record.get(DSL.field("l.listing_type"), String.class))
                        .createdAt(JooqUtils.toLocalDateTime(record.get(DSL.field("l.created_at"))))
                        .updatedAt(JooqUtils.toLocalDateTime(record.get(DSL.field("l.updated_at"))))
                        .build());
    }

    private Listing mapToListing(org.jooq.Record record) {
        return Listing.builder()
                .id(record.get(DSL.field("id"), String.class))
                .title(record.get(DSL.field("title"), String.class))
                .description(record.get(DSL.field("description"), String.class))
                .category(record.get(DSL.field("category"), String.class))
                .condition(record.get(DSL.field("condition"), String.class))
                .ownerId(record.get(DSL.field("owner_id"), String.class))
                .price(record.get(DSL.field("price"), BigDecimal.class))
                .pricePerDay(record.get(DSL.field("price_per_day"), BigDecimal.class))
                .images(extractStringArray(record.get(DSL.field("images"))))
                .latitude(record.get(DSL.field("latitude"), Double.class))
                .longitude(record.get(DSL.field("longitude"), Double.class))
                .neighborhood(record.get(DSL.field("neighborhood"), String.class))
                .available(record.get(DSL.field("available"), Boolean.class))
                .status(record.get(DSL.field("status"), String.class))
                .listingType(record.get(DSL.field("listing_type"), String.class))
                .createdAt(JooqUtils.toLocalDateTime(record.get(DSL.field("created_at"))))
                .updatedAt(JooqUtils.toLocalDateTime(record.get(DSL.field("updated_at"))))
                .build();
    }

    private List<String> extractStringArray(Object value) {
        if (value == null) return Collections.emptyList();
        if (value instanceof String[]) return Arrays.asList((String[]) value);
        if (value instanceof Array) {
            try {
                Object arr = ((Array) value).getArray();
                if (arr instanceof String[]) return Arrays.asList((String[]) arr);
            } catch (SQLException e) {
                return Collections.emptyList();
            }
        }
        return Collections.emptyList();
    }
}
