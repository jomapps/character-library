/**
 * Enhanced Reference Search Service
 * 
 * Scene-aware image selection with detailed reasoning and scoring system.
 * Intelligently matches reference images to scene requirements with comprehensive analysis.
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { SceneAnalysisEngine, SceneAnalysis } from './SceneAnalysisEngine'

export interface ReferenceImage {
  id: string
  imageUrl: string
  mediaId: string
  dinoAssetId?: string
  
  // Shot metadata
  lens?: number
  angle?: string
  crop?: string
  expression?: string
  pose?: string
  referenceShot?: any
  
  // Enhanced metadata
  cameraAzimuthDeg?: number
  cameraElevationDeg?: number
  cameraDistanceM?: number
  gaze?: string
  thirds?: string
  recommendedFor?: string[]
  
  // Quality scores
  qualityScore?: number
  consistencyScore?: number
  technicalScore?: number
  compositionScore?: number
  cinematicScore?: number
  
  metadata?: any
}

export interface ScoredReferenceImage extends ReferenceImage {
  scores: {
    sceneTypeMatch: number
    lensPreference: number
    cropPreference: number
    anglePreference: number
    emotionalTone: number
    compositionMatch: number
    qualityScore: number
  }
  totalScore: number
}

export interface SearchOptions {
  sceneType?: string
  emotionalIntensity?: number
  includeAlternatives?: boolean
  minQualityScore?: number
  maxResults?: number
}

export interface SceneReferenceResult {
  success: boolean
  selectedImage?: {
    imageUrl: string
    mediaId: string
    referenceShot: any
    score: number
    metadata: any
  }
  reasoning?: string
  alternatives?: ScoredReferenceImage[]
  sceneAnalysis?: SceneAnalysis
  searchMetrics?: {
    totalImagesEvaluated: number
    averageScore: number
    selectionConfidence: number
  }
  error?: string
}

export class EnhancedReferenceSearchService {
  private payload: any
  private sceneAnalysisEngine: SceneAnalysisEngine

  constructor() {
    this.payload = null
    this.sceneAnalysisEngine = new SceneAnalysisEngine()
  }

  async initialize() {
    this.payload = await getPayload({ config })
  }

  /**
   * Find best reference image for scene with detailed analysis
   */
  async findBestReferenceForScene(
    characterId: string,
    sceneDescription: string,
    options: SearchOptions = {}
  ): Promise<SceneReferenceResult> {
    console.log(`🔍 Finding best reference for scene: "${sceneDescription.substring(0, 100)}..."`)

    if (!this.payload) {
      await this.initialize()
    }

    try {
      // Step 1: Analyze scene context
      const sceneAnalysis = this.sceneAnalysisEngine.analyzeSceneContext(sceneDescription)
      console.log('📊 Scene analysis:', sceneAnalysis)

      // Step 2: Get character's available reference images
      const availableImages = await this.getCharacterReferenceImages(characterId, options)
      console.log(`📸 Found ${availableImages.length} available reference images`)

      if (availableImages.length === 0) {
        return {
          success: false,
          error: 'No reference images found for this character',
          sceneAnalysis,
        }
      }

      // Step 3: Score images based on scene requirements
      const scoredImages = await this.scoreImagesForScene(availableImages, sceneAnalysis)

      // Step 4: Select best match with detailed reasoning
      const bestMatch = scoredImages[0]
      if (!bestMatch) {
        return {
          success: false,
          error: 'No suitable reference images found for this scene',
          sceneAnalysis,
        }
      }

      const reasoning = this.generateSelectionReasoning(bestMatch, sceneAnalysis)

      return {
        success: true,
        selectedImage: {
          imageUrl: bestMatch.imageUrl,
          mediaId: bestMatch.mediaId,
          referenceShot: bestMatch.referenceShot,
          score: bestMatch.totalScore,
          metadata: bestMatch.metadata,
        },
        reasoning,
        alternatives: options.includeAlternatives ? scoredImages.slice(1, 4) : [], // Top 3 alternatives
        sceneAnalysis,
        searchMetrics: {
          totalImagesEvaluated: availableImages.length,
          averageScore: scoredImages.reduce((sum, img) => sum + img.totalScore, 0) / scoredImages.length,
          selectionConfidence: bestMatch.totalScore / 100, // Normalize to 0-1
        },
      }

    } catch (error) {
      console.error('Scene-based reference search failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      }
    }
  }

  /**
   * Get character's available reference images
   */
  private async getCharacterReferenceImages(characterId: string, options: SearchOptions): Promise<ReferenceImage[]> {
    const character = await this.payload.findByID({
      collection: 'characters',
      id: characterId,
    })

    if (!character || !character.imageGallery) {
      return []
    }

    const images: ReferenceImage[] = []

    for (const galleryItem of character.imageGallery) {
      if (!galleryItem.imageFile) continue

      // Apply quality filter
      if (options.minQualityScore && galleryItem.qualityScore < options.minQualityScore) {
        continue
      }

      // Get image URL
      const imageUrl = typeof galleryItem.imageFile === 'object' 
        ? galleryItem.imageFile.url 
        : galleryItem.imageFile

      images.push({
        id: galleryItem.id || `${characterId}_${images.length}`,
        imageUrl,
        mediaId: typeof galleryItem.imageFile === 'object' ? galleryItem.imageFile.id : galleryItem.imageFile,
        dinoAssetId: galleryItem.dinoAssetId,
        
        // Shot metadata
        lens: galleryItem.lens,
        angle: galleryItem.angle,
        crop: galleryItem.crop,
        expression: galleryItem.expression,
        pose: galleryItem.pose,
        referenceShot: galleryItem.referenceShot,
        
        // Enhanced metadata
        cameraAzimuthDeg: galleryItem.cameraAzimuthDeg,
        cameraElevationDeg: galleryItem.cameraElevationDeg,
        cameraDistanceM: galleryItem.cameraDistanceM,
        gaze: galleryItem.gaze,
        thirds: galleryItem.thirds,
        recommendedFor: galleryItem.recommendedFor,
        
        // Quality scores
        qualityScore: galleryItem.qualityScore || 75,
        consistencyScore: galleryItem.consistencyScore || 75,
        technicalScore: galleryItem.technicalScore || 75,
        compositionScore: galleryItem.compositionScore || 75,
        cinematicScore: galleryItem.cinematicScore || 75,
        
        metadata: galleryItem,
      })
    }

    return images
  }

  /**
   * Score images based on scene requirements
   */
  private async scoreImagesForScene(
    images: ReferenceImage[],
    sceneAnalysis: SceneAnalysis
  ): Promise<ScoredReferenceImage[]> {
    const scoredImages = images.map(image => {
      const scores = {
        sceneTypeMatch: this.scoreSceneTypeMatch(image, sceneAnalysis.sceneType),
        lensPreference: this.scoreLensPreference(image, sceneAnalysis.requiredShots.preferredLens),
        cropPreference: this.scoreCropPreference(image, sceneAnalysis.requiredShots.preferredCrop),
        anglePreference: this.scoreAnglePreference(image, sceneAnalysis.requiredShots.preferredAngles),
        emotionalTone: this.scoreEmotionalTone(image, sceneAnalysis.emotionalTone),
        compositionMatch: this.scoreCompositionMatch(image, sceneAnalysis.compositionNeeds),
        qualityScore: image.qualityScore || 75,
      }

      // Weighted total score
      const totalScore = (
        scores.sceneTypeMatch * 0.25 +
        scores.lensPreference * 0.20 +
        scores.cropPreference * 0.20 +
        scores.anglePreference * 0.15 +
        scores.emotionalTone * 0.10 +
        scores.compositionMatch * 0.05 +
        scores.qualityScore * 0.05
      )

      return {
        ...image,
        scores,
        totalScore,
      }
    })

    // Sort by total score (highest first)
    return scoredImages.sort((a, b) => b.totalScore - a.totalScore)
  }

  /**
   * Score scene type match
   */
  private scoreSceneTypeMatch(image: ReferenceImage, sceneType: string): number {
    if (!image.recommendedFor) return 50 // Neutral if no recommendations

    const sceneTypeMap: Record<string, string[]> = {
      dialogue: ['close_dialogue', 'dialogue'],
      action: ['action', 'action_sequences'],
      emotional: ['emotional', 'emotional_moments'],
      establishing: ['establishing', 'establishing_shots', 'introduction'],
      transition: ['transition']
    }

    const relevantTypes = sceneTypeMap[sceneType] || []
    const hasMatch = image.recommendedFor.some(rec => 
      relevantTypes.some(type => rec.includes(type) || type.includes(rec))
    )

    return hasMatch ? 90 : 40
  }

  /**
   * Score lens preference match
   */
  private scoreLensPreference(image: ReferenceImage, preferredLens: number[]): number {
    if (!image.lens || preferredLens.length === 0) return 50

    if (preferredLens.includes(image.lens)) {
      return 95
    }

    // Partial credit for close matches
    const closestLens = preferredLens.reduce((closest, lens) => 
      Math.abs(lens - image.lens!) < Math.abs(closest - image.lens!) ? lens : closest
    )

    const difference = Math.abs(closestLens - image.lens)
    return Math.max(20, 95 - (difference * 10)) // Reduce score by 10 per mm difference
  }

  /**
   * Score crop preference match
   */
  private scoreCropPreference(image: ReferenceImage, preferredCrops: string[]): number {
    if (!image.crop || preferredCrops.length === 0) return 50

    if (preferredCrops.includes(image.crop)) {
      return 95
    }

    // Partial credit for similar crops
    const cropSimilarity: Record<string, string[]> = {
      'cu': ['mcu'],
      'mcu': ['cu', '3q'],
      '3q': ['mcu', 'full'],
      'full': ['3q'],
      'hands': []
    }

    const similarCrops = cropSimilarity[image.crop] || []
    const hasSimilar = preferredCrops.some(crop => similarCrops.includes(crop))

    return hasSimilar ? 70 : 30
  }

  /**
   * Score angle preference match
   */
  private scoreAnglePreference(image: ReferenceImage, preferredAngles: number[]): number {
    if (!image.cameraAzimuthDeg && preferredAngles.length === 0) return 50

    const imageAzimuth = image.cameraAzimuthDeg || 0

    if (preferredAngles.includes(imageAzimuth)) {
      return 95
    }

    // Find closest angle
    const closestAngle = preferredAngles.reduce((closest, angle) => 
      Math.abs(angle - imageAzimuth) < Math.abs(closest - imageAzimuth) ? angle : closest
    )

    const difference = Math.abs(closestAngle - imageAzimuth)
    return Math.max(20, 95 - (difference * 0.5)) // Reduce score by 0.5 per degree difference
  }

  /**
   * Score emotional tone match
   */
  private scoreEmotionalTone(image: ReferenceImage, emotionalTone: string): number {
    if (!image.expression) return 50

    const toneExpressionMap: Record<string, string[]> = {
      neutral: ['neutral'],
      tense: ['concerned', 'worried', 'tense'],
      intimate: ['gentle', 'soft', 'vulnerable'],
      dramatic: ['determined', 'intense', 'strong'],
      contemplative: ['thoughtful', 'contemplative', 'pondering']
    }

    const relevantExpressions = toneExpressionMap[emotionalTone] || ['neutral']
    const hasMatch = relevantExpressions.some(expr => 
      image.expression!.includes(expr) || expr.includes(image.expression!)
    )

    return hasMatch ? 85 : 45
  }

  /**
   * Score composition match
   */
  private scoreCompositionMatch(image: ReferenceImage, compositionNeeds: any): number {
    let score = 50

    // Eye contact requirement
    if (compositionNeeds.eyeContact && image.gaze === 'to_camera') {
      score += 15
    } else if (!compositionNeeds.eyeContact && image.gaze !== 'to_camera') {
      score += 10
    }

    // Profile work requirement
    if (compositionNeeds.profileWork && Math.abs(image.cameraAzimuthDeg || 0) >= 75) {
      score += 15
    }

    // Full body requirement
    if (compositionNeeds.fullBodyNeeded && image.crop === 'full') {
      score += 15
    }

    // Hands importance
    if (compositionNeeds.handsImportant && image.crop === 'hands') {
      score += 20
    }

    return Math.min(100, score)
  }

  /**
   * Generate detailed selection reasoning
   */
  private generateSelectionReasoning(
    selectedImage: ScoredReferenceImage,
    sceneAnalysis: SceneAnalysis
  ): string {
    const reasons = []

    // Scene type match
    if (selectedImage.scores.sceneTypeMatch > 80) {
      reasons.push(`Perfect match for ${sceneAnalysis.sceneType} scenes`)
    } else if (selectedImage.scores.sceneTypeMatch > 60) {
      reasons.push(`Good fit for ${sceneAnalysis.sceneType} scenes`)
    }

    // Lens choice
    if (selectedImage.lens && sceneAnalysis.requiredShots.preferredLens.includes(selectedImage.lens)) {
      const lensType = selectedImage.lens === 35 ? 'action/body' :
                     selectedImage.lens === 50 ? 'conversation' : 'emotional'
      reasons.push(`${selectedImage.lens}mm lens ideal for ${lensType} work`)
    }

    // Crop appropriateness
    if (selectedImage.crop && sceneAnalysis.requiredShots.preferredCrop.includes(selectedImage.crop)) {
      const cropDescription: Record<string, string> = {
        'cu': 'close-up intimacy',
        'mcu': 'medium close-up balance',
        '3q': 'three-quarter body context',
        'full': 'full body coverage',
        'hands': 'detailed hand work'
      }
      reasons.push(`${selectedImage.crop.toUpperCase()} crop provides ${cropDescription[selectedImage.crop]}`)
    }

    // Quality assurance
    if (selectedImage.qualityScore && selectedImage.qualityScore > 85) {
      reasons.push(`High quality score (${selectedImage.qualityScore}/100)`)
    }

    // Overall score
    reasons.push(`Overall compatibility score: ${Math.round(selectedImage.totalScore)}/100`)

    return reasons.join('. ') + '.'
  }
}
