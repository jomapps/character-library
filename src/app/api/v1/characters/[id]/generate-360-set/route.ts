/**
 * Character 360° Image Set Generation API
 * 
 * This endpoint generates a complete 360° reference image set for a character.
 * It creates multiple angle views for comprehensive character reference.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { BackgroundJobService } from '../../../../../../services/BackgroundJobService'
import { v4 as uuidv4 } from 'uuid'

export interface Generate360SetRequest {
  style?: 'character_production' | 'cinematic' | 'realistic'
  qualityThreshold?: number
  imageCount?: number
  angles?: string[]
  maxRetries?: number
  customSeed?: number
}

export interface Generate360SetResponse {
  success: boolean
  jobId?: string
  status: 'accepted' | 'processing' | 'completed' | 'failed'
  message?: string
  estimatedCompletionTime?: string
  pollUrl?: string
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
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params
    const body: Generate360SetRequest = await request.json()

    console.log(`🚀 Starting async 360° image generation for character: ${characterId}`)

    // Validate character exists
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 2,
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Character not found',
      }, { status: 404 })
    }

    // Validate character has master reference image
    const masterRef = typeof character.masterReferenceImage === 'string'
      ? null
      : character.masterReferenceImage

    if (!masterRef?.dinoAssetId) {
      return NextResponse.json({
        success: false,
        status: 'failed',
        error: 'Character must have a master reference image for 360° generation',
      }, { status: 400 })
    }

    // Generate unique job ID
    const jobId = uuidv4()

    // Extract parameters with defaults
    const style = body.style || 'character_production'
    const qualityThreshold = body.qualityThreshold || 75
    const imageCount = body.imageCount || 27 // Default to full 27-shot set
    const maxRetries = body.maxRetries || 3
    const customSeed = body.customSeed

    console.log(`📋 Creating job ${jobId} for ${imageCount} images with style: ${style}`)

    // Create job record in database
    const jobData = {
      jobId,
      characterId,
      jobType: '360-set' as const,
      status: 'pending' as const,
      progress: {
        current: 0,
        total: imageCount,
        percentage: 0,
        currentTask: 'Initializing...'
      },
      requestData: {
        style,
        qualityThreshold,
        imageCount,
        maxRetries,
        customSeed,
        angles: body.angles || DEFAULT_ANGLES.slice(0, imageCount)
      },
      startedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await payload.create({
      collection: 'image-generation-jobs',
      data: jobData,
    })

    // Start background processing
    const backgroundJobService = BackgroundJobService.getInstance()

    // Don't await this - let it run in background
    backgroundJobService.startJob(jobId, characterId, '360-set', jobData.requestData, payload)
      .catch(error => {
        console.error(`Background job ${jobId} failed to start:`, error)
      })

    // Calculate estimated completion time (rough estimate: 30 seconds per image)
    const estimatedSeconds = imageCount * 30
    const estimatedCompletionTime = new Date(Date.now() + estimatedSeconds * 1000).toISOString()

    // Return immediate response with job details
    return NextResponse.json({
      success: true,
      jobId,
      status: 'accepted',
      message: `360° image generation job started. Generating ${imageCount} images.`,
      estimatedCompletionTime,
      pollUrl: `/api/v1/jobs/${jobId}/status`,
    }, { status: 202 }) // 202 Accepted

  } catch (error) {
    console.error('360° image set generation job creation error:', error)

    return NextResponse.json({
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to create 360° image generation job',
    }, { status: 500 })
  }
}

// Note: This endpoint now uses async processing with the BackgroundJobService
// The actual image generation logic has been moved to the background service
// and uses the enhanced 360° reference system with 27 professional shots
