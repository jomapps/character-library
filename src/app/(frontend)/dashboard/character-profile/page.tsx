'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Search, User, Image as ImageIcon } from 'lucide-react'

interface Character {
  id: string
  name: string
  characterId: string
  masterReferenceImage?: {
    id: string
    filename: string
    url: string
    alt: string
  }
  imageGallery?: Array<{
    imageFile: {
      id: string
      filename: string
      url: string
      alt: string
    }
    isCoreReference: boolean
    shotType?: string
    tags?: string
    qualityScore?: number
    consistencyScore?: number
  }>
}

export default function CharacterProfilePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchCharacters = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/characters?search=${encodeURIComponent(term)}&limit=10`)
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      setSearchResults(data.docs || [])
    } catch (err) {
      console.error('Character search failed:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCharacters(searchTerm)
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleCharacterSelect = (character: Character) => {
    router.push(`/dashboard/character-profile/${character.id}`)
  }

  return (
    <DashboardLayout>
      {/* Sidebar - Search */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Character Profile</h2>
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or character ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-500">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && searchResults.length === 0 && searchTerm && (
            <div className="p-4 text-center text-gray-500">
              <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No characters found</p>
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <div className="p-2">
              {searchResults.map((character) => (
                <button
                  key={character.id}
                  onClick={() => handleCharacterSelect(character)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {character.masterReferenceImage ? (
                      <img
                        src={character.masterReferenceImage.url}
                        alt={character.masterReferenceImage.alt}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {character.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {character.characterId}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searchTerm && (
            <div className="p-8 text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Character</h3>
              <p className="text-sm">Search for a character by name or ID to view their profile and media gallery.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-medium text-gray-900 mb-2">
            Character Profile
          </h2>
          <p className="text-gray-500 max-w-md">
            Search and select a character from the sidebar to view their complete profile, 
            including all generated images, master reference, and core set media.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
