import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useTranslation } from 'react-i18next';
import paymentService from '../services/paymentService';

interface Props {
  transactionId: string;
  amount: number;
  currency?: string;
  onSuccess?: () => void;
  theme?: 'light' | 'dark';
}

export const PaymentSheet: React.FC<Props> = ({
  transactionId,
  amount,
  currency = 'usd',
  onSuccess,
  theme = 'light',
}) => {
  const { t } = useTranslation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const dark = theme === 'dark';

  const handlePay = async () => {
    setLoading(true);
    try {
      const { clientSecret } = await paymentService.createPaymentIntent(transactionId);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Share Fair',
        returnURL: 'sharefair://payment/return',
      });

      if (initError) {
        Alert.alert(t('common.error'), initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert(t('payment.failed'), presentError.message);
        }
      } else {
        Alert.alert(t('payment.success'), '', [
          { text: 'OK', onPress: onSuccess },
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed';
      Alert.alert(t('common.error'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Text style={[styles.amount, dark && styles.textDark]}>
        ${(amount / 100).toFixed(2)} {currency.toUpperCase()}
      </Text>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePay}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('payment.payNow')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  containerDark: { backgroundColor: '#1e1e2e' },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  textDark: { color: '#f0f0f0' },
  button: {
    backgroundColor: '#635BFF',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
