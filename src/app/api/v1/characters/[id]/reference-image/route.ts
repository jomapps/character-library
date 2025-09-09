/**
 * Character Reference Image Management API
 * 
 * This endpoint handles updating a character's master reference image.
 * It supports both URL-based images and uploaded media references.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface ReferenceImageRequest {
  imageUrl?: string
  mediaId?: string // For uploaded media
  metadata?: {
    source: 'novel-movie' | 'generated' | 'uploaded'
    quality?: number
    dinoAssetId?: string
    description?: string
  }
}

export interface ReferenceImageResponse {
  success: boolean
  updated: boolean
  imageUrl?: string
  mediaId?: string
  error?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ReferenceImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    const body: ReferenceImageRequest = await request.json()

    console.log(`Updating reference image for character: ${id}`)

    // Validate request
    if (!body.imageUrl && !body.mediaId) {
      return NextResponse.json({
        success: false,
        updated: false,
        error: 'Either imageUrl or mediaId is required',
      }, { status: 400 })
    }

    // Check if character exists
    const existingCharacter = await payload.findByID({
      collection: 'characters',
      id,
    })

    if (!existingCharacter) {
      return NextResponse.json({
        success: false,
        updated: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (body.mediaId) {
      // Using uploaded media reference
      updateData.masterReferenceImage = body.mediaId
    } else if (body.imageUrl) {
      // For URL-based images, we might need to create a media record
      // or store the URL in a different field depending on your schema
      updateData.referenceImageUrl = body.imageUrl
    }

    // Add metadata if provided
    if (body.metadata) {
      updateData.referenceImageMetadata = {
        source: body.metadata.source || 'uploaded',
        quality: body.metadata.quality,
        dinoAssetId: body.metadata.dinoAssetId,
        description: body.metadata.description,
        updatedAt: new Date().toISOString(),
      }
    }

    // Update the character
    const updatedCharacter = await payload.update({
      collection: 'characters',
      id,
      data: updateData,
    })

    console.log(`Successfully updated reference image for character: ${id}`)

    // Prepare response
    let responseImageUrl = body.imageUrl
    if (body.mediaId && updatedCharacter.masterReferenceImage) {
      // If we have a media reference, get the URL from the media object
      const mediaObj = updatedCharacter.masterReferenceImage
      if (typeof mediaObj === 'object' && mediaObj.url) {
        responseImageUrl = mediaObj.url
      }
    }

    return NextResponse.json({
      success: true,
      updated: true,
      imageUrl: responseImageUrl,
      mediaId: body.mediaId,
    })

  } catch (error) {
    console.error('Reference image update error:', error)
    return NextResponse.json({
      success: false,
      updated: false,
      error: error instanceof Error ? error.message : 'Failed to update reference image',
    }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ReferenceImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    const character = await payload.findByID({
      collection: 'characters',
      id,
      depth: 2, // Include media details
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        updated: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Extract image information
    let imageUrl: string | undefined
    let mediaId: string | undefined

    if (character.masterReferenceImage) {
      if (typeof character.masterReferenceImage === 'object') {
        imageUrl = character.masterReferenceImage.url || undefined
        mediaId = character.masterReferenceImage.id
      } else {
        mediaId = character.masterReferenceImage
      }
    }

    return NextResponse.json({
      success: true,
      updated: true,
      imageUrl,
      mediaId,
    })

  } catch (error) {
    console.error('Reference image fetch error:', error)
    return NextResponse.json({
      success: false,
      updated: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reference image',
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ReferenceImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    console.log(`Deleting master reference image and all derived content for character: ${id}`)

    // Check if character exists
    const existingCharacter = await payload.findByID({
      collection: 'characters',
      id,
      depth: 2, // Include media details
    })

    if (!existingCharacter) {
      return NextResponse.json({
        success: false,
        updated: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    console.log(`Character found: ${existingCharacter.name}`)

    // Reset all master reference related data and derived content
    // This is a complete reset - new master reference means starting over
    const resetData = {
      // Master Reference Image
      masterReferenceImage: null,
      masterReferenceProcessed: false,
      masterReferenceQuality: null,

      // Core Set (360° reference images) - all based on master reference
      coreSetGenerated: false,
      coreSetGeneratedAt: null,
      coreSetQuality: null,

      // Image Gallery - all generated images are based on master reference
      imageGallery: [],

      // Quality Metrics - all consistency is measured against master reference
      enhancedQualityMetrics: {
        narrativeConsistency: null,
        crossSceneConsistency: null,
        relationshipVisualConsistency: null,
        lastValidated: null,
        validationHistory: [],
      },

      // Consistency Validation - no longer valid without master reference
      lastConsistencyValidation: null,
      consistencyValidationSummary: null,

      // Scene Contexts - clear generated images as they're based on master reference
      sceneContexts: (existingCharacter.sceneContexts || []).map((context: any) => ({
        ...context,
        generatedImages: [], // Clear all generated images
        qualityScores: [],   // Clear quality scores
        lastGenerated: null, // Reset generation timestamp
      })),
    }

    const updatedCharacter = await payload.update({
      collection: 'characters',
      id,
      data: resetData,
    })

    console.log(`Successfully reset character ${existingCharacter.name} - all derived content cleared`)

    return NextResponse.json({
      success: true,
      updated: true,
      message: 'Master reference image and all derived content deleted successfully. Character reset to base state.',
      resetFields: [
        'masterReferenceImage',
        'masterReferenceProcessed',
        'masterReferenceQuality',
        'coreSetGenerated',
        'coreSetGeneratedAt',
        'coreSetQuality',
        'imageGallery',
        'enhancedQualityMetrics',
        'lastConsistencyValidation',
        'consistencyValidationSummary',
        'sceneContexts.generatedImages'
      ]
    })

  } catch (error) {
    console.error('Master reference deletion error:', error)
    return NextResponse.json({
      success: false,
      updated: false,
      error: error instanceof Error ? error.message : 'Failed to delete master reference image',
    }, { status: 500 })
  }
}
