import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StatusBar } from 'expo-status-bar';
import { store, type RootState } from '../src/store';
import { useAuth } from '../src/hooks/useAuth';
import { useTheme } from '../src/hooks/useTheme';
import { useLanguage } from '../src/hooks/useLanguage';
import '../src/i18n';

const STRIPE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

// Auth guard — redirects to login if unauthenticated on protected routes
function AuthGuard() {
  const { isAuthenticated, isLoading, initAuth } = useAuth();
  const { loadTheme } = useTheme();
  const { loadLanguage } = useLanguage();
  const segments = useSegments();

  useEffect(() => {
    initAuth();
    loadTheme();
    loadLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const protectedTabs = ['create', 'transactions', 'profile'];
    const currentTab = segments[1] as string | undefined;

    if (!isAuthenticated && inTabsGroup && currentTab && protectedTabs.includes(currentTab)) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

function RootLayout() {
  const theme = useSelector((state: RootState) => state.ui.theme);
  const dark = theme === 'dark';

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="listing/[id]" options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="listing/[id]edit" options={{ headerShown: true, title: 'Edit Listing' }} />
        <Stack.Screen name="transaction/[id]" options={{ headerShown: true, title: 'Transaction' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function Layout() {
  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_KEY}>
        <RootLayout />
      </StripeProvider>
    </Provider>
  );
}
