import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';

const MAX_IMAGES = 5;

interface Props {
  images: string[];
  onImagesChange: (images: string[]) => void;
  theme?: 'light' | 'dark';
}

export const ImageUploadGrid: React.FC<Props> = ({ images, onImagesChange, theme = 'light' }) => {
  const { t } = useTranslation();
  const dark = theme === 'dark';

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert(t('common.warning'), t('listing.maxImagesReached'));
      return;
    }

    Alert.alert(t('listing.addPhoto'), '', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect: [4, 3],
          });
          if (!result.canceled && result.assets[0]) {
            onImagesChange([...images, result.assets[0].uri]);
          }
        },
      },
      {
        text: 'Photo Library',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') return;
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsMultipleSelection: true,
            selectionLimit: MAX_IMAGES - images.length,
          });
          if (!result.canceled) {
            const uris = result.assets.map((a) => a.uri);
            onImagesChange([...images, ...uris].slice(0, MAX_IMAGES));
          }
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.grid}>
      {images.map((uri, index) => (
        <View key={uri + index} style={styles.imageWrapper}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          {index === 0 && (
            <View style={styles.coverBadge}>
              <Text style={styles.coverText}>Cover</Text>
            </View>
          )}
          <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
            <Text style={styles.removeBtnText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      {images.length < MAX_IMAGES && (
        <TouchableOpacity
          style={[styles.addButton, dark && styles.addButtonDark]}
          onPress={pickImage}
        >
          <Text style={[styles.addIcon, dark && styles.addIconDark]}>+</Text>
          <Text style={[styles.addLabel, dark && styles.addIconDark]}>
            {t('listing.addPhoto')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  coverText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  addButtonDark: {
    borderColor: '#374151',
    backgroundColor: '#111827',
  },
  addIcon: {
    fontSize: 28,
    color: '#9ca3af',
    lineHeight: 32,
  },
  addIconDark: {
    color: '#6b7280',
  },
  addLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
});
