/**
 * Character Interaction Image Generation API
 * 
 * This endpoint generates images showing multiple characters interacting,
 * maintaining visual consistency for each character while composing them together.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { imageGenerationService } from '@/services/ImageGenerationService'

export interface InteractionImageRequest {
  primaryCharacterId: string
  secondaryCharacterIds: string[]
  interactionType: string
  sceneDescription: string
  environmentContext?: string
  mood?: string
  lightingStyle?: string
  style?: string
}

export interface InteractionImageResponse {
  success: boolean
  imageUrl?: string
  imageBuffer?: Buffer
  mediaId?: string
  interactionContext?: {
    interactionId: string
    characterIds: string[]
    interactionType: string
    generatedAt: Date
    qualityScore?: number
  }
  error?: string
  validationNotes?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<InteractionImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: InteractionImageRequest = await request.json()

    console.log(`Generating interaction image between characters`)
    console.log(`Primary: ${body.primaryCharacterId}, Secondary: ${body.secondaryCharacterIds.join(', ')}`)

    // Validate required fields
    if (!body.primaryCharacterId) {
      return NextResponse.json({
        success: false,
        error: 'primaryCharacterId is required',
      }, { status: 400 })
    }

    if (!body.secondaryCharacterIds || body.secondaryCharacterIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'secondaryCharacterIds is required and cannot be empty',
      }, { status: 400 })
    }

    if (!body.interactionType) {
      return NextResponse.json({
        success: false,
        error: 'interactionType is required',
      }, { status: 400 })
    }

    if (!body.sceneDescription?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'sceneDescription is required',
      }, { status: 400 })
    }

    // Get all characters involved
    const allCharacterIds = [body.primaryCharacterId, ...body.secondaryCharacterIds]
    const characters = await Promise.all(
      allCharacterIds.map(id => 
        payload.findByID({
          collection: 'characters',
          id,
          depth: 3,
        })
      )
    )

    // Check if all characters exist
    const missingCharacters = characters
      .map((char, index) => char ? null : allCharacterIds[index])
      .filter(id => id !== null)

    if (missingCharacters.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Characters not found: ${missingCharacters.join(', ')}`,
      }, { status: 404 })
    }

    // Build interaction prompt
    const interactionPrompt = buildInteractionPrompt(characters, body)

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

    // Generate the interaction image
    const generationResult = await imageGenerationService.generateImage(interactionPrompt, {
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
    const filename = `interaction_${allCharacterIds.join('_')}_${Date.now()}.jpg`
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

    // Create interaction context record
    const interactionId = `interaction_${Date.now()}`
    const interactionData = {
      interactionId,
      characterIds: allCharacterIds,
      interactionType: body.interactionType,
      generatedAt: new Date(),
      qualityScore: 85, // Default quality score
    }

    // Update all characters with the interaction image
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
                shotType: 'interaction',
                tags: `interaction,${body.interactionType},multi-character`,
                qualityScore: 85, // Default quality score
                consistencyScore: 90, // Default consistency score
              },
            ],
          },
        })
      )
    )

    console.log(`Successfully generated interaction image: ${interactionId}`)

    return NextResponse.json({
      success: true,
      imageUrl: mediaResult.imageUrl,
      mediaId: mediaResult.mediaId,
      interactionContext: interactionData,
    })

  } catch (error) {
    console.error('Interaction image generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate interaction image',
    }, { status: 500 })
  }
}

function buildInteractionPrompt(characters: any[], request: InteractionImageRequest): string {
  const primaryCharacter = characters[0]
  const secondaryCharacters = characters.slice(1)

  let prompt = ''

  // Add primary character description
  prompt += `${primaryCharacter.name}`
  if (primaryCharacter.physicalDescription) {
    const physicalDesc = extractTextFromField(primaryCharacter.physicalDescription)
    prompt += ` (${physicalDesc})`
  }
  if (primaryCharacter.age) prompt += `, age ${primaryCharacter.age}`
  if (primaryCharacter.eyeColor) prompt += `, ${primaryCharacter.eyeColor} eyes`
  if (primaryCharacter.hairColor) prompt += `, ${primaryCharacter.hairColor} hair`

  // Add secondary characters
  prompt += ' interacting with '
  secondaryCharacters.forEach((character, index) => {
    if (index > 0) prompt += ' and '
    prompt += `${character.name}`
    if (character.physicalDescription) {
      const physicalDesc = extractTextFromField(character.physicalDescription)
      prompt += ` (${physicalDesc})`
    }
    if (character.age) prompt += `, age ${character.age}`
    if (character.eyeColor) prompt += `, ${character.eyeColor} eyes`
    if (character.hairColor) prompt += `, ${character.hairColor} hair`
  })

  // Add interaction type and scene description
  prompt += `, ${request.interactionType}: ${request.sceneDescription}`

  // Add environment context
  if (request.environmentContext) {
    prompt += `, in ${request.environmentContext}`
  }

  // Add mood
  if (request.mood) {
    prompt += `, mood: ${request.mood}`
  }

  // Add lighting style
  if (request.lightingStyle) {
    prompt += `, lighting: ${request.lightingStyle}`
  }

  prompt += ', multiple characters in frame, character interaction, high quality, detailed, cinematic'

  return prompt
}

function extractTextFromField(field: any): string {
  if (!field) {
    return ''
  }

  if (typeof field === 'string') {
    return field.trim()
  }

  throw new Error(`Expected string field but received ${typeof field}. RichText format is no longer supported.`)
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
        alt: `Generated interaction image: ${filename}`,
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
