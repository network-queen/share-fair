import React, { useEffect, useState } from 'react';
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
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '../../src/hooks/redux';
import { fetchListing, clearCurrentListing } from '../../src/store/slices/listingSlice';
import listingService from '../../src/services/listingService';
import { ImageUploadGrid } from '../../src/components/ImageUploadGrid';
import { LocationPicker } from '../../src/components/LocationPicker';
import type { RootState } from '../../src/store';
import type { ItemCondition } from '../../src/types';

const CATEGORIES = [
  'Electronics', 'Tools', 'Sports', 'Books', 'Clothing',
  'Furniture', 'Vehicles', 'Garden', 'Kitchen', 'Other',
];
const CONDITIONS: ItemCondition[] = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { currentListing: listing, isLoading } = useAppSelector((s) => s.listing);
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState<ItemCondition>('GOOD');
  const [price, setPrice] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [latitude, setLatitude] = useState(50.45);
  const [longitude, setLongitude] = useState(30.52);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchListing(id));
    return () => { dispatch(clearCurrentListing()); };
  }, [id, dispatch]);

  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setCategory(listing.category);
      setCondition(listing.condition);
      setPrice(listing.price ? String(listing.price) : '');
      setPricePerDay(listing.pricePerDay ? String(listing.pricePerDay) : '');
      setNeighborhood(listing.neighborhood);
      setLatitude(listing.latitude);
      setLongitude(listing.longitude);
      setImages(listing.images || []);
    }
  }, [listing]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('validation.required'));
      return;
    }
    setSaving(true);
    try {
      await listingService.updateListing(id!, {
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        price: parseFloat(price) || 0,
        pricePerDay: pricePerDay ? parseFloat(pricePerDay) : undefined,
        neighborhood: neighborhood.trim(),
        latitude,
        longitude,
      });
      Alert.alert(t('common.success'), '', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      Alert.alert(t('common.error'), err instanceof Error ? err.message : t('validation.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t('listing.deleteListing'), t('listing.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await listingService.deleteListing(id!);
            router.replace('/(tabs)');
          } catch (err: unknown) {
            Alert.alert(t('common.error'), err instanceof Error ? err.message : 'Failed');
          }
        },
      },
    ]);
  };

  if (isLoading && !listing) {
    return (
      <View style={[styles.center, dark && styles.centerDark]}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  const inp = [styles.input, dark && styles.inputDark];
  const lbl = [styles.label, dark && styles.labelDark];

  return (
    <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={lbl}>{t('listing.itemName')} *</Text>
        <TextInput style={inp} value={title} onChangeText={setTitle}
          placeholder={t('listing.itemNamePlaceholder')} placeholderTextColor="#9ca3af" />

        <Text style={lbl}>{t('listing.description')}</Text>
        <TextInput style={[...inp, styles.textarea]} value={description} onChangeText={setDescription}
          placeholder={t('listing.descriptionPlaceholder')} placeholderTextColor="#9ca3af"
          multiline numberOfLines={4} textAlignVertical="top" />

        <Text style={lbl}>{t('search.neighborhood')}</Text>
        <TextInput style={inp} value={neighborhood} onChangeText={setNeighborhood}
          placeholder={t('listing.neighborhoodPlaceholder')} placeholderTextColor="#9ca3af" />

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

        <Text style={lbl}>{t('listing.condition')}</Text>
        <View style={styles.condRow}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, condition === c && styles.chipActive, dark && styles.chipDark]}
              onPress={() => setCondition(c)}
            >
              <Text style={[styles.chipText, condition === c && styles.chipTextActive, dark && styles.chipTextDark]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={lbl}>{t('listing.price')}</Text>
        <TextInput style={inp} value={price} onChangeText={setPrice}
          placeholder={t('listing.pricePlaceholder')} placeholderTextColor="#9ca3af" keyboardType="numeric" />

        <Text style={lbl}>{t('listing.pricePerDay')}</Text>
        <TextInput style={inp} value={pricePerDay} onChangeText={setPricePerDay}
          placeholder={t('listing.pricePerDayPlaceholder')} placeholderTextColor="#9ca3af" keyboardType="numeric" />

        <Text style={lbl}>{t('listing.images')}</Text>
        <ImageUploadGrid images={images} onImagesChange={setImages} theme={theme} />

        <Text style={[lbl, { marginTop: 16 }]}>{t('listing.location')}</Text>
        <LocationPicker
          latitude={latitude} longitude={longitude}
          onLocationChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
          theme={theme}
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('common.save')}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>{t('listing.deleteListing')}</Text>
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
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  labelDark: { color: '#d1d5db' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, fontSize: 15, color: '#1a1a2e', backgroundColor: '#fff' },
  inputDark: { borderColor: '#374151', backgroundColor: '#1e1e2e', color: '#f0f0f0' },
  textarea: { height: 100 },
  chipScroll: { marginBottom: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#e5e7eb', marginRight: 8 },
  chipDark: { backgroundColor: '#2d2d3e' },
  chipActive: { backgroundColor: '#10B981' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextDark: { color: '#d1d5db' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  condRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  saveBtn: { backgroundColor: '#10B981', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  disabled: { opacity: 0.6 },
  deleteBtn: { backgroundColor: '#fef2f2', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: '#fecaca' },
  deleteBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 15 },
});
