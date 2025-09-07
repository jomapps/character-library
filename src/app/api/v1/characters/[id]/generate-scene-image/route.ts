/**
 * Scene-Specific Character Image Generation API
 * 
 * This endpoint generates character images tailored for specific scenes with context-aware
 * prompting, mood, lighting, and environmental considerations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { imageGenerationService } from '@/services/ImageGenerationService'

export interface SceneImageRequest {
  sceneContext: string
  sceneType: 'dialogue' | 'action' | 'emotional' | 'establishing'
  additionalCharacters?: string[]
  environmentContext?: string
  mood?: string
  lightingStyle?: string
  style?: string
  referenceImageAssetId?: string
}

export interface SceneImageResponse {
  success: boolean
  imageUrl?: string
  imageBuffer?: Buffer
  mediaId?: string
  sceneContext?: {
    sceneId: string
    sceneType: string
    generatedAt: Date
    qualityScore?: number
  }
  error?: string
  validationNotes?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SceneImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: SceneImageRequest = await request.json()

    console.log(`Generating scene-specific image for character: ${characterId}`)
    console.log(`Scene type: ${body.sceneType}, Context: "${body.sceneContext.substring(0, 100)}..."`)

    // Validate required fields
    if (!body.sceneContext?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'sceneContext is required',
      }, { status: 400 })
    }

    if (!body.sceneType) {
      return NextResponse.json({
        success: false,
        error: 'sceneType is required',
      }, { status: 400 })
    }

    // Get the character with full details
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 3,
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Build context-aware prompt
    const scenePrompt = buildScenePrompt(character, body)

    // Get reference images for consistency
    const referenceImageAssetId = body.referenceImageAssetId ||
      (typeof character.masterReferenceImage === 'object' ? character.masterReferenceImage?.dinoAssetId : null) ||
      character.imageGallery?.find((img: any) => img.isCoreReference)?.dinoAssetId

    if (!referenceImageAssetId) {
      return NextResponse.json({
        success: false,
        error: 'No reference image available for character consistency',
      }, { status: 400 })
    }

    // Generate the scene-specific image
    const generationResult = await imageGenerationService.generateImage(scenePrompt, {
      referenceImageAssetId: referenceImageAssetId,
      style: 'custom',
      additionalReferenceIds: character.imageGallery
        ?.filter((img: any) => img.isCoreReference)
        ?.map((img: any) => img.dinoAssetId)
        ?.slice(0, 3) // Limit to 3 additional references
    })

    if (!generationResult.success || !generationResult.imageBuffer) {
      return NextResponse.json({
        success: false,
        error: generationResult.error || 'Image generation failed',
      }, { status: 500 })
    }

    // Upload the generated image
    const filename = `${characterId}_scene_${body.sceneType}_${Date.now()}.jpg`
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

    // Create scene context record
    const sceneId = `scene_${Date.now()}`
    const sceneContextData = {
      sceneId,
      sceneType: body.sceneType,
      generatedImages: [{ imageId: mediaResult.mediaId }],
      qualityScores: [{ score: 85 }], // Default quality score
      lastGenerated: new Date().toISOString(),
    }

    // Update character with scene context
    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        sceneContexts: [
          ...(character.sceneContexts || []),
          sceneContextData,
        ],
        // Add to image gallery
        imageGallery: [
          ...(character.imageGallery || []),
          {
            imageFile: mediaResult.mediaId,
            isCoreReference: false,
            shotType: `scene_${body.sceneType}`,
            tags: `scene,${body.sceneType},${body.mood || 'neutral'}`,
            qualityScore: 85, // Default quality score
            consistencyScore: 90, // Default consistency score
          },
        ],
      },
    })

    console.log(`Successfully generated scene image for character: ${characterId}`)

    return NextResponse.json({
      success: true,
      imageUrl: mediaResult.imageUrl,
      mediaId: mediaResult.mediaId,
      sceneContext: {
        sceneId,
        sceneType: body.sceneType,
        generatedAt: new Date(),
        qualityScore: 85, // Default quality score
      },
    })

  } catch (error) {
    console.error('Scene image generation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate scene image',
    }, { status: 500 })
  }
}

function buildScenePrompt(character: any, request: SceneImageRequest): string {
  let prompt = `${character.name}, `

  // Add physical description
  if (character.physicalDescription) {
    const physicalDesc = extractTextFromRichText(character.physicalDescription)
    prompt += `${physicalDesc}, `
  }

  // Add basic physical attributes
  if (character.age) prompt += `age ${character.age}, `
  if (character.height) prompt += `${character.height} tall, `
  if (character.eyeColor) prompt += `${character.eyeColor} eyes, `
  if (character.hairColor) prompt += `${character.hairColor} hair, `

  // Add clothing if available
  if (character.clothing) {
    const clothingDesc = extractTextFromRichText(character.clothing)
    prompt += `wearing ${clothingDesc}, `
  }

  // Add scene context
  prompt += `in a scene: ${request.sceneContext}`

  // Add scene type specific elements
  switch (request.sceneType) {
    case 'dialogue':
      prompt += ', speaking or in conversation, expressive face, clear facial features'
      break
    case 'action':
      prompt += ', in motion, dynamic pose, action scene'
      break
    case 'emotional':
      prompt += ', emotional expression, dramatic lighting, close-up or medium shot'
      break
    case 'establishing':
      prompt += ', full body or wide shot, establishing the character in the environment'
      break
  }

  // Add environment context
  if (request.environmentContext) {
    prompt += `, environment: ${request.environmentContext}`
  }

  // Add mood
  if (request.mood) {
    prompt += `, mood: ${request.mood}`
  }

  // Add lighting style
  if (request.lightingStyle) {
    prompt += `, lighting: ${request.lightingStyle}`
  }

  // Add additional characters if specified
  if (request.additionalCharacters && request.additionalCharacters.length > 0) {
    prompt += `, with other characters: ${request.additionalCharacters.join(', ')}`
  }

  prompt += ', high quality, detailed, cinematic'

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
        alt: `Generated scene image: ${filename}`,
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
