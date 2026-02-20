import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useAuth } from '../../src/hooks/useAuth';
import type { RootState } from '../../src/store';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoading, error } = useAuth();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, dark && styles.containerDark]}>
      <View style={styles.inner}>
        {/* Logo / Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={[styles.appName, dark && styles.textDark]}>Share Fair</Text>
          <Text style={[styles.tagline, dark && styles.subDark]}>
            {t('home.tagline')}
          </Text>
        </View>

        {/* Auth card */}
        <View style={[styles.card, dark && styles.cardDark]}>
          <Text style={[styles.title, dark && styles.textDark]}>
            {t('auth.loginTitle')}
          </Text>
          <Text style={[styles.subtitle, dark && styles.subDark]}>
            {t('auth.loginSubtitle')}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, styles.googleBtn, isLoading && styles.btnDisabled]}
            onPress={() => login('google')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnIcon}>G</Text>
                <Text style={styles.btnText}>{t('auth.loginWithGoogle')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.githubBtn, isLoading && styles.btnDisabled]}
            onPress={() => login('github')}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnIcon}>🐙</Text>
                <Text style={styles.btnText}>{t('auth.loginWithGithub')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.footer, dark && styles.subDark]}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  containerDark: {
    backgroundColor: '#0f0f1a',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#065f46',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  cardDark: {
    backgroundColor: '#1e1e2e',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
  },
  textDark: {
    color: '#f0f0f0',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  subDark: {
    color: '#9ca3af',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
  },
  btnDisabled: { opacity: 0.6 },
  googleBtn: { backgroundColor: '#4285F4' },
  githubBtn: { backgroundColor: '#24292e' },
  btnIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 16,
  },
});
