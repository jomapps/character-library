/**
 * API endpoint for validating character consistency across all gallery images
 * POST /api/characters/[id]/validate-consistency
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { qualityAssuranceService } from '../../../../../../services/QualityAssuranceService'

interface ConsistencyValidationResult {
  imageId: string
  dinoAssetId: string
  consistencyScore: number
  qualityScore: number
  isConsistent: boolean
  isQualityValid: boolean
  isOverallValid: boolean
  validationNotes: string
  recommendations: string[]
  shotType?: string
  isCoreReference: boolean
}

interface ValidationSummary {
  total: number
  consistent: number
  qualityValid: number
  overallValid: number
  averageConsistency: number
  averageQuality: number
  coreReferenceValid: number
  onDemandValid: number
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params

    console.log(`Validating character consistency for: ${characterId}`)

    // Get the character document
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Check if master reference image exists
    if (!character.masterReferenceImage) {
      return NextResponse.json(
        { error: 'Master reference image is required for consistency validation' },
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

    // Get all gallery images with DINOv3 asset IDs
    const galleryImages = (character.imageGallery || [])
      .filter((item: any) => item.dinoAssetId)
      .map((item: any) => ({
        imageId: typeof item.imageFile === 'string' ? item.imageFile : item.imageFile?.id,
        dinoAssetId: item.dinoAssetId,
        shotType: item.shotType,
        isCoreReference: item.isCoreReference || false,
        existingConsistencyScore: item.consistencyScore,
        existingQualityScore: item.qualityScore,
      }))

    if (galleryImages.length === 0) {
      return NextResponse.json(
        { error: 'No gallery images with DINOv3 processing found' },
        { status: 400 },
      )
    }

    console.log(`Validating consistency for ${galleryImages.length} gallery images`)

    // Run consistency validation for each image
    const validationResults: ConsistencyValidationResult[] = []

    for (const galleryImage of galleryImages) {
      try {
        console.log(`Validating image: ${galleryImage.imageId}`)

        // Run QA with consistency check against master reference
        const qaResult = await qualityAssuranceService.runQualityAssurance(
          galleryImage.dinoAssetId,
          masterRefMedia.dinoAssetId,
        )

        const isConsistent = qaResult.consistencyScore! >= 85 // Default consistency threshold
        const isQualityValid = qaResult.qualityScore >= 70 // Default quality threshold
        const isOverallValid = isConsistent && isQualityValid

        validationResults.push({
          imageId: galleryImage.imageId,
          dinoAssetId: galleryImage.dinoAssetId,
          consistencyScore: qaResult.consistencyScore!,
          qualityScore: qaResult.qualityScore,
          isConsistent,
          isQualityValid,
          isOverallValid,
          validationNotes: qaResult.validationNotes,
          recommendations: qaResult.recommendations,
          shotType: galleryImage.shotType,
          isCoreReference: galleryImage.isCoreReference,
        })
      } catch (error) {
        console.error(`Validation failed for image ${galleryImage.imageId}:`, error)

        validationResults.push({
          imageId: galleryImage.imageId,
          dinoAssetId: galleryImage.dinoAssetId,
          consistencyScore: 0,
          qualityScore: 0,
          isConsistent: false,
          isQualityValid: false,
          isOverallValid: false,
          validationNotes: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recommendations: ['Retry validation', 'Check image processing status'],
          shotType: galleryImage.shotType,
          isCoreReference: galleryImage.isCoreReference,
        })
      }
    }

    // Calculate summary statistics
    const summary: ValidationSummary = {
      total: validationResults.length,
      consistent: validationResults.filter((r) => r.isConsistent).length,
      qualityValid: validationResults.filter((r) => r.isQualityValid).length,
      overallValid: validationResults.filter((r) => r.isOverallValid).length,
      averageConsistency:
        validationResults.reduce((sum, r) => sum + r.consistencyScore, 0) /
        validationResults.length,
      averageQuality:
        validationResults.reduce((sum, r) => sum + r.qualityScore, 0) / validationResults.length,
      coreReferenceValid: validationResults.filter((r) => r.isCoreReference && r.isOverallValid)
        .length,
      onDemandValid: validationResults.filter((r) => !r.isCoreReference && r.isOverallValid).length,
    }

    // Update character gallery with validation results
    const updatedImageGallery = (character.imageGallery || []).map((item: any) => {
      const validationResult = validationResults.find(
        (r) =>
          (typeof item.imageFile === 'string' ? item.imageFile : item.imageFile?.id) === r.imageId,
      )

      if (validationResult) {
        return {
          ...item,
          consistencyScore: validationResult.consistencyScore,
          qualityScore: validationResult.qualityScore,
          dinoProcessingStatus: validationResult.isOverallValid
            ? ('validation_success' as const)
            : ('validation_failed' as const),
          validationNotes: validationResult.validationNotes,
        }
      }

      return item
    })

    // Update character document with validation results
    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        imageGallery: updatedImageGallery,
        lastConsistencyValidation: new Date().toISOString(),
        consistencyValidationSummary: summary as any,
      },
    })

    // Generate overall recommendations
    const overallRecommendations = generateOverallRecommendations(validationResults, summary)

    console.log(
      `✓ Consistency validation completed: ${summary.overallValid}/${summary.total} images valid`,
    )

    return NextResponse.json({
      success: true,
      message: `Validated ${summary.total} images, ${summary.overallValid} passed all checks`,
      data: {
        characterId,
        characterName: character.name,
        masterReferenceAssetId: masterRefMedia.dinoAssetId,
        validationResults,
        summary,
        recommendations: overallRecommendations,
        validatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Character consistency validation API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during consistency validation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Generate overall recommendations based on validation results
 */
