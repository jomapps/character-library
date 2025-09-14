/**
 * Scene Analysis Engine
 * 
 * Intelligent scene understanding for optimal image selection based on context.
 * Analyzes scene descriptions to recommend appropriate camera angles, shots, and parameters.
 */

export type SceneType = 'dialogue' | 'action' | 'emotional' | 'establishing' | 'transition'
export type EmotionalTone = 'neutral' | 'tense' | 'intimate' | 'dramatic' | 'contemplative'

export interface RequiredShots {
  preferredLens: number[]     // [50, 85] for intimate dialogue
  preferredCrop: string[]     // ["cu", "mcu"] for emotional scenes
  preferredAngles: number[]   // [-35, 0, 35] for conversation
}

export interface CameraPreferences {
  intimacyLevel: number       // 1-10 (affects distance/lens choice)
  dynamismLevel: number       // 1-10 (affects angle variety)
  emotionalIntensity: number  // 1-10 (affects crop tightness)
}

export interface CompositionNeeds {
  eyeContact: boolean         // Requires "to_camera" gaze
  profileWork: boolean        // Benefits from profile shots
  fullBodyNeeded: boolean     // Requires full body reference
  handsImportant: boolean     // Needs hand detail shots
}

export interface SceneAnalysis {
  sceneType: SceneType
  emotionalTone: EmotionalTone
  requiredShots: RequiredShots
  cameraPreferences: CameraPreferences
  compositionNeeds: CompositionNeeds
  confidence: number          // 0-100 confidence in analysis
  keywords: string[]          // Extracted keywords
  reasoning: string           // Why these recommendations were made
}

export class SceneAnalysisEngine {
  
  /**
   * Analyze scene context from description
   */
  analyzeSceneContext(description: string): SceneAnalysis {
    const keywords = this.extractKeywords(description.toLowerCase())
    
    const sceneType = this.detectSceneType(keywords)
    const emotionalTone = this.detectEmotionalTone(keywords)
    const requiredShots = this.identifyRequiredShots(keywords, sceneType, emotionalTone)
    const cameraPreferences = this.suggestCameraSettings(keywords, sceneType, emotionalTone)
    const compositionNeeds = this.analyzeCompositionNeeds(keywords, sceneType, emotionalTone)
    
    const confidence = this.calculateConfidence(keywords, sceneType, emotionalTone)
    const reasoning = this.generateReasoning(sceneType, emotionalTone, keywords)

    return {
      sceneType,
      emotionalTone,
      requiredShots,
      cameraPreferences,
      compositionNeeds,
      confidence,
      keywords,
      reasoning
    }
  }

