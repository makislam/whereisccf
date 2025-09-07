'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

// Create icons safely
const createDefaultIcon = () => {
  if (typeof window === 'undefined') return undefined
  return new L.Icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

const createHighlightedIcon = () => {
  if (typeof window === 'undefined') return undefined
  return new L.Icon({
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

interface Profile {
  id: string
  name: string
  program: string
  graduationYear: string | null
  currentTerm: string | null
  location: string
  latitude: number
  longitude: number
  user: {
    name: string | null
    image: string | null
  }
}

interface MapComponentProps {
  profiles: Profile[]
  selectedProfile?: Profile | null
  mapCenter?: [number, number] | null
}

// Function to offset markers for the same location
function offsetMarkersForSameLocation(profiles: Profile[]): (Profile & { offsetLat: number; offsetLng: number })[] {
  const locationGroups: { [key: string]: Profile[] } = {}
  
  profiles.forEach(profile => {
    const locationKey = `${profile.latitude.toFixed(4)},${profile.longitude.toFixed(4)}`
    if (!locationGroups[locationKey]) {
      locationGroups[locationKey] = []
    }
    locationGroups[locationKey].push(profile)
  })
  
  const offsetProfiles: (Profile & { offsetLat: number; offsetLng: number })[] = []
  
  Object.values(locationGroups).forEach(group => {
    if (group.length === 1) {
      offsetProfiles.push({
        ...group[0],
        offsetLat: group[0].latitude,
        offsetLng: group[0].longitude
      })
    } else {
      const radius = 0.01
      const centerLat = group[0].latitude
      const centerLng = group[0].longitude
      
      group.forEach((profile, index) => {
        if (index === 0) {
          offsetProfiles.push({
            ...profile,
            offsetLat: centerLat,
            offsetLng: centerLng
          })
        } else {
          const angle = (2 * Math.PI * index) / group.length
          const offsetLat = centerLat + radius * Math.sin(angle)
          const offsetLng = centerLng + radius * Math.cos(angle)
          
          offsetProfiles.push({
            ...profile,
            offsetLat,
            offsetLng
          })
        }
      })
    }
  })
  
  return offsetProfiles
}

export default function MapComponent({ profiles, selectedProfile, mapCenter }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const [icons, setIcons] = useState<{ default: L.Icon | null; highlighted: L.Icon | null }>({
    default: null,
    highlighted: null
  })

  // Initialize icons on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIcons({
        default: createDefaultIcon() || null,
        highlighted: createHighlightedIcon() || null
      })
    }
  }, [])

  // Handle map view changes with proper error handling
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      try {
        // Check if map is still valid before attempting operations
        const map = mapRef.current
        if (map && map.getContainer && typeof map.getContainer === 'function') {
          const container = map.getContainer()
          if (container && container.parentNode) {
            map.setView(mapCenter, 10, { animate: true })
          }
        }
      } catch (error) {
        console.warn('Could not set map view:', error)
      }
    }
  }, [mapCenter])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (error) {
          // Silently handle cleanup errors
        }
        mapRef.current = null
      }
    }
  }, [])

  const offsetProfiles = offsetMarkersForSameLocation(profiles)
  
  const center: [number, number] = [20, 0]
  const zoom = 2

  // Don't render until icons are loaded
  if (!icons.default || !icons.highlighted) {
    return (
      <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
      ref={(map) => {
        if (map) {
          mapRef.current = map
        }
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {offsetProfiles.map((profile) => {
        const isSelected = selectedProfile?.id === profile.id
        const icon = isSelected ? icons.highlighted : icons.default
        
        return (
          <Marker
            key={profile.id}
            position={[profile.offsetLat, profile.offsetLng]}
            icon={icon || undefined}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <p className="text-gray-600">{profile.program}</p>
                {profile.graduationYear && (
                  <p className="text-gray-500">Class of {profile.graduationYear}</p>
                )}
                {profile.currentTerm && (
                  <p className="text-gray-500">Current: {profile.currentTerm}</p>
                )}
                <p className="text-gray-500 mt-1">{profile.location}</p>
                {isSelected && (
                  <p className="text-red-600 font-medium mt-2">📍 Selected from search</p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
