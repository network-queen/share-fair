import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useTranslation } from 'react-i18next'

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  onChange: (lat: number, lng: number) => void
}

const DraggableMarker = ({
  position,
  onChange,
}: {
  position: [number, number]
  onChange: (lat: number, lng: number) => void
}) => {
  const [pos, setPos] = useState(position)

  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng])
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })

  return (
    <Marker
      position={pos}
      draggable
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const latlng = marker.getLatLng()
          setPos([latlng.lat, latlng.lng])
          onChange(latlng.lat, latlng.lng)
        },
      }}
    />
  )
}

const LocationPicker = ({ latitude, longitude, onChange }: LocationPickerProps) => {
  const { t } = useTranslation()
  const defaultLat = latitude && latitude !== 0 ? latitude : 50.45
  const defaultLng = longitude && longitude !== 0 ? longitude : 30.52

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">{t('listing.pickLocation')}</p>
      <div className="h-[300px]">
        <MapContainer center={[defaultLat, defaultLng]} zoom={13} className="h-full w-full rounded-lg">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={[defaultLat, defaultLng]} onChange={onChange} />
        </MapContainer>
      </div>
    </div>
  )
}

export default LocationPicker
