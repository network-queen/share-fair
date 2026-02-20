import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ReviewResponse } from '../services/reviewService';

interface Props {
  reviews: ReviewResponse[];
  theme?: 'light' | 'dark';
}

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <Text style={{ fontSize: 14, color: '#FBBF24' }}>
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </Text>
);

export const ReviewList: React.FC<Props> = ({ reviews, theme = 'light' }) => {
  const { t } = useTranslation();
  const dark = theme === 'dark';

  if (reviews.length === 0) {
    return <Text style={[styles.empty, dark && styles.subDark]}>{t('review.noReviews')}</Text>;
  }

  return (
    <FlatList
      data={reviews}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={[styles.card, dark && styles.cardDark]}>
          <View style={styles.header}>
            <Text style={[styles.reviewer, dark && styles.textDark]}>
              {item.reviewerName || 'Anonymous'}
            </Text>
            <Stars rating={item.rating} />
          </View>
          <Text style={[styles.comment, dark && styles.subDark]}>{item.comment}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  empty: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  subDark: { color: '#9ca3af' },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardDark: { backgroundColor: '#1e1e2e' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewer: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1a1a2e',
  },
  textDark: { color: '#f0f0f0' },
  comment: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 19,
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 6,
  },
});
