/**
 * Enhanced Seeding Service
 * 
 * Creates comprehensive shot library with 25+ guaranteed shots and automated seeding system.
 * Transforms from manual template creation to automated comprehensive coverage.
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { EnhancedPromptBuilder } from './EnhancedPromptBuilder'
import { CinematicParameterCalculator } from './CinematicParameterCalculator'

export interface ShotDefinition {
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
  pack: 'core' | 'addon'
  description: string
  usageNotes: string
  
  // Enhanced parameters
  cameraAzimuthDeg: number
  cameraElevationDeg: number
  cameraDistanceM: number
  subjectYawDeg?: number
  gaze?: string
  thirds?: string
  headroom?: string
  whenToUse: string
  sceneTypes: string[]
  priority: number
  negativePrompts?: string
  compositionNotes?: string
}

export interface SeedingResults {
  essential: number
  comprehensive: number
  failed: number
  total: number
  errors: string[]
}

export class EnhancedSeedingService {
  private payload: any
  private promptBuilder: EnhancedPromptBuilder
  private parameterCalculator: CinematicParameterCalculator

  constructor() {
    this.payload = null
    this.promptBuilder = new EnhancedPromptBuilder()
    this.parameterCalculator = new CinematicParameterCalculator()
  }

  async initialize() {
    this.payload = await getPayload({ config })
  }

  /**
   * Seed comprehensive reference shot library (27 essential shots)
   */
  async seedComprehensiveLibrary(options: {
    cleanExisting: boolean
    guaranteeAllShots: boolean
  }): Promise<SeedingResults> {
    console.log('🌱 Seeding comprehensive reference shot library (27 essential shots)...')

    if (!this.payload) {
      await this.initialize()
    }

    if (options.cleanExisting) {
      await this.cleanExistingShots()
    }

    // Get complete shot library definition
    const shotsToSeed = this.getComprehensiveReferenceLibrary()
    
    console.log(`📊 Creating ${shotsToSeed.length} reference shots (comprehensive coverage)`)

    const results: SeedingResults = {
      essential: 0,
      comprehensive: 0,
      failed: 0,
      total: shotsToSeed.length,
      errors: []
    }

    for (const shotData of shotsToSeed) {
      try {
        const enhancedShot = this.enhanceShotData(shotData)

        await this.payload.create({
          collection: 'reference-shots',
          data: enhancedShot,
        })

        // Count by priority
        if (shotData.priority === 1) {
          results.essential++
        } else {
          results.comprehensive++
        }

        console.log(`✅ Created: ${shotData.shotName}`)

      } catch (error) {
        const errorMsg = `Failed to create ${shotData.shotName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMsg}`)
        results.errors.push(errorMsg)
        results.failed++
      }
    }

    console.log(`🎉 Comprehensive seeding complete: ${results.essential} essential, ${results.comprehensive} comprehensive, ${results.failed} failed`)
    console.log(`📊 Total reference shots created: ${results.essential + results.comprehensive} of ${results.total}`)
    
    return results
  }

  /**
   * Get complete reference library definition (27 essential shots)
   */
  private getComprehensiveReferenceLibrary(): ShotDefinition[] {
    return [
      // ESSENTIAL FOUNDATION - Core shots (Priority 1)
      {
        slug: 'enhanced_35a_front_full_v2',
        shotName: '35mm FRONT FULL (Enhanced)',
        lensMm: 35, mode: 'Action/Body', angle: 'front', crop: 'full',
        expression: 'neutral', pose: 'a_pose', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: 0, cameraDistanceM: 3.4,
        description: 'Full body front view with natural A-pose stance for character establishment',
        usageNotes: 'Essential for wardrobe, proportions, and blocking reference',
        whenToUse: 'Full body reference for wardrobe, proportions, and blocking. Essential for character establishment and action sequences.',
        sceneTypes: ['action', 'establishing'],
        compositionNotes: 'Ensure full body visibility with natural A-pose stance.',
      },
      {
        slug: 'enhanced_35a_3qleft_3q_v2',
        shotName: '35mm 3Q LEFT (Enhanced)',
        lensMm: 35, mode: 'Action/Body', angle: '3q_left', crop: '3q',
        expression: 'neutral', pose: 'relaxed', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -35, cameraElevationDeg: 0, cameraDistanceM: 2.7,
        description: 'Three-quarter body view from left side showing depth and dimension',
        usageNotes: 'Dynamic reference for movement and spatial relationships',
        whenToUse: 'Three-quarter body reference showing left side profile while maintaining eye contact. Ideal for movement planning.',
        sceneTypes: ['action', 'dialogue'],
        compositionNotes: 'Maintain dynamic three-quarter positioning with natural stance.',
      },
      {
        slug: 'enhanced_35a_3qright_3q_v2',
        shotName: '35mm 3Q RIGHT (Enhanced)',
        lensMm: 35, mode: 'Action/Body', angle: '3q_right', crop: '3q',
        expression: 'neutral', pose: 'relaxed', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 35, cameraElevationDeg: 0, cameraDistanceM: 2.7,
        description: 'Three-quarter body view from right side for symmetrical coverage',
        usageNotes: 'Complementary angle to left 3/4 for complete spatial reference',
        whenToUse: 'Three-quarter body reference showing right side profile. Essential for balanced coverage and movement planning.',
        sceneTypes: ['action', 'dialogue'],
        compositionNotes: 'Mirror positioning of left 3/4 shot for consistency.',
      },
      {
        slug: 'enhanced_50c_front_cu_v2',
        shotName: '50mm FRONT CU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: 'front', crop: 'cu',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: 0, cameraDistanceM: 2.1,
        description: 'Natural conversation close-up with direct eye contact',
        usageNotes: 'Primary dialogue reference with natural perspective',
        whenToUse: 'Standard dialogue close-up for conversation scenes. Natural 50mm perspective ideal for character interaction.',
        sceneTypes: ['dialogue', 'emotional'],
        compositionNotes: 'Focus on facial expression and direct eye contact.',
      },
      {
        slug: 'enhanced_50c_3qleft_cu_v2',
        shotName: '50mm 3Q LEFT CU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: '3q_left', crop: 'cu',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -35, cameraElevationDeg: 0, cameraDistanceM: 1.8,
        description: 'Conversational close-up from left angle for dynamic dialogue',
        usageNotes: 'Over-shoulder and reaction shot reference',
        whenToUse: 'Dynamic dialogue angle for conversation scenes. Perfect for over-shoulder shots and character reactions.',
        sceneTypes: ['dialogue'],
        compositionNotes: 'Maintain eye contact while showing profile dimension.',
      },
      {
        slug: 'enhanced_50c_3qright_cu_v2',
        shotName: '50mm 3Q RIGHT CU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: '3q_right', crop: 'cu',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 35, cameraElevationDeg: 0, cameraDistanceM: 1.8,
        description: 'Conversational close-up from right angle for balanced coverage',
        usageNotes: 'Complementary dialogue angle for scene continuity',
        whenToUse: 'Balanced dialogue coverage for conversation scenes. Essential for maintaining screen direction and continuity.',
        sceneTypes: ['dialogue'],
        compositionNotes: 'Mirror left angle positioning for consistent coverage.',
      },
      {
        slug: 'enhanced_85e_front_mcu_v2',
        shotName: '85mm FRONT MCU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: 'front', crop: 'mcu',
        expression: 'neutral', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: 0, cameraDistanceM: 1.5,
        description: 'Emotional medium close-up with shallow depth of field',
        usageNotes: 'Primary emotional reference with intimate framing',
        whenToUse: 'Emotional moments and intimate dialogue. 85mm compression creates flattering perspective for close work.',
        sceneTypes: ['emotional', 'dialogue'],
        compositionNotes: 'Shallow depth of field for emotional isolation.',
      },
      {
        slug: 'enhanced_85e_3qleft_mcu_v2',
        shotName: '85mm 3Q LEFT MCU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: '3q_left', crop: 'mcu',
        expression: 'neutral', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -35, cameraElevationDeg: 0, cameraDistanceM: 1.3,
        description: 'Emotional medium close-up from left angle with compression',
        usageNotes: 'Intimate emotional reference with dimensional depth',
        whenToUse: 'Emotional scenes requiring dimensional depth. Perfect for contemplative and vulnerable moments.',
        sceneTypes: ['emotional'],
        compositionNotes: 'Use compression to isolate subject emotionally.',
      },
      {
        slug: 'enhanced_85e_3qright_mcu_v2',
        shotName: '85mm 3Q RIGHT MCU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: '3q_right', crop: 'mcu',
        expression: 'neutral', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 35, cameraElevationDeg: 0, cameraDistanceM: 1.3,
        description: 'Emotional medium close-up from right angle for complete coverage',
        usageNotes: 'Balanced emotional reference for scene continuity',
        whenToUse: 'Emotional balance for scene coverage. Essential for maintaining emotional continuity across angles.',
        sceneTypes: ['emotional'],
        compositionNotes: 'Consistent emotional framing with right angle perspective.',
      },

      // ESSENTIAL ADDITIONAL SHOTS (Priority 1) - ALWAYS CREATED
      {
        slug: 'enhanced_85e_profile_left_mcu_v2',
        shotName: '85mm PROFILE LEFT MCU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: 'profile_left', crop: 'mcu',
        expression: 'neutral', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -90, cameraElevationDeg: 0, cameraDistanceM: 1.5,
        description: 'Pure left profile for facial structure reference',
        usageNotes: 'Essential for model alignment and contemplative moments',
        whenToUse: 'Pure left profile for facial structure and contemplative moments. Essential for model alignment and rigging.',
        sceneTypes: ['emotional', 'transition'],
        compositionNotes: 'Capture clean profile silhouette with proper lighting.',
      },
      {
        slug: 'enhanced_85e_profile_right_mcu_v2',
        shotName: '85mm PROFILE RIGHT MCU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: 'profile_right', crop: 'mcu',
        expression: 'neutral', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 90, cameraElevationDeg: 0, cameraDistanceM: 1.5,
        description: 'Pure right profile for facial structure symmetry',
        usageNotes: 'Symmetry check and contemplative reference',
        whenToUse: 'Pure right profile for facial structure symmetry checks. Essential for balanced character reference.',
        sceneTypes: ['emotional', 'transition'],
        compositionNotes: 'Mirror left profile for consistent structure reference.',
      },

      // BACK VIEWS FOR WARDROBE/HAIR (Priority 1)
      {
        slug: 'enhanced_35a_back_full_v2',
        shotName: '35mm BACK FULL (Enhanced)',
        lensMm: 35, mode: 'Action/Body', angle: 'back', crop: 'full',
        expression: 'neutral', pose: 'a_pose', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 180, cameraElevationDeg: 0, cameraDistanceM: 3.4,
        description: 'Full body back view for wardrobe and hair reference',
        usageNotes: 'Essential for costume back details and hair styling',
        whenToUse: 'Full body back view for wardrobe, hair, and posture reference. Essential for costume continuity.',
        sceneTypes: ['establishing'],
        compositionNotes: 'Focus on wardrobe details and hair styling from behind.',
      },
      {
        slug: 'enhanced_50c_back_3q_v2',
        shotName: '50mm BACK 3Q (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: 'back', crop: '3q',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 180, cameraElevationDeg: 0, cameraDistanceM: 2.1,
        description: 'Three-quarter back view for hair and costume details',
        usageNotes: 'Back reference for costume and hair continuity',
        whenToUse: 'Back three-quarter view for hair and costume back details. Important for wardrobe continuity.',
        sceneTypes: ['dialogue', 'transition'],
        compositionNotes: 'Capture hair and costume details from back angle.',
      },

      // HANDS CLOSE-UPS FOR DETAIL WORK (Priority 1)
      {
        slug: 'enhanced_85h_hands_detail_v2',
        shotName: 'HANDS DETAIL (Enhanced Macro)',
        lensMm: 85, mode: 'Hands', angle: 'front', crop: 'hands',
        expression: 'neutral', pose: 'hand_centered', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: -15, cameraDistanceM: 0.8,
        description: 'Detailed hand reference for prop interaction and gestures',
        usageNotes: 'Essential for hand continuity and prop work',
        whenToUse: 'Detailed hand reference for prop interaction, gestures, and texture continuity.',
        sceneTypes: ['action', 'dialogue'],
        compositionNotes: 'Focus on hand details and natural positioning.',
      },

      // T-POSE CALIBRATION (Priority 1)
      {
        slug: 'enhanced_35a_tpose_full_v2',
        shotName: 'T-POSE CALIBRATION (Enhanced)',
        lensMm: 35, mode: 'Action/Body', angle: 'front', crop: 'full',
        expression: 'neutral', pose: 't_pose', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: 0, cameraDistanceM: 3.4,
        description: 'T-pose calibration for rigging and model alignment',
        usageNotes: 'Technical reference for 3D model alignment',
        whenToUse: 'T-pose calibration for rigging and model alignment. Essential for 3D character setup.',
        sceneTypes: ['establishing'],
        compositionNotes: 'Perfect T-pose with arms parallel to ground.',
      },

      // EXPRESSION VARIATIONS - ESSENTIAL (Priority 1)
      {
        slug: 'enhanced_50c_concerned_cu_v2',
        shotName: '50mm CONCERNED CU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: 'front', crop: 'cu',
        expression: 'concerned', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: 0, cameraDistanceM: 2.1,
        description: 'Concerned expression for worry and care scenes',
        usageNotes: 'Essential emotional reference for dramatic moments',
        whenToUse: 'Concerned expression for worry, doubt, or care scenes. Essential for emotional range.',
        sceneTypes: ['emotional', 'dialogue'],
        compositionNotes: 'Capture subtle concern without overacting.',
      },
      {
        slug: 'enhanced_85e_vulnerable_mcu_v2',
        shotName: '85mm VULNERABLE MCU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: '3q_left', crop: 'mcu',
        expression: 'vulnerable', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -25, cameraElevationDeg: 5, cameraDistanceM: 1.4,
        description: 'Vulnerable expression for exposed emotional moments',
        usageNotes: 'Intimate emotional reference with slight high angle',
        whenToUse: 'Vulnerable expression for exposed emotional moments. Perfect for character development scenes.',
        sceneTypes: ['emotional'],
        compositionNotes: 'Slight high angle enhances vulnerability.',
      },

      // HIGH/LOW ANGLE VARIANTS - ESSENTIAL (Priority 1)
      {
        slug: 'enhanced_50c_high_angle_cu_v2',
        shotName: '50mm HIGH ANGLE CU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: 'front', crop: 'cu',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: 15, cameraDistanceM: 2.1,
        description: 'High angle close-up for power dynamics',
        usageNotes: 'Creates vulnerability and submission in character',
        whenToUse: 'High angle for power dynamics and vulnerability. Effective for showing character weakness.',
        sceneTypes: ['emotional', 'dialogue'],
        compositionNotes: 'High angle creates psychological vulnerability.',
      },
      {
        slug: 'enhanced_50c_low_angle_cu_v2',
        shotName: '50mm LOW ANGLE CU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: 'front', crop: 'cu',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: -15, cameraDistanceM: 2.1,
        description: 'Low angle close-up for authority and strength',
        usageNotes: 'Creates power and dominance in character',
        whenToUse: 'Low angle for authority and strength portrayal. Effective for showing character power.',
        sceneTypes: ['dialogue', 'action'],
        compositionNotes: 'Low angle enhances character authority.',
      },

      // ADDITIONAL 3/4 VARIANTS - ESSENTIAL (Priority 1)
      {
        slug: 'enhanced_35a_45left_3q_v2',
        shotName: '35mm 45° LEFT 3Q (Enhanced)',
        lensMm: 35, mode: 'Action/Body', angle: '3q_left', crop: '3q',
        expression: 'neutral', pose: 'dynamic_stance', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -45, cameraElevationDeg: 0, cameraDistanceM: 2.5,
        description: 'Extended 3/4 left for dynamic movement reference',
        usageNotes: 'Dynamic positioning for action sequences',
        whenToUse: 'Extended 3/4 left for dynamic movement reference. Perfect for action scene planning.',
        sceneTypes: ['action'],
        compositionNotes: 'Dynamic stance with extended angle coverage.',
      },
      {
        slug: 'enhanced_35a_45right_3q_v2',
        shotName: '35mm 45° RIGHT 3Q (Enhanced)',
        lensMm: 35, mode: 'Action/Body', angle: '3q_right', crop: '3q',
        expression: 'neutral', pose: 'dynamic_stance', fStop: 2.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 45, cameraElevationDeg: 0, cameraDistanceM: 2.5,
        description: 'Extended 3/4 right for dynamic movement reference',
        usageNotes: 'Balanced dynamic positioning for action coverage',
        whenToUse: 'Extended 3/4 right for dynamic movement reference. Essential for balanced action coverage.',
        sceneTypes: ['action'],
        compositionNotes: 'Mirror left dynamic stance for consistent coverage.',
      },

      // COMPREHENSIVE COVERAGE SHOTS (Priority 1) - ALWAYS CREATED
      {
        slug: 'enhanced_85e_determined_mcu_v2',
        shotName: '85mm DETERMINED MCU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: 'front', crop: 'mcu',
        expression: 'determined', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 0, cameraElevationDeg: 0, cameraDistanceM: 1.5,
        description: 'Determined expression for resolve and decision moments',
        usageNotes: 'Strong emotional reference for character determination',
        whenToUse: 'Determined expression for resolve and decision moments. Essential for character strength.',
        sceneTypes: ['emotional', 'action'],
        compositionNotes: 'Capture inner strength and determination.',
      },
      {
        slug: 'enhanced_50c_thoughtful_3qleft_cu_v2',
        shotName: '50mm THOUGHTFUL 3Q LEFT CU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: '3q_left', crop: 'cu',
        expression: 'thoughtful', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -35, cameraElevationDeg: 0, cameraDistanceM: 1.8,
        description: 'Thoughtful expression for contemplative dialogue',
        usageNotes: 'Reflective emotional state for character development',
        whenToUse: 'Thoughtful expression for contemplative dialogue. Perfect for character reflection scenes.',
        sceneTypes: ['dialogue', 'emotional'],
        compositionNotes: 'Capture contemplative mood with natural angle.',
      },

      // CLOSE-UP VARIATIONS (Priority 1)
      {
        slug: 'enhanced_85e_tight_15left_cu_v2',
        shotName: '85mm TIGHT 15° LEFT CU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: 'front', crop: 'cu',
        expression: 'neutral', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -15, cameraElevationDeg: 0, cameraDistanceM: 1.2,
        description: 'Tight close-up with slight angle for intimate moments',
        usageNotes: 'Ultra-intimate framing for emotional peaks',
        whenToUse: 'Tight close-up with slight angle for intimate moments. Perfect for emotional climaxes.',
        sceneTypes: ['emotional'],
        compositionNotes: 'Very tight framing with subtle angle variation.',
      },
      {
        slug: 'enhanced_85e_tight_15right_cu_v2',
        shotName: '85mm TIGHT 15° RIGHT CU (Enhanced)',
        lensMm: 85, mode: 'Emotion', angle: 'front', crop: 'cu',
        expression: 'neutral', pose: 'relaxed', fStop: 1.8, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 15, cameraElevationDeg: 0, cameraDistanceM: 1.2,
        description: 'Tight close-up right angle for intimate dialogue',
        usageNotes: 'Balanced intimate framing for emotional scenes',
        whenToUse: 'Tight close-up right angle for intimate dialogue. Essential for emotional balance.',
        sceneTypes: ['emotional', 'dialogue'],
        compositionNotes: 'Mirror left tight framing for consistency.',
      },

      // MEDIUM SHOT VARIANTS (Priority 1)
      {
        slug: 'enhanced_50c_25left_mcu_v2',
        shotName: '50mm 25° LEFT MCU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: '3q_left', crop: 'mcu',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: -25, cameraElevationDeg: 0, cameraDistanceM: 1.9,
        description: 'Medium close-up with subtle angle for natural conversation',
        usageNotes: 'Natural conversation angle with comfortable framing',
        whenToUse: 'Medium close-up with subtle angle for natural conversation. Perfect for dialogue scenes.',
        sceneTypes: ['dialogue'],
        compositionNotes: 'Subtle angle maintains natural conversation feel.',
      },
      {
        slug: 'enhanced_50c_25right_mcu_v2',
        shotName: '50mm 25° RIGHT MCU (Enhanced)',
        lensMm: 50, mode: 'Conversation', angle: '3q_right', crop: 'mcu',
        expression: 'neutral', pose: 'relaxed', fStop: 2.0, iso: 200, shutterSpeed: '1/250',
        referenceWeight: 0.9, pack: 'core', priority: 1,
        cameraAzimuthDeg: 25, cameraElevationDeg: 0, cameraDistanceM: 1.9,
        description: 'Medium close-up right angle for conversation balance',
        usageNotes: 'Balanced conversation coverage with natural framing',
        whenToUse: 'Medium close-up right angle for conversation balance. Essential for dialogue continuity.',
        sceneTypes: ['dialogue'],
        compositionNotes: 'Balanced angle for conversation continuity.',
      },
    ]
  }

  /**
   * Clean existing reference shots
   */
  private async cleanExistingShots(): Promise<void> {
    console.log('🧹 Cleaning existing reference shots...')
    
    const existingShots = await this.payload.find({
      collection: 'reference-shots',
      limit: 1000,
    })

    for (const shot of existingShots.docs) {
      await this.payload.delete({
        collection: 'reference-shots',
        id: shot.id,
      })
    }

    console.log(`🗑️  Removed ${existingShots.docs.length} existing shots`)
  }

  /**
   * Enhance shot data with calculated parameters
   */
  private enhanceShotData(baseShot: ShotDefinition): any {
    // Calculate missing parameters using the parameter calculator
    const requirements = {
      lens: baseShot.lensMm,
      crop: baseShot.crop,
      angle: baseShot.angle,
      expression: baseShot.expression,
      sceneType: baseShot.sceneTypes[0] as any
    }

    const calculated = this.parameterCalculator.calculateParameters(requirements)

    return {
      ...baseShot,
      // Use provided values or calculated defaults
      cameraDistanceM: baseShot.cameraDistanceM || calculated.camera.distanceM,
      subjectYawDeg: baseShot.subjectYawDeg || calculated.subject.yawDeg,
      gaze: baseShot.gaze || calculated.subject.gaze,
      thirds: baseShot.thirds || calculated.composition.thirds,
      headroom: baseShot.headroom || calculated.composition.headroom,

      // Generate enhanced prompt template
      promptTemplate: this.generateEnhancedPromptTemplate(baseShot),

      // Set technical defaults
      fStop: baseShot.fStop || calculated.technical.fStop,
      iso: baseShot.iso || calculated.technical.iso,
      shutterSpeed: baseShot.shutterSpeed || calculated.technical.shutterSpeed,

      // Enhanced metadata
      tags: this.generateTags(baseShot),
      fileNamePattern: this.generateFileNamePattern(baseShot),
      isActive: true,
      sortOrder: baseShot.priority * 10,
      version: 'v2_enhanced',
    }
  }

  /**
   * Generate enhanced prompt template
   */
  private generateEnhancedPromptTemplate(shot: ShotDefinition): string {
    return this.promptBuilder.getCinematicTemplate() || `
Ultra-detailed studio reference of {CHARACTER}; {PHYSIQUE_TRAITS};
personality cues: {PERSONALITY}; neutral seamless background; natural soft key.

CAMERA (full-frame):
- focal length: ${shot.lensMm}mm
- physical distance: ${shot.cameraDistanceM}m
- azimuth: ${shot.cameraAzimuthDeg}°
- elevation: ${shot.cameraElevationDeg}°

COMPOSITION:
- crop: ${shot.crop} | thirds: {THIRDS} | headroom: {HEADROOM}

SUBJECT:
- shoulder yaw: {SUBJECT_YAW}° | gaze: {GAZE} | pose: ${shot.pose}

EXPOSURE: f/${shot.fStop}, ISO ${shot.iso}, ${shot.shutterSpeed}s
FOCUS: eyes tack sharp; realistic pores; natural micro-speculars.

reference_image: {REF_URL}
reference_weight: ${shot.referenceWeight}

--negatives: {NEGATIVE_PROMPTS}, CGI, 3D, illustration, cartoon, props, text, watermarks.
{COMPOSITION_NOTES}
    `.trim()
  }

  /**
   * Generate tags for shot
   */
  private generateTags(shot: ShotDefinition): Array<{ tag: string }> {
    const tags = [
      `${shot.lensMm}mm`,
      shot.mode.toLowerCase(),
      shot.angle,
      shot.crop,
      shot.expression,
      `priority_${shot.priority}`,
      ...shot.sceneTypes
    ]

    return tags.map(tag => ({ tag }))
  }

  /**
   * Generate file name pattern
   */
  private generateFileNamePattern(shot: ShotDefinition): string {
    return `{CHAR}_${shot.lensMm}mm_${shot.angle}_${shot.crop}_${shot.expression}_v2_{TIMESTAMP}.png`
  }
}
