/**
 * API endpoint for generating the initial character image (master reference)
 * POST /api/characters/[id]/generate-initial-image
 * 
 * This endpoint creates the first image for a character based on a prompt.
 * The generated image is optimized for use as a reference image (front-facing, clear, etc.)
 * and is automatically set as the master reference image for the character.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { imageGenerationService } from '../../../../../../services/ImageGenerationService'
import { dinoOrchestrator } from '../../../../../../services/DinoOrchestrator'

interface GenerateInitialImageRequest {
  prompt: string
  style?: 'character_turnaround' | 'character_production' | 'custom'
  width?: number
  height?: number
}

interface GenerateInitialImageResponse {
  success: boolean
  message?: string
  data?: {
    characterId: string
    characterName: string
    imageId: string
    dinoAssetId: string
    publicUrl: string
    qualityScore?: number
    validationNotes?: string
  }
  error?: string
  details?: string
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<GenerateInitialImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: GenerateInitialImageRequest = await request.json()

    if (!body.prompt) {
      return NextResponse.json({ 
        success: false,
        error: 'Prompt is required' 
      }, { status: 400 })
    }

    console.log(`Generating initial image for character: ${characterId}`)
    console.log(`Prompt: "${body.prompt}"`)

    // Get the character document
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
    })

    if (!character) {
      return NextResponse.json({ 
        success: false,
        error: 'Character not found' 
      }, { status: 404 })
    }

    // Check if character already has a master reference image
    if (character.masterReferenceImage) {
      return NextResponse.json({
        success: false,
        error: 'Character already has a master reference image. Use the generate-image endpoint for additional images.',
      }, { status: 400 })
    }

    // Enhance the prompt for reference image generation
    const enhancedPrompt = enhancePromptForReferenceImage(body.prompt)
    
    console.log(`Enhanced prompt: "${enhancedPrompt}"`)

    // Generate the initial image using text-to-image (no reference images)
    const generationResult = await imageGenerationService.generateImage(enhancedPrompt, {
      style: body.style || 'character_turnaround',
      width: body.width || 768,
      height: body.height || 1024,
      steps: 35, // Higher quality for reference image
      guidance: 8.0, // Strong adherence to prompt
    })

    if (!generationResult.success || !generationResult.imageBuffer) {
      return NextResponse.json({
        success: false,
        error: 'Image generation failed',
        details: generationResult.error,
      }, { status: 500 })
    }

    // Upload the generated image and create media record
    const filename = `${characterId}_initial_${Date.now()}.jpg`
    const mediaResult = await uploadGeneratedImage(
      generationResult.imageBuffer,
      filename,
      `Initial character reference image: ${filename}`,
      payload
    )

    if (!mediaResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to upload generated image',
        details: mediaResult.error,
      }, { status: 500 })
    }

    // Wait for DINOv3 processing to complete
    await waitForDinoProcessing(mediaResult.imageId!, payload)

    // Get the updated media document with DINOv3 data
    const updatedMedia = await payload.findByID({
      collection: 'media',
      id: mediaResult.imageId!,
    })

    if (!updatedMedia.dinoAssetId) {
      return NextResponse.json({
        success: false,
        error: 'Failed to process image with DINOv3',
        details: 'Image was uploaded but DINOv3 processing failed',
      }, { status: 500 })
    }

    // Get the public URL for the image
    const publicUrl = getPublicImageUrl(updatedMedia.dinoAssetId)

    // Update the character with the master reference image
    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        masterReferenceImage: mediaResult.imageId,
        masterReferenceProcessed: updatedMedia.dinoProcessingStatus === 'validation_success',
      },
    })

    console.log(`✓ Initial image generated successfully for character: ${character.name}`)

    return NextResponse.json({
      success: true,
      message: `Initial character image generated successfully`,
      data: {
        characterId,
        characterName: character.name,
        imageId: mediaResult.imageId!,
        dinoAssetId: updatedMedia.dinoAssetId,
        publicUrl,
        qualityScore: updatedMedia.qualityScore ?? undefined,
        validationNotes: updatedMedia.validationNotes ?? undefined,
      },
    })

  } catch (error) {
    console.error('Initial image generation API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during image generation',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * Enhance the user prompt for optimal reference image generation
 */
function enhancePromptForReferenceImage(userPrompt: string): string {
  // Add reference image specific enhancements
  const referenceEnhancements = [
    'front facing',
    'looking directly at camera',
    'neutral expression',
    'clear lighting',
    'full body visible',
    'standing pose',
    'plain background',
    'high quality',
    'detailed',
    'character reference sheet style'
  ]

  // Check if the prompt already contains reference-specific terms
  const hasReferenceTerms = referenceEnhancements.some(term => 
    userPrompt.toLowerCase().includes(term.toLowerCase())
  )

  if (hasReferenceTerms) {
    // User already provided reference-specific terms, just add quality enhancers
    return `${userPrompt}, high quality, detailed, character reference sheet`
  } else {
    // Add full reference image enhancements
    return `${userPrompt}, front facing, looking directly at camera, neutral expression, clear lighting, full body visible, standing pose, plain background, high quality, detailed, character reference sheet style`
  }
}

/**
 * Upload generated image and create media record
 */
async function uploadGeneratedImage(
  imageBuffer: Buffer,
  filename: string,
  alt: string,
  payload: any
): Promise<{
  success: boolean
  imageId?: string
  error?: string
}> {
  try {
    // Create media record in Payload
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt,
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
      imageId: mediaDoc.id,
    }
  } catch (error) {
    console.error('Failed to upload generated image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    }
  }
}

/**
 * Wait for DINOv3 processing to complete
 */
async function waitForDinoProcessing(
  mediaId: string, 
  payload: any, 
  maxWaitTime: number = 30000
): Promise<void> {
  const startTime = Date.now()
  const pollInterval = 2000 // Check every 2 seconds

  while (Date.now() - startTime < maxWaitTime) {
    const media = await payload.findByID({
      collection: 'media',
      id: mediaId,
    })

    if (media.dinoProcessingStatus && 
        media.dinoProcessingStatus !== 'pending' && 
        media.dinoProcessingStatus !== 'processing') {
      // Processing completed (either success or error)
      return
    }

    // Wait before next check
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }

  console.warn(`DINOv3 processing timeout for media: ${mediaId}`)
}

/**
 * Get public URL for the image from DINOv3 asset ID
 */
function getPublicImageUrl(dinoAssetId: string): string {
  // The DINOv3 service stores images in Cloudflare R2
  // The asset ID is the R2 object key, so we can construct the public URL
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://media.rumbletv.com'
  return `${baseUrl}/${dinoAssetId}`
}
