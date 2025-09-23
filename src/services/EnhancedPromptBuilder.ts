/**
 * Enhanced Prompt Builder Service
 * 
 * Transforms the existing template-based system into a precision cinematographic
 * reference generator with exact technical specifications and intelligent parameter calculation.
 */

export interface EnhancedReferenceShot {
  // Existing fields
  slug: string
  shotName: string
  lensMm: number
  mode: string
  angle: string
  crop: string
  expression: string
  pose: string
  fStop: number
  iso: number
  shutterSpeed: string
  referenceWeight: number
  pack: string
  description: string
  usageNotes: string
  promptTemplate: string

  // Enhanced fields (optional for backward compatibility)
  cameraAzimuthDeg?: number
  cameraElevationDeg?: number
  cameraDistanceM?: number
  subjectYawDeg?: number
  gaze?: string
  thirds?: string
  headroom?: string
  whenToUse?: string
  sceneTypes?: string[]
  priority?: number
  negativePrompts?: string
  compositionNotes?: string
}

export interface CharacterData {
  name: string
  physicalDescription?: string
  personality?: string
  [key: string]: any
}

export interface PromptPlaceholders {
  CHARACTER: string
  PHYSIQUE_TRAITS: string
  PERSONALITY: string
  LENS: number
  DISTANCE: number
  AZIMUTH: number
  ELEVATION: number
  CROP: string
  THIRDS: string
  HEADROOM: string
  SUBJECT_YAW: number
  GAZE: string
  POSE: string
  FSTOP: number
  ISO: number
  SHUTTER: string
  REF_URL: string
  REF_WEIGHT: number
  NEGATIVE_PROMPTS: string
  COMPOSITION_NOTES: string
}

export class EnhancedPromptBuilder {
  private readonly CINEMATIC_TEMPLATE = `
Ultra-detailed studio reference of {CHARACTER}; {PHYSIQUE_TRAITS};
personality cues: {PERSONALITY}; neutral seamless background; natural soft key.

CAMERA (full-frame):
- focal length: {LENS}mm
- physical distance: {DISTANCE}m
- azimuth: {AZIMUTH}°
- elevation: {ELEVATION}°

COMPOSITION:
- crop: {CROP} | thirds: {THIRDS} | headroom: {HEADROOM}

SUBJECT:
- shoulder yaw: {SUBJECT_YAW}° | gaze: {GAZE} | pose: {POSE}

EXPOSURE: f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s
FOCUS: eyes tack sharp; realistic pores; natural micro-speculars.

reference_image: {REF_URL}
reference_weight: {REF_WEIGHT}

--negatives: {NEGATIVE_PROMPTS}, CGI, 3D, illustration, cartoon, props, text, watermarks.
{COMPOSITION_NOTES}
  `.trim()

  /**
   * Get the cinematic template
   */
  getCinematicTemplate(): string {
    return this.CINEMATIC_TEMPLATE
  }

  /**
   * Build enhanced cinematic prompt with precise technical specifications
   */
  buildEnhancedPrompt(
    referenceShot: EnhancedReferenceShot,
    characterData: CharacterData,
    masterRefUrl: string
  ): string {
    const placeholders = this.calculatePlaceholders(referenceShot, characterData, masterRefUrl)
    return this.replacePlaceholders(this.CINEMATIC_TEMPLATE, placeholders)
  }

  /**
   * Calculate all placeholder values with intelligent defaults
   */
  private calculatePlaceholders(
    referenceShot: EnhancedReferenceShot,
    characterData: CharacterData,
    masterRefUrl: string
  ): PromptPlaceholders {
    return {
      CHARACTER: characterData.name,
      PHYSIQUE_TRAITS: characterData.physicalDescription || 'detailed character',
      PERSONALITY: characterData.personality || 'authentic personality',
      LENS: referenceShot.lensMm,
      DISTANCE: referenceShot.cameraDistanceM || this.calculateDistance(referenceShot.lensMm, referenceShot.crop),
      AZIMUTH: referenceShot.cameraAzimuthDeg || 0,
      ELEVATION: referenceShot.cameraElevationDeg || 0,
      CROP: referenceShot.crop,
      THIRDS: referenceShot.thirds || this.calculateThirds(referenceShot.cameraAzimuthDeg || 0),
      HEADROOM: referenceShot.headroom || this.calculateHeadroom(referenceShot.crop),
      SUBJECT_YAW: referenceShot.subjectYawDeg || this.calculateSubjectYaw(referenceShot.cameraAzimuthDeg || 0),
      GAZE: referenceShot.gaze || this.calculateGaze(referenceShot.cameraAzimuthDeg || 0),
      POSE: referenceShot.pose,
      FSTOP: referenceShot.fStop,
      ISO: referenceShot.iso,
      SHUTTER: referenceShot.shutterSpeed,
      REF_URL: masterRefUrl,
      REF_WEIGHT: referenceShot.referenceWeight,
      NEGATIVE_PROMPTS: this.generateNegativePrompts(referenceShot),
      COMPOSITION_NOTES: referenceShot.compositionNotes || '',
    }
  }

