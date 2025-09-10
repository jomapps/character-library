'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { ArrowLeft, User, Star, ExternalLink } from 'lucide-react'

interface MediaItem {
  id: string
  filename: string
  url: string
  alt: string
  qualityScore?: number
  consistencyScore?: number
  shotType?: string
  tags?: string
  isCoreReference?: boolean
}

interface Character {
  id: string
  name: string
  characterId: string
  status: string
  biography?: string
  personality?: string
  age?: string
  height?: string
  eyeColor?: string
  hairColor?: string
  masterReferenceImage?: MediaItem
  imageGallery?: Array<{
    imageFile: MediaItem
    isCoreReference: boolean
    shotType?: string
    tags?: string
    qualityScore?: number
    consistencyScore?: number
  }>
  masterReferenceProcessed?: boolean
  coreSetGenerated?: boolean
}

export default function CharacterProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const characterId = params.characterId as string

  const [character, setCharacter] = useState<Character | null>(null)
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCharacter()
  }, [characterId])

  const fetchCharacter = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/v1/characters/${characterId}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch character: ${response.status}`)
      }

      const data = await response.json()
      setCharacter(data)
      
      // Set initial selected image to master reference
      if (data.masterReferenceImage) {
        setSelectedImage(data.masterReferenceImage)
      } else if (data.imageGallery && data.imageGallery.length > 0) {
        setSelectedImage(data.imageGallery[0].imageFile)
      }
    } catch (err) {
      console.error('Failed to fetch character:', err)
      setError(err instanceof Error ? err.message : 'Failed to load character')
    } finally {
      setLoading(false)
    }
  }

  // Organize media: master reference first, then core set, then others
  const organizedMedia = character ? (() => {
    const media: MediaItem[] = []
    
    // Add master reference first
    if (character.masterReferenceImage) {
      media.push({
        ...character.masterReferenceImage,
        isCoreReference: false,
        shotType: 'Master Reference'
      })
    }
    
    // Add core set images
    const coreSetImages = character.imageGallery?.filter(item => item.isCoreReference) || []
    coreSetImages.forEach(item => {
      media.push({
        ...item.imageFile,
        isCoreReference: true,
        shotType: item.shotType || 'Core Set',
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore
      })
    })
    
    // Add other images
    const otherImages = character.imageGallery?.filter(item => !item.isCoreReference) || []
    otherImages.forEach(item => {
      media.push({
        ...item.imageFile,
        isCoreReference: false,
        shotType: item.shotType || 'Generated',
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore
      })
    })
    
    return media
  })() : []

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading character profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !character) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">Character Not Found</h2>
            <p className="text-gray-500 mb-4">{error || 'The requested character could not be found.'}</p>
            <button
              onClick={() => router.push('/dashboard/character-profile')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Media Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => router.push('/dashboard/character-profile')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Search
          </button>
          <h2 className="text-lg font-semibold text-gray-900 truncate">{character.name}</h2>
          <p className="text-sm text-gray-500">CharacterID: {character.characterId}</p>
          <p className="text-xs text-gray-400">DB ID: {character.id}</p>
          <p className="text-xs text-gray-400 mt-1">{organizedMedia.length} images</p>
        </div>

        {/* Media Thumbnails */}
        <div className="flex-1 overflow-y-auto p-2">
          {organizedMedia.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No images available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {organizedMedia.map((media, index) => (
                <button
                  key={`${media.id}-${index}`}
                  onClick={() => setSelectedImage(media)}
                  className={`w-full p-2 rounded-lg border-2 transition-colors ${
                    selectedImage?.id === media.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="aspect-square mb-2 rounded-md overflow-hidden bg-gray-100">
                    <img
                      src={media.url}
                      alt={media.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {media.shotType}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {media.filename}
                    </p>
                    {(media.qualityScore || media.consistencyScore) && (
                      <div className="flex items-center space-x-2 mt-1">
                        {media.qualityScore && (
                          <span className="text-xs text-green-600">
                            Q: {Math.round(media.qualityScore)}
                          </span>
                        )}
                        {media.consistencyScore && (
                          <span className="text-xs text-blue-600">
                            C: {Math.round(media.consistencyScore)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Character Info Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{character.name}</h1>
              <p className="text-gray-600">Character ID: {character.characterId}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  character.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {character.status}
                </span>
                {character.masterReferenceProcessed && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Star className="h-3 w-3 mr-1" />
                    Master Processed
                  </span>
                )}
                {character.coreSetGenerated && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    360° Core Set
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Selected Image */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedImage?.shotType || 'Selected Image'}
                      </h3>
                      {selectedImage && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(selectedImage.url, '_blank')}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="View Full Size"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {selectedImage ? (
                      <div>
                        <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={selectedImage.url}
                            alt={selectedImage.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Filename:</span>
                            <span className="ml-2 text-gray-600">{selectedImage.filename}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">URL:</span>
                            <a 
                              href={selectedImage.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800 break-all"
                            >
                              {selectedImage.url}
                            </a>
                          </div>
                          {selectedImage.qualityScore && (
                            <div>
                              <span className="font-medium text-gray-700">Quality Score:</span>
                              <span className="ml-2 text-green-600">{Math.round(selectedImage.qualityScore)}/100</span>
                            </div>
                          )}
                          {selectedImage.consistencyScore && (
                            <div>
                              <span className="font-medium text-gray-700">Consistency Score:</span>
                              <span className="ml-2 text-blue-600">{Math.round(selectedImage.consistencyScore)}/100</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-500">No image selected</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Character Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Character Details</h3>
                  <div className="space-y-4">
                    {character.biography && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Biography</h4>
                        <p className="text-sm text-gray-600">{character.biography}</p>
                      </div>
                    )}
                    {character.personality && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Personality</h4>
                        <p className="text-sm text-gray-600">{character.personality}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {character.age && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Age</h4>
                          <p className="text-sm text-gray-600">{character.age}</p>
                        </div>
                      )}
                      {character.height && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Height</h4>
                          <p className="text-sm text-gray-600">{character.height}</p>
                        </div>
                      )}
                      {character.eyeColor && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Eye Color</h4>
                          <p className="text-sm text-gray-600">{character.eyeColor}</p>
                        </div>
                      )}
                      {character.hairColor && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Hair Color</h4>
                          <p className="text-sm text-gray-600">{character.hairColor}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