function generateOverallRecommendations(
  results: ConsistencyValidationResult[],
  summary: ValidationSummary,
): string[] {
  const recommendations: string[] = []

  const passRate = summary.overallValid / summary.total
  const consistencyRate = summary.consistent / summary.total
  const qualityRate = summary.qualityValid / summary.total

  // Overall performance recommendations
  if (passRate >= 0.9) {
    recommendations.push('Excellent character consistency maintained across all images')
  } else if (passRate >= 0.7) {
    recommendations.push('Good character consistency with room for minor improvements')
  } else if (passRate >= 0.5) {
    recommendations.push('Moderate consistency issues - consider regenerating failed images')
  } else {
    recommendations.push(
      'Significant consistency problems - review generation process and reference images',
    )
  }

  // Consistency-specific recommendations
  if (consistencyRate < 0.6) {
    recommendations.push('Character consistency is below acceptable levels')
    recommendations.push('Consider strengthening reference image influence in generation')
    recommendations.push('Review character description and ensure it matches master reference')
  }

  // Quality-specific recommendations
  if (qualityRate < 0.7) {
    recommendations.push('Image quality issues detected across multiple images')
    recommendations.push('Review generation parameters and model settings')
  }

  // Core reference vs on-demand analysis
  const coreRefResults = results.filter((r) => r.isCoreReference)
  const onDemandResults = results.filter((r) => !r.isCoreReference)

  if (coreRefResults.length > 0) {
    const coreRefPassRate =
      coreRefResults.filter((r) => r.isOverallValid).length / coreRefResults.length
    if (coreRefPassRate < 0.8) {
      recommendations.push('Core reference set has consistency issues - consider regenerating')
    }
  }

  if (onDemandResults.length > 0) {
    const onDemandPassRate =
      onDemandResults.filter((r) => r.isOverallValid).length / onDemandResults.length
    if (onDemandPassRate < 0.6) {
      recommendations.push(
        'On-demand generated images show poor consistency - strengthen reference influence',
      )
    }
  }

  // Specific image recommendations
  const failedImages = results.filter((r) => !r.isOverallValid)
  if (failedImages.length > 0 && failedImages.length <= 3) {
    recommendations.push(
      `Consider regenerating specific failed images: ${failedImages.map((r) => r.shotType || r.imageId).join(', ')}`,
    )
  }

  return recommendations
}
