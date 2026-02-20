import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import carbonService, { type LeaderboardEntry } from '../services/carbonService';

interface Props {
  theme?: 'light' | 'dark';
}

export const CarbonLeaderboard: React.FC<Props> = ({ theme = 'light' }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const dark = theme === 'dark';

  useEffect(() => {
    carbonService
      .getLeaderboard(10)
      .then(setEntries)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <View style={[styles.container, dark && styles.containerDark]}>
      <Text style={[styles.heading, dark && styles.textDark]}>{t('carbon.leaderboard')}</Text>
      {loading ? (
        <ActivityIndicator color="#10B981" style={{ marginVertical: 16 }} />
      ) : entries.length === 0 ? (
        <Text style={[styles.empty, dark && styles.subDark]}>{t('carbon.noHistory')}</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.userId}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.medal}>{medals[index] || `${index + 1}.`}</Text>
              <Text style={[styles.name, dark && styles.textDark]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.carbon}>{item.totalCarbonSaved.toFixed(1)} kg</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#052e16',
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 12,
  },
  textDark: {
    color: '#d1fae5',
  },
  subDark: {
    color: '#6ee7b7',
  },
  empty: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  medal: {
    fontSize: 18,
    width: 28,
  },
  name: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a2e',
  },
  carbon: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});
