/**
 * Character Images API
 * 
 * GET /api/v1/characters/{id}/images
 * 
 * Returns all generated images for a character in organized categories:
 * - Master reference image
 * - 360° core reference set
 * - Scene-specific images
 * - On-demand generated images
 * - Relationship/interaction images
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface CharacterImagesResponse {
  success: boolean
  characterId: string
  characterName: string
  totalImages: number
  images: {
    masterReference?: {
      imageId: string
      url: string
      dinoAssetId?: string | null
      qualityScore?: number | null
      isProcessed: boolean
    }
    coreReferenceSet: Array<{
      imageId: string
      url: string
      dinoAssetId?: string | null
      shotType: string
      angle?: string
      lens?: string
      qualityScore?: number | null
      consistencyScore?: number | null
      isValid: boolean
      referenceShot?: any
    }>
    sceneImages: Array<{
      imageId: string
      url: string
      dinoAssetId?: string | null
      shotType: string
      sceneContext?: string
      tags?: string
      qualityScore?: number | null
      consistencyScore?: number | null
      isValid: boolean
      generationPrompt?: string
    }>
    onDemandImages: Array<{
      imageId: string
      url: string
      dinoAssetId?: string | null
      shotType: string
      tags?: string
      qualityScore?: number | null
      consistencyScore?: number | null
      isValid: boolean
      generationPrompt?: string
    }>
    relationshipImages: Array<{
      imageId: string
      url: string
      dinoAssetId?: string | null
      shotType: string
      tags?: string
      qualityScore?: number | null
      consistencyScore?: number | null
      isValid: boolean
    }>
  }
  summary: {
    masterReferenceCount: number
    coreReferenceCount: number
    sceneImageCount: number
    onDemandImageCount: number
    relationshipImageCount: number
    totalValidImages: number
    averageQuality: number
    averageConsistency: number
  }
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<CharacterImagesResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const { searchParams } = new URL(request.url)
    
    // Query parameters
    const includeUrls = searchParams.get('includeUrls') !== 'false' // Default true
    const minQuality = parseInt(searchParams.get('minQuality') || '0')
    const category = searchParams.get('category') // Filter by category

    console.log(`📸 Fetching all images for character: ${characterId}`)

    // Get character with full media details
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 3, // Include all related media with full details
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        characterId,
        characterName: '',
        totalImages: 0,
        images: {
          coreReferenceSet: [],
          sceneImages: [],
          onDemandImages: [],
          relationshipImages: []
        },
        summary: {
          masterReferenceCount: 0,
          coreReferenceCount: 0,
          sceneImageCount: 0,
          onDemandImageCount: 0,
          relationshipImageCount: 0,
          totalValidImages: 0,
          averageQuality: 0,
          averageConsistency: 0
        },
        error: 'Character not found'
      }, { status: 404 })
    }

    // Helper function to get image URL
    const getImageUrl = (imageFile: any): string => {
      if (!includeUrls) return ''
      
      if (typeof imageFile === 'object' && imageFile?.url) {
        return imageFile.url
      }
      if (typeof imageFile === 'object' && imageFile?.filename) {
        return `https://media.rumbletv.com/media/${imageFile.filename}`
      }
      return ''
    }

    // Helper function to check if image meets quality threshold
    const meetsQuality = (qualityScore?: number | null): boolean => {
      return !qualityScore || qualityScore >= minQuality
    }

    // Process master reference image
    let masterReference = undefined
    if (character.masterReferenceImage && typeof character.masterReferenceImage === 'object') {
      const masterRef = character.masterReferenceImage
      if (meetsQuality(masterRef.qualityScore)) {
        masterReference = {
          imageId: masterRef.id,
          url: getImageUrl(masterRef),
          dinoAssetId: masterRef.dinoAssetId,
          qualityScore: masterRef.qualityScore,
          isProcessed: character.masterReferenceProcessed || false
        }
      }
    }

    // Process image gallery
    const imageGallery = character.imageGallery || []
    
    const coreReferenceSet = imageGallery
      .filter((item: any) => 
        item.isCoreReference && 
        meetsQuality(item.qualityScore) &&
        (!category || category === 'core')
      )
      .map((item: any) => ({
        imageId: typeof item.imageFile === 'string' ? item.imageFile : item.imageFile?.id,
        url: getImageUrl(item.imageFile),
        dinoAssetId: item.dinoAssetId,
        shotType: item.shotType || 'core_reference',
        angle: item.referenceShot?.angle,
        lens: item.referenceShot?.lensMm ? `${item.referenceShot.lensMm}mm` : undefined,
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore,
        isValid: item.dinoProcessingStatus === 'validation_success',
        referenceShot: item.referenceShot
      }))

    const sceneImages = imageGallery
      .filter((item: any) => 
        !item.isCoreReference && 
        (item.shotType === 'scene' || item.shotType?.includes('scene')) &&
        meetsQuality(item.qualityScore) &&
        (!category || category === 'scene')
      )
      .map((item: any) => ({
        imageId: typeof item.imageFile === 'string' ? item.imageFile : item.imageFile?.id,
        url: getImageUrl(item.imageFile),
        dinoAssetId: item.dinoAssetId,
        shotType: item.shotType || 'scene',
        sceneContext: item.sceneContext,
        tags: item.tags,
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore,
        isValid: item.dinoProcessingStatus === 'validation_success',
        generationPrompt: item.generationPrompt
      }))

    const onDemandImages = imageGallery
      .filter((item: any) => 
        !item.isCoreReference && 
        (item.shotType === 'on_demand' || item.generationPrompt) &&
        item.shotType !== 'scene' &&
        item.shotType !== 'relationship' &&
        item.shotType !== 'interaction' &&
        meetsQuality(item.qualityScore) &&
        (!category || category === 'ondemand')
      )
      .map((item: any) => ({
        imageId: typeof item.imageFile === 'string' ? item.imageFile : item.imageFile?.id,
        url: getImageUrl(item.imageFile),
        dinoAssetId: item.dinoAssetId,
        shotType: item.shotType || 'on_demand',
        tags: item.tags,
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore,
        isValid: item.dinoProcessingStatus === 'validation_success',
        generationPrompt: item.generationPrompt
      }))

    const relationshipImages = imageGallery
      .filter((item: any) => 
        !item.isCoreReference && 
        (item.shotType === 'relationship' || item.shotType === 'interaction') &&
        meetsQuality(item.qualityScore) &&
        (!category || category === 'relationship')
      )
      .map((item: any) => ({
        imageId: typeof item.imageFile === 'string' ? item.imageFile : item.imageFile?.id,
        url: getImageUrl(item.imageFile),
        dinoAssetId: item.dinoAssetId,
        shotType: item.shotType || 'relationship',
        tags: item.tags,
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore,
        isValid: item.dinoProcessingStatus === 'validation_success'
      }))

    // Calculate summary statistics
    const allImages = [
      ...(masterReference ? [masterReference] : []),
      ...coreReferenceSet,
      ...sceneImages,
      ...onDemandImages,
      ...relationshipImages
    ]

    const validImages = allImages.filter(img => 
      'isValid' in img ? img.isValid : ('isProcessed' in img ? img.isProcessed : true)
    )

    const qualityScores = allImages
      .map(img => img.qualityScore)
      .filter((score): score is number => typeof score === 'number')

    const consistencyScores = allImages
      .map(img => 'consistencyScore' in img ? img.consistencyScore : undefined)
      .filter((score): score is number => typeof score === 'number')

    const summary = {
      masterReferenceCount: masterReference ? 1 : 0,
      coreReferenceCount: coreReferenceSet.length,
      sceneImageCount: sceneImages.length,
      onDemandImageCount: onDemandImages.length,
      relationshipImageCount: relationshipImages.length,
      totalValidImages: validImages.length,
      averageQuality: qualityScores.length > 0 
        ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length)
        : 0,
      averageConsistency: consistencyScores.length > 0
        ? Math.round(consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length)
        : 0
    }

    console.log(`📸 Found ${allImages.length} total images for character ${character.name}`)

    return NextResponse.json({
      success: true,
      characterId,
      characterName: character.name || 'Unknown Character',
      totalImages: allImages.length,
      images: {
        masterReference,
        coreReferenceSet,
        sceneImages,
        onDemandImages,
        relationshipImages
      },
      summary
    })

  } catch (error) {
    console.error('Character images API error:', error)
    return NextResponse.json({
      success: false,
      characterId: '',
      characterName: '',
      totalImages: 0,
      images: {
        coreReferenceSet: [],
        sceneImages: [],
        onDemandImages: [],
        relationshipImages: []
      },
      summary: {
        masterReferenceCount: 0,
        coreReferenceCount: 0,
        sceneImageCount: 0,
        onDemandImageCount: 0,
        relationshipImageCount: 0,
        totalValidImages: 0,
        averageQuality: 0,
        averageConsistency: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
