/**
 * Core Set Generation Service
 * 
 * This service handles the generation of complete 360° reference sets for characters
 * using the new ReferenceShot template system with enhanced prompting and quality control.
 */

import { imageGenerationService } from './ImageGenerationService'
import { dinoOrchestrator } from './DinoOrchestrator'

export interface CoreSetGenerationOptions {
  customSeed?: number
  qualityThreshold?: number
  maxRetries?: number
}

export interface CoreSetGenerationResult {
  success: boolean
  generatedImages: GeneratedImageResult[]
  failedImages: FailedImageResult[]
  totalAttempts: number
  error?: string
}

export interface GeneratedImageResult {
  referenceShot: any
  imageId: string
  dinoAssetId: string
  isValid: boolean
  qualityScore: number
  consistencyScore: number
  validationNotes?: string
  generationTime: number
}

export interface FailedImageResult {
  referenceShot: any
  error: string
  attempts: number
}

export class CoreSetGenerationService {
  /**
   * Generate complete 360° core reference set for a character
   */
  async generate360CoreSet(
    characterId: string,
    masterReferenceAssetId: string,
    characterData: any,
    payload: any,
    options: CoreSetGenerationOptions = {}
  ): Promise<CoreSetGenerationResult> {
    const startTime = Date.now()
    console.log(`🎬 Starting 360° core set generation for character: ${characterId}`)

    try {
      // Get all 27 essential reference shots
      const referenceShots = await this.getReferenceShots(payload)
      console.log(`📋 Found ${referenceShots.length} reference shot templates`)

      // Get master reference image URL for template substitution
      const masterReferenceUrl = await this.getMasterReferenceUrl(masterReferenceAssetId, payload)

      const generatedImages: GeneratedImageResult[] = []
      const failedImages: FailedImageResult[] = []
      let totalAttempts = 0

      // Generate images for each reference shot
      for (const referenceShot of referenceShots) {
        console.log(`🎯 Generating: ${referenceShot.shotName}`)
        
        const result = await this.generateSingleShot(
          referenceShot,
          characterData,
          masterReferenceAssetId,
          masterReferenceUrl,
          payload,
          options
        )

        totalAttempts += result.attempts

        if (result.success && result.generatedImage) {
          generatedImages.push(result.generatedImage)
          console.log(`✅ Success: ${referenceShot.shotName} (Quality: ${result.generatedImage.qualityScore})`)
        } else {
          failedImages.push({
            referenceShot,
            error: result.error || 'Unknown error',
            attempts: result.attempts,
          })
          console.log(`❌ Failed: ${referenceShot.shotName} - ${result.error}`)
        }
      }

      const processingTime = Date.now() - startTime
      const successRate = (generatedImages.length / referenceShots.length) * 100

      console.log(`🎉 Core set generation completed in ${processingTime}ms`)
      console.log(`📊 Success rate: ${successRate.toFixed(1)}% (${generatedImages.length}/${referenceShots.length})`)

      return {
        success: generatedImages.length > 0,
        generatedImages,
        failedImages,
        totalAttempts,
      }

    } catch (error) {
      console.error('💥 Core set generation failed:', error)
      return {
        success: false,
        generatedImages: [],
        failedImages: [],
        totalAttempts: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Generate a single shot using reference template
   */
  private async generateSingleShot(
    referenceShot: any,
    characterData: any,
    masterReferenceAssetId: string,
    masterReferenceUrl: string,
    payload: any,
    options: CoreSetGenerationOptions
  ): Promise<{
    success: boolean
    generatedImage?: GeneratedImageResult
    error?: string
    attempts: number
  }> {
    const maxRetries = options.maxRetries || 3
    let attempts = 0

    while (attempts < maxRetries) {
      attempts++
      const attemptStartTime = Date.now()

      try {
        console.log(`🔄 Attempt ${attempts}/${maxRetries} for ${referenceShot.shotName}`)

        // Generate image using enhanced template system
        const generationResult = await imageGenerationService.generateImage('', {
          referenceImageAssetId: masterReferenceAssetId,
          style: 'character_production',
          seed: options.customSeed ? options.customSeed + attempts : undefined,
          referenceShot,
          characterData,
          masterReferenceUrl,
        })

        if (!generationResult.success || !generationResult.imageBuffer) {
          throw new Error(generationResult.error || 'Image generation failed')
        }

        // Upload generated image
        const fileName = this.generateFileName(referenceShot, characterData, attempts)
        const mediaResult = await this.uploadGeneratedImage(
          generationResult.imageBuffer,
          fileName,
          payload
        )

        if (!mediaResult.success) {
          throw new Error(mediaResult.error || 'Failed to upload image')
        }

        // Validate with DINOv3
        const validationResult = await this.validateGeneratedImage(
          mediaResult.dinoAssetId!,
          masterReferenceAssetId,
          options.qualityThreshold || 75
        )

        const generationTime = Date.now() - attemptStartTime

        const generatedImage: GeneratedImageResult = {
          referenceShot,
          imageId: mediaResult.mediaId!,
          dinoAssetId: mediaResult.dinoAssetId!,
          isValid: validationResult.isValid,
          qualityScore: validationResult.qualityScore,
          consistencyScore: validationResult.consistencyScore,
          validationNotes: validationResult.notes,
          generationTime,
        }

        // Check if quality meets threshold
        if (validationResult.isValid && validationResult.qualityScore >= (options.qualityThreshold || 75)) {
          return {
            success: true,
            generatedImage,
            attempts,
          }
        } else if (attempts === maxRetries) {
          // Last attempt, return even if quality is below threshold
          return {
            success: true,
            generatedImage,
            attempts,
          }
        } else {
          console.log(`⚠️  Quality below threshold (${validationResult.qualityScore}), retrying...`)
        }

      } catch (error) {
        console.error(`💥 Attempt ${attempts} failed:`, error)
        
        if (attempts === maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            attempts,
          }
        }
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
      attempts,
    }
  }

  /**
   * Get all 27 essential reference shot templates from database
   */
  private async getReferenceShots(payload: any): Promise<any[]> {
    const result = await payload.find({
      collection: 'reference-shots',
      where: {
        isActive: { equals: true },
      },
      sort: 'sortOrder',
      limit: 50,
    })

    return result.docs
  }

  /**
   * Get master reference image URL from DINO asset ID
   */
  private async getMasterReferenceUrl(assetId: string, payload: any): Promise<string> {
    try {
      // Find the media document with this DINO asset ID
      const mediaResult = await payload.find({
        collection: 'media',
        where: {
          dinoAssetId: {
            equals: assetId,
          },
        },
        limit: 1,
      })

      if (mediaResult.docs.length > 0) {
        const media = mediaResult.docs[0]
        return media.url || `https://media.rumbletv.com/media/${media.filename}`
      }

      console.warn(`Could not find media with DINO asset ID: ${assetId}`)
      return ''
    } catch (error) {
      console.warn('Could not get master reference URL:', error)
      return ''
    }
  }

  /**
   * Generate filename using template pattern
   */
  private generateFileName(referenceShot: any, characterData: any, version: number): string {
    let fileName = referenceShot.fileNamePattern

    const substitutions = {
      '{CHAR}': characterData.name?.replace(/[^a-zA-Z0-9]/g, '') || 'Character',
      '{LENS}': referenceShot.lensMm.toString(),
      '{MODE}': referenceShot.mode.charAt(0), // First letter (A/C/E/H)
      '{ANGLE}': referenceShot.angle.toUpperCase(),
      '{CROP}': referenceShot.crop.toUpperCase(),
      '{EXPR}': referenceShot.expression.toUpperCase(),
      '{N}': version.toString(),
    }

    for (const [placeholder, value] of Object.entries(substitutions)) {
      fileName = fileName.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value)
    }

    return fileName
  }

  /**
   * Upload generated image to media storage
   */
  protected async uploadGeneratedImage(
    imageBuffer: Buffer,
    fileName: string,
    payload: any
  ): Promise<{
    success: boolean
    mediaId?: string
    dinoAssetId?: string
    error?: string
  }> {
    try {
      // Create media record in Payload
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: `Generated reference image: ${fileName}`,
        },
        file: {
          data: imageBuffer,
          mimetype: 'image/jpeg',
          name: fileName,
          size: imageBuffer.length,
        },
      })

      return {
        success: true,
        mediaId: mediaDoc.id,
        dinoAssetId: mediaDoc.dinoAssetId, // Assuming this gets set by media hooks
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  /**
   * Validate generated image using DINOv3
   */
  private async validateGeneratedImage(
    generatedAssetId: string,
    masterReferenceAssetId: string,
    qualityThreshold: number
  ): Promise<{
    isValid: boolean
    qualityScore: number
    consistencyScore: number
    notes?: string
  }> {
    try {
      const validationResult = await dinoOrchestrator.validateNewAsset(
        generatedAssetId,
        masterReferenceAssetId
      )

      return {
        isValid: validationResult.isValid && validationResult.qualityScore >= qualityThreshold,
        qualityScore: validationResult.qualityScore,
        consistencyScore: validationResult.consistencyScore,
        notes: validationResult.validationNotes,
      }
    } catch (error) {
      console.error('Validation failed:', error)
      return {
        isValid: false,
        qualityScore: 0,
        consistencyScore: 0,
        notes: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}

// Export singleton instance
export const coreSetGenerationService = new CoreSetGenerationService()
