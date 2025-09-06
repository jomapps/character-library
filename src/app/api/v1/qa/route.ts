/**
 * Quality Assurance API endpoints
 * POST /api/v1/qa - Run QA on single or multiple assets
 * GET /api/v1/qa/config - Get current QA configuration
 * PUT /api/v1/qa/config - Update QA configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { qualityAssuranceService } from '../../../../services/QualityAssuranceService'

interface QARequest {
  assetIds: string | string[]
  masterReferenceAssetId?: string
  thresholds?: {
    qualityThreshold?: number
    consistencyThreshold?: number
    strictMode?: boolean
  }
}

interface QAConfigRequest {
  qualityThreshold?: number
  consistencyThreshold?: number
  strictMode?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: QARequest = await request.json()

    if (!body.assetIds) {
      return NextResponse.json(
        { error: 'assetIds is required' },
        { status: 400 }
      )
    }

    const assetIds = Array.isArray(body.assetIds) ? body.assetIds : [body.assetIds]
    
    if (assetIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one asset ID is required' },
        { status: 400 }
      )
    }

    console.log(`Running QA on ${assetIds.length} asset(s)`)

    // Run QA based on whether it's single or batch
    if (assetIds.length === 1) {
      const result = await qualityAssuranceService.runQualityAssurance(
        assetIds[0],
        body.masterReferenceAssetId,
        body.thresholds
      )

      return NextResponse.json({
        success: true,
        type: 'single',
        data: result,
      })
    } else {
      const result = await qualityAssuranceService.runBatchQualityAssurance(
        assetIds,
        body.masterReferenceAssetId,
        body.thresholds
      )

      return NextResponse.json({
        success: true,
        type: 'batch',
        data: result,
      })
    }

  } catch (error) {
    console.error('QA API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error during QA processing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const thresholds = qualityAssuranceService.getThresholds()
    
    return NextResponse.json({
      success: true,
      data: {
        thresholds,
        description: {
          qualityThreshold: 'Minimum quality score (0-100) for images to pass QA',
          consistencyThreshold: 'Minimum consistency score (0-100) for character matching',
          strictMode: 'Enable stricter validation criteria',
        },
      },
    })

  } catch (error) {
    console.error('QA config GET error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: QAConfigRequest = await request.json()

    // Validate threshold values
    if (body.qualityThreshold !== undefined) {
      if (body.qualityThreshold < 0 || body.qualityThreshold > 100) {
        return NextResponse.json(
          { error: 'qualityThreshold must be between 0 and 100' },
          { status: 400 }
        )
      }
    }

    if (body.consistencyThreshold !== undefined) {
      if (body.consistencyThreshold < 0 || body.consistencyThreshold > 100) {
        return NextResponse.json(
          { error: 'consistencyThreshold must be between 0 and 100' },
          { status: 400 }
        )
      }
    }

    // Update thresholds
    qualityAssuranceService.setThresholds(body)
    const updatedThresholds = qualityAssuranceService.getThresholds()

    console.log('QA thresholds updated:', updatedThresholds)

    return NextResponse.json({
      success: true,
      message: 'QA configuration updated successfully',
      data: {
        thresholds: updatedThresholds,
      },
    })

  } catch (error) {
    console.error('QA config PUT error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
