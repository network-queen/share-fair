package com.sharefair.repository;

import java.util.List;
import java.util.Map;

public interface NeighborhoodRepository {
    List<Map<String, String>> findAll();
    List<String> findDistinctCategoriesInListings();
    List<String> searchListingTitles(String query);
}
