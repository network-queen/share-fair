import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TrustTier } from '../types';

const TIER_COLORS: Record<TrustTier, { bg: string; text: string }> = {
  BRONZE: { bg: '#cd7f32', text: '#fff' },
  SILVER: { bg: '#c0c0c0', text: '#333' },
  GOLD: { bg: '#ffd700', text: '#333' },
  PLATINUM: { bg: '#e5e4e2', text: '#333' },
};

interface Props {
  tier: TrustTier;
  score?: number;
  size?: 'sm' | 'md';
}

export const TrustBadge: React.FC<Props> = ({ tier, score, size = 'md' }) => {
  const colors = TIER_COLORS[tier] || TIER_COLORS.BRONZE;
  const small = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, small && styles.badgeSm]}>
      <Text style={[styles.text, { color: colors.text }, small && styles.textSm]}>
        {tier}{score != null ? ` · ${score}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontWeight: '700',
    fontSize: 13,
  },
  textSm: {
    fontSize: 11,
  },
});
