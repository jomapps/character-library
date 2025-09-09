/**
 * Smart Image Generation Service
 * 
 * Intelligent image generation that analyzes prompts, selects optimal reference images,
 * generates with validation, and retries with different strategies if needed.
 */

import { imageGenerationService } from './ImageGenerationService'
import { dinoOrchestrator } from './DinoOrchestrator'

export interface ReferenceImage {
  id: string
  dinoAssetId: string
  type: 'master' | 'core_reference' | 'generated'
  shotType?: string
  tags?: string
  qualityScore?: number
  consistencyScore?: number
  filename?: string
}

export interface GenerationConfig {
  maxRetries: number
  qualityThreshold: number
  consistencyThreshold: number
  style: string
  tags: string
}

export interface SmartGenerationResult {
  success: boolean
  imageId?: string
  dinoAssetId?: string
  publicUrl?: string
  selectedReferenceId?: string
  selectedReferenceType?: string
  qualityScore?: number
  consistencyScore?: number
  attempts?: number
  validationNotes?: string
  filename?: string
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

export class SmartImageGenerationService {
  
  /**
   * Main smart image generation method
   */
  async generateSmartImage(
    characterId: string,
    characterName: string,
    prompt: string,
    character: any,
    config: GenerationConfig,
    payload: any
  ): Promise<SmartGenerationResult> {
    
    const attempts: Array<{
      referenceUsed: string
      qualityScore?: number
      consistencyScore?: number
      reason: string
    }> = []
    
    const failureReasons: string[] = []

    try {
      // Step 1: Analyze prompt and extract reference images
      const referenceImages = this.extractReferenceImages(character)
      if (referenceImages.length === 0) {
        return {
          success: false,
          error: 'No reference images available for generation',
        }
      }

      // Step 2: Analyze prompt to understand desired image characteristics
      const promptAnalysis = this.analyzePrompt(prompt)
      console.log('Prompt analysis:', promptAnalysis)

      // Step 3: Rank reference images by relevance to prompt
      const rankedReferences = this.rankReferencesByPrompt(referenceImages, promptAnalysis)
      console.log(`Ranked ${rankedReferences.length} reference images by relevance`)

      // Step 4: Get master reference for consistency validation
      const masterReference = referenceImages.find(ref => ref.type === 'master')
      if (!masterReference) {
        return {
          success: false,
          error: 'Master reference image not found for consistency validation',
        }
      }

      // Step 5: Try generation with different references until success
      for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
        console.log(`\n--- Attempt ${attempt}/${config.maxRetries} ---`)
        
        // Select reference for this attempt
        const selectedReference = this.selectReferenceForAttempt(rankedReferences, attempt)
        console.log(`Using reference: ${selectedReference.type} (${selectedReference.shotType || 'unknown shot'})`)

        try {
          // Generate image with selected reference
          const generationResult = await imageGenerationService.generateImage(prompt, {
            referenceImageAssetId: selectedReference.dinoAssetId,
            style: config.style as any,
            width: 768,
            height: 1024,
            steps: 30,
            guidance: 7.5,
          })

          if (!generationResult.success || !generationResult.imageBuffer) {
            const reason = `Generation failed: ${generationResult.error}`
            attempts.push({
              referenceUsed: `${selectedReference.type}:${selectedReference.id}`,
              reason,
            })
            failureReasons.push(reason)
            continue
          }

          // Upload generated image
          const filename = `${characterId}_smart_${Date.now()}.jpg`
          const mediaResult = await this.uploadGeneratedImage(
            generationResult.imageBuffer,
            filename,
            payload
          )

          if (!mediaResult.success || !mediaResult.dinoAssetId || !mediaResult.imageId) {
            const reason = `Upload failed: ${mediaResult.error}`
            attempts.push({
              referenceUsed: `${selectedReference.type}:${selectedReference.id}`,
              reason,
            })
            failureReasons.push(reason)
            continue
          }

          // Validate quality and consistency
          const validationResult = await dinoOrchestrator.validateNewAsset(
            mediaResult.dinoAssetId,
            masterReference.dinoAssetId
          )

          const qualityScore = validationResult.qualityScore || 0
          const consistencyScore = validationResult.consistencyScore || 0
          
          attempts.push({
            referenceUsed: `${selectedReference.type}:${selectedReference.id}`,
            qualityScore,
            consistencyScore,
            reason: validationResult.isValid ? 'Success' : 'Failed validation',
          })

          // Check if validation passes thresholds
          if (qualityScore >= config.qualityThreshold && 
              consistencyScore >= config.consistencyThreshold) {
            
            console.log(`✓ Success! Quality: ${qualityScore}, Consistency: ${consistencyScore}`)

            // Add to character gallery
            await this.addToCharacterGallery(
              character,
              mediaResult.imageId,
              prompt,
              config.tags,
              qualityScore,
              consistencyScore,
              validationResult.validationNotes,
              payload
            )

            // Get public URL - priority: DINOv3 URL, original PayloadCMS URL, fallback
            const media = await payload.findByID({
              collection: 'media',
              id: mediaResult.imageId,
            })
            const publicUrl = media.dinoMediaUrl || media.url || this.getPublicImageUrl(mediaResult.dinoAssetId)

            return {
              success: true,
              imageId: mediaResult.imageId,
              dinoAssetId: mediaResult.dinoAssetId,
              publicUrl,
              selectedReferenceId: selectedReference.id,
              selectedReferenceType: selectedReference.type,
              qualityScore,
              consistencyScore,
              attempts: attempt,
              validationNotes: validationResult.validationNotes,
              filename,
            }
          } else {
            const reason = `Validation failed - Quality: ${qualityScore}/${config.qualityThreshold}, Consistency: ${consistencyScore}/${config.consistencyThreshold}`
            failureReasons.push(reason)
            console.log(`✗ ${reason}`)
          }

        } catch (error) {
          const reason = `Attempt ${attempt} error: ${error instanceof Error ? error.message : 'Unknown error'}`
          attempts.push({
            referenceUsed: `${selectedReference.type}:${selectedReference.id}`,
            reason,
          })
          failureReasons.push(reason)
          console.error(reason)
        }
      }

      // All attempts failed
      return {
        success: false,
        error: `Failed to generate acceptable image after ${config.maxRetries} attempts`,
        details: {
          attempts,
          totalAttempts: config.maxRetries,
          failureReasons,
        },
      }

    } catch (error) {
      console.error('Smart image generation service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in smart generation',
        details: {
          attempts,
          totalAttempts: attempts.length,
          failureReasons: [...failureReasons, error instanceof Error ? error.message : 'Unknown error'],
        },
      }
    }
  }

