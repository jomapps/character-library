/**
 * Smart Image Generation API
 * POST /api/characters/[id]/generate-smart-image
 * 
 * Intelligent image generation that:
 * 1. Analyzes the prompt to understand desired image type
 * 2. Selects the best reference image from character gallery
 * 3. Generates image with optimal reference
 * 4. Validates consistency with DINOv3
 * 5. Retries if needed with different approaches
 * 6. Saves successful images to character gallery
 * 7. Returns the final validated result
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { smartImageGenerationService } from '../../../../../../services/SmartImageGenerationService'

interface SmartGenerateImageRequest {
  prompt: string
  characterName?: string
  maxRetries?: number
  qualityThreshold?: number
  consistencyThreshold?: number
  style?: 'character_turnaround' | 'character_production' | 'custom'
  tags?: string
}

interface SmartGenerateImageResponse {
  success: boolean
  message?: string
  data?: {
    characterId: string
    characterName: string
    imageId: string
    dinoAssetId: string
    publicUrl: string
    selectedReferenceId: string
    selectedReferenceType: string
    qualityScore: number
    consistencyScore: number
    attempts: number
    generationTime: number
    validationNotes?: string
    filename: string
  }
  error?: string
  details?: {
    attempts: Array<{
      referenceUsed: string
      qualityScore?: number
      consistencyScore?: number
      reason: string
    }>
    totalAttempts: number
    failureReasons: string[]
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SmartGenerateImageResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: SmartGenerateImageRequest = await request.json()

    console.log(`Smart image generation for character: ${characterId}`)
    console.log(`Prompt: "${body.prompt}"`)

    // Validate required fields
    if (!body.prompt?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required',
      }, { status: 400 })
    }

    // Get the character document with full media details
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 3, // Include all related media
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Check if character has any reference images
    if (!character.masterReferenceImage && (!character.imageGallery || character.imageGallery.length === 0)) {
      return NextResponse.json({
        success: false,
        error: 'Character has no reference images. Please upload a master reference image first.',
      }, { status: 400 })
    }

    // Use character name from request or character data
    const characterName = body.characterName || character.name || 'Unknown Character'

    // Configure generation parameters
    const generationConfig = {
      maxRetries: Math.min(body.maxRetries || 3, 5), // Limit to 5 max
      qualityThreshold: Math.max(body.qualityThreshold || 70, 50), // Minimum 50
      consistencyThreshold: Math.max(body.consistencyThreshold || 80, 60), // Minimum 60
      style: body.style || 'character_production',
      tags: body.tags || 'smart generation',
    }

    console.log('Generation config:', generationConfig)

    // Run smart image generation
    const startTime = Date.now()
    const result = await smartImageGenerationService.generateSmartImage(
      characterId,
      characterName,
      body.prompt,
      character,
      generationConfig,
      payload
    )
    const generationTime = Date.now() - startTime

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Smart image generation failed',
        details: result.details,
      }, { status: 500 })
    }

    // Return successful result
    return NextResponse.json({
      success: true,
      message: `Smart image generated successfully in ${result.attempts} attempts`,
      data: {
        characterId,
        characterName,
        imageId: result.imageId!,
        dinoAssetId: result.dinoAssetId!,
        publicUrl: result.publicUrl!,
        selectedReferenceId: result.selectedReferenceId!,
        selectedReferenceType: result.selectedReferenceType!,
        qualityScore: result.qualityScore!,
        consistencyScore: result.consistencyScore!,
        attempts: result.attempts!,
        generationTime,
        validationNotes: result.validationNotes,
        filename: result.filename!,
      },
    })

  } catch (error) {
    console.error('Smart image generation API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error during smart image generation',
      details: {
        attempts: [],
        totalAttempts: 0,
        failureReasons: [error instanceof Error ? error.message : 'Unknown error'],
      },
    }, { status: 500 })
  }
}
