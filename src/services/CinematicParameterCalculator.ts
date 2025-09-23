/**
 * Cinematic Parameter Calculator Service
 * 
 * Advanced parameter calculation engine for professional cinematography standards.
 * Provides intelligent defaults and validation for camera positioning, composition,
 * and subject parameters based on shot requirements and cinematic best practices.
 */

export interface CameraParameters {
  azimuthDeg: number
  elevationDeg: number
  distanceM: number
}

export interface SubjectParameters {
  yawDeg: number
  gaze: 'to_camera' | 'away' | 'left' | 'right'
  pose: string
}

export interface CompositionParameters {
  thirds: 'centered' | 'left_third' | 'right_third'
  headroom: 'tight' | 'equal' | 'loose'
  eyeLevel: number // Percentage from bottom (0-100)
}

export interface ShotRequirements {
  lens: number
  crop: string
  angle: string
  expression: string
  sceneType?: 'dialogue' | 'action' | 'emotional' | 'establishing' | 'transition'
  intimacyLevel?: number // 1-10 scale
  dynamismLevel?: number // 1-10 scale
}

export interface CalculatedParameters {
  camera: CameraParameters
  subject: SubjectParameters
  composition: CompositionParameters
  technical: {
    fStop: number
    iso: number
    shutterSpeed: string
    depthOfField: string
  }
  validation: {
    isValid: boolean
    warnings: string[]
    suggestions: string[]
  }
}

export class CinematicParameterCalculator {
  
  /**
   * Calculate all parameters for a shot based on requirements
   */
  calculateParameters(requirements: ShotRequirements): CalculatedParameters {
    const camera = this.calculateCameraParameters(requirements)
    const subject = this.calculateSubjectParameters(requirements, camera)
    const composition = this.calculateCompositionParameters(requirements, camera)
    const technical = this.calculateTechnicalParameters(requirements)
    const validation = this.validateParameters(requirements, camera, subject, composition)

    return {
      camera,
      subject,
      composition,
      technical,
      validation
    }
  }

  /**
   * Calculate camera positioning parameters
   */
  calculateCameraParameters(requirements: ShotRequirements): CameraParameters {
    // Convert angle to azimuth
    const azimuth = this.angleToAzimuth(requirements.angle)
    
    // Calculate elevation based on shot type and crop
    const elevation = this.calculateElevation(requirements.crop, requirements.sceneType)
    
    // Calculate distance using professional standards
    const distance = this.calculateOptimalDistance(requirements.lens, requirements.crop, requirements.intimacyLevel)

    return {
      azimuthDeg: azimuth,
      elevationDeg: elevation,
      distanceM: distance
    }
  }

  /**
   * Calculate subject positioning parameters
   */
  calculateSubjectParameters(requirements: ShotRequirements, camera: CameraParameters): SubjectParameters {
    // Calculate subject yaw for natural positioning
    const yaw = this.calculateSubjectYaw(camera.azimuthDeg, requirements.sceneType)
    
    // Determine gaze direction
    const gaze = this.calculateGazeDirection(camera.azimuthDeg, requirements.sceneType, requirements.intimacyLevel)
    
    // Suggest pose based on shot requirements
    const pose = this.suggestPose(requirements.crop, requirements.expression, requirements.dynamismLevel)

    return {
      yawDeg: yaw,
      gaze,
      pose
    }
  }

  /**
   * Calculate composition parameters
   */
  calculateCompositionParameters(requirements: ShotRequirements, camera: CameraParameters): CompositionParameters {
    // Rule of thirds positioning
    const thirds = this.calculateThirdsPositioning(camera.azimuthDeg, requirements.sceneType)
    
    // Headroom calculation
    const headroom = this.calculateHeadroom(requirements.crop, requirements.sceneType)
    
    // Eye level positioning
    const eyeLevel = this.calculateEyeLevel(requirements.crop, camera.elevationDeg)

    return {
      thirds,
      headroom,
      eyeLevel
    }
  }

  /**
   * Calculate technical camera parameters
   */
  calculateTechnicalParameters(requirements: ShotRequirements) {
    const fStop = this.calculateOptimalFStop(requirements.lens, requirements.crop, requirements.intimacyLevel)
    const iso = this.calculateOptimalISO(requirements.sceneType)
    const shutterSpeed = this.calculateShutterSpeed(requirements.dynamismLevel)
    const depthOfField = this.calculateDepthOfField(requirements.lens, fStop, requirements.crop)

    return {
      fStop,
      iso,
      shutterSpeed,
      depthOfField
    }
  }

