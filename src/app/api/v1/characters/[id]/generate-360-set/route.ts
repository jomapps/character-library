/**
 * Character 360° Image Set Generation API
 * 
 * This endpoint generates a complete 360° reference image set for a character.
 * It creates multiple angle views for comprehensive character reference.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface Generate360SetRequest {
  style?: 'character_production' | 'cinematic' | 'realistic'
  qualityThreshold?: number
  imageCount?: number
  angles?: string[]
}

export interface Generate360SetResponse {
  success: boolean
  images?: Array<{
    url: string
    angle: string
    quality: number
    dinoAssetId?: string
    mediaId?: string
  }>
  status: 'completed' | 'processing' | 'failed'
  processingTime?: number
  error?: string
}

const DEFAULT_ANGLES = [
  'front',
  'back', 
  'left',
  'right',
  'three-quarter-left',
  'three-quarter-right',
  'front-left',
  'front-right'
]

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Generate360SetResponse>> {
  const startTime = Date.now()
  
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    const body: Generate360SetRequest = await request.json()

    console.log(`Generating 360° image set for character: ${id}`)

    // Validate character exists
    const character = await payload.findByID({
      collection: 'characters',
      id,
      depth: 2,
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Character not found',
      }, { status: 404 })
    }

    // Extract parameters with defaults
    const style = body.style || 'character_production'
    const qualityThreshold = body.qualityThreshold || 75
    const imageCount = body.imageCount || 8
    const angles = body.angles || DEFAULT_ANGLES.slice(0, imageCount)

    console.log(`Generating ${angles.length} images with style: ${style}`)

    // Check if character has sufficient data for generation
    if (!character.physicalDescription && !character.masterReferenceImage) {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Character needs either a physical description or reference image for 360° generation',
      }, { status: 400 })
    }

    // Generate images for each angle
    const generatedImages: Array<{
      url: string
      angle: string
      quality: number
      dinoAssetId?: string
      mediaId?: string
    }> = []

    for (const angle of angles) {
      try {
        console.log(`Generating image for angle: ${angle}`)
        
        // Create prompt for this specific angle
        const anglePrompt = createAnglePrompt(character, angle, style)
        
        // Here you would integrate with your image generation service
        // For now, we'll simulate the generation process
        const imageResult = await generateImageForAngle(character, angle, anglePrompt, qualityThreshold)
        
        if (imageResult.success && imageResult.url && imageResult.quality) {
          generatedImages.push({
            url: imageResult.url,
            angle: angle,
            quality: imageResult.quality,
            dinoAssetId: imageResult.dinoAssetId,
            mediaId: imageResult.mediaId,
          })
        } else {
          console.warn(`Failed to generate image for angle ${angle}: ${imageResult.error}`)
        }
        
      } catch (angleError) {
        console.error(`Error generating image for angle ${angle}:`, angleError)
        // Continue with other angles even if one fails
      }
    }

    // Update character with generated images
    if (generatedImages.length > 0) {
      const imageGalleryUpdate = generatedImages.map(img => ({
        imageFile: img.mediaId,
        isCoreReference: true,
        angle: img.angle,
        dinoAssetId: img.dinoAssetId,
        quality: img.quality,
        generatedAt: new Date().toISOString(),
        style: style,
      }))

      await payload.update({
        collection: 'characters',
        id,
        data: {
          imageGallery: [
            ...(character.imageGallery || []),
            ...imageGalleryUpdate
          ],
          coreSetGenerated: true,
          coreSetGeneratedAt: new Date().toISOString(),
        },
      })
    }

    const processingTime = Date.now() - startTime
    const status = generatedImages.length > 0 ? 'completed' : 'failed'

    console.log(`360° generation ${status} for character ${id}. Generated ${generatedImages.length}/${angles.length} images in ${processingTime}ms`)

    return NextResponse.json({
      success: generatedImages.length > 0,
      images: generatedImages,
      status,
      processingTime,
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('360° image set generation error:', error)
    
    return NextResponse.json({
      success: false,
      status: 'failed',
      processingTime,
      error: error instanceof Error ? error.message : 'Failed to generate 360° image set',
    }, { status: 500 })
  }
}

function createAnglePrompt(character: any, angle: string, style: string): string {
  const baseDescription = extractTextFromField(character.physicalDescription) ||
                         extractTextFromField(character.biography) ||
                         `Character named ${character.name}`
  
  const styleModifiers: Record<string, string> = {
    'character_production': 'professional character sheet style, clean background, consistent lighting',
    'cinematic': 'cinematic lighting, dramatic composition, film quality',
    'realistic': 'photorealistic, natural lighting, detailed textures'
  }

  const angleInstructions: Record<string, string> = {
    'front': 'facing directly forward, front view',
    'back': 'facing away, back view showing rear',
    'left': 'left profile, side view from left',
    'right': 'right profile, side view from right',
    'three-quarter-left': 'three-quarter view from left side',
    'three-quarter-right': 'three-quarter view from right side',
    'front-left': 'angled front-left view',
    'front-right': 'angled front-right view'
  }

  return `${baseDescription}, ${angleInstructions[angle] || angle}, ${styleModifiers[style] || styleModifiers['character_production']}`
}

function extractTextFromField(field: any): string | null {
  if (!field) {
    return null
  }

  if (typeof field === 'string') {
    return field.trim() || null
  }

  throw new Error(`Expected string field but received ${typeof field}. RichText format is no longer supported.`)
}

async function generateImageForAngle(
  character: any, 
  angle: string, 
  prompt: string, 
  qualityThreshold: number
): Promise<{
  success: boolean
  url?: string
  quality?: number
  dinoAssetId?: string
  mediaId?: string
  error?: string
}> {
  // This is a placeholder for actual image generation integration
  // You would integrate with your preferred image generation service here
  // For example: DALL-E, Midjourney, Stable Diffusion, etc.
  
  try {
    // Simulate image generation process
    console.log(`Simulating image generation for prompt: ${prompt}`)
    
    // In a real implementation, you would:
    // 1. Call your image generation API
    // 2. Upload the generated image to your media storage
    // 3. Create a media record in Payload
    // 4. Return the media ID and URL
    
    // For now, return a simulated success response
    return {
      success: true,
      url: `https://placeholder.example.com/character-${character.id}-${angle}.jpg`,
      quality: Math.floor(Math.random() * 25) + 75, // Random quality 75-100
      dinoAssetId: `dino-${character.id}-${angle}-${Date.now()}`,
      mediaId: `media-${character.id}-${angle}-${Date.now()}`,
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed'
    }
  }
}
