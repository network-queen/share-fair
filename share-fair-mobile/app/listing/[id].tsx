import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../src/hooks/redux';
import { fetchListing } from '../../src/store/slices/listingSlice';
import { createTransaction } from '../../src/store/slices/transactionSlice';
import { TrustBadge } from '../../src/components/TrustBadge';
import { ReviewList } from '../../src/components/ReviewList';
import trustScoreService from '../../src/services/trustScoreService';
import reviewService, { type ReviewResponse } from '../../src/services/reviewService';
import type { RootState } from '../../src/store';
import type { TrustScore } from '../../src/types';

const { width: SCREEN_W } = Dimensions.get('window');
const PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentListing: listing, isLoading } = useAppSelector((s) => s.listing);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const user = useAppSelector((s) => s.auth.user);
  const dark = theme === 'dark';

  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [bookModal, setBookModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [booking, setBooking] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchListing(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (listing?.ownerId) {
      trustScoreService.getTrustScore(listing.ownerId).then(setTrustScore).catch(() => {});
      reviewService.getUserReviews(listing.ownerId).then(setReviews).catch(() => {});
    }
  }, [listing?.ownerId]);

  const handleBook = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert(t('common.warning'), t('transaction.datesRequired'));
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      Alert.alert(t('common.warning'), t('transaction.endAfterStart'));
      return;
    }
    setBooking(true);
    try {
      const result = await dispatch(createTransaction({ listingId: id!, startDate, endDate })).unwrap();
      setBookModal(false);
      router.push(`/transaction/${result.id}`);
    } catch (err: unknown) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setBooking(false);
    }
  };

  if (isLoading || !listing) {
    return (
      <View style={[styles.center, dark && styles.centerDark]}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  const images = listing.images?.length ? listing.images : [PLACEHOLDER];
  const isFree = listing.listingType === 'FREE' || listing.price === 0;
  const isOwner = user?.id === listing.ownerId;

  return (
    <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => {
              setImgIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W));
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.image, { width: SCREEN_W }]} resizeMode="cover" />
            )}
          />
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === imgIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={[styles.content, dark && styles.contentDark]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, dark && styles.textDark]}>{listing.title}</Text>
            {isFree ? (
              <View style={styles.freeBadge}><Text style={styles.freeBadgeText}>FREE</Text></View>
            ) : (
              <Text style={styles.price}>
                {listing.pricePerDay ? `$${listing.pricePerDay}/day` : `$${listing.price}`}
              </Text>
            )}
          </View>

          <Text style={[styles.meta, dark && styles.subDark]}>
            📍 {listing.neighborhood} · {listing.category} · {listing.condition}
          </Text>

          {listing.ratings != null && listing.reviewCount != null && (
            <Text style={[styles.meta, dark && styles.subDark]}>
              {'★'.repeat(Math.round(listing.ratings))} {listing.ratings.toFixed(1)} ({listing.reviewCount} reviews)
            </Text>
          )}

          <Text style={[styles.description, dark && styles.subDark]}>{listing.description}</Text>

          {/* Owner section */}
          {listing.owner && (
            <View style={[styles.ownerBox, dark && styles.ownerBoxDark]}>
              <Text style={[styles.sectionTitle, dark && styles.textDark]}>{t('listing.owner')}</Text>
              <View style={styles.ownerRow}>
                <Image
                  source={{ uri: listing.owner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(listing.owner.name)}` }}
                  style={styles.ownerAvatar}
                />
                <View style={styles.ownerInfo}>
                  <Text style={[styles.ownerName, dark && styles.textDark]}>{listing.owner.name}</Text>
                  <Text style={[styles.ownerMeta, dark && styles.subDark]}>📍 {listing.owner.neighborhood}</Text>
                  {trustScore && <TrustBadge tier={trustScore.tier} score={trustScore.score} size="sm" />}
                </View>
              </View>
            </View>
          )}

          {/* Map */}
          <Text style={[styles.sectionTitle, dark && styles.textDark]}>{t('listing.location')}</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: listing.latitude,
              longitude: listing.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker coordinate={{ latitude: listing.latitude, longitude: listing.longitude }} />
          </MapView>

          {/* Reviews */}
          <Text style={[styles.sectionTitle, dark && styles.textDark, { marginTop: 16 }]}>
            {t('review.ownerReviews')}
          </Text>
          <ReviewList reviews={reviews.slice(0, 3)} theme={theme} />

          {/* Actions */}
          {!isOwner && listing.available && (
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => user ? setBookModal(true) : router.push('/(auth)/login')}
            >
              <Text style={styles.bookBtnText}>
                {isFree ? `🤝 ${t('listing.borrow')}` : `📅 ${t('listing.rent')}`}
              </Text>
            </TouchableOpacity>
          )}
          {isOwner && (
            <TouchableOpacity
              style={[styles.bookBtn, styles.editBtn]}
              onPress={() => router.push(`/listing/${id}edit`)}
            >
              <Text style={styles.bookBtnText}>{t('listing.edit')}</Text>
            </TouchableOpacity>
          )}
          {!listing.available && (
            <View style={styles.unavailableBox}>
              <Text style={styles.unavailableText}>{t('listing.unavailable')}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book modal */}
      <Modal visible={bookModal} transparent animationType="slide" onRequestClose={() => setBookModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, dark && styles.modalSheetDark]}>
            <Text style={[styles.modalTitle, dark && styles.textDark]}>
              {isFree ? t('transaction.confirmBorrow') : t('transaction.confirmRent')}
            </Text>

            <Text style={[styles.modalLabel, dark && styles.subDark]}>{t('transaction.startDate')}</Text>
            <TextInput
              style={[styles.dateInput, dark && styles.inputDark]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              value={startDate}
              onChangeText={setStartDate}
            />

            <Text style={[styles.modalLabel, dark && styles.subDark]}>{t('transaction.endDate')}</Text>
            <TextInput
              style={[styles.dateInput, dark && styles.inputDark]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              value={endDate}
              onChangeText={setEndDate}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setBookModal(false)}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, booking && styles.btnDisabled]}
                onPress={handleBook}
                disabled={booking}
              >
                {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalConfirmText}>{t('common.next')}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  safeDark: { backgroundColor: '#0f0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerDark: { backgroundColor: '#0f0f1a' },
  image: { height: 280, backgroundColor: '#e5e7eb' },
  dots: { flexDirection: 'row', justifyContent: 'center', padding: 8, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: '#10B981', width: 18 },
  content: { padding: 16, backgroundColor: '#f9fafb' },
  contentDark: { backgroundColor: '#0f0f1a' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginRight: 8 },
  textDark: { color: '#f0f0f0' },
  price: { fontSize: 20, fontWeight: '700', color: '#10B981' },
  freeBadge: { backgroundColor: '#10B981', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  freeBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  meta: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  subDark: { color: '#9ca3af' },
  description: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginVertical: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  ownerBox: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  ownerBoxDark: { backgroundColor: '#1e1e2e', borderColor: '#2d2d3e' },
  ownerRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  ownerAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#e5e7eb' },
  ownerInfo: { flex: 1, gap: 4 },
  ownerName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  ownerMeta: { fontSize: 12, color: '#6b7280' },
  map: { width: '100%', height: 180, borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  bookBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  editBtn: { backgroundColor: '#6366F1' },
  bookBtnText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  unavailableBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  unavailableText: { color: '#dc2626', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalSheetDark: { backgroundColor: '#1e1e2e' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1a1a2e',
  },
  inputDark: { borderColor: '#374151', backgroundColor: '#111827', color: '#f0f0f0' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  modalCancelText: { color: '#374151', fontWeight: '600' },
  modalConfirmBtn: { flex: 2, padding: 14, borderRadius: 10, backgroundColor: '#10B981', alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
});
