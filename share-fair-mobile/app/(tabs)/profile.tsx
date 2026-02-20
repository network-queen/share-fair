import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../src/hooks/redux';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/hooks/useTheme';
import { useLanguage } from '../../src/hooks/useLanguage';
import { updateUser } from '../../src/store/slices/authSlice';
import { TrustBadge } from '../../src/components/TrustBadge';
import { ReviewList } from '../../src/components/ReviewList';
import trustScoreService from '../../src/services/trustScoreService';
import reviewService, { type ReviewResponse } from '../../src/services/reviewService';
import listingService from '../../src/services/listingService';
import type { TrustScore, Listing } from '../../src/types';
import { ListingCard } from '../../src/components/ListingCard';

type Tab = 'listings' | 'reviews' | 'settings';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const dark = theme === 'dark';

  const [tab, setTab] = useState<Tab>('listings');
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [neighborhood, setNeighborhood] = useState(user?.neighborhood || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    trustScoreService.getTrustScore(user.id).then(setTrustScore).catch(() => {});
    reviewService.getUserReviews(user.id).then(setReviews).catch(() => {});
    listingService.getUserListings(user.id).then(setUserListings).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <View style={[styles.center, dark && styles.centerDark]}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      await dispatch(updateUser({ id: user.id, data: { name, neighborhood } }));
      setEditing(false);
    } catch {
      Alert.alert(t('common.error'), t('validation.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('common.logout'), t('auth.logout'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  const TABS: Tab[] = ['listings', 'reviews', 'settings'];

  return (
    <SafeAreaView style={[styles.safe, dark && styles.safeDark]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, dark && styles.headerDark]}>
          <Image
            source={{ uri: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}` }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            {editing ? (
              <>
                <TextInput
                  style={[styles.nameInput, dark && styles.inputDark]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('profile.name')}
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={[styles.nameInput, dark && styles.inputDark, { marginTop: 4 }]}
                  value={neighborhood}
                  onChangeText={setNeighborhood}
                  placeholder={t('search.neighborhood')}
                  placeholderTextColor="#9ca3af"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>{t('common.save')}</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setEditing(false)}>
                    <Text style={styles.cancelText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.name, dark && styles.textDark]}>{user.name}</Text>
                <Text style={[styles.email, dark && styles.subDark]}>{user.email}</Text>
                <Text style={[styles.neighborhood, dark && styles.subDark]}>📍 {user.neighborhood}</Text>
                <TouchableOpacity onPress={() => setEditing(true)}>
                  <Text style={styles.editLink}>{t('profile.edit')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, dark && styles.statsRowDark]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, dark && styles.textDark]}>
              {user.carbonSaved?.toFixed(1) || '0'} kg
            </Text>
            <Text style={[styles.statLabel, dark && styles.subDark]}>{t('carbon.saved')}</Text>
          </View>
          {trustScore && (
            <View style={styles.stat}>
              <TrustBadge tier={trustScore.tier} score={trustScore.score} />
              <Text style={[styles.statLabel, dark && styles.subDark, { marginTop: 4 }]}>
                {t('profile.trustScore')}
              </Text>
            </View>
          )}
          {trustScore && (
            <View style={styles.stat}>
              <Text style={[styles.statValue, dark && styles.textDark]}>
                {trustScore.completedTransactions}
              </Text>
              <Text style={[styles.statLabel, dark && styles.subDark]}>
                {t('trust.transactions')}
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, dark && styles.tabsDark]}>
          {TABS.map((t_) => (
            <TouchableOpacity
              key={t_}
              style={[styles.tabBtn, tab === t_ && styles.tabBtnActive]}
              onPress={() => setTab(t_)}
            >
              <Text style={[styles.tabText, tab === t_ && styles.tabTextActive, dark && styles.subDark]}>
                {t_ === 'listings'
                  ? t('profile.myListings')
                  : t_ === 'reviews'
                  ? t('review.reviews')
                  : t('common.settings')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {tab === 'listings' && (
            userListings.length === 0 ? (
              <Text style={[styles.empty, dark && styles.subDark]}>{t('profile.noListings')}</Text>
            ) : (
              userListings.map((l) => <ListingCard key={l.id} listing={l} theme={theme} />)
            )
          )}
          {tab === 'reviews' && (
            <View style={{ paddingHorizontal: 16 }}>
              <ReviewList reviews={reviews} theme={theme} />
            </View>
          )}
          {tab === 'settings' && (
            <View style={[styles.settings, dark && styles.settingsDark]}>
              {/* Language */}
              <Text style={[styles.settingsLabel, dark && styles.textDark]}>
                {t('common.settings')} — Language
              </Text>
              <View style={styles.langRow}>
                {(['en', 'uk'] as const).map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.langBtn, language === lang && styles.langBtnActive]}
                    onPress={() => changeLanguage(lang)}
                  >
                    <Text style={[styles.langBtnText, language === lang && styles.langBtnTextActive]}>
                      {lang === 'en' ? '🇺🇸 English' : '🇺🇦 Українська'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dark mode */}
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, dark && styles.textDark]}>
                  {dark ? t('common.darkMode') : t('common.lightMode')}
                </Text>
                <Switch
                  value={dark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#d1d5db', true: '#10B981' }}
                  thumbColor="#fff"
                />
              </View>

              {/* Logout */}
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>{t('auth.logout')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  safeDark: { backgroundColor: '#0f0f1a' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centerDark: { backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerDark: { backgroundColor: '#1a1a2e', borderBottomColor: '#2d2d3e' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e5e7eb' },
  userInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  textDark: { color: '#f0f0f0' },
  email: { fontSize: 13, color: '#6b7280', marginBottom: 2 },
  subDark: { color: '#9ca3af' },
  neighborhood: { fontSize: 13, color: '#6b7280', marginBottom: 6 },
  editLink: { fontSize: 13, color: '#10B981', fontWeight: '600' },
  nameInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: '#1a1a2e',
    backgroundColor: '#f9fafb',
  },
  inputDark: { borderColor: '#374151', backgroundColor: '#111827', color: '#f0f0f0' },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  saveBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelText: { color: '#6b7280', fontSize: 13 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  statsRowDark: { backgroundColor: '#1a1a2e', borderBottomColor: '#2d2d3e' },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabsDark: { backgroundColor: '#1a1a2e', borderBottomColor: '#2d2d3e' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: '#10B981' },
  tabText: { fontSize: 13, color: '#6b7280', fontWeight: '500' },
  tabTextActive: { color: '#10B981', fontWeight: '700' },
  tabContent: { paddingVertical: 12 },
  empty: { textAlign: 'center', color: '#6b7280', fontSize: 14, marginTop: 32 },
  settings: { padding: 16, margin: 16, backgroundColor: '#fff', borderRadius: 12 },
  settingsDark: { backgroundColor: '#1e1e2e' },
  settingsLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 16 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  langBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  langBtnActive: { borderColor: '#10B981', backgroundColor: '#f0fdf4' },
  langBtnText: { fontSize: 13, color: '#374151' },
  langBtnTextActive: { color: '#10B981', fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 12,
  },
  switchLabel: { fontSize: 14, color: '#374151' },
  logoutBtn: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 8,
  },
  logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
});
