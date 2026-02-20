import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../src/hooks/redux';
import {
  fetchTransaction,
  updateTransactionStatus,
} from '../../src/store/slices/transactionSlice';
import { ReviewForm } from '../../src/components/ReviewForm';
import { PaymentSheet } from '../../src/components/PaymentSheet';
import type { RootState } from '../../src/store';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  ACTIVE: '#10B981',
  COMPLETED: '#6366F1',
  CANCELLED: '#EF4444',
  DISPUTED: '#F97316',
};

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentTransaction: tx, isLoading } = useAppSelector((s) => s.transaction);
  const user = useAppSelector((s) => s.auth.user);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchTransaction(id));
  }, [id, dispatch]);

  const changeStatus = (status: string) => {
    Alert.alert(
      status === 'CANCELLED' ? t('transaction.cancel') : t('transaction.complete'),
      '',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.next'),
          onPress: () => dispatch(updateTransactionStatus({ id: id!, status })),
        },
      ]
    );
  };

  if (isLoading && !tx) {
    return (
      <View style={[styles.center, dark && styles.centerDark]}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  if (!tx) {
    return (
      <View style={[styles.center, dark && styles.centerDark]}>
        <Text style={[styles.emptyText, dark && styles.subDark]}>{t('transaction.notFound')}</Text>
      </View>
    );
  }

  const isOwner = user?.id === tx.ownerId;
  const isBorrower = user?.id === tx.borrowerId;
  const statusColor = STATUS_COLORS[tx.status] || '#6b7280';
  const canReview = tx.status === 'COMPLETED' && !reviewDone;
  const revieweeId = isOwner ? tx.borrowerId : tx.ownerId;

  const row = (label: string, value: string) => (
    <View style={[styles.row, dark && styles.rowDark]}>
      <Text style={[styles.rowLabel, dark && styles.subDark]}>{label}</Text>
      <Text style={[styles.rowValue, dark && styles.textDark]}>{value}</Text>
    </View>
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status header */}
        <View style={[styles.statusHeader, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {t(`transaction.status.${tx.status}` as any) || tx.status}
          </Text>
          <Text style={[styles.listingTitle, dark && styles.textDark]} numberOfLines={2}>
            {tx.listingTitle}
          </Text>
        </View>

        {/* Details */}
        <View style={[styles.card, dark && styles.cardDark]}>
          {row(t('transaction.role'), isOwner ? `👑 ${t('transaction.owner')}` : `📦 ${t('transaction.borrower')}`)}
          {row(t('transaction.owner'), tx.ownerName)}
          {row(t('transaction.borrower'), tx.borrowerName)}
          {row(t('transaction.startDate'), formatDate(tx.startDate))}
          {row(t('transaction.endDate'), formatDate(tx.endDate))}
          {!tx.isFree && row(t('transaction.totalAmount'), `$${tx.totalAmount.toFixed(2)}`)}
          {!tx.isFree && row(t('transaction.serviceFee'), `$${tx.serviceFee.toFixed(2)}`)}
          {row(t('transaction.paymentStatus'), tx.paymentStatus)}
          {row(t('transaction.createdAt'), formatDate(tx.createdAt))}
          {tx.completedAt && row(t('transaction.completedAt'), formatDate(tx.completedAt))}
        </View>

        {/* Payment — for pending non-free transactions where borrower needs to pay */}
        {tx.status === 'PENDING' && !tx.isFree && isBorrower && (
          <View style={[styles.card, dark && styles.cardDark]}>
            <Text style={[styles.sectionTitle, dark && styles.textDark]}>
              Payment
            </Text>
            <PaymentSheet
              transactionId={tx.id}
              amount={Math.round(tx.totalAmount * 100)}
              onSuccess={() => dispatch(fetchTransaction(id!))}
              theme={theme}
            />
          </View>
        )}

        {/* Free transaction note */}
        {tx.isFree && tx.status === 'PENDING' && (
          <View style={styles.freeNote}>
            <Text style={styles.freeNoteText}>{t('transaction.freeTransaction')}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* Owner can accept */}
          {isOwner && tx.status === 'PENDING' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => changeStatus('ACTIVE')}
            >
              <Text style={styles.actionBtnText}>{t('transaction.accept')}</Text>
            </TouchableOpacity>
          )}
          {/* Owner or borrower can cancel */}
          {(isOwner || isBorrower) && (tx.status === 'PENDING' || tx.status === 'ACTIVE') && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => changeStatus('CANCELLED')}
            >
              <Text style={styles.actionBtnText}>{t('transaction.cancel')}</Text>
            </TouchableOpacity>
          )}
          {/* Owner completes */}
          {isOwner && tx.status === 'ACTIVE' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={() => changeStatus('COMPLETED')}
            >
              <Text style={styles.actionBtnText}>{t('transaction.complete')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Review form */}
        {canReview && (
          <View style={[styles.card, dark && styles.cardDark]}>
            <ReviewForm
              transactionId={tx.id}
              revieweeId={revieweeId}
              onSubmitted={() => setReviewDone(true)}
              theme={theme}
            />
          </View>
        )}

        {reviewDone && (
          <View style={styles.freeNote}>
            <Text style={styles.freeNoteText}>{t('review.alreadyReviewed')}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.viewListingBtn}
          onPress={() => router.push(`/listing/${tx.listingId}`)}
        >
          <Text style={styles.viewListingText}>{t('transaction.viewListing')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  safeDark: { backgroundColor: '#0f0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerDark: { backgroundColor: '#0f0f1a' },
  emptyText: { color: '#6b7280', fontSize: 16 },
  subDark: { color: '#9ca3af' },
  content: { padding: 16, paddingBottom: 40 },
  statusHeader: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statusText: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  listingTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  textDark: { color: '#f0f0f0' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: { backgroundColor: '#1e1e2e' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowDark: { borderBottomColor: '#2d2d3e' },
  rowLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  rowValue: { fontSize: 13, fontWeight: '500', color: '#1a1a2e', flex: 1, textAlign: 'right' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', padding: 16, paddingBottom: 0 },
  freeNote: {
    backgroundColor: '#f0fdf4',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  freeNoteText: { color: '#065f46', fontWeight: '600', fontSize: 14 },
  actions: { flexDirection: 'column', gap: 10, marginBottom: 16 },
  actionBtn: { borderRadius: 12, padding: 14, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#10B981' },
  cancelBtn: { backgroundColor: '#EF4444' },
  completeBtn: { backgroundColor: '#6366F1' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  viewListingBtn: {
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  viewListingText: { color: '#10B981', fontWeight: '600' },
});
