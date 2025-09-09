/**
 * DINOv3 Orchestrator Service
 * 
 * This service manages all interactions with the DINOv3 image analysis service.
 * It handles image upload, feature extraction, quality analysis, and consistency validation.
 */

export interface DinoUploadResponse {
  asset_id: string
  media_url: string
  metadata: {
    filename: string
    size: number
    content_type: string
    upload_timestamp: string
  }
}

export interface DinoFeaturesResponse {
  asset_id: string
  features: number[] // 384-dimensional vector
  processing_status: string
}

export interface DinoQualityResponse {
  asset_id: string
  quality_score: number
  diversity_score: number
  feature_stats: {
    mean: number
    std: number
    max: number
    min: number
  }
}

export interface DinoConsistencyResponse {
  reference_asset_id: string
  test_asset_id: string
  same_character: boolean
  similarity_score: number
  confidence: number
  explanation: string
}

export interface DinoValidationResult {
  consistencyScore: number
  qualityScore: number
  validationNotes: string
  isValid: boolean
}

export class DinoOrchestrator {
  private baseUrl: string
  private apiKey: string
  private qualityThreshold: number = 70 // Configurable quality threshold
  private consistencyThreshold: number = 85 // Configurable consistency threshold

  constructor() {
    this.baseUrl = process.env.DINO_SERVICE_URL || 'https://dino.ft.tc'
    this.apiKey = process.env.DINO_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('DINO_API_KEY not set - DINOv3 service will not function')
    }
  }

  /**
   * Upload image to DINOv3 service and extract features
   */
  async uploadAndExtract(imageBuffer: Buffer, filename: string): Promise<{
    dinoAssetId: string
    dinoMediaUrl?: string
    features?: number[]
    status: string
    error?: string
  }> {
    try {
      // Step 1: Upload media to DINOv3 service
      const uploadResult = await this.uploadMedia(imageBuffer, filename)
      
      if (!uploadResult.asset_id) {
        throw new Error('Failed to upload media to DINOv3 service')
      }

      // Step 2: Extract features
      const featuresResult = await this.extractFeatures(uploadResult.asset_id)

      return {
        dinoAssetId: uploadResult.asset_id,
        dinoMediaUrl: uploadResult.media_url,
        features: featuresResult.features,
        status: 'processing',
      }
    } catch (error) {
      console.error('DINOv3 upload and extract failed:', error)
      return {
        dinoAssetId: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Validate a new asset against a master reference
   */
  async validateNewAsset(
    newAssetId: string, 
    masterRefAssetId: string
  ): Promise<DinoValidationResult> {
    try {
      // Run quality and consistency checks in parallel
      const [qualityResult, consistencyResult] = await Promise.all([
        this.analyzeQuality(newAssetId),
        this.validateConsistency(newAssetId, masterRefAssetId),
      ])

      const qualityScore = qualityResult.quality_score
      const consistencyScore = consistencyResult.similarity_score
      
      const isQualityValid = qualityScore >= this.qualityThreshold
      const isConsistencyValid = consistencyScore >= this.consistencyThreshold
      const isValid = isQualityValid && isConsistencyValid

      let validationNotes = ''
      if (!isQualityValid) {
        validationNotes += `Quality score ${qualityScore} below threshold ${this.qualityThreshold}. `
      }
      if (!isConsistencyValid) {
        validationNotes += `Consistency score ${consistencyScore} below threshold ${this.consistencyThreshold}. `
      }
      if (isValid) {
        validationNotes = 'Image passed all validation checks.'
      }

      return {
        consistencyScore,
        qualityScore,
        validationNotes,
        isValid,
      }
    } catch (error) {
      console.error('DINOv3 validation failed:', error)
      return {
        consistencyScore: 0,
        qualityScore: 0,
        validationNotes: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isValid: false,
      }
    }
  }

  /**
   * Upload media file to DINOv3 service
   */
  private async uploadMedia(imageBuffer: Buffer, filename: string): Promise<DinoUploadResponse> {
    console.log(`DINOv3 upload request:`, {
      url: `${this.baseUrl}/api/v1/upload-media`,
      filename,
      bufferSize: imageBuffer.length,
      hasApiKey: !!this.apiKey
    })

    const formData = new FormData()
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' })
    formData.append('file', blob, filename)

    const response = await fetch(`${this.baseUrl}/api/v1/upload-media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`DINOv3 upload error details:`, {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText,
        url: `${this.baseUrl}/api/v1/upload-media`,
        hasApiKey: !!this.apiKey
      })
      throw new Error(`DINOv3 upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return await response.json()
  }

  /**
   * Extract DINOv3 features from uploaded asset
   */
  private async extractFeatures(assetId: string): Promise<DinoFeaturesResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/extract-features?asset_id=${encodeURIComponent(assetId)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`DINOv3 feature extraction failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Analyze image quality using DINOv3
   */
  private async analyzeQuality(assetId: string): Promise<DinoQualityResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/analyze-quality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ asset_id: assetId }),
    })

    if (!response.ok) {
      throw new Error(`DINOv3 quality analysis failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Validate consistency between two assets
   */
  private async validateConsistency(
    testAssetId: string, 
    referenceAssetId: string
  ): Promise<DinoConsistencyResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/validate-consistency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        reference_asset_id: referenceAssetId,
        test_asset_id: testAssetId,
      }),
    })

    if (!response.ok) {
      throw new Error(`DINOv3 consistency validation failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Set quality threshold for validation
   */
  setQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(100, threshold))
  }

  /**
   * Set consistency threshold for validation
   */
  setConsistencyThreshold(threshold: number): void {
    this.consistencyThreshold = Math.max(0, Math.min(100, threshold))
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      qualityThreshold: this.qualityThreshold,
      consistencyThreshold: this.consistencyThreshold,
      hasApiKey: !!this.apiKey,
    }
  }
}

// Export singleton instance
export const dinoOrchestrator = new DinoOrchestrator()
