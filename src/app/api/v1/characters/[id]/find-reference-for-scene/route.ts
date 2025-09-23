/**
 * Scene-Based Reference Search API
 * 
 * POST /api/v1/characters/{id}/find-reference-for-scene
 * 
 * Intelligently finds the best reference image for a character based on scene description.
 * Uses advanced scene analysis and scoring to recommend optimal reference images.
 */

import { NextRequest, NextResponse } from 'next/server'
import { EnhancedReferenceSearchService } from '@/services/EnhancedReferenceSearchService'

export interface SceneReferenceRequest {
  sceneDescription: string
  sceneType?: 'dialogue' | 'action' | 'emotional' | 'establishing' | 'transition'
  emotionalIntensity?: number // 1-10 scale
  includeAlternatives?: boolean
  minQualityScore?: number
  maxResults?: number
  detailedAnalysis?: boolean
}

export interface SceneReferenceResponse {
  success: boolean
  selectedImage?: {
    imageUrl: string
    mediaId: string
    referenceShot: any
    score: number
    metadata: any
  }
  reasoning?: string
  alternatives?: Array<{
    imageUrl: string
    mediaId: string
    score: number
    reasoning: string
  }>
  sceneAnalysis?: {
    sceneType: string
    emotionalTone: string
    confidence: number
    keywords: string[]
    reasoning: string
    requiredShots: {
      preferredLens: number[]
      preferredCrop: string[]
      preferredAngles: number[]
    }
    cameraPreferences: {
      intimacyLevel: number
      dynamismLevel: number
      emotionalIntensity: number
    }
  }
  searchMetrics?: {
    totalImagesEvaluated: number
    averageScore: number
    selectionConfidence: number
    processingTimeMs: number
  }
  error?: string
}

/**
 * POST /api/v1/characters/{id}/find-reference-for-scene
 * Find best reference image for a scene
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SceneReferenceResponse>> {
  const startTime = Date.now()
  
  try {
    const { id: characterId } = await params
    const body = await request.json()
    
    const {
      sceneDescription,
      sceneType,
      emotionalIntensity = 5,
      includeAlternatives = true,
      minQualityScore = 70,
      maxResults = 5,
      detailedAnalysis = true
    }: SceneReferenceRequest = body

    // Validate required parameters
    if (!sceneDescription) {
      return NextResponse.json({
        success: false,
        error: 'sceneDescription is required',
      }, { status: 400 })
    }

    if (!characterId) {
      return NextResponse.json({
        success: false,
        error: 'Character ID is required',
      }, { status: 400 })
    }

    console.log(`🎬 Finding reference for character ${characterId}`)
    console.log(`📝 Scene: "${sceneDescription.substring(0, 100)}..."`)

    // Initialize search service
    const searchService = new EnhancedReferenceSearchService()
    await searchService.initialize()

    // Perform intelligent search
    const result = await searchService.findBestReferenceForScene(
      characterId,
      sceneDescription,
      {
        sceneType,
        emotionalIntensity,
        includeAlternatives,
        minQualityScore,
        maxResults,
      }
    )

    const processingTimeMs = Date.now() - startTime

    // Format response
    const response: SceneReferenceResponse = {
      success: result.success,
      selectedImage: result.selectedImage,
      reasoning: result.reasoning,
      alternatives: result.alternatives?.slice(0, maxResults - 1).map(alt => ({
        imageUrl: alt.imageUrl,
        mediaId: alt.mediaId,
        score: Math.round(alt.totalScore),
        reasoning: `${alt.lens}mm ${alt.crop?.toUpperCase()} shot (${alt.angle}) - Score: ${Math.round(alt.totalScore)}/100`
      })),
      sceneAnalysis: detailedAnalysis ? result.sceneAnalysis : undefined,
      searchMetrics: result.searchMetrics ? {
        ...result.searchMetrics,
        processingTimeMs
      } : undefined,
      error: result.error
    }

    if (result.success) {
      console.log(`✅ Found reference: ${result.selectedImage?.score}/100 confidence`)
      console.log(`🔍 Processed ${result.searchMetrics?.totalImagesEvaluated} images in ${processingTimeMs}ms`)
    } else {
      console.log(`❌ Search failed: ${result.error}`)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Scene-based reference search failed:', error)
    
    const processingTimeMs = Date.now() - startTime
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      searchMetrics: {
        totalImagesEvaluated: 0,
        averageScore: 0,
        selectionConfidence: 0,
        processingTimeMs
      }
    }, { status: 500 })
  }
}

/**
 * GET /api/v1/characters/{id}/find-reference-for-scene
 * Get information about scene-based reference search
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: characterId } = await params
    
    // Get character info and available references
    const searchService = new EnhancedReferenceSearchService()
    await searchService.initialize()

    // Get available images count (simplified version)
    const availableImages = await searchService['getCharacterReferenceImages'](characterId, {})
    
    const info = {
      characterId,
      availableReferences: availableImages.length,
      searchCapabilities: {
        sceneTypes: ['dialogue', 'action', 'emotional', 'establishing', 'transition'],
        emotionalTones: ['neutral', 'tense', 'intimate', 'dramatic', 'contemplative'],
        analysisFeatures: [
          'Automatic scene type detection',
          'Emotional tone analysis',
          'Camera preference calculation',
          'Composition needs assessment',
          'Multi-factor scoring system',
          'Detailed reasoning generation'
        ],
        scoringFactors: {
          sceneTypeMatch: '25%',
          lensPreference: '20%',
          cropPreference: '20%',
          anglePreference: '15%',
          emotionalTone: '10%',
          compositionMatch: '5%',
          qualityScore: '5%'
        }
      },
      usage: {
        endpoint: `POST /api/v1/characters/${characterId}/find-reference-for-scene`,
        requiredParameters: ['sceneDescription'],
        optionalParameters: {
          sceneType: 'Override automatic scene detection',
          emotionalIntensity: 'Scale 1-10 for emotional weight',
          includeAlternatives: 'Return top alternative matches',
          minQualityScore: 'Filter by minimum quality threshold',
          maxResults: 'Limit number of alternatives returned',
          detailedAnalysis: 'Include full scene analysis in response'
        }
      },
      examples: {
        basicSearch: {
          sceneDescription: 'Intimate dialogue between two characters, emotional revelation'
        },
        detailedSearch: {
          sceneDescription: 'High-intensity action sequence with character in motion',
          sceneType: 'action',
          emotionalIntensity: 8,
          includeAlternatives: true,
          detailedAnalysis: true
        },
        qualityFiltered: {
          sceneDescription: 'Close-up emotional moment, character crying',
          minQualityScore: 85,
          maxResults: 3
        }
      }
    }

    return NextResponse.json(info)

  } catch (error) {
    console.error('Failed to get search info:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
