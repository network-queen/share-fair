import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import reviewService, { type CreateReviewData } from '../services/reviewService';

interface Props {
  transactionId: string;
  revieweeId: string;
  onSubmitted?: () => void;
  theme?: 'light' | 'dark';
}

export const ReviewForm: React.FC<Props> = ({
  transactionId,
  revieweeId,
  onSubmitted,
  theme = 'light',
}) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const dark = theme === 'dark';

  const submit = async () => {
    if (rating === 0) {
      Alert.alert(t('common.warning'), t('review.invalidRating'));
      return;
    }
    setLoading(true);
    try {
      const data: CreateReviewData = { transactionId, revieweeId, rating, comment };
      await reviewService.createReview(data);
      onSubmitted?.();
    } catch {
      Alert.alert(t('common.error'), t('validation.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Text style={[styles.title, dark && styles.textDark]}>{t('review.leaveReview')}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating && styles.starFilled]}>
              {star <= rating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={[styles.input, dark && styles.inputDark]}
        placeholder={t('review.commentPlaceholder')}
        placeholderTextColor={dark ? '#6b7280' : '#9ca3af'}
        value={comment}
        onChangeText={setComment}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={submit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('review.submit')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  containerDark: { backgroundColor: '#1e1e2e' },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 12,
  },
  textDark: { color: '#f0f0f0' },
  stars: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  star: {
    fontSize: 28,
    color: '#d1d5db',
  },
  starFilled: {
    color: '#FBBF24',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a2e',
    minHeight: 80,
    marginBottom: 12,
  },
  inputDark: {
    borderColor: '#374151',
    backgroundColor: '#111827',
    color: '#f0f0f0',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
