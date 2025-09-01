/**
 * Character Workflow Service
 * 
 * This service manages character-specific workflows including:
 * - Master reference image processing
 * - 360° core reference set generation
 * - On-demand image generation with QA
 * - Character consistency validation
 */

import { dinoOrchestrator } from './DinoOrchestrator'
import { imageGenerationService } from './ImageGenerationService'

export interface MasterReferenceResult {
  success: boolean
  dinoAssetId?: string
  qualityScore?: number
  error?: string
  validationNotes?: string
}

export interface CoreReferenceSetResult {
  success: boolean
  generatedImages: Array<{
    angle: number
    imageId: string
    dinoAssetId: string
    consistencyScore: number
    qualityScore: number
    isValid: boolean
  }>
  failedImages: Array<{
    angle: number
    error: string
    attempts: number
  }>
  totalAttempts: number
}

export interface OnDemandGenerationResult {
  success: boolean
  imageId?: string
  dinoAssetId?: string
  qualityScore?: number
  consistencyScore?: number
  isValid?: boolean
  error?: string
  validationNotes?: string
}

export class CharacterWorkflowService {
  private qualityThreshold = 70
  private consistencyThreshold = 85
  private maxRetries = 3

  /**
   * Process a master reference image for a character
   * This is the "genesis" image that defines the character
   */
  async processMasterReference(
    characterId: string,
    imageBuffer: Buffer,
    filename: string,
    payload: any
  ): Promise<MasterReferenceResult> {
    try {
      console.log(`Processing master reference for character: ${characterId}`)

      // Step 1: Upload and extract features with DINOv3
      const dinoResult = await dinoOrchestrator.uploadAndExtract(imageBuffer, filename)
      
      if (dinoResult.status === 'error') {
        return {
          success: false,
          error: dinoResult.error || 'Failed to process image with DINOv3',
        }
      }

      // Step 2: Analyze quality (no consistency check needed for master reference)
      const qualityResult = await this.analyzeImageQuality(dinoResult.dinoAssetId)
      
      if (!qualityResult.success) {
        return {
          success: false,
          error: qualityResult.error,
        }
      }

      // Step 3: Validate quality meets threshold
      const isQualityValid = qualityResult.qualityScore >= this.qualityThreshold
      
      if (!isQualityValid) {
        return {
          success: false,
          error: `Master reference quality score ${qualityResult.qualityScore} below threshold ${this.qualityThreshold}`,
          qualityScore: qualityResult.qualityScore,
          validationNotes: `Quality validation failed. Score: ${qualityResult.qualityScore}/${this.qualityThreshold}`,
        }
      }

      console.log(`Master reference processed successfully. Quality: ${qualityResult.qualityScore}`)

      return {
        success: true,
        dinoAssetId: dinoResult.dinoAssetId,
        qualityScore: qualityResult.qualityScore,
        validationNotes: `Master reference validated successfully. Quality score: ${qualityResult.qualityScore}`,
      }

    } catch (error) {
      console.error('Master reference processing failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during master reference processing',
      }
    }
  }

  /**
   * Generate 360° core reference set for a character
   * Creates 8 turnaround images at different angles
   */
  async generate360CoreSet(
    characterId: string,
    masterReferenceAssetId: string,
    characterDescription: string,
    payload: any
  ): Promise<CoreReferenceSetResult> {
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]
    const generatedImages: CoreReferenceSetResult['generatedImages'] = []
    const failedImages: CoreReferenceSetResult['failedImages'] = []
    let totalAttempts = 0

    console.log(`Generating 360° core set for character: ${characterId}`)

    for (const angle of angles) {
      let attempts = 0
      let success = false

      while (attempts < this.maxRetries && !success) {
        attempts++
        totalAttempts++

        try {
          console.log(`Generating ${angle}° view (attempt ${attempts}/${this.maxRetries})`)

          // Generate the prompt for this angle
          const prompt = this.generateAnglePrompt(characterDescription, angle)
          
          // Generate image using the image generation service
          const generationResult = await imageGenerationService.generateImage(prompt, {
            referenceImageAssetId: masterReferenceAssetId,
            style: 'character_turnaround',
          })

          if (!generationResult.success || !generationResult.imageBuffer) {
            throw new Error(generationResult.error || 'Image generation failed')
          }

          // Upload generated image to get media ID
          const mediaResult = await this.uploadGeneratedImage(
            generationResult.imageBuffer,
            `${characterId}_${angle}deg.jpg`,
            payload
          )

          if (!mediaResult.success) {
            throw new Error(mediaResult.error || 'Failed to upload generated image')
          }

          // Validate consistency against master reference
          const validationResult = await dinoOrchestrator.validateNewAsset(
            mediaResult.dinoAssetId!,
            masterReferenceAssetId
          )

          const isValid = validationResult.isValid
          
          generatedImages.push({
            angle,
            imageId: mediaResult.imageId!,
            dinoAssetId: mediaResult.dinoAssetId!,
            consistencyScore: validationResult.consistencyScore,
            qualityScore: validationResult.qualityScore,
            isValid,
          })

          if (isValid) {
            console.log(`✓ ${angle}° view generated successfully (consistency: ${validationResult.consistencyScore}, quality: ${validationResult.qualityScore})`)
            success = true
          } else {
            console.log(`✗ ${angle}° view failed validation (consistency: ${validationResult.consistencyScore}, quality: ${validationResult.qualityScore})`)
            if (attempts === this.maxRetries) {
              failedImages.push({
                angle,
                error: validationResult.validationNotes,
                attempts,
              })
            }
          }

        } catch (error) {
          console.error(`Error generating ${angle}° view (attempt ${attempts}):`, error)
          if (attempts === this.maxRetries) {
            failedImages.push({
              angle,
              error: error instanceof Error ? error.message : 'Unknown generation error',
              attempts,
            })
          }
        }
      }
    }