  /**
   * Professional cinematography distance calculations
   */
  calculateDistance(lens: number, crop: string): number {
    const baseDistances: Record<number, number> = { 35: 3.4, 50: 2.1, 85: 1.5 }
    const cropMultipliers: Record<string, number> = {
      full: 1.0,
      '3q': 0.8,
      mcu: 0.65,
      cu: 0.55,
      hands: 0.4
    }
    
    const baseDistance = baseDistances[lens] || 2.1
    const multiplier = cropMultipliers[crop] || 0.8
    
    return Math.round((baseDistance * multiplier) * 10) / 10 // Round to 1 decimal
  }

  /**
   * Calculate rule of thirds positioning
   */
  calculateThirds(azimuth: number): string {
    if (azimuth === 0) return 'centered'
    if (azimuth < 0) return 'right_third' // Camera left = subject on right third
    return 'left_third'
  }

  /**
   * Calculate headroom based on crop type
   */
  calculateHeadroom(crop: string): string {
    const headroomMap: Record<string, string> = {
      'cu': 'tight',
      'mcu': 'equal',
      '3q': 'loose',
      'full': 'loose',
      'hands': 'tight'
    }
    return headroomMap[crop] || 'equal'
  }

  /**
   * Calculate gaze direction based on camera position
   */
  calculateGaze(azimuth: number): string {
    if (Math.abs(azimuth) <= 15) return 'to_camera'
    if (Math.abs(azimuth) >= 75) return 'away'
    return 'to_camera'
  }

  /**
   * Calculate subject yaw for natural positioning
   */
  calculateSubjectYaw(cameraAzimuth: number): number {
    // Subject should generally face camera for most shots
    return Math.round(-cameraAzimuth * 0.7) // Partial compensation for natural look
  }

  /**
   * Generate context-aware negative prompts
   */
  generateNegativePrompts(shot: EnhancedReferenceShot): string {
    const negatives: string[] = []

    // Use shot-specific negatives if available
    if (shot.negativePrompts) {
      negatives.push(shot.negativePrompts)
    }

    // Composition-based negatives
    if ((shot.cameraAzimuthDeg || 0) !== 0) {
      negatives.push('front_facing', 'centered_composition')
    }
    
    if (shot.crop === 'cu') {
      negatives.push('full_body', 'wide_shot', 'hands_visible')
    }
    
    if (shot.crop === 'full') {
      negatives.push('cropped_limbs', 'tight_crop')
    }

    // Camera-based negatives
    if (shot.lensMm === 85) {
      negatives.push('wide_angle_distortion')
    }
    
    if (shot.lensMm === 35) {
      negatives.push('telephoto_compression')
    }

    // Expression-based negatives
    if (shot.expression === 'neutral') {
      negatives.push('exaggerated_expression', 'dramatic_emotion')
    }

    return negatives.join(', ')
  }

  /**
   * Get default f-stop based on lens
   */
  getDefaultFStop(lens: number): number {
    const fStopMap: Record<number, number> = {
      35: 2.8,  // Wider aperture for action shots
      50: 2.0,  // Natural depth for conversation
      85: 1.8   // Shallow depth for emotion
    }
    return fStopMap[lens] || 2.0
  }

  /**
   * Replace placeholders in template string
   */
  private replacePlaceholders(template: string, placeholders: PromptPlaceholders): string {
    let result = template
    
    Object.entries(placeholders).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      result = result.replace(new RegExp(placeholder, 'g'), String(value))
    })
    
    return result
  }

  /**
   * Validate enhanced prompt for completeness
   */
  validatePrompt(prompt: string): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for unreplaced placeholders
    const unreplacedPlaceholders = prompt.match(/\{[A-Z_]+\}/g)
    if (unreplacedPlaceholders) {
      errors.push(`Unreplaced placeholders: ${unreplacedPlaceholders.join(', ')}`)
    }

    // Check for essential components
    if (!prompt.includes('CAMERA (full-frame)')) {
      warnings.push('Missing camera specifications section')
    }

    if (!prompt.includes('COMPOSITION:')) {
      warnings.push('Missing composition section')
    }

    if (!prompt.includes('SUBJECT:')) {
      warnings.push('Missing subject section')
    }

    if (!prompt.includes('reference_image:')) {
      errors.push('Missing reference image URL')
    }

    // Check for reasonable values
    if (prompt.includes('focal length: 0mm')) {
      errors.push('Invalid focal length')
    }

    if (prompt.includes('distance: 0m')) {
      errors.push('Invalid camera distance')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Generate enhanced file name pattern
   */
  generateFileName(
    referenceShot: EnhancedReferenceShot,
    characterData: CharacterData,
    attempt: number = 1
  ): string {
    const charName = characterData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const lens = referenceShot.lensMm
    const angle = referenceShot.angle
    const crop = referenceShot.crop
    const expression = referenceShot.expression
    const timestamp = Date.now()
    
    return `${charName}_${lens}mm_${angle}_${crop}_${expression}_v${attempt}_${timestamp}.png`
  }
}
