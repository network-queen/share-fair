import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../src/store';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, dark && styles.containerDark]}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={[styles.code, dark && styles.textDark]}>404</Text>
        <Text style={[styles.title, dark && styles.textDark]}>{t('common.notFound')}</Text>
        <Text style={[styles.subtitle, dark && styles.subDark]}>
          {t('common.notFoundDesc')}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnText}>{t('common.goHome')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  containerDark: { backgroundColor: '#0f0f1a' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 72, marginBottom: 16 },
  code: { fontSize: 64, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  textDark: { color: '#f0f0f0' },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  subDark: { color: '#9ca3af' },
  btn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
