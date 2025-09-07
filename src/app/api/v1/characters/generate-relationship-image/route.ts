/**
 * Relationship-Aware Image Generation API
 * 
 * This endpoint generates images that showcase character relationships with
 * visual cues, positioning, and interaction dynamics that reflect their story connections.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { imageGenerationService } from '@/services/ImageGenerationService'

export interface RelationshipImageRequest {
  characterIds: string[]
  relationshipContext: string
  visualStyle?: string
  environmentContext?: string
  mood?: string
  lightingStyle?: string
  emphasizeRelationship?: boolean
  style?: string
}

export interface RelationshipImageResponse {
  success: boolean
  imageUrl?: string
  imageBuffer?: Buffer
  mediaId?: string
  relationshipAnalysis?: {
    primaryRelationship: {
      type: string
      strength: number
      conflictLevel: number
      visualCues: string[]
    }
    characterDynamics: Array<{
      characterId: string
      role: string
      prominence: number
    }>
  }
  error?: string
  validationNotes?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<RelationshipImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: RelationshipImageRequest = await request.json()

    console.log(`Generating relationship-aware image for characters: ${body.characterIds.join(', ')}`)

    // Validate required fields
    if (!body.characterIds || body.characterIds.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'At least 2 characterIds are required',
      }, { status: 400 })
    }

    if (!body.relationshipContext?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'relationshipContext is required',
      }, { status: 400 })
    }

    // Get all characters
    const characters = await Promise.all(
      body.characterIds.map(id => 
        payload.findByID({
          collection: 'characters',
          id,
          depth: 3,
        })
      )
    )

    // Check if all characters exist
    const missingCharacters = characters
      .map((char, index) => char ? null : body.characterIds[index])
      .filter(id => id !== null)

    if (missingCharacters.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Characters not found: ${missingCharacters.join(', ')}`,
      }, { status: 404 })
    }

    // Analyze relationships between characters
    const relationshipAnalysis = analyzeCharacterRelationships(characters)

    // Build relationship-aware prompt
    const relationshipPrompt = buildRelationshipPrompt(characters, body, relationshipAnalysis)

    // Collect reference images from all characters
    const referenceImages = characters
      .map(char => typeof char.masterReferenceImage === 'object' ? char.masterReferenceImage?.dinoAssetId : null)
      .filter(id => id)

    if (referenceImages.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No reference images available for character consistency',
      }, { status: 400 })
    }

    // Generate the relationship image
    const generationResult = await imageGenerationService.generateImage(relationshipPrompt, {
      referenceImageAssetId: referenceImages[0] || undefined, // Primary character as main reference
      additionalReferenceIds: referenceImages.slice(1).filter((id): id is string => Boolean(id)), // Other characters as additional references
      style: 'custom',
    })

    if (!generationResult.success || !generationResult.imageBuffer) {
      return NextResponse.json({
        success: false,
        error: generationResult.error || 'Image generation failed',
      }, { status: 500 })
    }

    // Upload the generated image
    const filename = `relationship_${body.characterIds.join('_')}_${Date.now()}.jpg`
    const mediaResult = await uploadGeneratedImage(
      generationResult.imageBuffer,
      filename,
      payload
    )

    if (!mediaResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to upload generated image',
      }, { status: 500 })
    }

    // Update all characters with the relationship image
    await Promise.all(
      characters.map(character => 
        payload.update({
          collection: 'characters',
          id: character.id,
          data: {
            imageGallery: [
              ...(character.imageGallery || []),
              {
                imageFile: mediaResult.mediaId,
                isCoreReference: false,
                shotType: 'relationship',
                tags: `relationship,${relationshipAnalysis?.primaryRelationship?.type || 'unknown'},multi-character`,
                qualityScore: 85, // Default quality score
                consistencyScore: 90, // Default consistency score
              },
            ],
          },
        })
      )
    )

    console.log(`Successfully generated relationship image`)

    return NextResponse.json({
      success: true,
      imageUrl: mediaResult.imageUrl,
      mediaId: mediaResult.mediaId,
      relationshipAnalysis,
    })

  } catch (error) {
    console.error('Relationship image generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate relationship image',
    }, { status: 500 })
  }
}

function analyzeCharacterRelationships(characters: any[]): RelationshipImageResponse['relationshipAnalysis'] {
  if (characters.length < 2) {
    return {
      primaryRelationship: {
        type: 'unknown',
        strength: 5,
        conflictLevel: 1,
        visualCues: [],
      },
      characterDynamics: characters.map((char, index) => ({
        characterId: char.id,
        role: index === 0 ? 'primary' : 'secondary',
        prominence: index === 0 ? 1.0 : 0.8,
      })),
    }
  }

  const primaryCharacter = characters[0]
  const secondaryCharacter = characters[1]

  // Find relationship between first two characters
  const relationship = primaryCharacter.enhancedRelationships?.find(
    (rel: any) => rel.characterId === secondaryCharacter.id
  )

  const primaryRelationship = {
    type: relationship?.relationshipType || 'unknown',
    strength: relationship?.strength || 5,
    conflictLevel: relationship?.conflictLevel || 1,
    visualCues: relationship?.visualCues || [],
  }

  // Determine character dynamics based on relationships
  const characterDynamics = characters.map((character, index) => {
    let role = 'secondary'
    let prominence = 0.8

    if (index === 0) {
      role = 'primary'
      prominence = 1.0
    } else if (relationship && relationship.relationshipType) {
      // Adjust prominence based on relationship strength
      prominence = Math.min(1.0, 0.6 + (relationship.strength / 10) * 0.4)
      
      // Adjust role based on relationship type
      if (['mentor', 'boss', 'parent'].includes(relationship.relationshipType.toLowerCase())) {
        role = 'authority'
        prominence = Math.max(prominence, 0.9)
      } else if (['student', 'employee', 'child'].includes(relationship.relationshipType.toLowerCase())) {
        role = 'subordinate'
        prominence = Math.min(prominence, 0.7)
      } else if (['enemy', 'rival'].includes(relationship.relationshipType.toLowerCase())) {
        role = 'antagonist'
        prominence = Math.max(prominence, 0.85)
      }
    }

    return {
      characterId: character.id,
      role,
      prominence,
    }
  })

  return {
    primaryRelationship,
    characterDynamics,
  }
}

function buildRelationshipPrompt(
  characters: any[], 
  request: RelationshipImageRequest, 
  analysis: RelationshipImageResponse['relationshipAnalysis']
): string {
  let prompt = ''

  // Add characters with relationship-aware descriptions
  characters.forEach((character, index) => {
    if (index > 0) prompt += ' and '
    
    prompt += `${character.name}`
    
    // Add physical description
    if (character.physicalDescription) {
      const physicalDesc = extractTextFromRichText(character.physicalDescription)
      prompt += ` (${physicalDesc})`
    }
    
    // Add basic attributes
    if (character.age) prompt += `, age ${character.age}`
    if (character.eyeColor) prompt += `, ${character.eyeColor} eyes`
    if (character.hairColor) prompt += `, ${character.hairColor} hair`
    
    // Add role-based positioning hints
    const dynamics = analysis?.characterDynamics.find(d => d.characterId === character.id)
    if (dynamics) {
      switch (dynamics.role) {
        case 'primary':
          prompt += ', prominently positioned'
          break
        case 'authority':
          prompt += ', in authoritative position'
          break
        case 'subordinate':
          prompt += ', in respectful position'
          break
        case 'antagonist':
          prompt += ', in confrontational position'
          break
      }
    }
  })

  // Add relationship context
  prompt += `, showing their relationship: ${request.relationshipContext}`

  // Add relationship type specific visual cues
  if (analysis?.primaryRelationship) {
    const relType = analysis.primaryRelationship.type.toLowerCase()
    
    switch (relType) {
      case 'friend':
        prompt += ', friendly body language, close proximity, warm expressions'
        break
      case 'enemy':
        prompt += ', tense body language, confrontational poses, intense expressions'
        break
      case 'mentor':
        prompt += ', teaching gesture, respectful distance, guiding interaction'
        break
      case 'family':
      case 'parent':
      case 'child':
      case 'sibling':
        prompt += ', familial warmth, protective or caring gestures'
        break
      case 'romantic':
      case 'lover':
      case 'spouse':
        prompt += ', intimate positioning, romantic tension, loving expressions'
        break
      case 'rival':
        prompt += ', competitive stance, challenging expressions, dynamic tension'
        break
    }

    // Add visual cues from relationship data
    if (analysis.primaryRelationship.visualCues.length > 0) {
      prompt += `, visual elements: ${analysis.primaryRelationship.visualCues.join(', ')}`
    }

    // Adjust based on conflict level
    if (analysis.primaryRelationship.conflictLevel > 7) {
      prompt += ', high tension, dramatic conflict'
    } else if (analysis.primaryRelationship.conflictLevel < 3) {
      prompt += ', harmonious interaction, peaceful'
    }
  }

  // Add environment and style
  if (request.environmentContext) {
    prompt += `, in ${request.environmentContext}`
  }

  if (request.mood) {
    prompt += `, mood: ${request.mood}`
  }

  if (request.lightingStyle) {
    prompt += `, lighting: ${request.lightingStyle}`
  }

  prompt += ', multiple characters, relationship dynamics, high quality, detailed, cinematic'

  return prompt
}

function extractTextFromRichText(richText: any): string {
  if (!richText || !richText.root || !richText.root.children) {
    return ''
  }
  
  return richText.root.children
    .map((child: any) => child.text || '')
    .join(' ')
    .trim()
}

async function uploadGeneratedImage(
  imageBuffer: Buffer,
  filename: string,
  payload: any
): Promise<{ success: boolean; mediaId?: string; imageUrl?: string; error?: string }> {
  try {
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Generated relationship image: ${filename}`,
      },
      file: {
        data: imageBuffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: imageBuffer.length,
      },
    })

    return {
      success: true,
      mediaId: media.id,
      imageUrl: media.url,
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}
