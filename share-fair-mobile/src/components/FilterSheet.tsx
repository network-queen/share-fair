import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SearchParams } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  params: SearchParams;
  onApply: (params: SearchParams) => void;
  neighborhoods: Array<{ id: string; name: string }>;
  categories: string[];
  theme?: 'light' | 'dark';
}

export const FilterSheet: React.FC<Props> = ({
  visible,
  onClose,
  params,
  onApply,
  neighborhoods,
  categories,
  theme = 'light',
}) => {
  const { t } = useTranslation();
  const dark = theme === 'dark';
  const [local, setLocal] = React.useState<SearchParams>(params);

  React.useEffect(() => {
    setLocal(params);
  }, [params, visible]);

  const SORT_OPTIONS = [
    { value: 'relevance', label: t('search.relevance') },
    { value: 'distance', label: t('search.distance') },
    { value: 'price', label: t('search.price') },
    { value: 'date', label: t('search.date') },
  ] as const;

  const chip = (selected: boolean) => [
    styles.chip,
    selected && styles.chipActive,
    dark && styles.chipDark,
    dark && selected && styles.chipActiveDark,
  ];

  const chipText = (selected: boolean) => [
    styles.chipText,
    selected && styles.chipTextActive,
    dark && styles.chipTextDark,
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, dark && styles.sheetDark]}>
          <View style={styles.handle} />
          <Text style={[styles.title, dark && styles.textDark]}>{t('search.title')}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sort */}
            <Text style={[styles.label, dark && styles.subDark]}>{t('search.sortBy')}</Text>
            <View style={styles.chips}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={chip(local.sortBy === opt.value)}
                  onPress={() => setLocal({ ...local, sortBy: opt.value })}
                >
                  <Text style={chipText(local.sortBy === opt.value)}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Categories */}
            {categories.length > 0 && (
              <>
                <Text style={[styles.label, dark && styles.subDark]}>{t('search.category')}</Text>
                <View style={styles.chips}>
                  <TouchableOpacity
                    style={chip(!local.category)}
                    onPress={() => setLocal({ ...local, category: undefined })}
                  >
                    <Text style={chipText(!local.category)}>{t('search.allCategories')}</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={chip(local.category === cat)}
                      onPress={() => setLocal({ ...local, category: cat })}
                    >
                      <Text style={chipText(local.category === cat)}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Neighborhoods */}
            {neighborhoods.length > 0 && (
              <>
                <Text style={[styles.label, dark && styles.subDark]}>{t('search.neighborhood')}</Text>
                <View style={styles.chips}>
                  <TouchableOpacity
                    style={chip(!local.neighborhood)}
                    onPress={() => setLocal({ ...local, neighborhood: undefined })}
                  >
                    <Text style={chipText(!local.neighborhood)}>{t('search.allNeighborhoods')}</Text>
                  </TouchableOpacity>
                  {neighborhoods.map((n) => (
                    <TouchableOpacity
                      key={n.id}
                      style={chip(local.neighborhood === n.name)}
                      onPress={() => setLocal({ ...local, neighborhood: n.name })}
                    >
                      <Text style={chipText(local.neighborhood === n.name)}>{n.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => { onApply(local); onClose(); }}
            >
              <Text style={styles.applyText}>{t('search.searchButton')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  sheetDark: { backgroundColor: '#1e1e2e' },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  textDark: { color: '#f0f0f0' },
  subDark: { color: '#9ca3af' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  chipDark: { borderColor: '#374151', backgroundColor: '#111827' },
  chipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  chipActiveDark: { backgroundColor: '#10B981', borderColor: '#10B981' },
  chipText: { fontSize: 13, color: '#374151' },
  chipTextDark: { color: '#d1d5db' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelText: { color: '#374151', fontWeight: '600' },
  applyBtn: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
  },
  applyText: { color: '#fff', fontWeight: '700' },
});
