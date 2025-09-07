/**
 * Novel Movie Character Sync API
 * 
 * This endpoint handles bidirectional synchronization between Novel Movie and Character Library.
 * It includes conflict detection, resolution strategies, and change tracking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface NovelMovieSyncRequest {
  characterData: {
    name?: string
    status?: 'draft' | 'in_development' | 'ready' | 'in_production' | 'archived'
    biography?: any
    personality?: any
    motivations?: any
    backstory?: any
    age?: number
    height?: string
    weight?: string
    eyeColor?: string
    hairColor?: string
    physicalDescription?: any
    voiceDescription?: any
    clothing?: any
    skills?: Array<{
      skill: string
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
      description?: string
    }>
    relationships?: Array<{
      characterId: string
      characterName?: string
      relationshipType: string
      relationshipDynamic?: string
      storyContext?: string
      visualCues?: string[]
      strength?: number
      conflictLevel?: number
    }>
  }
  lastModified: string
  changeSet: string[]
  conflictResolution?: 'novel-movie-wins' | 'character-library-wins' | 'manual'
}

export interface NovelMovieSyncResponse {
  success: boolean
  character?: any
  syncStatus: 'synced' | 'conflict' | 'error'
  conflicts?: Array<{
    field: string
    novelMovieValue: any
    characterLibraryValue: any
    resolution?: 'novel-movie' | 'character-library' | 'manual'
  }>
  error?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<NovelMovieSyncResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: NovelMovieSyncRequest = await request.json()

    console.log(`Syncing Novel Movie character: ${characterId}`)

    // Get the current character
    const currentCharacter = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 2,
    })

    if (!currentCharacter) {
      return NextResponse.json({
        success: false,
        syncStatus: 'error',
        error: 'Character not found',
      }, { status: 404 })
    }

    // Check for conflicts
    const conflicts: Array<{
      field: string
      novelMovieValue: any
      characterLibraryValue: any
      resolution?: 'novel-movie' | 'character-library' | 'manual'
    }> = []

    const lastModified = new Date(body.lastModified)
    const characterLastModified = new Date(currentCharacter.updatedAt)

    // Detect conflicts by comparing timestamps and changed fields
    if (characterLastModified > lastModified) {
      // Character Library has newer changes, check for conflicts
      for (const field of body.changeSet) {
        const novelMovieValue = getNestedValue(body.characterData, field)
        const characterLibraryValue = getNestedValue(currentCharacter, field)
        
        if (JSON.stringify(novelMovieValue) !== JSON.stringify(characterLibraryValue)) {
          conflicts.push({
            field,
            novelMovieValue,
            characterLibraryValue,
          })
        }
      }
    }

    // Handle conflicts based on resolution strategy
    const updateData = { ...body.characterData }
    const conflictResolution = body.conflictResolution || 
      currentCharacter.novelMovieIntegration?.conflictResolution || 'manual'

    if (conflicts.length > 0) {
      if (conflictResolution === 'manual') {
        // Return conflicts for manual resolution
        return NextResponse.json({
          success: false,
          syncStatus: 'conflict',
          conflicts: conflicts,
        }, { status: 409 })
      } else if (conflictResolution === 'character-library-wins') {
        // Keep Character Library values for conflicted fields
        for (const conflict of conflicts) {
          setNestedValue(updateData, conflict.field, conflict.characterLibraryValue)
          conflict.resolution = 'character-library'
        }
      } else {
        // novel-movie-wins (default behavior)
        for (const conflict of conflicts) {
          conflict.resolution = 'novel-movie'
        }
      }
    }

    // Prepare update data with sync metadata (excluding problematic fields)
    const { relationships: _relationships, ...characterDataWithoutRelationships } = body.characterData
    const syncUpdateData = {
      ...characterDataWithoutRelationships,
      novelMovieIntegration: {
        ...currentCharacter.novelMovieIntegration,
        lastSyncAt: new Date().toISOString(),
        syncStatus: conflicts.length > 0 ? 'conflict' as const : 'synced' as const,
        changeLog: [
          ...(currentCharacter.novelMovieIntegration?.changeLog || []),
          {
            timestamp: new Date().toISOString(),
            source: 'novel-movie' as const,
            changes: body.changeSet.map(field => ({ field })),
            resolvedBy: conflicts.length > 0 ? `auto-${conflictResolution}` : 'system',
          },
        ],
      },
    }

    // Update the character
    const updatedCharacter = await payload.update({
      collection: 'characters',
      id: characterId,
      data: syncUpdateData,
    })

    console.log(`Successfully synced character: ${characterId}`)

    return NextResponse.json({
      success: true,
      character: updatedCharacter,
      syncStatus: conflicts.length > 0 ? 'conflict' : 'synced',
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    })

  } catch (error) {
    console.error('Novel Movie character sync error:', error)
    return NextResponse.json({
      success: false,
      syncStatus: 'error',
      error: error instanceof Error ? error.message : 'Failed to sync character',
    }, { status: 500 })
  }
}

// Helper functions for nested object access
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {}
    return current[key]
  }, obj)
  target[lastKey] = value
}
