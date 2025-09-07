'use client'

import { useState, useEffect } from 'react'

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

interface SearchResult extends Profile {
  highlighted?: boolean
}

interface PeopleSearchProps {
  profiles: Profile[]
  onPersonSelect: (profile: Profile) => void
  onClearSearch: () => void
}

// Simple SVG icons
const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CloseIcon = () => (
  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface PeopleSearchProps {
  profiles: Profile[]
  onPersonSelect: (profile: Profile) => void
  onClearSearch: () => void
}

export function PeopleSearch({ profiles, onPersonSelect, onClearSearch }: PeopleSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)

  // Filter profiles based on search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const filtered = profiles.filter(profile => {
      const searchLower = searchTerm.toLowerCase()
      return (
        profile.name.toLowerCase().includes(searchLower) ||
        profile.program.toLowerCase().includes(searchLower) ||
        profile.location.toLowerCase().includes(searchLower) ||
        (profile.graduationYear && profile.graduationYear.includes(searchTerm)) ||
        (profile.currentTerm && profile.currentTerm.toLowerCase().includes(searchLower))
      )
    })

    setSearchResults(filtered)
    setShowResults(filtered.length > 0)
  }, [searchTerm, profiles])

  const handlePersonClick = (profile: Profile) => {
    onPersonSelect(profile)
    setShowResults(false)
    setSearchTerm(`${profile.name} - ${profile.location}`)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
    onClearSearch()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // If clearing the input, also clear the search
    if (value === '') {
      onClearSearch()
    }
  }

  return (
    <div className="relative mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search by name, program, location, or graduation year..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-200">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </div>
          {searchResults.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handlePersonClick(profile)}
              className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.program}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{profile.location}</span>
                    {profile.graduationYear && (
                      <>
                        <span className="mx-2">•</span>
                        <span>Class of {profile.graduationYear}</span>
                      </>
                    )}
                  </div>
                  {profile.currentTerm && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {profile.currentTerm}
                    </p>
                  )}
                </div>
                <div className="ml-3 text-xs text-blue-600 font-medium">
                  View on map
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {searchTerm.length >= 2 && searchResults.length === 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No people found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  )
}
