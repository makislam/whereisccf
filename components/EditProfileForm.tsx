'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LocationAutocomplete } from './LocationAutocomplete'

interface Profile {
  id: string
  name: string
  program: string
  graduationYear: string | null
  currentTerm: string | null
  location: string
  latitude: number
  longitude: number
}

interface EditProfileFormProps {
  profile: Profile
  onCancel: () => void
}

export function EditProfileForm({ profile, onCancel }: EditProfileFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: profile.latitude,
    lon: profile.longitude
  })
  const [formData, setFormData] = useState({
    name: profile.name,
    program: profile.program,
    graduationYear: profile.graduationYear || '',
    currentTerm: profile.currentTerm || '',
    location: profile.location,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit the form with validated coordinates
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          latitude: coordinates.lat,
          longitude: coordinates.lon,
        }),
      })

      if (response.ok) {
        router.refresh()
        onCancel() // Close the edit form
      } else {
        alert('Failed to update profile. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    }

    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLocationChange = (location: string, lat: number, lon: number) => {
    setFormData({
      ...formData,
      location,
    })
    setCoordinates({ lat, lon })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
          Program
        </label>
        <input
          type="text"
          id="program"
          name="program"
          value={formData.program}
          onChange={handleChange}
          required
          placeholder="e.g., Computer Science, Engineering, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
            Graduation Year
          </label>
          <input
            type="text"
            id="graduationYear"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            placeholder="e.g., 2025"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="currentTerm" className="block text-sm font-medium text-gray-700 mb-1">
            Current Term (if applicable)
          </label>
          <input
            type="text"
            id="currentTerm"
            name="currentTerm"
            value={formData.currentTerm}
            onChange={handleChange}
            placeholder="e.g., Fall 2024"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <LocationAutocomplete
          value={formData.location}
          onChange={handleLocationChange}
          placeholder="e.g., Toronto, ON, Canada"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Search and select your city from the dropdown to ensure it appears correctly on the map
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
