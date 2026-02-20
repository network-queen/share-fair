import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../src/hooks/redux';
import { fetchMyTransactions } from '../../src/store/slices/transactionSlice';
import type { RootState } from '../../src/store';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  ACTIVE: '#10B981',
  COMPLETED: '#6366F1',
  CANCELLED: '#EF4444',
  DISPUTED: '#F97316',
};

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { transactions, isLoading } = useAppSelector((s) => s.transaction);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';
  const user = useAppSelector((s) => s.auth.user);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    dispatch(fetchMyTransactions());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMyTransactions());
    setRefreshing(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.center, dark && styles.centerDark]}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dark && styles.containerDark]}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, dark && styles.textDark]}>
              {t('transaction.noTransactions')}
            </Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.browseBtnText}>{t('transaction.browseListings')}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const isOwner = item.ownerId === user?.id;
          const statusColor = STATUS_COLORS[item.status] || '#6b7280';
          return (
            <TouchableOpacity
              style={[styles.card, dark && styles.cardDark]}
              onPress={() => router.push(`/transaction/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.listingTitle, dark && styles.textDark]} numberOfLines={1}>
                  {item.listingTitle}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {t(`transaction.status.${item.status}` as any) || item.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.role, dark && styles.subDark]}>
                {isOwner ? `👑 ${t('transaction.owner')}` : `📦 ${t('transaction.borrower')}`}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.dates, dark && styles.subDark]}>
                  {formatDate(item.startDate)} → {formatDate(item.endDate)}
                </Text>
                {!item.isFree && (
                  <Text style={styles.amount}>${item.totalAmount.toFixed(2)}</Text>
                )}
                {item.isFree && (
                  <Text style={[styles.free]}>{t('listing.free')}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#0f0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerDark: { backgroundColor: '#0f0f1a' },
  list: { padding: 16, paddingBottom: 24 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
  browseBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseBtnText: { color: '#fff', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: { backgroundColor: '#1e1e2e' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  listingTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginRight: 8,
  },
  textDark: { color: '#f0f0f0' },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  role: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  subDark: { color: '#9ca3af' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dates: { fontSize: 12, color: '#6b7280' },
  amount: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  free: { fontSize: 12, color: '#10B981', fontWeight: '600' },
});
