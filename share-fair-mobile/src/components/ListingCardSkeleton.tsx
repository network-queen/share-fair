import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface Props {
  theme?: 'light' | 'dark';
}

export const ListingCardSkeleton: React.FC<Props> = ({ theme = 'light' }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const dark = theme === 'dark';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  const bg = dark ? '#2d2d3e' : '#e5e7eb';

  return (
    <View style={[styles.card, dark && styles.cardDark]}>
      <Animated.View style={[styles.image, { backgroundColor: bg, opacity }]} />
      <View style={styles.body}>
        <Animated.View style={[styles.line, { width: '80%', backgroundColor: bg, opacity }]} />
        <Animated.View style={[styles.line, { width: '50%', backgroundColor: bg, opacity, marginTop: 8 }]} />
        <Animated.View style={[styles.line, { width: '30%', backgroundColor: bg, opacity, marginTop: 12 }]} />
      </View>
    </View>
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#1e1e2e',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 0,
  },
  body: {
    padding: 12,
  },
  line: {
    height: 14,
    borderRadius: 6,
  },
});
