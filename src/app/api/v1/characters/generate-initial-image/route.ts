/**
 * API endpoint for generating an initial character image without requiring an existing character
 * POST /api/characters/generate-initial-image
 * 
 * This endpoint creates an initial character image that can be used when creating a new character.
 * The generated image is optimized for use as a reference image (front-facing, clear, etc.)
 * and returns the image data that can be used to create a character with a master reference image.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { imageGenerationService } from '../../../../../services/ImageGenerationService'


interface GenerateStandaloneImageRequest {
  prompt: string
  style?: 'character_turnaround' | 'character_production' | 'custom'
  width?: number
  height?: number
  alt?: string
}

interface GenerateStandaloneImageResponse {
  success: boolean
  message?: string
  data?: {
    imageId: string
    dinoAssetId: string
    publicUrl: string
    qualityScore?: number
    validationNotes?: string
    filename: string
  }
  error?: string
  details?: string
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateStandaloneImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: GenerateStandaloneImageRequest = await request.json()

    if (!body.prompt) {
      return NextResponse.json({ 
        success: false,
        error: 'Prompt is required' 
      }, { status: 400 })
    }

    console.log(`Generating standalone initial character image`)
    console.log(`Prompt: "${body.prompt}"`)

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
    const filename = `standalone_initial_${Date.now()}.jpg`
    const mediaResult = await uploadGeneratedImage(
      generationResult.imageBuffer,
      filename,
      body.alt || `Generated character reference image: ${filename}`,
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
    // Priority: 1) DINOv3 media URL, 2) Original PayloadCMS URL, 3) Fallback construction
    const publicUrl = updatedMedia.dinoMediaUrl || updatedMedia.url || getPublicImageUrl(updatedMedia.dinoAssetId)

    // Log URL generation for debugging (can be removed in production)
    console.log(`URL generation: Using ${updatedMedia.dinoMediaUrl ? 'DINOv3' : updatedMedia.url ? 'PayloadCMS' : 'fallback'} URL: ${publicUrl}`)

    console.log(`✓ Standalone initial image generated successfully`)

    return NextResponse.json({
      success: true,
      message: `Initial character image generated successfully`,
      data: {
        imageId: mediaResult.imageId!,
        dinoAssetId: updatedMedia.dinoAssetId,
        publicUrl,
        qualityScore: updatedMedia.qualityScore ?? undefined,
        validationNotes: updatedMedia.validationNotes ?? undefined,
        filename,
      },
    })

  } catch (error) {
    console.error('Standalone initial image generation API error:', error)
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
 * Get public URL for the image from DINOv3 asset ID (fallback)
 */
function getPublicImageUrl(dinoAssetId: string): string {
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://media.rumbletv.com'

  // If the asset ID is already a complete URL, return it as-is
  if (dinoAssetId.startsWith('http://') || dinoAssetId.startsWith('https://')) {
    return dinoAssetId
  }

  // If the asset ID contains a file extension, use it as-is
  if (dinoAssetId.includes('.')) {
    return `${baseUrl}/${dinoAssetId}`
  }

  // For asset IDs without extension, construct URL without extension
  // The DINOv3 service should handle the correct object key format
  return `${baseUrl}/${dinoAssetId}`
}
