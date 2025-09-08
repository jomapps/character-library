/**
 * Image Generation Service
 * 
 * This service handles AI image generation using Fal.ai
 * Supports text-to-image and image-to-image generation with reference images
 */

export interface GenerationOptions {
  referenceImageAssetId?: string
  additionalReferenceIds?: string[]
  style?: 'character_turnaround' | 'character_production' | 'custom'
  width?: number
  height?: number
  steps?: number
  guidance?: number
  seed?: number
}

export interface GenerationResult {
  success: boolean
  imageBuffer?: Buffer
  imageUrl?: string
  error?: string
  metadata?: {
    prompt: string
    model: string
    parameters: Record<string, any>
    generationTime: number
  }
}

export class ImageGenerationService {
  private falApiKey: string
  private textToImageModel: string
  private imageToImageModel: string
  private baseUrl = 'https://fal.run'

  constructor() {
    this.falApiKey = process.env.FAL_KEY || ''
    this.textToImageModel = process.env.FAL_TEXT_TO_IMAGE_MODEL || 'fal-ai/nano-banana'
    this.imageToImageModel = process.env.FAL_IMAGE_TO_IMAGE_MODEL || 'fal-ai/nano-banana/edit'

    if (!this.falApiKey) {
      console.warn('FAL_KEY not set - Image generation will not function')
    }
  }

