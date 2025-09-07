/**
 * Novel Movie Bulk Character Operations API
 * 
 * This endpoint handles bulk character operations for Novel Movie projects including
 * batch creation, updates, and synchronization of multiple characters.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface BulkCharacterOperation {
  projectId: string
  characters: Array<{
    id?: string // For update/sync operations
    characterData: {
      name: string
      characterId?: string
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
    lastModified?: string // For sync operations
    changeSet?: string[] // For sync operations
  }>
  operation: 'create' | 'update' | 'sync'
  syncSettings?: {
    autoSync?: boolean
    conflictResolution?: 'novel-movie-wins' | 'character-library-wins' | 'manual'
  }
}

export interface BulkOperationResponse {
  success: boolean
  results: Array<{
    characterId?: string
    characterName: string
    success: boolean
    operation: string
    syncStatus?: 'synced' | 'conflict' | 'error'
    error?: string
    conflicts?: Array<{
      field: string
      novelMovieValue: any
      characterLibraryValue: any
    }>
  }>
  summary: {
    total: number
    successful: number
    failed: number
    conflicts: number
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<BulkOperationResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: BulkCharacterOperation = await request.json()

    console.log(`Bulk ${body.operation} operation for project: ${body.projectId}`)
    console.log(`Processing ${body.characters.length} characters`)

    // Validate required fields
    if (!body.projectId) {
      return NextResponse.json({
        success: false,
        results: [],
        summary: { total: 0, successful: 0, failed: 0, conflicts: 0 },
        error: 'projectId is required',
      }, { status: 400 })
    }

    if (!body.characters || body.characters.length === 0) {
      return NextResponse.json({
        success: false,
        results: [],
        summary: { total: 0, successful: 0, failed: 0, conflicts: 0 },
        error: 'characters array is required and cannot be empty',
      }, { status: 400 })
    }

    const results: BulkOperationResponse['results'] = []
    let successful = 0
    let failed = 0
    let conflicts = 0

    // Process each character
    for (const characterRequest of body.characters) {
      try {
        const result = await processCharacterOperation(
          payload,
          body.operation,
          body.projectId,
          characterRequest,
          body.syncSettings
        )

        results.push(result)

        if (result.success) {
          successful++
          if (result.syncStatus === 'conflict') {
            conflicts++
          }
        } else {
          failed++
        }

      } catch (error) {
        console.error(`Error processing character ${characterRequest.characterData.name}:`, error)
        results.push({
          characterName: characterRequest.characterData.name,
          success: false,
          operation: body.operation,
          syncStatus: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        failed++
      }
    }

    const overallSuccess = failed === 0 && conflicts === 0

    return NextResponse.json({
      success: overallSuccess,
      results,
      summary: {
        total: body.characters.length,
        successful,
        failed,
        conflicts,
      },
    }, { status: overallSuccess ? 200 : 207 }) // 207 Multi-Status for partial success

  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json({
      success: false,
      results: [],
      summary: { total: 0, successful: 0, failed: 0, conflicts: 0 },
      error: error instanceof Error ? error.message : 'Failed to process bulk operation',
    }, { status: 500 })
  }
}

async function processCharacterOperation(
  payload: any,
  operation: string,
  projectId: string,
  characterRequest: BulkCharacterOperation['characters'][0],
  syncSettings?: BulkCharacterOperation['syncSettings']
): Promise<BulkOperationResponse['results'][0]> {
  
  const characterData = characterRequest.characterData

  if (operation === 'create') {
    // Generate character ID if not provided
    const characterId = characterData.characterId || 
      `${projectId}-${characterData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`

    const characterLibraryData = {
      name: characterData.name,
      characterId: characterId,
      status: characterData.status || 'draft',
      
      // Character development fields
      biography: characterData.biography,
      personality: characterData.personality,
      motivations: characterData.motivations,
      backstory: characterData.backstory,
      
      // Physical description
      age: characterData.age,
      height: characterData.height,
      weight: characterData.weight,
      eyeColor: characterData.eyeColor,
      hairColor: characterData.hairColor,
      physicalDescription: characterData.physicalDescription,
      voiceDescription: characterData.voiceDescription,
      clothing: characterData.clothing,
      
      // Skills
      skills: characterData.skills || [],
      
      // Novel Movie integration fields
      novelMovieIntegration: {
        projectId: projectId,
        projectName: `Project ${projectId}`,
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'synced' as const,
        conflictResolution: syncSettings?.conflictResolution || 'manual',
        changeLog: [{
          timestamp: new Date().toISOString(),
          source: 'novel-movie' as const,
          changes: [{ field: 'bulk_creation' }],
          resolvedBy: 'system',
        }],
      },
      
      // Enhanced relationships
      enhancedRelationships: characterData.relationships || [],
      
      // Initialize quality metrics
      enhancedQualityMetrics: {
        narrativeConsistency: null,
        crossSceneConsistency: null,
        relationshipVisualConsistency: null,
        lastValidated: null,
        validationHistory: [],
      },
    }

    const character = await payload.create({
      collection: 'characters',
      data: characterLibraryData,
    })

    return {
      characterId: character.id,
      characterName: characterData.name,
      success: true,
      operation: 'create',
      syncStatus: 'synced',
    }

  } else if (operation === 'update' || operation === 'sync') {
    if (!characterRequest.id) {
      throw new Error('Character ID is required for update/sync operations')
    }

    // For simplicity, we'll do a basic update here
    // In a full implementation, this would include conflict detection like the sync endpoint
    const updateData = {
      ...characterData,
      enhancedRelationships: characterData.relationships || [],
      novelMovieIntegration: {
        lastSyncAt: new Date().toISOString(),
        syncStatus: 'synced' as const,
        changeLog: [{
          timestamp: new Date().toISOString(),
          source: 'novel-movie' as const,
          changes: characterRequest.changeSet?.map(field => ({ field })) || [{ field: 'bulk_update' }],
          resolvedBy: 'system',
        }],
      },
    }

    const character = await payload.update({
      collection: 'characters',
      id: characterRequest.id,
      data: updateData,
    })

    return {
      characterId: character.id,
      characterName: characterData.name,
      success: true,
      operation: operation,
      syncStatus: 'synced',
    }
  }

  throw new Error(`Unsupported operation: ${operation}`)
}