  /**
   * Extract and normalize keywords from scene description
   */
  private extractKeywords(description: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
    ])

    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
  }

  /**
   * Detect scene type from keywords
   */
  private detectSceneType(keywords: string[]): SceneType {
    const sceneTypeKeywords = {
      dialogue: ['conversation', 'talking', 'speaking', 'dialogue', 'discussion', 'chat', 'words', 'says', 'tells', 'asks', 'responds', 'replies'],
      action: ['fight', 'running', 'chase', 'movement', 'action', 'dynamic', 'fast', 'quick', 'rush', 'battle', 'combat', 'moves'],
      emotional: ['crying', 'sad', 'happy', 'angry', 'emotional', 'feeling', 'reaction', 'tears', 'joy', 'fear', 'love', 'hate', 'pain'],
      establishing: ['wide', 'establishing', 'location', 'setting', 'environment', 'place', 'room', 'building', 'landscape', 'overview'],
      transition: ['walking', 'moving', 'transition', 'between', 'connecting', 'goes', 'leaves', 'enters', 'approaches', 'departs']
    }

    let maxScore = 0
    let detectedType: SceneType = 'dialogue' // Default

    for (const [type, typeKeywords] of Object.entries(sceneTypeKeywords)) {
      const score = typeKeywords.filter(keyword =>
        keywords.some(k => k.includes(keyword) || keyword.includes(k))
      ).length

      if (score > maxScore) {
        maxScore = score
        detectedType = type as SceneType
      }
    }

    return detectedType
  }

  /**
   * Detect emotional tone from keywords
   */
  private detectEmotionalTone(keywords: string[]): EmotionalTone {
    const toneKeywords = {
      tense: ['tense', 'nervous', 'anxious', 'worried', 'stressed', 'pressure', 'conflict', 'argument', 'confrontation'],
      intimate: ['intimate', 'close', 'personal', 'private', 'quiet', 'whisper', 'gentle', 'tender', 'soft'],
      dramatic: ['dramatic', 'intense', 'powerful', 'strong', 'climax', 'peak', 'crucial', 'critical', 'important'],
      contemplative: ['thoughtful', 'thinking', 'contemplative', 'reflective', 'pondering', 'considering', 'wondering', 'musing']
    }

    let maxScore = 0
    let detectedTone: EmotionalTone = 'neutral'

    for (const [tone, toneKeywordList] of Object.entries(toneKeywords)) {
      const score = toneKeywordList.filter(keyword =>
        keywords.some(k => k.includes(keyword) || keyword.includes(k))
      ).length

      if (score > maxScore) {
        maxScore = score
        detectedTone = tone as EmotionalTone
      }
    }

    return detectedTone
  }

  /**
   * Identify required shots based on scene analysis
   */
  private identifyRequiredShots(keywords: string[], sceneType: SceneType, emotionalTone: EmotionalTone): RequiredShots {
    const shotKeywords = {
      closeUp: ['close', 'intimate', 'face', 'expression', 'eyes', 'detail', 'emotion'],
      mediumShot: ['conversation', 'dialogue', 'talking', 'medium', 'interaction'],
      fullBody: ['full', 'body', 'movement', 'action', 'standing', 'walking', 'posture'],
      profile: ['profile', 'side', 'silhouette', 'contemplative', 'thinking'],
      hands: ['hands', 'gesture', 'touching', 'holding', 'props', 'object']
    }

    const requiredShots: RequiredShots = {
      preferredLens: [],
      preferredCrop: [],
      preferredAngles: []
    }

    // Base recommendations on scene type
    switch (sceneType) {
      case 'dialogue':
        requiredShots.preferredLens.push(50, 85)
        requiredShots.preferredCrop.push('cu', 'mcu')
        requiredShots.preferredAngles.push(0, -35, 35)
        break
      case 'action':
        requiredShots.preferredLens.push(35, 50)
        requiredShots.preferredCrop.push('full', '3q')
        requiredShots.preferredAngles.push(-45, 0, 45)
        break
      case 'emotional':
        requiredShots.preferredLens.push(85)
        requiredShots.preferredCrop.push('cu', 'mcu')
        requiredShots.preferredAngles.push(-25, 0, 25)
        break
      case 'establishing':
        requiredShots.preferredLens.push(35)
        requiredShots.preferredCrop.push('full')
        requiredShots.preferredAngles.push(0)
        break
      case 'transition':
        requiredShots.preferredLens.push(35, 50)
        requiredShots.preferredCrop.push('full', '3q')
        requiredShots.preferredAngles.push(-35, 35)
        break
    }

    // Refine based on emotional tone
    if (emotionalTone === 'intimate') {
      requiredShots.preferredLens = [85]
      requiredShots.preferredCrop = ['cu']
      requiredShots.preferredAngles = [0, -15, 15]
    } else if (emotionalTone === 'dramatic') {
      requiredShots.preferredAngles.push(-15, 15) // Add elevation variety
    }

    // Adjust based on specific keywords
    if (this.hasKeywords(keywords, shotKeywords.closeUp)) {
      requiredShots.preferredLens.push(85)
      requiredShots.preferredCrop.push('cu')
    }

    if (this.hasKeywords(keywords, shotKeywords.fullBody)) {
      requiredShots.preferredLens.push(35)
      requiredShots.preferredCrop.push('full')
    }

    if (this.hasKeywords(keywords, shotKeywords.profile)) {
      requiredShots.preferredAngles.push(-90, 90)
    }

    // Remove duplicates and sort
    requiredShots.preferredLens = [...new Set(requiredShots.preferredLens)].sort()
    requiredShots.preferredCrop = [...new Set(requiredShots.preferredCrop)]
    requiredShots.preferredAngles = [...new Set(requiredShots.preferredAngles)].sort()

    return requiredShots
  }

  /**
   * Suggest camera settings based on scene analysis
   */
  private suggestCameraSettings(keywords: string[], sceneType: SceneType, emotionalTone: EmotionalTone): CameraPreferences {
    let intimacyLevel = 5
    let dynamismLevel = 5
    let emotionalIntensity = 5

    // Adjust based on scene type
    switch (sceneType) {
      case 'dialogue':
        intimacyLevel = 7
        dynamismLevel = 3
        emotionalIntensity = 6
        break
      case 'action':
        intimacyLevel = 3
        dynamismLevel = 9
        emotionalIntensity = 4
        break
      case 'emotional':
        intimacyLevel = 8
        dynamismLevel = 2
        emotionalIntensity = 9
        break
      case 'establishing':
        intimacyLevel = 2
        dynamismLevel = 4
        emotionalIntensity = 3
        break
      case 'transition':
        intimacyLevel = 4
        dynamismLevel = 6
        emotionalIntensity = 4
        break
    }

    // Adjust based on emotional tone
    switch (emotionalTone) {
      case 'intimate':
        intimacyLevel = Math.min(10, intimacyLevel + 2)
        dynamismLevel = Math.max(1, dynamismLevel - 2)
        break
      case 'dramatic':
        emotionalIntensity = Math.min(10, emotionalIntensity + 2)
        dynamismLevel = Math.min(10, dynamismLevel + 1)
        break
      case 'tense':
        dynamismLevel = Math.min(10, dynamismLevel + 2)
        emotionalIntensity = Math.min(10, emotionalIntensity + 1)
        break
      case 'contemplative':
        intimacyLevel = Math.min(10, intimacyLevel + 1)
        dynamismLevel = Math.max(1, dynamismLevel - 3)
        break
    }

    // Fine-tune based on keywords
    const intensityKeywords = ['intense', 'powerful', 'strong', 'dramatic']
    const quietKeywords = ['quiet', 'gentle', 'soft', 'subtle']
    const fastKeywords = ['fast', 'quick', 'rapid', 'sudden']

    if (this.hasKeywords(keywords, intensityKeywords)) {
      emotionalIntensity = Math.min(10, emotionalIntensity + 1)
    }

    if (this.hasKeywords(keywords, quietKeywords)) {
      intimacyLevel = Math.min(10, intimacyLevel + 1)
      dynamismLevel = Math.max(1, dynamismLevel - 1)
    }

    if (this.hasKeywords(keywords, fastKeywords)) {
      dynamismLevel = Math.min(10, dynamismLevel + 2)
    }

    return {
      intimacyLevel,
      dynamismLevel,
      emotionalIntensity
    }
  }

  /**
   * Analyze composition needs
   */
  private analyzeCompositionNeeds(keywords: string[], sceneType: SceneType, emotionalTone: EmotionalTone): CompositionNeeds {
    const eyeContactKeywords = ['looking', 'staring', 'gazing', 'eye', 'contact', 'direct']
    const profileKeywords = ['profile', 'side', 'silhouette', 'contemplative', 'thinking', 'pondering']
    const fullBodyKeywords = ['standing', 'walking', 'posture', 'movement', 'full', 'body']
    const handKeywords = ['hands', 'gesture', 'touching', 'holding', 'props', 'object', 'pointing']

    return {
      eyeContact: sceneType === 'dialogue' || this.hasKeywords(keywords, eyeContactKeywords),
      profileWork: this.hasKeywords(keywords, profileKeywords) || emotionalTone === 'contemplative',
      fullBodyNeeded: sceneType === 'action' || sceneType === 'establishing' || this.hasKeywords(keywords, fullBodyKeywords),
      handsImportant: this.hasKeywords(keywords, handKeywords)
    }
  }

  /**
   * Calculate confidence in analysis
   */
  private calculateConfidence(keywords: string[], sceneType: SceneType, emotionalTone: EmotionalTone): number {
    let confidence = 50 // Base confidence

    // Increase confidence based on keyword matches
    confidence += Math.min(30, keywords.length * 2) // More keywords = higher confidence

    // Increase confidence for clear scene indicators
    const sceneIndicators = {
      dialogue: ['conversation', 'talking', 'dialogue'],
      action: ['action', 'fight', 'chase'],
      emotional: ['emotional', 'crying', 'feeling'],
      establishing: ['establishing', 'wide', 'location'],
      transition: ['transition', 'moving', 'walking']
    }

    const hasStrongIndicator = sceneIndicators[sceneType]?.some(indicator =>
      keywords.some(k => k.includes(indicator))
    )

    if (hasStrongIndicator) confidence += 20

    // Cap at 95 to maintain some uncertainty
    return Math.min(95, confidence)
  }

  /**
   * Generate reasoning for recommendations
   */
  private generateReasoning(sceneType: SceneType, emotionalTone: EmotionalTone, keywords: string[]): string {
    const reasons = []

    reasons.push(`Detected scene type: ${sceneType}`)
    reasons.push(`Emotional tone: ${emotionalTone}`)

    if (keywords.length > 0) {
      reasons.push(`Key indicators: ${keywords.slice(0, 5).join(', ')}`)
    }

    // Add specific reasoning based on scene type
    switch (sceneType) {
      case 'dialogue':
        reasons.push('Recommending 50mm and 85mm lenses for natural conversation perspective')
        break
      case 'action':
        reasons.push('Recommending 35mm lens and wider shots for dynamic movement capture')
        break
      case 'emotional':
        reasons.push('Recommending 85mm lens and close-ups for emotional intimacy')
        break
      case 'establishing':
        reasons.push('Recommending 35mm lens and full body shots for context establishment')
        break
      case 'transition':
        reasons.push('Recommending varied angles and medium shots for movement continuity')
        break
    }

    return reasons.join('. ') + '.'
  }

  /**
   * Check if keywords contain any of the target words
   */
  private hasKeywords(keywords: string[], targetWords: string[]): boolean {
    return targetWords.some(target =>
      keywords.some(keyword => keyword.includes(target) || target.includes(keyword))
    )
  }
}
