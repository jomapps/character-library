/**
 * Character Relationships Management API
 * 
 * This endpoint handles creating, updating, and managing relationships between characters
 * including bidirectional relationship mapping and visual cue tracking.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface RelationshipRequest {
  relatedCharacterId: string
  relationshipType: string
  relationshipDynamic?: string
  storyContext?: string
  visualCues?: string[]
  strength?: number // 1-10
  conflictLevel?: number // 1-10
  bidirectional?: boolean // Whether to create the reverse relationship
}

export interface RelationshipResponse {
  success: boolean
  relationship?: {
    id: string
    characterId: string
    relatedCharacterId: string
    relationshipType: string
    relationshipDynamic?: string
    storyContext?: string
    visualCues?: string[]
    strength?: number
    conflictLevel?: number
    createdAt: Date
  }
  reverseRelationship?: {
    id: string
    characterId: string
    relatedCharacterId: string
    relationshipType: string
  }
  error?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<RelationshipResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: RelationshipRequest = await request.json()

    console.log(`Creating relationship for character: ${characterId}`)

    // Validate required fields
    if (!body.relatedCharacterId) {
      return NextResponse.json({
        success: false,
        error: 'relatedCharacterId is required',
      }, { status: 400 })
    }

    if (!body.relationshipType) {
      return NextResponse.json({
        success: false,
        error: 'relationshipType is required',
      }, { status: 400 })
    }

    // Validate that both characters exist
    const [character, relatedCharacter] = await Promise.all([
      payload.findByID({
        collection: 'characters',
        id: characterId,
        depth: 2,
      }),
      payload.findByID({
        collection: 'characters',
        id: body.relatedCharacterId,
        depth: 2,
      })
    ])

    if (!character) {
      return NextResponse.json({
        success: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    if (!relatedCharacter) {
      return NextResponse.json({
        success: false,
        error: 'Related character not found',
      }, { status: 404 })
    }

    // Check if relationship already exists
    const existingRelationships = character.enhancedRelationships || []
    const existingRelationship = existingRelationships.find(
      (rel: any) => rel.characterId === body.relatedCharacterId
    )

    if (existingRelationship) {
      return NextResponse.json({
        success: false,
        error: 'Relationship already exists between these characters',
      }, { status: 409 })
    }

    // Create the relationship data
    const relationshipData = {
      characterId: body.relatedCharacterId,
      characterName: relatedCharacter.name,
      relationshipType: body.relationshipType,
      relationshipDynamic: body.relationshipDynamic || '',
      storyContext: body.storyContext || '',
      visualCues: (body.visualCues || []).map((cue: string) => ({ cue, id: `cue_${Date.now()}_${Math.random()}` })),
      strength: body.strength || 5,
      conflictLevel: body.conflictLevel || 1,
    }

    // Update the character with the new relationship
    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        enhancedRelationships: [
          ...existingRelationships,
          relationshipData,
        ],
      },
    })

    let reverseRelationship: { id: string; characterId: string; relatedCharacterId: string; relationshipType: string; } | undefined = undefined

    // Create bidirectional relationship if requested
    if (body.bidirectional !== false) { // Default to true
      const reverseRelationshipType = getReverseRelationshipType(body.relationshipType)
      const reverseRelationshipData = {
        characterId: characterId,
        characterName: character.name,
        relationshipType: reverseRelationshipType,
        relationshipDynamic: body.relationshipDynamic || '',
        storyContext: body.storyContext || '',
        visualCues: (body.visualCues || []).map((cue: string) => ({ cue, id: `cue_${Date.now()}_${Math.random()}` })),
        strength: body.strength || 5,
        conflictLevel: body.conflictLevel || 1,
      }

      const existingReverseRelationships = relatedCharacter.enhancedRelationships || []
      
      // Check if reverse relationship already exists
      const existingReverseRelationship = existingReverseRelationships.find(
        (rel: any) => rel.characterId === characterId
      )

      if (!existingReverseRelationship) {
        await payload.update({
          collection: 'characters',
          id: body.relatedCharacterId,
          data: {
            enhancedRelationships: [
              ...existingReverseRelationships,
              reverseRelationshipData,
            ],
          },
        })

        reverseRelationship = {
          id: `${body.relatedCharacterId}-${characterId}`,
          characterId: body.relatedCharacterId,
          relatedCharacterId: characterId,
          relationshipType: reverseRelationshipType,
        }
      }
    }

    const responseRelationship = {
      id: `${characterId}-${body.relatedCharacterId}`,
      characterId: characterId,
      relatedCharacterId: body.relatedCharacterId,
      relationshipType: body.relationshipType,
      relationshipDynamic: body.relationshipDynamic,
      storyContext: body.storyContext,
      visualCues: body.visualCues, // This should be a string array from the request
      strength: body.strength,
      conflictLevel: body.conflictLevel,
      createdAt: new Date(),
    }

    console.log(`Successfully created relationship between ${character.name} and ${relatedCharacter.name}`)

    return NextResponse.json({
      success: true,
      relationship: responseRelationship,
      reverseRelationship: reverseRelationship,
    })

  } catch (error) {
    console.error('Relationship creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create relationship',
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params

    // Get the character with relationships
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 2,
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    const relationships = character.enhancedRelationships || []

    // Enrich relationships with related character data
    const enrichedRelationships = await Promise.all(
      relationships.map(async (rel: any) => {
        try {
          const relatedCharacter = await payload.findByID({
            collection: 'characters',
            id: rel.characterId,
            depth: 1,
          })

          return {
            ...rel,
            relatedCharacter: relatedCharacter ? {
              id: relatedCharacter.id,
              name: relatedCharacter.name,
              status: relatedCharacter.status,
            } : null,
          }
        } catch (error) {
          console.error(`Error loading related character ${rel.characterId}:`, error)
          return {
            ...rel,
            relatedCharacter: null,
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      character: {
        id: character.id,
        name: character.name,
        status: character.status,
      },
      relationships: enrichedRelationships,
    })

  } catch (error) {
    console.error('Get relationships error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get relationships',
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<RelationshipResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: RelationshipRequest = await request.json()

    console.log(`Updating relationship for character: ${characterId}`)

    if (!body.relatedCharacterId) {
      return NextResponse.json({
        success: false,
        error: 'relatedCharacterId is required',
      }, { status: 400 })
    }

    // Get the character
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 2,
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Find and update the relationship
    const relationships = character.enhancedRelationships || []
    const relationshipIndex = relationships.findIndex(
      (rel: any) => rel.characterId === body.relatedCharacterId
    )

    if (relationshipIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Relationship not found',
      }, { status: 404 })
    }

    // Update the relationship
    relationships[relationshipIndex] = {
      ...relationships[relationshipIndex],
      relationshipType: body.relationshipType || relationships[relationshipIndex].relationshipType,
      relationshipDynamic: body.relationshipDynamic !== undefined ? body.relationshipDynamic : relationships[relationshipIndex].relationshipDynamic,
      storyContext: body.storyContext !== undefined ? body.storyContext : relationships[relationshipIndex].storyContext,
      visualCues: body.visualCues !== undefined ?
        (body.visualCues || []).map((cue: string) => ({ cue, id: `cue_${Date.now()}_${Math.random()}` })) :
        relationships[relationshipIndex].visualCues,
      strength: body.strength !== undefined ? body.strength : relationships[relationshipIndex].strength,
      conflictLevel: body.conflictLevel !== undefined ? body.conflictLevel : relationships[relationshipIndex].conflictLevel,
    }

    // Update the character
    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        enhancedRelationships: relationships,
      },
    })

    const updatedRelationship = {
      id: `${characterId}-${body.relatedCharacterId}`,
      characterId: characterId,
      relatedCharacterId: body.relatedCharacterId,
      relationshipType: relationships[relationshipIndex].relationshipType,
      relationshipDynamic: relationships[relationshipIndex].relationshipDynamic || undefined,
      storyContext: relationships[relationshipIndex].storyContext || undefined,
      visualCues: relationships[relationshipIndex].visualCues ?
        relationships[relationshipIndex].visualCues.map((cue: any) => typeof cue === 'string' ? cue : cue.cue) :
        undefined,
      strength: relationships[relationshipIndex].strength ?? undefined,
      conflictLevel: relationships[relationshipIndex].conflictLevel ?? undefined,
      createdAt: new Date(),
    }

    console.log(`Successfully updated relationship`)

    return NextResponse.json({
      success: true,
      relationship: updatedRelationship,
    })

  } catch (error) {
    console.error('Relationship update error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update relationship',
    }, { status: 500 })
  }
}

function getReverseRelationshipType(relationshipType: string): string {
  const reverseMap: Record<string, string> = {
    'friend': 'friend',
    'enemy': 'enemy',
    'mentor': 'student',
    'student': 'mentor',
    'parent': 'child',
    'child': 'parent',
    'sibling': 'sibling',
    'spouse': 'spouse',
    'partner': 'partner',
    'boss': 'employee',
    'employee': 'boss',
    'ally': 'ally',
    'rival': 'rival',
    'lover': 'lover',
  }

  return reverseMap[relationshipType.toLowerCase()] || relationshipType
}
