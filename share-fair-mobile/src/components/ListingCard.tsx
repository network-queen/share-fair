import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import type { Listing } from '../types';

interface Props {
  listing: Listing;
  theme?: 'light' | 'dark';
}

const PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image';

export const ListingCard: React.FC<Props> = ({ listing, theme = 'light' }) => {
  const dark = theme === 'dark';

  return (
    <TouchableOpacity
      style={[styles.card, dark && styles.cardDark]}
      onPress={() => router.push(`/listing/${listing.id}`)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: listing.images?.[0] || PLACEHOLDER }}
        style={styles.image}
        resizeMode="cover"
      />
      {listing.listingType === 'FREE' || listing.price === 0 ? (
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>FREE</Text>
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={[styles.title, dark && styles.textDark]} numberOfLines={2}>
          {listing.title}
        </Text>
        <Text style={[styles.neighborhood, dark && styles.subDark]} numberOfLines={1}>
          {listing.neighborhood}
          {listing.distanceKm != null ? ` · ${listing.distanceKm.toFixed(1)} km` : ''}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {listing.listingType === 'FREE' || listing.price === 0
              ? 'Free'
              : listing.pricePerDay
              ? `$${listing.pricePerDay}/day`
              : `$${listing.price}`}
          </Text>
          <Text style={[styles.condition, dark && styles.subDark]}>{listing.condition}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1e1e2e',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  freeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  textDark: {
    color: '#f0f0f0',
  },
  neighborhood: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  subDark: {
    color: '#9ca3af',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  condition: {
    fontSize: 11,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