  /**
   * Extract and organize reference images from character data
   */
  private extractReferenceImages(character: any): ReferenceImage[] {
    const references: ReferenceImage[] = []

    // Add master reference
    if (character.masterReferenceImage?.dinoAssetId) {
      references.push({
        id: character.masterReferenceImage.id,
        dinoAssetId: character.masterReferenceImage.dinoAssetId,
        type: 'master',
        shotType: 'master_reference',
        qualityScore: character.masterReferenceImage.qualityScore,
        consistencyScore: character.masterReferenceImage.consistencyScore,
        filename: character.masterReferenceImage.filename,
      })
    }

    // Add gallery images
    if (character.imageGallery) {
      for (const item of character.imageGallery) {
        if (item.imageFile?.dinoAssetId) {
          references.push({
            id: item.imageFile.id,
            dinoAssetId: item.imageFile.dinoAssetId,
            type: item.isCoreReference ? 'core_reference' : 'generated',
            shotType: item.shotType,
            tags: item.tags,
            qualityScore: item.qualityScore,
            consistencyScore: item.consistencyScore,
            filename: item.imageFile.filename,
          })
        }
      }
    }

    return references
  }

  /**
   * Analyze prompt to understand desired image characteristics
   */
  private analyzePrompt(prompt: string): {
    shotType: string
    mood: string
    setting: string
    pose: string
    angle: string
    keywords: string[]
  } {
    const lowerPrompt = prompt.toLowerCase()
    const keywords = lowerPrompt.split(/\s+/)

    // Analyze shot type
    let shotType = 'medium'
    if (keywords.some(k => ['close-up', 'closeup', 'portrait', 'headshot', 'face'].includes(k))) {
      shotType = 'close_up'
    } else if (keywords.some(k => ['full', 'body', 'standing', 'whole'].includes(k))) {
      shotType = 'full_body'
    } else if (keywords.some(k => ['wide', 'environment', 'scene', 'landscape'].includes(k))) {
      shotType = 'wide'
    }

    // Analyze angle/pose
    let angle = 'front'
    if (keywords.some(k => ['side', 'profile', 'left', 'right'].includes(k))) {
      angle = 'side'
    } else if (keywords.some(k => ['back', 'behind', 'rear'].includes(k))) {
      angle = 'back'
    } else if (keywords.some(k => ['45', 'angle', 'three-quarter'].includes(k))) {
      angle = '45_degree'
    }

    // Analyze mood
    let mood = 'neutral'
    if (keywords.some(k => ['action', 'fighting', 'running', 'dynamic'].includes(k))) {
      mood = 'action'
    } else if (keywords.some(k => ['calm', 'peaceful', 'serene', 'relaxed'].includes(k))) {
      mood = 'calm'
    } else if (keywords.some(k => ['dramatic', 'intense', 'serious'].includes(k))) {
      mood = 'dramatic'
    }

    // Analyze setting
    let setting = 'neutral'
    if (keywords.some(k => ['outdoor', 'forest', 'mountain', 'field', 'nature'].includes(k))) {
      setting = 'outdoor'
    } else if (keywords.some(k => ['indoor', 'room', 'house', 'building'].includes(k))) {
      setting = 'indoor'
    } else if (keywords.some(k => ['studio', 'background', 'plain'].includes(k))) {
      setting = 'studio'
    }

    return {
      shotType,
      mood,
      setting,
      pose: angle,
      angle,
      keywords,
    }
  }