    const successCount = generatedImages.filter(img => img.isValid).length
    const success = successCount >= 6 // Allow up to 2 failures out of 8

    console.log(`360° core set generation completed. Success: ${successCount}/8 images`)

    return {
      success,
      generatedImages,
      failedImages,
      totalAttempts,
    }
  }

  /**
   * Generate an on-demand image for a character with full QA pipeline
   */
  async generateOnDemandImage(
    characterId: string,
    prompt: string,
    masterReferenceAssetId: string,
    coreReferenceAssetIds: string[],
    payload: any
  ): Promise<OnDemandGenerationResult> {
    try {
      console.log(`Generating on-demand image for character: ${characterId}`)

      // Generate image using all reference images for maximum consistency
      const generationResult = await imageGenerationService.generateImage(prompt, {
        referenceImageAssetId: masterReferenceAssetId,
        additionalReferenceIds: coreReferenceAssetIds,
        style: 'character_production',
      })

      if (!generationResult.success || !generationResult.imageBuffer) {
        return {
          success: false,
          error: generationResult.error || 'Image generation failed',
        }
      }

      // Upload generated image
      const mediaResult = await this.uploadGeneratedImage(
        generationResult.imageBuffer,
        `${characterId}_ondemand_${Date.now()}.jpg`,
        payload
      )

      if (!mediaResult.success) {
        return {
          success: false,
          error: mediaResult.error || 'Failed to upload generated image',
        }
      }

      // Run full QA pipeline
      const validationResult = await dinoOrchestrator.validateNewAsset(
        mediaResult.dinoAssetId!,
        masterReferenceAssetId
      )

      console.log(`On-demand image generated. Quality: ${validationResult.qualityScore}, Consistency: ${validationResult.consistencyScore}, Valid: ${validationResult.isValid}`)

      return {
        success: true,
        imageId: mediaResult.imageId,
        dinoAssetId: mediaResult.dinoAssetId,
        qualityScore: validationResult.qualityScore,
        consistencyScore: validationResult.consistencyScore,
        isValid: validationResult.isValid,
        validationNotes: validationResult.validationNotes,
      }

    } catch (error) {
      console.error('On-demand image generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during on-demand generation',
      }
    }
  }

  /**
   * Generate angle-specific prompt for turnaround images
   */
  private generateAnglePrompt(characterDescription: string, angle: number): string {
    const angleDescriptions = {
      0: 'front view, facing camera directly',
      45: '45-degree left turn, three-quarter view from the left',
      90: 'left profile, side view from the left',
      135: '45-degree back-left turn, three-quarter back view from the left',
      180: 'back view, facing away from camera',
      225: '45-degree back-right turn, three-quarter back view from the right',
      270: 'right profile, side view from the right',
      315: '45-degree right turn, three-quarter view from the right',
    }

    const angleDesc = angleDescriptions[angle as keyof typeof angleDescriptions]
    
    return `Full body shot of ${characterDescription}, ${angleDesc}, neutral expression, studio lighting, clean background, character turnaround reference sheet style`
  }

  /**
   * Analyze image quality using DINOv3
   */
  private async analyzeImageQuality(dinoAssetId: string): Promise<{
    success: boolean
    qualityScore: number
    error?: string
  }> {
    try {
      // This would call the DINOv3 quality analysis endpoint
      // For now, we'll simulate this since the orchestrator handles the API calls
      const response = await fetch(`${process.env.DINO_SERVICE_URL}/analyze-quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DINO_API_KEY}`,
        },
        body: JSON.stringify({ asset_id: dinoAssetId }),
      })

      if (!response.ok) {
        throw new Error(`Quality analysis failed: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        qualityScore: result.quality_score,
      }
    } catch (error) {
      return {
        success: false,
        qualityScore: 0,
        error: error instanceof Error ? error.message : 'Quality analysis failed',
      }
    }
  }

  /**
   * Upload generated image and create media record
   */
  private async uploadGeneratedImage(
    imageBuffer: Buffer,
    filename: string,
    payload: any
  ): Promise<{
    success: boolean
    imageId?: string
    dinoAssetId?: string
    error?: string
  }> {
    try {
      // Create media record in Payload
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: `Generated character image: ${filename}`,
        },
        file: {
          data: imageBuffer,
          mimetype: 'image/jpeg',
          name: filename,
          size: imageBuffer.length,
        },
      })

      // The media hook will automatically process with DINOv3
      // We need to wait a moment and then fetch the updated document
      await new Promise(resolve => setTimeout(resolve, 2000))

      const updatedDoc = await payload.findByID({
        collection: 'media',
        id: mediaDoc.id,
      })

      return {
        success: true,
        imageId: updatedDoc.id,
        dinoAssetId: updatedDoc.dinoAssetId,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
      }
    }
  }

  /**
   * Set quality threshold
   */
  setQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(100, threshold))
  }

  /**
   * Set consistency threshold
   */
  setConsistencyThreshold(threshold: number): void {
    this.consistencyThreshold = Math.max(0, Math.min(100, threshold))
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      qualityThreshold: this.qualityThreshold,
      consistencyThreshold: this.consistencyThreshold,
      maxRetries: this.maxRetries,
    }
  }
}

// Export singleton instance
export const characterWorkflowService = new CharacterWorkflowService()
