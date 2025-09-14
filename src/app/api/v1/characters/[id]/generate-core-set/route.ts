/**
 * API endpoint for generating 360° core reference set for a character
 * POST /api/characters/[id]/generate-core-set
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
// import { characterWorkflowService } from '../../../../../../services/CharacterWorkflowService' // Legacy service, now using CoreSetGenerationService
import { coreSetGenerationService } from '../../../../../../services/CoreSetGenerationService'

interface GenerateCoreSetRequest {
  includeAddonShots?: boolean
  customSeed?: number
  qualityThreshold?: number
  maxRetries?: number
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: GenerateCoreSetRequest = await request.json().catch(() => ({}))

    console.log(`🎬 Starting enhanced 360° core set generation for character: ${characterId}`)

    // Get the character document with full depth for relationships
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 2,
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Check if master reference image exists and is processed
    if (!character.masterReferenceImage) {
      return NextResponse.json(
        { error: 'Master reference image is required before generating core set' },
        { status: 400 },
      )
    }

    if (!character.masterReferenceProcessed) {
      return NextResponse.json(
        { error: 'Master reference image must be processed before generating core set' },
        { status: 400 },
      )
    }

    // Get the master reference media document
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

    // Prepare character data for template generation
    const characterData = {
      name: character.name,
      physicalDescription: character.physicalDescription,
      personality: character.personality,
      age: character.age,
      eyeColor: character.eyeColor,
      hairColor: character.hairColor,
      height: character.height,
      motivations: character.motivations,
      // fears: character.fears, // Field doesn't exist in Character type
    }

    // Generate the 360° core set using new template system
    const result = await coreSetGenerationService.generate360CoreSet(
      characterId,
      masterRefMedia.dinoAssetId,
      characterData,
      payload,
      {
        customSeed: body.customSeed,
        qualityThreshold: body.qualityThreshold || 75,
        maxRetries: body.maxRetries || 3,
      }
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Core set generation failed',
          details: {
            generatedImages: result.generatedImages,
            failedImages: result.failedImages,
            totalAttempts: result.totalAttempts,
            errorMessage: result.error,
          },
        },
        { status: 500 },
      )
    }

    // Update character document with enhanced core set results
    const coreSetImages = result.generatedImages.map((img) => ({
      imageFile: img.imageId,
      isCoreReference: true,
      referenceShot: img.referenceShot.id, // Link to reference shot template

      // Enhanced metadata from template
      lens: img.referenceShot.lensMm,
      angle: img.referenceShot.angle,
      crop: img.referenceShot.crop,
      expression: img.referenceShot.expression,
      pose: img.referenceShot.pose,
      referenceWeight: img.referenceShot.referenceWeight,

      // Quality and validation data
      dinoAssetId: img.dinoAssetId,
      dinoProcessingStatus: img.isValid ? 'validation_success' as const : 'validation_failed' as const,
      qualityScore: img.qualityScore,
      consistencyScore: img.consistencyScore,
      validationNotes: img.validationNotes || `Generated using ${img.referenceShot.shotName} template`,

      // Legacy fields for backward compatibility
      shotType: img.referenceShot.slug,
      tags: `360° core reference, ${img.referenceShot.mode}, ${img.referenceShot.pack}`,
      generationPrompt: `Template-generated using ${img.referenceShot.shotName}`,
    }))

    // Add core set images to character gallery
    const updatedImageGallery = [...(character.imageGallery || []), ...coreSetImages]

    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        imageGallery: updatedImageGallery,
        coreSetGenerated: true,
        coreSetGeneratedAt: new Date().toISOString(),
        coreSetQuality: {
          successCount: result.generatedImages.filter((img) => img.isValid).length,
          totalAttempts: result.totalAttempts,
          averageQuality:
            result.generatedImages.reduce((sum, img) => sum + img.qualityScore, 0) /
            result.generatedImages.length,
          averageConsistency:
            result.generatedImages.reduce((sum, img) => sum + img.consistencyScore, 0) /
            result.generatedImages.length,
        },
      },
    })

    console.log(`✓ Enhanced 360° core set generation completed for character: ${character.name}`)

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${result.generatedImages.length} reference images using template system`,
      data: {
        characterId,
        characterName: character.name,
        generatedImages: result.generatedImages,
        failedImages: result.failedImages,
        totalAttempts: result.totalAttempts,
        coreSetImages: coreSetImages.map((img) => ({
          imageId: img.imageFile,
          referenceShot: img.referenceShot,
          shotName: result.generatedImages.find(gi => gi.imageId === img.imageFile)?.referenceShot.shotName,
          qualityScore: img.qualityScore,
          consistencyScore: img.consistencyScore,
          lens: img.lens,
          angle: img.angle,
          crop: img.crop,
        })),
        summary: {
          totalGenerated: result.generatedImages.length,
          validImages: result.generatedImages.filter(img => img.isValid).length,
          averageQuality: result.generatedImages.reduce((sum, img) => sum + img.qualityScore, 0) / result.generatedImages.length,
          averageConsistency: result.generatedImages.reduce((sum, img) => sum + img.consistencyScore, 0) / result.generatedImages.length,
        },
      },
    })
  } catch (error) {
    console.error('Core set generation API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during core set generation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Build character description from persona data for image generation
 * @deprecated - Now using enhanced character data structure in CoreSetGenerationService
 */
function _buildCharacterDescription(character: any): string {
  const parts: string[] = []

  // Add basic info
  if (character.name) {
    parts.push(character.name)
  }

  // Add physical description
  if (character.age) {
    parts.push(`${character.age} years old`)
  }

  if (character.physicalDescription) {
    // Extract key physical traits from text
    const physicalText = _extractTextFromField(character.physicalDescription)
    if (physicalText) {
      parts.push(physicalText.substring(0, 200)) // Limit length
    }
  }

  // Add basic physical attributes
  const physicalAttribs: string[] = []
  if (character.eyeColor) physicalAttribs.push(`${character.eyeColor} eyes`)
  if (character.hairColor) physicalAttribs.push(`${character.hairColor} hair`)
  if (character.height) physicalAttribs.push(`${character.height} tall`)

  if (physicalAttribs.length > 0) {
    parts.push(physicalAttribs.join(', '))
  }

  // Add clothing/style if available
  if (character.clothing) {
    const clothingText = _extractTextFromField(character.clothing)
    if (clothingText) {
      parts.push(clothingText.substring(0, 100))
    }
  }

  return parts.join(', ')
}

/**
 * Extract text from field - expects string format only
 * @deprecated - Legacy function
 */
function _extractTextFromField(field: any): string {
  if (!field) return ''

  if (typeof field === 'string') {
    return field
  }

  throw new Error(`Expected string field but received ${typeof field}. RichText format is no longer supported.`)
}


