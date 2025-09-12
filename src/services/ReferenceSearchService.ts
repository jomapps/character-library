/**
 * Reference Search Service
 * 
 * This service analyzes text prompts and finds the best matching reference image
 * from a character's 360° reference set based on context, mood, and technical requirements.
 */

export interface ReferenceSearchOptions {
  preferredLens?: number // 35, 50, 85
  preferredAngle?: string
  preferredCrop?: string
  includeAddonShots?: boolean
  minQualityScore?: number
}

export interface ReferenceSearchResult {
  success: boolean
  bestMatch?: {
    imageUrl: string
    imageId: string
    referenceShot: any
    confidence: number
    reasoning: string
  }
  alternatives?: Array<{
    imageUrl: string
    imageId: string
    referenceShot: any
    confidence: number
    reasoning: string
  }>
  error?: string
}

export interface PromptAnalysis {
  sceneType: 'dialogue' | 'action' | 'emotional' | 'establishing' | 'unknown'
  mood: string[]
  suggestedLens: number
  suggestedAngle: string
  suggestedCrop: string
  suggestedExpression: string
  keywords: string[]
  confidence: number
}

export class ReferenceSearchService {
  /**
   * Find the best reference image for a given prompt
   */
  async findBestReference(
    characterId: string,
    prompt: string,
    payload: any,
    options: ReferenceSearchOptions = {}
  ): Promise<ReferenceSearchResult> {
    try {
      console.log(`🔍 Searching reference images for character: ${characterId}`)
      console.log(`📝 Prompt: "${prompt}"`)

      // Get character with image gallery
      const character = await payload.findByID({
        collection: 'characters',
        id: characterId,
        depth: 3, // Include related media and reference shots
      })

      if (!character) {
        return {
          success: false,
          error: 'Character not found',
        }
      }

      // Filter reference images
      const referenceImages = this.filterReferenceImages(character.imageGallery || [], options)

      if (referenceImages.length === 0) {
        return {
          success: false,
          error: 'No suitable reference images found',
        }
      }

      // Analyze the prompt
      const analysis = this.analyzePrompt(prompt)
      console.log(`🧠 Prompt analysis:`, analysis)

      // Score and rank images
      const scoredImages = this.scoreImages(referenceImages, analysis, options)
      
      // Sort by confidence score
      scoredImages.sort((a, b) => b.confidence - a.confidence)

      const bestMatch = scoredImages[0]
      const alternatives = scoredImages.slice(1, 4) // Top 3 alternatives

      console.log(`🎯 Best match: ${bestMatch.referenceShot?.shotName || 'Unknown'} (${bestMatch.confidence.toFixed(2)}%)`)

      return {
        success: true,
        bestMatch,
        alternatives,
      }

    } catch (error) {
      console.error('Reference search failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }
    }
  }

  /**
   * Analyze prompt to understand context and requirements
   */
  private analyzePrompt(prompt: string): PromptAnalysis {
    const lowerPrompt = prompt.toLowerCase()
    const keywords = this.extractKeywords(lowerPrompt)

    // Determine scene type
    let sceneType: PromptAnalysis['sceneType'] = 'unknown'
    if (this.containsAny(lowerPrompt, ['dialogue', 'conversation', 'talking', 'speaking', 'says', 'tells'])) {
      sceneType = 'dialogue'
    } else if (this.containsAny(lowerPrompt, ['action', 'running', 'fighting', 'moving', 'jumping', 'walking'])) {
      sceneType = 'action'
    } else if (this.containsAny(lowerPrompt, ['emotional', 'crying', 'laughing', 'angry', 'sad', 'happy', 'worried', 'concerned'])) {
      sceneType = 'emotional'
    } else if (this.containsAny(lowerPrompt, ['establishing', 'wide', 'full body', 'scene', 'environment'])) {
      sceneType = 'establishing'
    }

    // Extract mood keywords
    const moodKeywords = this.extractMoodKeywords(lowerPrompt)

    // Suggest technical parameters based on analysis
    const suggestedLens = this.suggestLens(sceneType, lowerPrompt)
    const suggestedAngle = this.suggestAngle(lowerPrompt)
    const suggestedCrop = this.suggestCrop(lowerPrompt)
    const suggestedExpression = this.suggestExpression(lowerPrompt, moodKeywords)

    // Calculate confidence based on keyword matches
    const confidence = Math.min(100, (keywords.length * 10) + (moodKeywords.length * 15))

    return {
      sceneType,
      mood: moodKeywords,
      suggestedLens,
      suggestedAngle,
      suggestedCrop,
      suggestedExpression,
      keywords,
      confidence,
    }
  }

  /**
   * Score images based on prompt analysis
   */
  private scoreImages(
    images: any[],
    analysis: PromptAnalysis,
    options: ReferenceSearchOptions
  ): Array<{
    imageUrl: string
    imageId: string
    referenceShot: any
    confidence: number
    reasoning: string
  }> {
    return images.map(image => {
      let score = 0
      const reasons: string[] = []

      const referenceShot = image.referenceShot
      if (!referenceShot) {
        return {
          imageUrl: this.getImageUrl(image),
          imageId: image.imageFile?.id || image.imageFile,
          referenceShot: null,
          confidence: 0,
          reasoning: 'No reference shot data available',
        }
      }

      // Scene type matching
      if (analysis.sceneType === 'dialogue' && referenceShot.mode === 'Conversation') {
        score += 30
        reasons.push('Conversation mode matches dialogue context')
      } else if (analysis.sceneType === 'action' && referenceShot.mode === 'Action/Body') {
        score += 30
        reasons.push('Action/Body mode matches action context')
      } else if (analysis.sceneType === 'emotional' && referenceShot.mode === 'Emotion') {
        score += 30
        reasons.push('Emotion mode matches emotional context')
      }

      // Lens matching
      if (referenceShot.lensMm === analysis.suggestedLens) {
        score += 20
        reasons.push(`${referenceShot.lensMm}mm lens matches suggested focal length`)
      } else if (options.preferredLens && referenceShot.lensMm === options.preferredLens) {
        score += 15
        reasons.push(`${referenceShot.lensMm}mm lens matches user preference`)
      }

      // Angle matching
      if (referenceShot.angle === analysis.suggestedAngle) {
        score += 15
        reasons.push(`${referenceShot.angle} angle matches analysis`)
      } else if (options.preferredAngle && referenceShot.angle === options.preferredAngle) {
        score += 10
        reasons.push(`${referenceShot.angle} angle matches user preference`)
      }

      // Crop matching
      if (referenceShot.crop === analysis.suggestedCrop) {
        score += 15
        reasons.push(`${referenceShot.crop} crop matches suggested framing`)
      } else if (options.preferredCrop && referenceShot.crop === options.preferredCrop) {
        score += 10
        reasons.push(`${referenceShot.crop} crop matches user preference`)
      }

      // Expression matching
      if (referenceShot.expression === analysis.suggestedExpression) {
        score += 20
        reasons.push(`${referenceShot.expression} expression matches mood analysis`)
      }

      // Quality bonus
      if (image.qualityScore && image.qualityScore > 85) {
        score += 10
        reasons.push(`High quality score (${image.qualityScore})`)
      }

      // Core vs addon preference
      if (referenceShot.pack === 'core') {
        score += 5
        reasons.push('Core reference shot (higher reliability)')
      }

      return {
        imageUrl: this.getImageUrl(image),
        imageId: image.imageFile?.id || image.imageFile,
        referenceShot,
        confidence: Math.min(100, score),
        reasoning: reasons.join('; ') || 'Basic compatibility match',
      }
    })
  }

  /**
   * Filter reference images based on options
   */
  private filterReferenceImages(imageGallery: any[], options: ReferenceSearchOptions): any[] {
    console.log(`🔍 Filtering ${imageGallery.length} images from gallery`)

    const filtered = imageGallery.filter(image => {
      // Must be core reference
      if (!image.isCoreReference) {
        console.log(`❌ Image ${image.imageFile} not a core reference`)
        return false
      }

      // Must have reference shot data
      if (!image.referenceShot) {
        console.log(`❌ Image ${image.imageFile} missing reference shot data`)
        return false
      }

      // Quality threshold (only apply if quality score exists)
      if (options.minQualityScore && image.qualityScore && image.qualityScore < options.minQualityScore) {
        console.log(`❌ Image ${image.imageFile} quality ${image.qualityScore} below threshold ${options.minQualityScore}`)
        return false
      }

      // Include addon shots if requested
      if (!options.includeAddonShots && image.referenceShot.pack === 'addon') {
        console.log(`❌ Image ${image.imageFile} is addon shot but not requested`)
        return false
      }

      console.log(`✅ Image ${image.imageFile} passed filters - ${image.referenceShot.shotName}`)
      return true
    })

    console.log(`🎯 Filtered to ${filtered.length} suitable reference images`)
    return filtered
  }

  /**
   * Extract keywords from prompt
   */
  private extractKeywords(prompt: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were']
    return prompt
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, '').toLowerCase())
      .filter(word => word.length > 2 && !commonWords.includes(word))
  }

  /**
   * Extract mood-related keywords
   */
  private extractMoodKeywords(prompt: string): string[] {
    const moodWords = [
      'happy', 'sad', 'angry', 'worried', 'concerned', 'thoughtful', 'determined',
      'vulnerable', 'resolute', 'neutral', 'excited', 'calm', 'tense', 'relaxed',
      'confident', 'uncertain', 'hopeful', 'desperate', 'proud', 'ashamed'
    ]
    
    return moodWords.filter(mood => prompt.includes(mood))
  }

  /**
   * Suggest lens based on scene type
   */
  private suggestLens(sceneType: string, prompt: string): number {
    if (sceneType === 'dialogue' || this.containsAny(prompt, ['close', 'face', 'portrait'])) {
      return 50 // Conversation lens
    } else if (sceneType === 'emotional' || this.containsAny(prompt, ['emotion', 'reaction', 'expression'])) {
      return 85 // Emotion lens
    } else if (sceneType === 'action' || this.containsAny(prompt, ['full body', 'wide', 'establishing'])) {
      return 35 // Action/Body lens
    }
    return 50 // Default to conversation
  }

  /**
   * Suggest angle based on prompt
   */
  private suggestAngle(prompt: string): string {
    if (this.containsAny(prompt, ['profile', 'side'])) {
      return 'profile_left'
    } else if (this.containsAny(prompt, ['three quarter', '3/4', 'angled'])) {
      return '3q_left'
    } else if (this.containsAny(prompt, ['back', 'behind'])) {
      return 'back'
    }
    return 'front' // Default
  }

  /**
   * Suggest crop based on prompt
   */
  private suggestCrop(prompt: string): string {
    if (this.containsAny(prompt, ['full body', 'whole body', 'head to toe'])) {
      return 'full'
    } else if (this.containsAny(prompt, ['close up', 'face', 'portrait'])) {
      return 'cu'
    } else if (this.containsAny(prompt, ['medium', 'waist up', 'chest up'])) {
      return 'mcu'
    } else if (this.containsAny(prompt, ['hands', 'hand'])) {
      return 'hands'
    }
    return '3q' // Default to 3/4
  }

  /**
   * Suggest expression based on mood
   */
  private suggestExpression(prompt: string, moodKeywords: string[]): string {
    if (moodKeywords.includes('worried') || moodKeywords.includes('concerned')) {
      return 'concerned'
    } else if (moodKeywords.includes('determined') || moodKeywords.includes('confident')) {
      return 'determined'
    } else if (moodKeywords.includes('thoughtful') || moodKeywords.includes('contemplative')) {
      return 'thoughtful'
    } else if (moodKeywords.includes('vulnerable') || moodKeywords.includes('sad')) {
      return 'vulnerable'
    } else if (moodKeywords.includes('resolute') || moodKeywords.includes('strong')) {
      return 'resolute'
    }
    return 'neutral' // Default
  }

  /**
   * Check if prompt contains any of the given terms
   */
  private containsAny(text: string, terms: string[]): boolean {
    return terms.some(term => text.includes(term))
  }

  /**
   * Get image URL from image object
   */
  private getImageUrl(image: any): string {
    // This would typically construct the URL from your media storage
    // For now, return a placeholder or use the media ID
    const mediaId = image.imageFile?.id || image.imageFile
    return `https://your-media-domain.com/${mediaId}`
  }
}

// Export singleton instance
export const referenceSearchService = new ReferenceSearchService()
