/**
 * Seed script to populate the ReferenceShots collection with default templates
 * Run with: npx tsx src/scripts/seed-reference-shots.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

const referenceShots: any[] = [
  // Core 9 (Essential Set)
  {
    slug: "35a_front_full_a_pose_v1",
    shotName: "35mm FRONT FULL (A pose)",
    lensMm: 35,
    mode: "Action/Body",
    angle: "front",
    crop: "full",
    expression: "neutral",
    pose: "a_pose",
    fStop: 4.0,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "Neutral full-body studio reference at 35mm with relaxed A pose; wardrobe and proportions visibility.",
    usageNotes: "Use for blocking, wardrobe checks, and establishing full-body proportions.",
    tags: [{ tag: "core" }, { tag: "full-body" }, { tag: "studio" }, { tag: "neutral" }],
    fileNamePattern: "{CHAR}_35A_FRONT_FULL_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; physique/traits: {PHYSIQUE_TRAITS}; personality cues: {PERSONALITY}; neutral seamless studio background; natural/soft key fill; HDR; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle, matched eye level; focus: crisp eyes, accurate skin tones, visible pores, authentic eye moisture; magazine quality realism; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props. Pose: relaxed A pose, feet shoulder width, arms natural."
  },
  {
    slug: "35a_3qleft_3q_v1",
    shotName: "35mm 3QLEFT 3Q",
    lensMm: 35,
    mode: "Action/Body",
    angle: "3q_left",
    crop: "3q",
    expression: "neutral",
    pose: "relaxed",
    fStop: 4.0,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "3/4 left, mid-thigh crop at 35mm; preserves body geometry and wardrobe readability.",
    usageNotes: "Use for movement planning and silhouette checks at slight angle.",
    tags: [{ tag: "core" }, { tag: "3q" }, { tag: "body" }],
    fileNamePattern: "{CHAR}_35A_3QLEFT_3Q_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; physique/traits: {PHYSIQUE_TRAITS}; personality cues: {PERSONALITY}; neutral seamless studio background; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "35a_3qright_3q_v1",
    shotName: "35mm 3QRIGHT 3Q",
    lensMm: 35,
    mode: "Action/Body",
    angle: "3q_right",
    crop: "3q",
    expression: "neutral",
    pose: "relaxed",
    fStop: 4.0,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "3/4 right counterpart at 35mm for balanced turnaround and body continuity.",
    usageNotes: "Pair with 3QLEFT for left-right consistency in body coverage.",
    tags: [{ tag: "core" }, { tag: "3q" }, { tag: "body" }],
    fileNamePattern: "{CHAR}_35A_3QRIGHT_3Q_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; neutral seamless studio background; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "50c_front_cu_neutral_v1",
    shotName: "50mm FRONT CU (NEUTRAL)",
    lensMm: 50,
    mode: "Conversation",
    angle: "front",
    crop: "cu",
    expression: "neutral",
    pose: "relaxed",
    fStop: 2.8,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "Conversation baseline portrait; balanced perspective and facial neutrality.",
    usageNotes: "Use for dialogue singles and neutral emotion calibration.",
    tags: [{ tag: "core" }, { tag: "conversation" }, { tag: "cu" }],
    fileNamePattern: "{CHAR}_50C_FRONT_CU_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; personality cues: {PERSONALITY}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "50c_3qleft_cu_thoughtful_v1",
    shotName: "50mm 3QLEFT CU (THOUGHTFUL)",
    lensMm: 50,
    mode: "Conversation",
    angle: "3q_left",
    crop: "cu",
    expression: "thoughtful",
    pose: "relaxed",
    fStop: 2.8,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "Convo-mode close-up with introspective tone at 3/4 left for subtle facial geometry.",
    usageNotes: "Use for reflective dialogue and quieter beats.",
    tags: [{ tag: "core" }, { tag: "conversation" }, { tag: "cu" }, { tag: "thoughtful" }],
    fileNamePattern: "{CHAR}_50C_3QLEFT_CU_THOUGHTFUL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; personality cues: {PERSONALITY}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "50c_3qright_cu_determined_v1",
    shotName: "50mm 3QRIGHT CU (DETERMINED)",
    lensMm: 50,
    mode: "Conversation",
    angle: "3q_right",
    crop: "cu",
    expression: "determined",
    pose: "relaxed",
    fStop: 2.8,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "Dialog CU with assertive energy; 3/4 right variant for cross-coverage.",
    usageNotes: "Use for decisive statements and resolve.",
    tags: [{ tag: "core" }, { tag: "conversation" }, { tag: "cu" }, { tag: "determined" }],
    fileNamePattern: "{CHAR}_50C_3QRIGHT_CU_DETERMINED_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "85e_front_mcu_subtle_concern_v1",
    shotName: "85mm FRONT MCU (SUBTLE_CONCERN)",
    lensMm: 85,
    mode: "Emotion",
    angle: "front",
    crop: "mcu",
    expression: "subtle_concern",
    pose: "relaxed",
    fStop: 2.5,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "Emotional medium-close-up with micro-expression fidelity at 85mm.",
    usageNotes: "Use for reaction inserts and nuanced beats.",
    tags: [{ tag: "core" }, { tag: "emotion" }, { tag: "mcu" }, { tag: "subtle_concern" }],
    fileNamePattern: "{CHAR}_85E_FRONT_MCU_SUBTLE_CONCERN_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "85e_3qleft_mcu_resolute_v1",
    shotName: "85mm 3QLEFT MCU (RESOLUTE)",
    lensMm: 85,
    mode: "Emotion",
    angle: "3q_left",
    crop: "mcu",
    expression: "resolute",
    pose: "relaxed",
    fStop: 2.5,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "MCU with steady presence; left variant complements front/back coverage.",
    usageNotes: "Use to communicate quiet strength.",
    tags: [{ tag: "core" }, { tag: "emotion" }, { tag: "mcu" }, { tag: "resolute" }],
    fileNamePattern: "{CHAR}_85E_3QLEFT_MCU_RESOLUTE_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "85e_3qright_mcu_vulnerable_v1",
    shotName: "85mm 3QRIGHT MCU (VULNERABLE)",
    lensMm: 85,
    mode: "Emotion",
    angle: "3q_right",
    crop: "mcu",
    expression: "vulnerable",
    pose: "relaxed",
    fStop: 2.5,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "core",
    description: "MCU variant capturing tenderness/vulnerability at 85mm.",
    usageNotes: "Use for exposed moments and reveals.",
    tags: [{ tag: "core" }, { tag: "emotion" }, { tag: "mcu" }, { tag: "vulnerable" }],
    fileNamePattern: "{CHAR}_85E_3QRIGHT_MCU_VULNERABLE_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },

  // Add-on Shots (6+ Additional)
  {
    slug: "85e_profile_left_mcu_v1",
    shotName: "85mm PROFILE LEFT MCU",
    lensMm: 85,
    mode: "Emotion",
    angle: "profile_left",
    crop: "mcu",
    expression: "neutral",
    pose: "relaxed",
    fStop: 2.5,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "addon",
    description: "Left profile MCU for facial structure reference.",
    usageNotes: "Use for model alignment and silhouette edges.",
    tags: [{ tag: "addon" }, { tag: "profile" }, { tag: "mcu" }],
    fileNamePattern: "{CHAR}_85E_PROFILEL_MCU_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "85e_profile_right_mcu_v1",
    shotName: "85mm PROFILE RIGHT MCU",
    lensMm: 85,
    mode: "Emotion",
    angle: "profile_right",
    crop: "mcu",
    expression: "neutral",
    pose: "relaxed",
    fStop: 2.5,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "addon",
    description: "Right profile MCU variant for symmetry checks.",
    usageNotes: "Use with PROFILE LEFT for bilateral reference.",
    tags: [{ tag: "addon" }, { tag: "profile" }, { tag: "mcu" }],
    fileNamePattern: "{CHAR}_85E_PROFILER_MCU_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "35a_back_full_v1",
    shotName: "35mm BACK FULL",
    lensMm: 35,
    mode: "Action/Body",
    angle: "back",
    crop: "full",
    expression: "neutral",
    pose: "relaxed",
    fStop: 4.0,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "addon",
    description: "Full-body back for hair, costume back, and posture references.",
    usageNotes: "Use for wardrobe back checks and rigging.",
    tags: [{ tag: "addon" }, { tag: "full" }, { tag: "back" }],
    fileNamePattern: "{CHAR}_35A_BACK_FULL_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    slug: "macro_hands_cu_v1",
    shotName: "HANDS CU (macro)",
    lensMm: 85,
    mode: "Hands",
    angle: "front",
    crop: "hands",
    expression: "neutral",
    pose: "hand_centered",
    fStop: 5.6,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "addon",
    description: "Macro hands close-up for texture and identity markers.",
    usageNotes: "Use for hand continuity and prop interaction planning.",
    tags: [{ tag: "addon" }, { tag: "hands" }, { tag: "macro" }],
    fileNamePattern: "{CHAR}_85H_FRONT_HANDS_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props. Pose: hands centered to frame."
  },
  {
    slug: "35a_front_full_t_pose_v1",
    shotName: "35mm FRONT FULL (T pose)",
    lensMm: 35,
    mode: "Action/Body",
    angle: "front",
    crop: "full",
    expression: "neutral",
    pose: "t_pose",
    fStop: 4.0,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "addon",
    description: "Calibration T pose for rig and proportion baselining.",
    usageNotes: "Use for rigging and model calibration.",
    tags: [{ tag: "addon" }, { tag: "full" }, { tag: "t_pose" }],
    fileNamePattern: "{CHAR}_35A_FRONT_FULL_TPOSE_NEUTRAL_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props. Pose: T pose, arms horizontal."
  },
  {
    slug: "50c_front_cu_concerned_v1",
    shotName: "50mm FRONT CU (CONCERNED)",
    lensMm: 50,
    mode: "Conversation",
    angle: "front",
    crop: "cu",
    expression: "concerned",
    pose: "relaxed",
    fStop: 2.8,
    iso: 200,
    shutterSpeed: "1/250",
    referenceWeight: 0.9,
    pack: "addon",
    description: "Conversation CU with concern expression to complete expression trio.",
    usageNotes: "Use to convey worry, doubt, or care.",
    tags: [{ tag: "addon" }, { tag: "conversation" }, { tag: "cu" }, { tag: "concerned" }],
    fileNamePattern: "{CHAR}_50C_FRONT_CU_CONCERNED_v{N}.jpg",
    promptTemplate: "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  }
]

async function seedReferenceShots() {
  try {
    console.log('🌱 Starting ReferenceShots seed process...')
    
    const payload = await getPayload({ config })
    
    // Check if any reference shots already exist
    const existing = await payload.find({
      collection: 'reference-shots',
      limit: 1,
    })
    
    if (existing.totalDocs > 0) {
      console.log('⚠️  ReferenceShots collection already has data. Skipping seed.')
      console.log('   To re-seed, delete existing reference shots first.')
      return
    }
    
    console.log(`📝 Creating ${referenceShots.length} reference shot templates...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const shot of referenceShots) {
      try {
        await payload.create({
          collection: 'reference-shots',
          data: shot,
        })
        console.log(`✅ Created: ${shot.shotName}`)
        successCount++
      } catch (error) {
        console.error(`❌ Failed to create ${shot.shotName}:`, error)
        errorCount++
      }
    }
    
    console.log('\n🎉 Seed process completed!')
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📊 Total: ${referenceShots.length}`)
    
    if (successCount > 0) {
      console.log('\n🚀 Reference shots are ready for use in 360° generation!')
    }
    
  } catch (error) {
    console.error('💥 Seed process failed:', error)
    process.exit(1)
  }
}

// Run the seed function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedReferenceShots()
    .then(() => {
      console.log('✨ Seed script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seed script failed:', error)
      process.exit(1)
    })
}

export { seedReferenceShots, referenceShots }
