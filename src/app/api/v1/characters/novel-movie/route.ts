/**
 * Novel Movie Character Integration API
 * 
 * This endpoint handles character creation and management specifically for Novel Movie projects.
 * It includes project-specific fields, sync settings, and enhanced character data mapping.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface NovelMovieCharacterData {
  name: string
  characterId?: string
  status?: 'draft' | 'in_development' | 'ready' | 'in_production' | 'archived'
  
  // Character Development Fields
  biography?: any // RichText
  personality?: any // RichText
  motivations?: any // RichText
  backstory?: any // RichText
  
  // Physical Description
  age?: number
  height?: string
  weight?: string
  eyeColor?: string
  hairColor?: string
  physicalDescription?: any // RichText
  voiceDescription?: any // RichText
  clothing?: any // RichText
  
  // Skills and abilities
  skills?: Array<{
    skill: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'
    description?: string
  }>
  
  // Relationships (will be mapped to enhancedRelationships)
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

export interface NovelMovieCreateRequest {
  novelMovieProjectId: string
  projectName?: string
  characterData: NovelMovieCharacterData
  syncSettings?: {
    autoSync?: boolean
    conflictResolution?: 'novel-movie-wins' | 'character-library-wins' | 'manual'
  }
}

export interface NovelMovieCreateResponse {
  success: boolean
  character?: any
  characterId?: string
  error?: string
  syncStatus?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<NovelMovieCreateResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: NovelMovieCreateRequest = await request.json()

    console.log(`Creating Novel Movie character for project: ${body.novelMovieProjectId}`)

    // Validate required fields
    if (!body.novelMovieProjectId) {
      return NextResponse.json({
        success: false,
        error: 'novelMovieProjectId is required',
      }, { status: 400 })
    }

    if (!body.characterData?.name) {
      return NextResponse.json({
        success: false,
        error: 'Character name is required',
      }, { status: 400 })
    }

    // Generate character ID if not provided
    const characterId = body.characterData.characterId || 
      `${body.novelMovieProjectId}-${body.characterData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

    // Map Novel Movie character data to Character Library format
    const characterLibraryData = {
      name: body.characterData.name,
      characterId: characterId,
      status: body.characterData.status || 'draft',
      
      // Character development fields
      biography: body.characterData.biography,
      personality: body.characterData.personality,
      motivations: body.characterData.motivations,
      backstory: body.characterData.backstory,
      
      // Physical description
      age: body.characterData.age,
      height: body.characterData.height,
      weight: body.characterData.weight,
      eyeColor: body.characterData.eyeColor,
      hairColor: body.characterData.hairColor,
      physicalDescription: body.characterData.physicalDescription,
      voiceDescription: body.characterData.voiceDescription,
      clothing: body.characterData.clothing,
      
      // Skills
      skills: body.characterData.skills || [],
      
      // Novel Movie integration fields
      novelMovieIntegration: {
        projectId: body.novelMovieProjectId,
        projectName: body.projectName || `Project ${body.novelMovieProjectId}`,
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'synced' as const,
        conflictResolution: (body.syncSettings?.conflictResolution === 'novel-movie-wins' ? 'auto' : 'manual') as 'auto' | 'manual',
        changeLog: [{
          timestamp: new Date().toISOString(),
          source: 'novel-movie' as const,
          changes: [{ field: 'initial_creation' }],
          resolvedBy: 'system',
        }],
      },
      
      // Enhanced relationships with proper structure
      enhancedRelationships: body.characterData.relationships?.map((rel: any) => ({
        characterId: rel.characterId,
        characterName: rel.characterName,
        relationshipType: rel.relationshipType,
        relationshipDynamic: rel.relationshipDynamic,
        storyContext: rel.storyContext,
        visualCues: rel.visualCues ?
          (Array.isArray(rel.visualCues) && typeof rel.visualCues[0] === 'string' ?
            rel.visualCues.map((cue: string) => ({ cue, id: `cue_${Date.now()}_${Math.random()}` })) :
            rel.visualCues) :
          undefined,
        strength: rel.strength,
        conflictLevel: rel.conflictLevel,
      })) || [],
      
      // Initialize quality metrics
      enhancedQualityMetrics: {
        narrativeConsistency: null,
        crossSceneConsistency: null,
        relationshipVisualConsistency: null,
        lastValidated: null,
        validationHistory: [],
      },
    }

    // Create the character
    const character = await payload.create({
      collection: 'characters',
      data: characterLibraryData,
    })

    console.log(`Successfully created character: ${character.id}`)

    return NextResponse.json({
      success: true,
      character: character,
      id: character.id,                    // MongoDB ObjectId for database operations
      characterId: character.characterId || undefined, // Human-readable business identifier, convert null to undefined
      syncStatus: 'synced',
    }, { status: 201 })

  } catch (error) {
    console.error('Novel Movie character creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create character',
    }, { status: 500 })
  }
}
