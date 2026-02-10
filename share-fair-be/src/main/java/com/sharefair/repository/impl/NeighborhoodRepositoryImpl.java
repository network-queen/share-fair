package com.sharefair.repository.impl;

import com.sharefair.repository.NeighborhoodRepository;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Repository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class NeighborhoodRepositoryImpl implements NeighborhoodRepository {
    private final DSLContext dsl;

    public NeighborhoodRepositoryImpl(DSLContext dsl) {
        this.dsl = dsl;
    }

    @Override
    public List<Map<String, String>> findAll() {
        return dsl.select(
                DSL.field("id"),
                DSL.field("name"),
                DSL.field("city")
        )
        .from(DSL.table("neighborhoods"))
        .fetch()
        .map(record -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", record.get(DSL.field("id"), String.class));
            map.put("name", record.get(DSL.field("name"), String.class));
            map.put("city", record.get(DSL.field("city"), String.class));
            return map;
        });
    }

    @Override
    public List<String> findDistinctCategoriesInListings() {
        return dsl.selectDistinct(DSL.field("category"))
                .from(DSL.table("listings"))
                .where(DSL.field("category").isNotNull())
                .fetch()
                .map(record -> record.get(DSL.field("category"), String.class));
    }

    @Override
    public List<String> searchListingTitles(String query) {
        String searchPattern = "%" + query.toLowerCase() + "%";
        return dsl.selectDistinct(DSL.field("title"))
                .from(DSL.table("listings"))
                .where(DSL.lower(DSL.field("title", String.class)).like(searchPattern))
                .limit(10)
                .fetch()
                .map(record -> record.get(DSL.field("title"), String.class));
    }
}
