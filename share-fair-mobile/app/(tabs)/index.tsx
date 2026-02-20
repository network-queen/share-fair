import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../src/hooks/redux';
import { fetchListings } from '../../src/store/slices/listingSlice';
import { ListingCard } from '../../src/components/ListingCard';
import { ListingCardSkeleton } from '../../src/components/ListingCardSkeleton';
import { CarbonLeaderboard } from '../../src/components/CarbonLeaderboard';
import type { RootState } from '../../src/store';

export default function HomeScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { listings, isLoading, pagination } = useAppSelector((s) => s.listing);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    (p: number) => dispatch(fetchListings({ page: p, limit: 20 })),
    [dispatch]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    await load(0);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (loadingMore || isLoading) return;
    if (page + 1 >= pagination.totalPages) return;
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    await load(next);
    setLoadingMore(false);
  };

  const skeletons = Array.from({ length: 4 });

  const ListHeader = () => (
    <View>
      <View style={[styles.hero, dark && styles.heroDark]}>
        <Text style={[styles.heroTitle, dark && styles.textDark]}>🌿 Share Fair</Text>
        <Text style={[styles.heroTagline, dark && styles.subDark]}>{t('home.tagline')}</Text>
      </View>
      <CarbonLeaderboard theme={theme} />
      <Text style={[styles.sectionTitle, dark && styles.textDark]}>
        {t('home.featuredListings')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, dark && styles.containerDark]}>
      <FlatList
        data={isLoading && listings.length === 0 ? [] : listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} theme={theme} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {skeletons.map((_, i) => (
                <ListingCardSkeleton key={i} theme={theme} />
              ))}
            </View>
          ) : (
            <Text style={[styles.empty, dark && styles.subDark]}>
              {t('search.noResults')}
            </Text>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color="#10B981" style={{ paddingVertical: 16 }} />
          ) : null
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#0f0f1a' },
  list: { paddingBottom: 20 },
  hero: {
    backgroundColor: '#10B981',
    padding: 24,
    paddingTop: 32,
    marginBottom: 16,
  },
  heroDark: { backgroundColor: '#064e3b' },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  textDark: { color: '#f0f0f0' },
  heroTagline: {
    fontSize: 15,
    color: '#d1fae5',
  },
  subDark: { color: '#9ca3af' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
    marginTop: 40,
  },
});