  /**
   * Convert angle string to precise azimuth degrees
   */
  private angleToAzimuth(angle: string): number {
    const angleMap: Record<string, number> = {
      'front': 0,
      '3q_left': -35,
      '3q_right': 35,
      'profile_left': -90,
      'profile_right': 90,
      'back': 180,
      '45_left': -45,
      '45_right': 45,
      '135_left': -135,
      '135_right': 135
    }
    return angleMap[angle] || 0
  }

  /**
   * Calculate camera elevation based on shot type
   */
  private calculateElevation(crop: string, sceneType?: string): number {
    // Default to eye level
    let elevation = 0

    // Adjust based on crop
    if (crop === 'cu') {
      elevation = 2 // Slightly above for flattering close-ups
    } else if (crop === 'full') {
      elevation = -5 // Slightly below for full body shots
    }

    // Adjust based on scene type
    if (sceneType === 'emotional') {
      elevation += 3 // Higher angle for vulnerability
    } else if (sceneType === 'action') {
      elevation -= 2 // Lower angle for power
    }

    return Math.max(-15, Math.min(15, elevation)) // Clamp to reasonable range
  }

  /**
   * Calculate optimal distance with intimacy consideration
   */
  private calculateOptimalDistance(lens: number, crop: string, intimacyLevel: number = 5): number {
    const baseDistances: Record<number, number> = { 35: 3.4, 50: 2.1, 85: 1.5 }
    const cropMultipliers: Record<string, number> = {
      full: 1.0,
      '3q': 0.8,
      mcu: 0.65,
      cu: 0.55,
      hands: 0.4
    }

    const baseDistance = baseDistances[lens] || 2.1
    const cropMultiplier = cropMultipliers[crop] || 0.8
    
    // Adjust for intimacy level (1-10 scale)
    const intimacyMultiplier = 1 + (5 - intimacyLevel) * 0.1
    
    const distance = baseDistance * cropMultiplier * intimacyMultiplier
    return Math.round(distance * 10) / 10 // Round to 1 decimal
  }

  /**
   * Calculate subject yaw for natural positioning
   */
  private calculateSubjectYaw(cameraAzimuth: number, sceneType?: string): number {
    let compensation = 0.7 // Default compensation factor

    // Adjust compensation based on scene type
    if (sceneType === 'dialogue') {
      compensation = 0.8 // More direct for conversation
    } else if (sceneType === 'emotional') {
      compensation = 0.6 // More natural for emotion
    }

    return Math.round(-cameraAzimuth * compensation)
  }

  /**
   * Calculate gaze direction based on context
   */
  private calculateGazeDirection(
    azimuth: number, 
    sceneType?: string, 
    intimacyLevel: number = 5
  ): 'to_camera' | 'away' | 'left' | 'right' {
    // For front-facing shots, usually to camera
    if (Math.abs(azimuth) <= 15) {
      return intimacyLevel > 6 ? 'to_camera' : 'to_camera'
    }

    // For profile shots, usually away
    if (Math.abs(azimuth) >= 75) {
      return sceneType === 'dialogue' ? 'to_camera' : 'away'
    }

    // For 3/4 shots, depends on scene type
    if (sceneType === 'dialogue' || intimacyLevel > 7) {
      return 'to_camera'
    }

    return 'to_camera' // Default to camera for most shots
  }

  /**
   * Suggest pose based on shot requirements
   */
  private suggestPose(crop: string, expression: string, dynamismLevel: number = 5): string {
    if (crop === 'hands') return 'hand_centered'
    if (crop === 'full' && expression === 'neutral') return 'a_pose'
    if (crop === 'full' && dynamismLevel > 7) return 'dynamic_stance'
    if (crop === 'cu' || crop === 'mcu') return 'relaxed'
    
    return 'natural'
  }

  /**
   * Calculate rule of thirds positioning
   */
  private calculateThirdsPositioning(azimuth: number, sceneType?: string): 'centered' | 'left_third' | 'right_third' {
    if (azimuth === 0 && sceneType !== 'dialogue') return 'centered'
    if (azimuth < 0) return 'right_third' // Camera left = subject on right third
    if (azimuth > 0) return 'left_third'
    return 'centered'
  }

