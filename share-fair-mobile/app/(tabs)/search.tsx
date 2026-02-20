import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useSearch } from '../../src/hooks/useSearch';
import { useGeolocation } from '../../src/hooks/useGeolocation';
import { useRecentSearches } from '../../src/hooks/useRecentSearches';
import { ListingCard } from '../../src/components/ListingCard';
import { ListingCardSkeleton } from '../../src/components/ListingCardSkeleton';
import { FilterSheet } from '../../src/components/FilterSheet';
import type { RootState } from '../../src/store';

export default function SearchScreen() {
  const { t } = useTranslation();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [mapMode, setMapMode] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    results,
    isLoading,
    hasMore,
    searchParams,
    neighborhoods,
    categories,
    performSearch,
    loadMoreResults,
    loadNeighborhoods,
    loadCategories,
  } = useSearch();

  const { getPosition, loading: locLoading } = useGeolocation();
  const { recentSearches, addSearch } = useRecentSearches();

  useEffect(() => {
    loadNeighborhoods();
    loadCategories();
    performSearch({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q.trim()) addSearch(q.trim());
      performSearch({ ...searchParams, query: q });
    }, 400);
  };

  const handleNearMe = async () => {
    try {
      const pos = await getPosition();
      performSearch({ ...searchParams, lat: pos.latitude, lng: pos.longitude, radius: 5 });
    } catch {
      // Permission denied or error — silently ignore
    }
  };

  return (
    <SafeAreaView style={[styles.container, dark && styles.containerDark]}>
      {/* Search bar row */}
      <View style={[styles.searchRow, dark && styles.searchRowDark]}>
        <TextInput
          style={[styles.input, dark && styles.inputDark]}
          placeholder={t('search.placeholder')}
          placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterOpen(true)}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Action chips */}
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, dark && styles.chipDark]}
          onPress={handleNearMe}
          disabled={locLoading}
        >
          <Text style={[styles.chipText, dark && styles.chipTextDark]}>
            {locLoading ? '...' : `📍 ${t('search.nearMe')}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, mapMode && styles.chipActive, dark && styles.chipDark]}
          onPress={() => setMapMode(!mapMode)}
        >
          <Text style={[styles.chipText, mapMode && styles.chipTextActive, dark && styles.chipTextDark]}>
            {mapMode ? `📋 ${t('search.listView')}` : `🗺️ ${t('search.mapView')}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Result count */}
      {results.length > 0 && (
        <Text style={[styles.count, dark && styles.subDark]}>
          {t('search.resultsFound', { count: results.length })}
        </Text>
      )}

      {/* Recent searches (shown when no results and no query) */}
      {!query && results.length === 0 && recentSearches.length > 0 && (
        <View style={styles.recent}>
          <Text style={[styles.recentTitle, dark && styles.subDark]}>
            {t('search.recentSearches')}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentSearches.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.recentChip, dark && styles.chipDark]}
                onPress={() => handleSearch(s)}
              >
                <Text style={[styles.recentChipText, dark && styles.chipTextDark]}>🕐 {s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Map or List */}
      {mapMode ? (
        <MapView
          style={styles.map}
          initialRegion={{ latitude: 50.45, longitude: 30.52, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
        >
          {results.map((item) => (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              title={item.title}
              description={item.pricePerDay ? `$${item.pricePerDay}/day` : 'Free'}
            />
          ))}
        </MapView>
      ) : (
        <FlatList
          data={isLoading && results.length === 0 ? [] : results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCard listing={item} theme={theme} />}
          ListEmptyComponent={
            isLoading ? (
              <View>
                {[0, 1, 2].map((i) => (
                  <ListingCardSkeleton key={i} theme={theme} />
                ))}
              </View>
            ) : (
              <Text style={[styles.empty, dark && styles.subDark]}>{t('search.noResults')}</Text>
            )
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMoreResults}>
                {isLoading ? (
                  <ActivityIndicator color="#10B981" />
                ) : (
                  <Text style={styles.loadMoreText}>{t('search.loadMore')}</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
          onEndReached={loadMoreResults}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        params={searchParams}
        onApply={(params) => performSearch({ ...params, query })}
        neighborhoods={neighborhoods}
        categories={categories}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#0f0f1a' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchRowDark: { backgroundColor: '#1a1a2e', borderBottomColor: '#2d2d3e' },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1a1a2e',
  },
  inputDark: { backgroundColor: '#111827', color: '#f0f0f0' },
  filterBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  filterIcon: { fontSize: 18 },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  chipDark: { backgroundColor: '#2d2d3e' },
  chipActive: { backgroundColor: '#10B981' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextDark: { color: '#d1d5db' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  count: {
    fontSize: 12,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  subDark: { color: '#9ca3af' },
  recent: { paddingHorizontal: 16, paddingVertical: 8 },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  recentChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  recentChipText: { fontSize: 12, color: '#374151' },
  list: { paddingBottom: 20 },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
    marginTop: 40,
  },
  map: { flex: 1 },
  loadMoreBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
  },
});
