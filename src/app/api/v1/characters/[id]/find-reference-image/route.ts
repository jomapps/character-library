/**
 * API endpoint for finding the best reference image for a character based on a prompt
 * POST /api/v1/characters/[id]/find-reference-image
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { referenceSearchService } from '../../../../../../services/ReferenceSearchService'

export interface FindReferenceImageRequest {
  prompt: string
  preferredLens?: number // 35, 50, 85
  preferredAngle?: string
  preferredCrop?: string
  includeAddonShots?: boolean
  minQualityScore?: number
  returnAlternatives?: boolean
}

export interface FindReferenceImageResponse {
  success: boolean
  bestMatch?: {
    imageUrl: string
    imageId: string
    referenceShot: {
      shotName: string
      lensMm: number
      mode: string
      angle: string
      crop: string
      expression: string
      pose: string
      description: string
      usageNotes: string
    }
    confidence: number
    reasoning: string
  }
  alternatives?: Array<{
    imageUrl: string
    imageId: string
    referenceShot: any
    confidence: number
    reasoning: string
  }>
  analysis?: {
    sceneType: string
    mood: string[]
    suggestedLens: number
    suggestedAngle: string
    suggestedCrop: string
    suggestedExpression: string
    keywords: string[]
    confidence: number
  }
  error?: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<FindReferenceImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: FindReferenceImageRequest = await request.json()

    console.log(`🔍 Finding reference image for character: ${characterId}`)
    console.log(`📝 Prompt: "${body.prompt}"`)

    // Validate required fields
    if (!body.prompt?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required',
      }, { status: 400 })
    }

    // Validate character exists
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 1,
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Check if character has reference images
    if (!character.imageGallery || character.imageGallery.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Character has no reference images. Generate a 360° core set first.',
      }, { status: 400 })
    }

    // Search for best reference image
    const searchResult = await referenceSearchService.findBestReference(
      characterId,
      body.prompt,
      payload,
      {
        preferredLens: body.preferredLens,
        preferredAngle: body.preferredAngle,
        preferredCrop: body.preferredCrop,
        includeAddonShots: body.includeAddonShots || false,
        minQualityScore: body.minQualityScore || 70,
      }
    )

    if (!searchResult.success) {
      return NextResponse.json({
        success: false,
        error: searchResult.error || 'Reference search failed',
      }, { status: 500 })
    }

    // Format response
    const response: FindReferenceImageResponse = {
      success: true,
      bestMatch: searchResult.bestMatch ? {
        imageUrl: searchResult.bestMatch.imageUrl,
        imageId: searchResult.bestMatch.imageId,
        referenceShot: {
          shotName: searchResult.bestMatch.referenceShot.shotName,
          lensMm: searchResult.bestMatch.referenceShot.lensMm,
          mode: searchResult.bestMatch.referenceShot.mode,
          angle: searchResult.bestMatch.referenceShot.angle,
          crop: searchResult.bestMatch.referenceShot.crop,
          expression: searchResult.bestMatch.referenceShot.expression,
          pose: searchResult.bestMatch.referenceShot.pose,
          description: searchResult.bestMatch.referenceShot.description,
          usageNotes: searchResult.bestMatch.referenceShot.usageNotes,
        },
        confidence: searchResult.bestMatch.confidence,
        reasoning: searchResult.bestMatch.reasoning,
      } : undefined,
    }

    // Include alternatives if requested
    if (body.returnAlternatives && searchResult.alternatives) {
      response.alternatives = searchResult.alternatives.map(alt => ({
        imageUrl: alt.imageUrl,
        imageId: alt.imageId,
        referenceShot: alt.referenceShot,
        confidence: alt.confidence,
        reasoning: alt.reasoning,
      }))
    }

    console.log(`🎯 Found reference: ${response.bestMatch?.referenceShot.shotName} (${response.bestMatch?.confidence.toFixed(1)}% confidence)`)
    console.log(`💡 Reasoning: ${response.bestMatch?.reasoning}`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Find reference image API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const { searchParams } = new URL(request.url)
    
    const includeAddonShots = searchParams.get('includeAddonShots') === 'true'
    const minQualityScore = parseInt(searchParams.get('minQualityScore') || '70')

    console.log(`📋 Listing reference images for character: ${characterId}`)

    // Get character with reference images
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 3, // Include related media and reference shots
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Filter and format reference images
    const referenceImages = (character.imageGallery || [])
      .filter((image: any) => {
        if (!image.isCoreReference) return false
        if (!image.referenceShot) return false
        if (image.qualityScore && image.qualityScore < minQualityScore) return false
        if (!includeAddonShots && image.referenceShot.pack === 'addon') return false
        return true
      })
      .map((image: any) => ({
        imageId: image.imageFile?.id || image.imageFile,
        imageUrl: `https://your-media-domain.com/${image.imageFile?.id || image.imageFile}`,
        referenceShot: {
          shotName: image.referenceShot.shotName,
          lensMm: image.referenceShot.lensMm,
          mode: image.referenceShot.mode,
          angle: image.referenceShot.angle,
          crop: image.referenceShot.crop,
          expression: image.referenceShot.expression,
          pose: image.referenceShot.pose,
          pack: image.referenceShot.pack,
          description: image.referenceShot.description,
          usageNotes: image.referenceShot.usageNotes,
        },
        qualityScore: image.qualityScore,
        consistencyScore: image.consistencyScore,
      }))

    // Group by lens for easier browsing
    const groupedByLens = referenceImages.reduce((groups: any, image: any) => {
      const lens = image.referenceShot.lensMm
      if (!groups[lens]) groups[lens] = []
      groups[lens].push(image)
      return groups
    }, {})

    return NextResponse.json({
      success: true,
      characterId,
      characterName: character.name,
      totalImages: referenceImages.length,
      images: referenceImages,
      groupedByLens,
      summary: {
        coreImages: referenceImages.filter((img: any) => img.referenceShot.pack === 'core').length,
        addonImages: referenceImages.filter((img: any) => img.referenceShot.pack === 'addon').length,
        averageQuality: referenceImages.reduce((sum: number, img: any) => sum + (img.qualityScore || 0), 0) / referenceImages.length,
        lensDistribution: {
          '35mm': referenceImages.filter((img: any) => img.referenceShot.lensMm === 35).length,
          '50mm': referenceImages.filter((img: any) => img.referenceShot.lensMm === 50).length,
          '85mm': referenceImages.filter((img: any) => img.referenceShot.lensMm === 85).length,
        },
      },
    })

  } catch (error) {
    console.error('List reference images API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}