  /**
   * Calculate headroom based on crop and scene
   */
  private calculateHeadroom(crop: string, sceneType?: string): 'tight' | 'equal' | 'loose' {
    const headroomMap: Record<string, 'tight' | 'equal' | 'loose'> = {
      'cu': 'tight',
      'mcu': 'equal',
      '3q': 'loose',
      'full': 'loose',
      'hands': 'tight'
    }

    let headroom = headroomMap[crop] || 'equal'

    // Adjust for scene type
    if (sceneType === 'emotional' && crop === 'cu') {
      headroom = 'tight' // Tighter for emotional intensity
    } else if (sceneType === 'establishing') {
      headroom = 'loose' // More space for context
    }

    return headroom
  }

  /**
   * Calculate eye level positioning
   */
  private calculateEyeLevel(crop: string, elevation: number): number {
    // Base eye level percentages from bottom
    const baseEyeLevels: Record<string, number> = {
      'cu': 65,     // Eyes in upper third for close-ups
      'mcu': 60,    // Slightly lower for medium close-ups
      '3q': 55,     // Middle for three-quarter shots
      'full': 50,   // Center for full body
      'hands': 50   // Center for hand shots
    }

    let eyeLevel = baseEyeLevels[crop] || 55

    // Adjust for camera elevation
    eyeLevel += elevation * 0.5 // Subtle adjustment

    return Math.max(40, Math.min(70, eyeLevel)) // Clamp to reasonable range
  }

  /**
   * Calculate optimal f-stop
   */
  private calculateOptimalFStop(lens: number, crop: string, intimacyLevel: number = 5): number {
    const baseFStops: Record<number, number> = {
      35: 2.8,  // Wider aperture for action shots
      50: 2.0,  // Natural depth for conversation
      85: 1.8   // Shallow depth for emotion
    }

    let fStop = baseFStops[lens] || 2.0

    // Adjust for crop (closer shots need shallower depth)
    if (crop === 'cu') fStop = Math.max(1.4, fStop - 0.4)
    if (crop === 'full') fStop = Math.min(4.0, fStop + 0.8)

    // Adjust for intimacy level
    if (intimacyLevel > 7) fStop = Math.max(1.4, fStop - 0.2)

    return Math.round(fStop * 10) / 10 // Round to 1 decimal
  }

  /**
   * Calculate optimal ISO
   */
  private calculateOptimalISO(sceneType?: string): number {
    const baseISO = 200

    // Adjust for scene type
    if (sceneType === 'action') return 400 // Higher for faster shutter
    if (sceneType === 'emotional') return 100 // Lower for maximum quality

    return baseISO
  }

  /**
   * Calculate shutter speed
   */
  private calculateShutterSpeed(dynamismLevel: number = 5): string {
    if (dynamismLevel > 7) return '1/500' // Fast for action
    if (dynamismLevel < 3) return '1/125' // Slower for static shots
    return '1/250' // Standard for most shots
  }

  /**
   * Calculate depth of field description
   */
  private calculateDepthOfField(lens: number, fStop: number, crop: string): string {
    const dofFactor = lens / fStop

    if (dofFactor > 40) return 'very_shallow'
    if (dofFactor > 25) return 'shallow'
    if (dofFactor > 15) return 'moderate'
    return 'deep'
  }

  /**
   * Validate calculated parameters
   */
  private validateParameters(
    requirements: ShotRequirements,
    camera: CameraParameters,
    subject: SubjectParameters,
    composition: CompositionParameters
  ) {
    const warnings: string[] = []
    const suggestions: string[] = []

    // Distance validation
    if (camera.distanceM < 0.5) {
      warnings.push('Camera distance very close - may cause distortion')
    }
    if (camera.distanceM > 5.0) {
      warnings.push('Camera distance very far - may lose detail')
    }

    // Elevation validation
    if (Math.abs(camera.elevationDeg) > 20) {
      warnings.push('High camera elevation - may create unflattering angle')
    }

    // Gaze/angle mismatch
    if (Math.abs(camera.azimuthDeg) > 60 && subject.gaze === 'to_camera') {
      suggestions.push('Consider "away" gaze for extreme angles')
    }

    // Composition suggestions
    if (requirements.crop === 'cu' && composition.headroom === 'loose') {
      suggestions.push('Consider tighter headroom for close-ups')
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    }
  }
}
