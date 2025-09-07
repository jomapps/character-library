/**
 * Quality Assurance Service
 * 
 * This service provides automated quality assurance for generated images
 * including quality analysis, consistency validation, and batch processing
 */



export interface QAResult {
  assetId: string
  qualityScore: number
  consistencyScore?: number
  isValid: boolean
  validationNotes: string
  recommendations: string[]
  processingTime: number
}

export interface BatchQAResult {
  results: QAResult[]
  summary: {
    total: number
    passed: number
    failed: number
    averageQuality: number
    averageConsistency: number
    processingTime: number
  }
  recommendations: string[]
}

export interface QAThresholds {
  qualityThreshold: number
  consistencyThreshold: number
  strictMode: boolean
}

export class QualityAssuranceService {
  private defaultThresholds: QAThresholds = {
    qualityThreshold: 70,
    consistencyThreshold: 85,
    strictMode: false,
  }

  /**
   * Run comprehensive QA on a single image
   */
  async runQualityAssurance(
    assetId: string,
    masterReferenceAssetId?: string,
    thresholds: Partial<QAThresholds> = {}
  ): Promise<QAResult> {
    const startTime = Date.now()
    const config = { ...this.defaultThresholds, ...thresholds }

    try {
      console.log(`Running QA for asset: ${assetId}`)

      // Run quality and consistency checks
      const [qualityResult, consistencyResult] = await Promise.all([
        this.analyzeQuality(assetId),
        masterReferenceAssetId ? this.analyzeConsistency(assetId, masterReferenceAssetId) : null,
      ])

      const qualityScore = qualityResult.qualityScore
      const consistencyScore = consistencyResult?.consistencyScore || 0

      // Determine if image passes QA
      const qualityPassed = qualityScore >= config.qualityThreshold
      const consistencyPassed = !masterReferenceAssetId || consistencyScore >= config.consistencyThreshold
      const isValid = qualityPassed && consistencyPassed

      // Generate validation notes
      const notes = this.generateValidationNotes(
        qualityScore,
        consistencyScore,
        config,
        qualityPassed,
        consistencyPassed
      )

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        qualityScore,
        consistencyScore,
        config,
        qualityPassed,
        consistencyPassed
      )

      const processingTime = Date.now() - startTime

      console.log(`QA completed for ${assetId}: Quality=${qualityScore}, Consistency=${consistencyScore}, Valid=${isValid}`)

      return {
        assetId,
        qualityScore,
        consistencyScore,
        isValid,
        validationNotes: notes,
        recommendations,
        processingTime,
      }

    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`QA failed for asset ${assetId}:`, error)

