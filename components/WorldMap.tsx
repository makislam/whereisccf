'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
})

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
}

export function WorldMap({ profiles }: WorldMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="h-96 w-full">
      <DynamicMap profiles={profiles} />
    </div>
  )
}
