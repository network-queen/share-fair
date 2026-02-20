import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, type MapPressEvent } from 'react-native-maps';

interface Props {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  theme?: 'light' | 'dark';
}

const DEFAULT_REGION = {
  latitude: 50.45,
  longitude: 30.52,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const LocationPicker: React.FC<Props> = ({
  latitude,
  longitude,
  onLocationChange,
  theme = 'light',
}) => {
  const [marker, setMarker] = useState(
    latitude && longitude ? { latitude, longitude } : null
  );

  const handlePress = (e: MapPressEvent) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setMarker({ latitude: lat, longitude: lng });
    onLocationChange(lat, lng);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={
          latitude && longitude
            ? { latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
            : DEFAULT_REGION
        }
        onPress={handlePress}
      >
        {marker && (
          <Marker
            coordinate={marker}
            draggable
            onDragEnd={(e) => {
              const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
              setMarker({ latitude: lat, longitude: lng });
              onLocationChange(lat, lng);
            }}
          />
        )}
      </MapView>
      {!marker && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Tap on the map to set location</Text>
        </View>
      )}
      {marker && (
        <View style={styles.coords}>
          <Text style={styles.coordsText}>
            {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  map: {
    width: '100%',
    height: 220,
  },
  hint: {
    padding: 8,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  hintText: {
    color: '#6b7280',
    fontSize: 12,
  },
  coords: {
    padding: 8,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
  },
  coordsText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '500',
  },
});