      return {
        assetId,
        qualityScore: 0,
        consistencyScore: 0,
        isValid: false,
        validationNotes: `QA processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Retry QA processing', 'Check asset availability', 'Verify DINOv3 service status'],
        processingTime,
      }
    }
  }

  /**
   * Run batch QA on multiple images
   */
  async runBatchQualityAssurance(
    assetIds: string[],
    masterReferenceAssetId?: string,
    thresholds: Partial<QAThresholds> = {}
  ): Promise<BatchQAResult> {
    const startTime = Date.now()
    console.log(`Running batch QA on ${assetIds.length} assets`)

    // Process in batches to avoid overwhelming the service
    const batchSize = 5
    const results: QAResult[] = []

    for (let i = 0; i < assetIds.length; i += batchSize) {
      const batch = assetIds.slice(i, i + batchSize)
      const batchPromises = batch.map(assetId => 
        this.runQualityAssurance(assetId, masterReferenceAssetId, thresholds)
      )
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    // Calculate summary statistics
    const passed = results.filter(r => r.isValid).length
    const failed = results.length - passed
    
    const averageQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
    const averageConsistency = masterReferenceAssetId 
      ? results.reduce((sum, r) => sum + (r.consistencyScore || 0), 0) / results.length
      : 0

    const processingTime = Date.now() - startTime

    // Generate batch recommendations
    const batchRecommendations = this.generateBatchRecommendations(results, thresholds)

    console.log(`Batch QA completed: ${passed}/${results.length} passed, avg quality: ${averageQuality.toFixed(1)}`)

    return {
      results,
      summary: {
        total: results.length,
        passed,
        failed,
        averageQuality,
        averageConsistency,
        processingTime,
      },
      recommendations: batchRecommendations,
    }
  }

  /**
   * Analyze image quality using DINOv3
   */
  private async analyzeQuality(assetId: string): Promise<{ qualityScore: number }> {
    try {
      const response = await fetch(`${process.env.DINO_SERVICE_URL}/analyze-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DINO_API_KEY}`,
        },
        body: JSON.stringify({ asset_id: assetId }),
      })

      if (!response.ok) {
        throw new Error(`Quality analysis failed: ${response.status}`)
      }

      const result = await response.json()
      return { qualityScore: result.quality_score }
    } catch (error) {
      console.error(`Quality analysis failed for ${assetId}:`, error)
      return { qualityScore: 0 }
    }
  }

  /**
   * Analyze consistency between two assets
   */
  private async analyzeConsistency(
    assetId: string,
    referenceAssetId: string
  ): Promise<{ consistencyScore: number }> {
    try {
      const response = await fetch(`${process.env.DINO_SERVICE_URL}/validate-consistency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DINO_API_KEY}`,
        },
        body: JSON.stringify({
          test_asset_id: assetId,
          reference_asset_id: referenceAssetId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Consistency analysis failed: ${response.status}`)
      }

      const result = await response.json()
      return { consistencyScore: result.similarity_score }
    } catch (error) {
      console.error(`Consistency analysis failed for ${assetId}:`, error)
      return { consistencyScore: 0 }
    }
  }

  /**
   * Generate validation notes based on QA results
   */
  private generateValidationNotes(
    qualityScore: number,
    consistencyScore: number,
    config: QAThresholds,
    qualityPassed: boolean,
    consistencyPassed: boolean
  ): string {
    const notes: string[] = []

    if (qualityPassed && consistencyPassed) {
      notes.push('✓ Image passed all quality assurance checks')
    }

    if (!qualityPassed) {
      notes.push(`✗ Quality score ${qualityScore.toFixed(1)} below threshold ${config.qualityThreshold}`)
    } else {
      notes.push(`✓ Quality score ${qualityScore.toFixed(1)} meets threshold ${config.qualityThreshold}`)
    }

    if (consistencyScore > 0) {
      if (!consistencyPassed) {
        notes.push(`✗ Consistency score ${consistencyScore.toFixed(1)} below threshold ${config.consistencyThreshold}`)
      } else {
        notes.push(`✓ Consistency score ${consistencyScore.toFixed(1)} meets threshold ${config.consistencyThreshold}`)
      }
    }

    if (config.strictMode) {
      notes.push('⚠ Strict mode enabled - higher standards applied')
    }

    return notes.join('. ')
  }

  /**
   * Generate recommendations based on QA results
   */
  private generateRecommendations(
    qualityScore: number,
    consistencyScore: number,
    config: QAThresholds,
    qualityPassed: boolean,
    consistencyPassed: boolean
  ): string[] {
    const recommendations: string[] = []

    if (!qualityPassed) {
      if (qualityScore < 50) {
        recommendations.push('Consider regenerating with different parameters')
        recommendations.push('Check lighting and composition in generation prompt')
      } else if (qualityScore < config.qualityThreshold) {
        recommendations.push('Minor quality improvements needed')
        recommendations.push('Consider post-processing or slight regeneration')
      }
    }

    if (consistencyScore > 0 && !consistencyPassed) {
      if (consistencyScore < 70) {
        recommendations.push('Character consistency is poor - regenerate with stronger reference influence')
        recommendations.push('Review character description and reference images')
      } else if (consistencyScore < config.consistencyThreshold) {
        recommendations.push('Minor consistency improvements needed')
        recommendations.push('Consider adjusting generation parameters')
      }
    }

    if (qualityPassed && consistencyPassed) {
      recommendations.push('Image meets all quality standards')
      if (qualityScore > 90 && consistencyScore > 95) {
        recommendations.push('Excellent quality - suitable for production use')
      }
    }

    return recommendations
  }

  /**
   * Generate batch-level recommendations
   */
  private generateBatchRecommendations(
    results: QAResult[],
    _thresholds: Partial<QAThresholds>
  ): string[] {
    const recommendations: string[] = []
    const passRate = results.filter(r => r.isValid).length / results.length
    const avgQuality = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
    const avgConsistency = results.reduce((sum, r) => sum + (r.consistencyScore || 0), 0) / results.length

    if (passRate < 0.5) {
      recommendations.push('Low pass rate - consider adjusting generation parameters or thresholds')
    } else if (passRate < 0.8) {
      recommendations.push('Moderate pass rate - some improvements possible')
    } else {
      recommendations.push('Good pass rate - generation pipeline performing well')
    }

    if (avgQuality < 60) {
      recommendations.push('Average quality is low - review generation model and prompts')
    } else if (avgQuality > 85) {
      recommendations.push('Excellent average quality maintained')
    }

    if (avgConsistency > 0) {
      if (avgConsistency < 75) {
        recommendations.push('Character consistency needs improvement - strengthen reference influence')
      } else if (avgConsistency > 90) {
        recommendations.push('Excellent character consistency maintained')
      }
    }

    return recommendations
  }

  /**
   * Update QA thresholds
   */
  setThresholds(thresholds: Partial<QAThresholds>): void {
    this.defaultThresholds = { ...this.defaultThresholds, ...thresholds }
  }

  /**
   * Get current thresholds
   */
  getThresholds(): QAThresholds {
    return { ...this.defaultThresholds }
  }
}

// Export singleton instance
export const qualityAssuranceService = new QualityAssuranceService()
