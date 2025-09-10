'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'

// Only import the map on the client side to avoid SSR issues
const Map = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
}) as React.ComponentType<{
  profiles: Profile[]
  selectedProfile?: Profile | null
  mapCenter?: [number, number] | null
}>

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

interface WorldMapProps {
  profiles: Profile[]
  selectedProfile?: Profile | null
  mapCenter?: [number, number] | null
}

export function WorldMap({ profiles, selectedProfile, mapCenter }: WorldMapProps) {
  const [mounted, setMounted] = useState(false)
  const [key, setKey] = useState(0)
  const errorCount = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset map if we get too many errors
  useEffect(() => {
    const handleError = () => {
      errorCount.current += 1
      if (errorCount.current > 3) {
        console.log('Resetting map due to multiple errors')
        setKey(prev => prev + 1)
        errorCount.current = 0
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (!mounted) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-96 w-full">
      <Map
        key={key}
        profiles={profiles}
        selectedProfile={selectedProfile}
        mapCenter={mapCenter}
      />
    </div>
  )
}
