'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
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

// Create colored default marker
const createPinDropIcon = (isSelected: boolean = false) => {
  if (typeof window === 'undefined') return null
  
  const color = isSelected ? 'red' : 'blue'
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

// Component to control map view without re-rendering
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Delay the map update to avoid conflicts
    timeoutRef.current = setTimeout(() => {
      try {
        // Check if map exists and has a valid container
        if (map && map.getContainer && typeof map.getContainer === 'function') {
          const container = map.getContainer()
          if (container && container.parentNode && !container.classList?.contains('leaflet-container-removed')) {
            map.setView(center, zoom, { animate: true, duration: 1 })
          }
        }
      } catch (error) {
        // Silently handle errors during component transitions
        console.warn('Map setView error:', error)
      }
    }, 100)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [map, center, zoom])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return null
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
    email: string | null
  }
}

interface MapProps {
  profiles: Profile[]
  selectedProfile?: Profile | null
  mapCenter?: [number, number] | null
}

// Function to offset markers for the same location
function offsetMarkersForSameLocation(profiles: Profile[]): (Profile & { offsetLat: number; offsetLng: number })[] {
  // Group profiles by location (using lat/lng with some precision to account for slight differences)
  const locationGroups: { [key: string]: Profile[] } = {}
  
  profiles.forEach(profile => {
    // Round to 4 decimal places to group nearby locations (roughly ~10m precision)
    const locationKey = `${profile.latitude.toFixed(4)},${profile.longitude.toFixed(4)}`
    if (!locationGroups[locationKey]) {
      locationGroups[locationKey] = []
    }
    locationGroups[locationKey].push(profile)
  })
  
  const offsetProfiles: (Profile & { offsetLat: number; offsetLng: number })[] = []
  
  Object.values(locationGroups).forEach(group => {
    if (group.length === 1) {
      // Single person at this location - no offset needed
      offsetProfiles.push({
        ...group[0],
        offsetLat: group[0].latitude,
        offsetLng: group[0].longitude
      })
    } else {
      // Multiple people at same location - arrange in a circle
      const radius = 0.01 // Roughly 1km offset radius
      const centerLat = group[0].latitude
      const centerLng = group[0].longitude
      
      group.forEach((profile, index) => {
        if (index === 0) {
          // First person stays at the original location
          offsetProfiles.push({
            ...profile,
            offsetLat: centerLat,
            offsetLng: centerLng
          })
        } else {
          // Arrange others in a circle around the center
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

export default function Map({ profiles, selectedProfile, mapCenter }: MapProps) {
  const [isIconsLoaded, setIsIconsLoaded] = useState(false)
  
  // Initialize icons on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsIconsLoaded(true)
    }
  }, [])

  const offsetProfiles = offsetMarkersForSameLocation(profiles)
  
  // Determine map center and zoom
  const center: [number, number] = mapCenter || [20, 0]
  const zoom = mapCenter ? 10 : 2

  // Don't render until icons are loaded to prevent hydration mismatch
  if (!isIconsLoaded) {
    return (
      <div className="h-full w-full bg-gray-200 rounded-lg flex items-center justify-center">
        <p>Loading map...</p>
      </div>
    )
  }
  
  return (
    <MapContainer
      center={[20, 0]} // Initial center, will be controlled by MapController
      zoom={2} // Initial zoom, will be controlled by MapController
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
      key={`map-${profiles.length}-${selectedProfile?.id || 'none'}`} // Force remount when data changes significantly
    >
      <MapController center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {offsetProfiles.map((profile) => {
        const isSelected = selectedProfile?.id === profile.id
        const pinDropIcon = createPinDropIcon(isSelected)
        
        return (
          <Marker
            key={`${profile.id}-${isSelected ? 'selected' : 'normal'}`}
            position={[profile.offsetLat, profile.offsetLng]}
            icon={pinDropIcon || undefined}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  {profile.user.image ? (
                    <img 
                      src={profile.user.image} 
                      alt={profile.name}
                      className="w-16 h-16 rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 border-2 border-blue-500 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <p className="text-gray-600">{profile.program}</p>
                {profile.graduationYear && (
                  <p className="text-gray-500">Class of {profile.graduationYear}</p>
                )}
                {profile.currentTerm && (
                  <p className="text-gray-500">Current: {profile.currentTerm}</p>
                )}
                <p className="text-gray-500 mt-1">{profile.location}</p>
                {profile.user.email && (
                  <div className="mt-3">
                    <a 
                      href={`mailto:${profile.user.email}?subject=Hi from Where is CCF!&body=Hi ${profile.name},%0D%0A%0D%0AI found your profile on Where is CCF and wanted to reach out!`}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      title={`Send an email to ${profile.name}`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact {profile.name.split(' ')[0]}
                    </a>
                  </div>
                )}
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
