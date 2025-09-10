'use client'

import { useState } from 'react'
import { EditProfileForm } from './EditProfileForm'
import { PeopleSearch } from './PeopleSearch'
import { WorldMap } from './WorldMapNew'

type AllProfilesProfile = {
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

interface CurrentUserProfile {
  id: string
  name: string
  program: string
  graduationYear: string | null
  currentTerm: string | null
  location: string
  latitude: number
  longitude: number
}

interface ProfileSectionProps {
  currentUserProfile: CurrentUserProfile
  allProfiles: AllProfilesProfile[]
}

export function ProfileSection({ currentUserProfile, allProfiles }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<AllProfilesProfile | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null)

  const handlePersonSelect = (profile: AllProfilesProfile) => {
    setSelectedProfile(profile)
    setMapCenter([profile.latitude, profile.longitude])
  }

  const handleClearSearch = () => {
    setSelectedProfile(null)
    setMapCenter(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              CCF Members Around the World
            </h2>
            <p className="text-gray-600">
              {allProfiles.length} members have shared their locations
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        
        {/* Search Component */}
        <PeopleSearch 
          profiles={allProfiles}
          onPersonSelect={handlePersonSelect}
          onClearSearch={handleClearSearch}
        />
        
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Edit Your Profile
            </h3>
            <EditProfileForm 
              profile={currentUserProfile} 
              onCancel={() => setIsEditing(false)} 
            />
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <WorldMap 
          profiles={allProfiles}
          selectedProfile={selectedProfile}
          mapCenter={mapCenter}
        />
      </div>
    </div>
  )
}
