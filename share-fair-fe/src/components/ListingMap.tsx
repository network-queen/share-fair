import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import type { Listing } from '../types'

// Fix default marker icon issue with webpack/vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

interface ListingMapProps {
  listings: Listing[]
  userLocation?: { lat: number; lng: number } | null
  className?: string
}

const ListingMap = ({ listings, userLocation, className = 'h-[500px]' }: ListingMapProps) => {
  const validListings = listings.filter(
    (l) => l.latitude && l.longitude && (l.latitude !== 0 || l.longitude !== 0)
  )

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : validListings.length > 0
      ? [validListings[0].latitude, validListings[0].longitude]
      : [50.45, 30.52] // Kyiv default

  return (
    <div className={className}>
      <MapContainer center={center} zoom={13} className="h-full w-full rounded-lg">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validListings.map((listing) => (
          <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <div className="min-w-[150px]">
                <Link to={`/listing/${listing.id}`} className="font-bold text-primary hover:underline">
                  {listing.title}
                </Link>
                <p className="text-sm text-gray-600 mt-1">${listing.price}</p>
                {listing.distanceKm != null && (
                  <p className="text-xs text-gray-500">{listing.distanceKm.toFixed(1)} km</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'bg-blue-500 rounded-full border-2 border-white shadow-lg',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default ListingMap
