import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { ImageUploadGrid } from '../../src/components/ImageUploadGrid';
import { LocationPicker } from '../../src/components/LocationPicker';
import listingService from '../../src/services/listingService';
import type { RootState } from '../../src/store';
import type { ItemCondition } from '../../src/types';

const CATEGORIES = [
  'Electronics', 'Tools', 'Sports', 'Books', 'Clothing',
  'Furniture', 'Vehicles', 'Garden', 'Kitchen', 'Other',
];
const CONDITIONS: ItemCondition[] = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];

export default function CreateScreen() {
  const { t } = useTranslation();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState<ItemCondition>('GOOD');
  const [listingType, setListingType] = useState<'RENTAL' | 'FREE'>('FREE');
  const [price, setPrice] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [latitude, setLatitude] = useState(50.45);
  const [longitude, setLongitude] = useState(30.52);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('validation.required'));
      return;
    }
    if (listingType === 'RENTAL' && !pricePerDay && !price) {
      Alert.alert(t('common.error'), t('validation.priceRequiredForRental'));
      return;
    }

    setLoading(true);
    try {
      const listing = await listingService.createListing({
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        listingType,
        price: listingType === 'FREE' ? 0 : parseFloat(price) || 0,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : undefined,
        neighborhood: neighborhood.trim() || 'Unknown',
        latitude,
        longitude,
        images: [],
        available: true,
        ownerId: '',
      });

      if (images.length > 0) {
        await listingService.uploadImages(listing.id, images);
      }

      Alert.alert(t('common.success'), '', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('validation.saveFailed');
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  const inp = [styles.input, dark && styles.inputDark];
  const lbl = [styles.label, dark && styles.labelDark];

  return (
    <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Listing Type */}
        <View style={styles.typeRow}>
          {(['FREE', 'RENTAL'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeBtn, listingType === type && styles.typeBtnActive]}
              onPress={() => setListingType(type)}
            >
              <Text style={[styles.typeBtnText, listingType === type && styles.typeBtnTextActive]}>
                {type === 'FREE' ? t('listing.typeFree') : t('listing.typeRental')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title */}
        <Text style={lbl}>{t('listing.itemName')} *</Text>
        <TextInput
          style={inp}
          value={title}
          onChangeText={setTitle}
          placeholder={t('listing.itemNamePlaceholder')}
          placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
        />

        {/* Description */}
        <Text style={lbl}>{t('listing.description')}</Text>
        <TextInput
          style={[...inp, styles.textarea]}
          value={description}
          onChangeText={setDescription}
          placeholder={t('listing.descriptionPlaceholder')}
          placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Neighborhood */}
        <Text style={lbl}>{t('search.neighborhood')}</Text>
        <TextInput
          style={inp}
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholder={t('listing.neighborhoodPlaceholder')}
          placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
        />

        {/* Category */}
        <Text style={lbl}>{t('listing.category')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive, dark && styles.chipDark]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive, dark && styles.chipTextDark]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Condition */}
        <Text style={lbl}>{t('listing.condition')}</Text>
        <View style={styles.conditionRow}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.condChip, condition === c && styles.condChipActive, dark && styles.chipDark]}
              onPress={() => setCondition(c)}
            >
              <Text style={[styles.condChipText, condition === c && styles.chipTextActive, dark && styles.chipTextDark]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pricing */}
        {listingType === 'RENTAL' && (
          <>
            <Text style={lbl}>{t('listing.price')}</Text>
            <TextInput
              style={inp}
              value={price}
              onChangeText={setPrice}
              placeholder={t('listing.pricePlaceholder')}
              placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
              keyboardType="numeric"
            />
            <Text style={lbl}>{t('listing.pricePerDay')}</Text>
            <TextInput
              style={inp}
              value={pricePerDay}
              onChangeText={setPricePerDay}
              placeholder={t('listing.pricePerDayPlaceholder')}
              placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
              keyboardType="numeric"
            />
          </>
        )}

        {/* Images */}
        <Text style={lbl}>{t('listing.images')}</Text>
        <ImageUploadGrid images={images} onImagesChange={setImages} theme={theme} />

        {/* Location */}
        <Text style={[lbl, { marginTop: 16 }]}>{t('listing.location')}</Text>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onLocationChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
          theme={theme}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>{t('listing.create')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  safeDark: { backgroundColor: '#0f0f1a' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  typeBtnActive: { borderColor: '#10B981', backgroundColor: '#f0fdf4' },
  typeBtnText: { fontWeight: '600', color: '#6b7280' },
  typeBtnTextActive: { color: '#10B981' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  labelDark: { color: '#d1d5db' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#1a1a2e',
    backgroundColor: '#fff',
  },
  inputDark: {
    borderColor: '#374151',
    backgroundColor: '#1e1e2e',
    color: '#f0f0f0',
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  chipScroll: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  chipDark: { backgroundColor: '#2d2d3e' },
  chipActive: { backgroundColor: '#10B981' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextDark: { color: '#d1d5db' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  conditionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  condChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  condChipActive: { backgroundColor: '#10B981' },
  condChipText: { fontSize: 12, color: '#374151' },
  submitBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