  /**
   * Rank reference images by relevance to the prompt
   */
  private rankReferencesByPrompt(
    references: ReferenceImage[],
    promptAnalysis: any
  ): ReferenceImage[] {
    return references
      .map(ref => ({
        ...ref,
        relevanceScore: this.calculateRelevanceScore(ref, promptAnalysis),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * Calculate relevance score for a reference image based on prompt analysis
   */
  private calculateRelevanceScore(ref: ReferenceImage, analysis: any): number {
    let score = 0

    // Base scores by type
    if (ref.type === 'master') score += 10 // Always valuable
    if (ref.type === 'core_reference') score += 8 // High quality references
    if (ref.type === 'generated') score += 5 // Previous generations

    // Quality bonuses
    if (ref.qualityScore && ref.qualityScore > 80) score += 5
    if (ref.consistencyScore && ref.consistencyScore > 85) score += 5

    // Shot type matching
    if (ref.shotType) {
      const shotType = ref.shotType.toLowerCase()
      if (shotType.includes(analysis.shotType)) score += 15
      if (shotType.includes(analysis.angle)) score += 10
      if (shotType.includes(analysis.pose)) score += 8
    }

    // Tags matching
    if (ref.tags) {
      const tags = ref.tags.toLowerCase()
      for (const keyword of analysis.keywords) {
        if (tags.includes(keyword)) score += 3
      }
    }

    return score
  }

  /**
   * Select reference image for a specific attempt
   */
  private selectReferenceForAttempt(
    rankedReferences: ReferenceImage[],
    attempt: number
  ): ReferenceImage {
    // First attempt: use highest ranked
    if (attempt === 1) {
      return rankedReferences[0]
    }

    // Second attempt: use master reference if not already used
    if (attempt === 2) {
      const master = rankedReferences.find(ref => ref.type === 'master')
      if (master && master !== rankedReferences[0]) {
        return master
      }
    }

    // Subsequent attempts: cycle through available references
    const index = (attempt - 1) % rankedReferences.length
    return rankedReferences[index]
  }

  /**
   * Upload generated image to media collection
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
      // Create media document
      const mediaDoc = await payload.create({
        collection: 'media',
        data: {
          alt: `Smart generated image: ${filename}`,
        },
        file: {
          data: imageBuffer,
          mimetype: 'image/jpeg',
          name: filename,
          size: imageBuffer.length,
        },
      })

      // Wait for DINOv3 processing
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

        const updatedMedia = await payload.findByID({
          collection: 'media',
          id: mediaDoc.id,
        })

        if (updatedMedia.dinoAssetId) {
          return {
            success: true,
            imageId: mediaDoc.id,
            dinoAssetId: updatedMedia.dinoAssetId,
          }
        }

        attempts++
      }

      return {
        success: false,
        error: 'DINOv3 processing timeout',
      }

    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }
    }
  }

  /**
   * Add successful image to character gallery
   */
  private async addToCharacterGallery(
    character: any,
    imageId: string,
    prompt: string,
    tags: string,
    qualityScore: number,
    consistencyScore: number,
    validationNotes: string | undefined,
    payload: any
  ): Promise<void> {
    const galleryItem = {
      imageFile: imageId,
      isCoreReference: false,
      dinoProcessingStatus: 'validation_success' as const,
      qualityScore,
      consistencyScore,
      validationNotes: validationNotes || 'Smart generation validation passed',
      shotType: 'smart_generated',
      tags: `${tags}, smart generation`,
      generationPrompt: prompt,
    }

    const updatedImageGallery = [...(character.imageGallery || []), galleryItem]

    await payload.update({
      collection: 'characters',
      id: character.id,
      data: {
        imageGallery: updatedImageGallery,
      },
    })
  }

  /**
   * Get public URL for an image
   */
  private getPublicImageUrl(dinoAssetId: string): string {
    const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://media.rumbletv.com'

    // If the asset ID is already a complete URL, return it as-is
    if (dinoAssetId.startsWith('http://') || dinoAssetId.startsWith('https://')) {
      return dinoAssetId
    }

    // If the asset ID contains a file extension, use it as-is
    if (dinoAssetId.includes('.')) {
      return `${baseUrl}/${dinoAssetId}`
    }

    // For asset IDs without extension, return URL without extension
    // The DINOv3 service should handle the correct object key format
    return `${baseUrl}/${dinoAssetId}`
  }
}

// Export singleton instance
export const smartImageGenerationService = new SmartImageGenerationService()