  /**
   * Generate image from text prompt with optional reference images
   */
  async generateImage(
    prompt: string,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now()

    try {
      console.log(`Generating image with prompt: "${prompt.substring(0, 100)}..."`)

      // Determine if we need image-to-image or text-to-image
      const useImageToImage = !!options.referenceImageAssetId
      const model = useImageToImage ? this.imageToImageModel : this.textToImageModel

      // Prepare generation parameters
      const parameters = await this.prepareGenerationParameters(prompt, options)
      
      // Call Fal.ai API
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${this.falApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Fal.ai API error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      
      if (!result.images || result.images.length === 0) {
        throw new Error('No images returned from Fal.ai')
      }

      // Download the generated image
      const imageUrl = result.images[0].url
      const imageBuffer = await this.downloadImage(imageUrl)

      const generationTime = Date.now() - startTime

      console.log(`Image generated successfully in ${generationTime}ms`)

      return {
        success: true,
        imageBuffer,
        imageUrl,
        metadata: {
          prompt,
          model,
          parameters,
          generationTime,
        },
      }

    } catch (error) {
      console.error('Image generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown generation error',
      }
    }
  }

  /**
   * Prepare generation parameters based on options and style
   */
  private async prepareGenerationParameters(
    prompt: string,
    options: GenerationOptions
  ): Promise<Record<string, any>> {
    // Determine if we need image-to-image or text-to-image
    const useImageToImage = !!options.referenceImageAssetId

    const parameters: Record<string, any> = {
      prompt: this.enhancePrompt(prompt, options.style),
      num_images: 1, // nano-banana uses num_images instead of batch_size
      output_format: 'jpeg', // nano-banana specific parameter
    }

    // Add seed if specified
    if (options.seed) {
      parameters.seed = options.seed
    }

    // Handle reference images for image-to-image generation
    if (useImageToImage && options.referenceImageAssetId) {
      const referenceImageUrl = await this.getDinoAssetUrl(options.referenceImageAssetId)
      if (referenceImageUrl) {
        // For nano-banana/edit, we need image_urls array
        parameters.image_urls = [referenceImageUrl]

        // Add additional reference images if available
        if (options.additionalReferenceIds && options.additionalReferenceIds.length > 0) {
          const additionalUrls = await Promise.all(
            options.additionalReferenceIds.map(id => this.getDinoAssetUrl(id))
          )
          const validUrls = additionalUrls.filter(url => url !== null)

          if (validUrls.length > 0) {
            parameters.image_urls.push(...validUrls.slice(0, 9)) // Max 10 images total
          }
        }
      }
    }

    return parameters
  }

  /**
   * Enhance prompt based on style and context
   * Note: nano-banana uses Gemini, so we use natural language descriptions
   */
  private enhancePrompt(prompt: string, style?: string): string {
    let enhancedPrompt = prompt

    switch (style) {
      case 'character_turnaround':
        enhancedPrompt += '. Create a professional character reference sheet with clean background, consistent lighting, high quality and detailed features.'
        break
      case 'character_production':
        enhancedPrompt += '. Create a cinematic quality image with professional lighting, high detail, and production-ready quality.'
        break
      default:
        enhancedPrompt += '. Create a high quality, detailed image.'
    }

    return enhancedPrompt
  }

  /**
   * Get image size based on options or style defaults
   */
  private getImageSize(options: GenerationOptions): string {
    if (options.width && options.height) {
      return `${options.width}x${options.height}`
    }

    switch (options.style) {
      case 'character_turnaround':
        return '768x1024' // Portrait orientation for character sheets
      case 'character_production':
        return '1024x768' // Landscape for cinematic shots
      default:
        return '1024x1024' // Square default
    }
  }

  /**
   * Get default steps based on style
   */
  private getDefaultSteps(style?: string): number {
    switch (style) {
      case 'character_turnaround':
        return 30 // Higher quality for reference images
      case 'character_production':
        return 25 // Good balance of quality and speed
      default:
        return 20 // Fast generation
    }
  }

  /**
   * Get default guidance scale based on style
   */
  private getDefaultGuidance(style?: string): number {
    switch (style) {
      case 'character_turnaround':
        return 8.0 // Higher adherence to prompt for consistency
      case 'character_production':
        return 7.5 // Good balance
      default:
        return 7.0 // Standard guidance
    }
  }

  /**
   * Get strength parameter for image-to-image based on style
   */
  private getStrengthForStyle(style?: string): number {
    switch (style) {
      case 'character_turnaround':
        return 0.8 // Strong influence from reference for consistency
      case 'character_production':
        return 0.6 // Moderate influence allowing for variation
      default:
        return 0.7 // Balanced default
    }
  }

  /**
   * Get DINOv3 asset URL for use as reference image
   */
  private async getDinoAssetUrl(dinoAssetId: string): Promise<string | null> {
    try {
      // Get media URL from DINOv3 service
      const response = await fetch(`${process.env.DINO_SERVICE_URL}/api/v1/media/${dinoAssetId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.DINO_API_KEY}`,
        },
      })

      if (!response.ok) {
        console.warn(`Failed to get DINOv3 asset URL for ${dinoAssetId}`)
        return null
      }

      const result = await response.json()
      return result.media_url || null
    } catch (error) {
      console.warn(`Error getting DINOv3 asset URL for ${dinoAssetId}:`, error)
      return null
    }
  }

  /**
   * Download image from URL and return as Buffer
   */
  private async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  /**
   * Generate multiple variations of an image
   */
  async generateVariations(
    prompt: string,
    count: number,
    options: GenerationOptions = {}
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = []
    
    console.log(`Generating ${count} variations of: "${prompt.substring(0, 50)}..."`)

    // Generate images in parallel (but limit concurrency to avoid rate limits)
    const batchSize = 3
    for (let i = 0; i < count; i += batchSize) {
      const batch = []
      const batchEnd = Math.min(i + batchSize, count)
      
      for (let j = i; j < batchEnd; j++) {
        // Use different seeds for variations
        const variationOptions = { ...options, seed: options.seed ? options.seed + j : undefined }
        batch.push(this.generateImage(prompt, variationOptions))
      }

      const batchResults = await Promise.all(batch)
      results.push(...batchResults)
    }

    const successCount = results.filter(r => r.success).length
    console.log(`Generated ${successCount}/${count} variations successfully`)

    return results
  }

  /**
   * Get service configuration
   */
  getConfig() {
    return {
      hasApiKey: !!this.falApiKey,
      textToImageModel: this.textToImageModel,
      imageToImageModel: this.imageToImageModel,
      baseUrl: this.baseUrl,
    }
  }
}

// Export singleton instance
export const imageGenerationService = new ImageGenerationService()
