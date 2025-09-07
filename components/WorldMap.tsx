'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
}) as React.ComponentType<{
  profiles: Profile[]
  selectedProfile?: Profile | null
  mapCenter?: [number, number] | null
}>

// Error boundary component for map errors
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.warn('Map error caught:', error, errorInfo)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Map failed to load</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
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

interface WorldMapProps {
  profiles: Profile[]
  selectedProfile?: Profile | null
  mapCenter?: [number, number] | null
}

export function WorldMap({ profiles, selectedProfile, mapCenter }: WorldMapProps) {
  const [mounted, setMounted] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    setMounted(true)
    setMapError(false)
  }, [])

  useEffect(() => {
    // Reset error state when profiles change
    setMapError(false)
  }, [profiles])

  if (!mounted) {
    return <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
  }

  if (mapError) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Unable to load map</p>
          <button 
            onClick={() => setMapError(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 w-full">
      <div className="h-full w-full rounded-lg overflow-hidden">
        <MapErrorBoundary onError={() => setMapError(true)}>
          <DynamicMap 
            profiles={profiles} 
            selectedProfile={selectedProfile}
            mapCenter={mapCenter}
          />
        </MapErrorBoundary>
      </div>
    </div>
  )
}
