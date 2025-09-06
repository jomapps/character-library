/**
 * API endpoint for generating on-demand images for a character
 * POST /api/characters/[id]/generate-image
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { characterWorkflowService } from '../../../../../../services/CharacterWorkflowService'

interface GenerateImageRequest {
  prompt: string
  shotType?: string
  tags?: string
  style?: 'character_turnaround' | 'character_production' | 'custom'
  count?: number
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: GenerateImageRequest = await request.json()

    if (!body.prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log(`Generating on-demand image for character: ${characterId}`)
    console.log(`Prompt: "${body.prompt}"`)

    // Get the character document
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Check if master reference image exists and is processed
    if (!character.masterReferenceImage || !character.masterReferenceProcessed) {
      return NextResponse.json(
        { error: 'Master reference image must be processed before generating images' },
        { status: 400 },
      )
    }

    // Get master reference media document
    const masterRefId =
      typeof character.masterReferenceImage === 'string'
        ? character.masterReferenceImage
        : character.masterReferenceImage.id

    const masterRefMedia = await payload.findByID({
      collection: 'media',
      id: masterRefId,
    })

    if (!masterRefMedia || !masterRefMedia.dinoAssetId) {
      return NextResponse.json(
        { error: 'Master reference image not properly processed with DINOv3' },
        { status: 400 },
      )
    }

    // Get core reference set asset IDs if available
    const coreReferenceAssetIds: string[] = []
    if (character.imageGallery) {
      for (const galleryItem of character.imageGallery) {
        if (galleryItem.isCoreReference && galleryItem.dinoAssetId) {
          coreReferenceAssetIds.push(galleryItem.dinoAssetId)
        }
      }
    }

    // Generate the requested number of images (default 1)
    const count = Math.min(body.count || 1, 5) // Limit to 5 images max
    const results = []

    for (let i = 0; i < count; i++) {
      console.log(`Generating image ${i + 1}/${count}`)

      const result = await characterWorkflowService.generateOnDemandImage(
        character.characterId || characterId,
        body.prompt,
        masterRefMedia.dinoAssetId,
        coreReferenceAssetIds,
        payload,
      )

      if (result.success && result.imageId) {
        // Add to character gallery
        const galleryItem = {
          imageFile: result.imageId,
          isCoreReference: false,
          dinoAssetId: result.dinoAssetId,
          dinoProcessingStatus: result.isValid
            ? ('validation_success' as const)
            : ('validation_failed' as const),
          qualityScore: result.qualityScore,
          consistencyScore: result.consistencyScore,
          validationNotes: result.validationNotes,
          shotType: body.shotType || 'on_demand',
          tags: body.tags || 'on-demand generation',
          generationPrompt: body.prompt,
        }

        // Update character gallery
        const updatedImageGallery = [...(character.imageGallery || []), galleryItem]

        await payload.update({
          collection: 'characters',
          id: characterId,
          data: {
            imageGallery: updatedImageGallery,
          },
        })

        results.push({
          success: true,
          imageId: result.imageId,
          qualityScore: result.qualityScore,
          consistencyScore: result.consistencyScore,
          isValid: result.isValid,
          validationNotes: result.validationNotes,
        })
      } else {
        results.push({
          success: false,
          error: result.error,
        })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const validCount = results.filter((r) => r.success && r.isValid).length

    console.log(`✓ Generated ${successCount}/${count} images, ${validCount} passed validation`)

    return NextResponse.json({
      success: successCount > 0,
      message: `Generated ${successCount}/${count} images, ${validCount} passed validation`,
      data: {
        characterId,
        characterName: character.name,
        prompt: body.prompt,
        results,
        summary: {
          total: count,
          successful: successCount,
          valid: validCount,
          averageQuality:
            results
              .filter((r) => r.success && r.qualityScore)
              .reduce((sum, r) => sum + (r.qualityScore || 0), 0) / successCount || 0,
          averageConsistency:
            results
              .filter((r) => r.success && r.consistencyScore)
              .reduce((sum, r) => sum + (r.consistencyScore || 0), 0) / successCount || 0,
        },
      },
    })
  } catch (error) {
    console.error('On-demand image generation API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during image generation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// GET endpoint to retrieve generation history
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params

    // Get the character document
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Filter gallery for on-demand generated images
    const onDemandImages = (character.imageGallery || [])
      .filter((item: any) => !item.isCoreReference && item.generationPrompt)
      .map((item: any) => ({
        imageId: item.imageFile,
        prompt: item.generationPrompt,
        shotType: item.shotType,
        tags: item.tags,
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore,
        isValid: item.dinoProcessingStatus === 'validation_success',
        validationNotes: item.validationNotes,
      }))

    return NextResponse.json({
      success: true,
      data: {
        characterId,
        characterName: character.name,
        onDemandImages,
        summary: {
          total: onDemandImages.length,
          valid: onDemandImages.filter((img: any) => img.isValid).length,
          averageQuality:
            onDemandImages.length > 0
              ? onDemandImages.reduce((sum: number, img: any) => sum + (img.qualityScore || 0), 0) /
                onDemandImages.length
              : 0,
          averageConsistency:
            onDemandImages.length > 0
              ? onDemandImages.reduce(
                  (sum: number, img: any) => sum + (img.consistencyScore || 0),
                  0,
                ) / onDemandImages.length
              : 0,
        },
      },
    })
  } catch (error) {
    console.error('Get generation history API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
