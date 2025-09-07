'use client'

import { useState, useEffect, useRef } from 'react'

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
  place_id: number
}

interface LocationAutocompleteProps {
  value: string
  onChange: (location: string, lat: number, lon: number) => void
  placeholder?: string
  required?: boolean
}

export function LocationAutocomplete({ 
  value, 
  onChange, 
  placeholder = "e.g., Toronto, ON, Canada",
  required = true 
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Debounced search function
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`
      )
      const data = await response.json()
      setSuggestions(data)
      setShowSuggestions(true)
      setSelectedIndex(-1)
    } catch (error) {
      console.error('Error fetching locations:', error)
      setSuggestions([])
    }
    setIsLoading(false)
  }

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Set new debounce
    debounceRef.current = setTimeout(() => {
      searchLocations(newValue)
    }, 300)
  }

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.display_name)
    setShowSuggestions(false)
    setSuggestions([])
    onChange(suggestion.display_name, parseFloat(suggestion.lat), parseFloat(suggestion.lon))
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true)
          }
        }}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === selectedIndex
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-900">
                {suggestion.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length >= 3 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">
            No locations found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  )
}
