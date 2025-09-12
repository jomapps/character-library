# Enhanced 360° Image Generation System

## Overview
This document outlines the enhanced 360° image generation system for character reference sets. The system has been upgraded from a basic 8-angle turnaround to a comprehensive 15+ shot reference library with intelligent prompt-based image selection.

## System Architecture

### Core Components
1. **ReferenceShots Collection**: Template library for all shot types
2. **Enhanced Character ImageGallery**: Structured metadata for generated images
3. **CoreSetGenerationService**: Automated 360° set generation
4. **ReferenceSearchService**: Intelligent image selection
5. **Quality Control Integration**: DINOv3 validation pipeline

## Enhanced Features

### 1. Expanded Shot Library (15+ Images)
The system now generates a minimum of 15 reference images per character:

**Core 9 (Essential Set)**:
- 3 lenses × 3 angles: 35mm (Action/Body), 50mm (Conversation), 85mm (Emotion)
- Angles: FRONT, 3/4 LEFT, 3/4 RIGHT

**Add-on Shots (6+ Additional)**:
- Profile shots (LEFT/RIGHT)
- Back view (full body)
- Hands close-up (macro)
- T-pose calibration
- Expression variations

### 2. Structured Metadata System
Each generated image includes comprehensive metadata:
- **Technical**: lens (35/50/85mm), f-stop, ISO, shutter speed
- **Composition**: angle, crop (full/3q/mcu/cu/hands), pose
- **Creative**: expression, mode, usage notes
- **Quality**: reference weight (0.85-0.95), validation scores

### 3. Intelligent Reference Selection
The system can analyze any text prompt and automatically select the most appropriate reference image based on:
- Scene type (dialogue, action, emotional)
- Required angle and crop
- Expression needs
- Technical requirements

## Quality Control Workflow

### Current DINOv3 Integration
The existing quality control system uses DINOv3 for character consistency validation:

1. **Master Reference Processing**: Upload → DINOv3 analysis → Asset ID generation
2. **Generation Validation**: New image → DINOv3 comparison → Consistency score
3. **Quality Metrics**: Character similarity, pose accuracy, visual quality
4. **Validation Pipeline**: Auto-reject below threshold, flag for review

### Enhanced QC Features
- **Template Compliance**: Verify shot matches intended template
- **Batch Validation**: Process entire 360° set for consistency
- **Progressive Quality**: Higher standards for core reference images

## Technical Implementation

### Image Generation Model
- **Primary Model**: `FAL_IMAGE_TO_IMAGE_MODEL` (fal-ai/nano-banana/edit)
- **Reference Integration**: Master image + existing core set for consistency
- **Prompt Engineering**: Universal template with placeholder substitution

## Database Schema

### ReferenceShots Collection
```typescript
interface ReferenceShot {
  slug: string                    // Unique identifier (e.g., "35a_front_full_a_pose_v1")
  shotName: string               // Display name (e.g., "35mm FRONT FULL (A pose)")
  lensMm: number                 // Camera lens: 35 | 50 | 85
  mode: string                   // Action/Body | Conversation | Emotion | Hands
  angle: string                  // front | 3q_left | 3q_right | profile_left | profile_right | back
  crop: string                   // full | 3q | mcu | cu | hands
  expression: string             // neutral | determined | concerned | thoughtful | vulnerable | resolute
  pose: string                   // a_pose | t_pose | hand_centered | relaxed
  fStop: number                  // Camera f-stop (e.g., 4.0, 2.8, 2.5)
  iso: number                    // ISO setting (e.g., 200)
  shutterSpeed: string           // Shutter speed (e.g., "1/250")
  referenceWeight: number        // Reference strength: 0.85-0.95
  pack: string                   // core | addon
  description: string            // Technical description
  usageNotes: string            // When to use this shot
  tags: string[]                // Searchable tags
  fileNamePattern: string       // Template for generated filenames
  promptTemplate: string        // Universal prompt template with placeholders
}
```

### Enhanced Character ImageGallery
```typescript
interface CharacterImageGalleryItem {
  imageFile: string              // Media ID
  isCoreReference: boolean       // Part of 360° core set
  referenceShot?: string         // Link to ReferenceShot template used

  // Technical metadata
  lens?: number                  // 35 | 50 | 85
  angle?: string                 // front | 3q_left | etc.
  crop?: string                  // full | 3q | mcu | cu | hands
  expression?: string            // neutral | determined | etc.
  pose?: string                  // a_pose | t_pose | etc.

  // Generation data
  generationPrompt?: string      // Full prompt used
  referenceWeight?: number       // Reference strength used

  // Quality metrics (existing)
  dinoAssetId?: string
  qualityScore?: number
  consistencyScore?: number
  validationNotes?: string
}
```

## Universal Prompt Template

The system uses a standardized prompt template with placeholder substitution:

```
Ultra detailed, photorealistic studio reference of {CHARACTER};
physique/traits: {PHYSIQUE_TRAITS};
personality cues: {PERSONALITY};
neutral seamless studio background; natural/soft key fill; HDR;
camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s;
composition: {CROP} crop, {ANGLE} angle, matched eye level;
focus: crisp eyes, accurate skin tones, visible pores, authentic eye moisture;
magazine quality realism;
reference_image: {REF_URL} | reference_weight: {REF_WEIGHT};
--negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props.
{POSE_INSTRUCTIONS}
```

### Placeholder Variables
- `{CHARACTER}`: Character name
- `{PHYSIQUE_TRAITS}`: Physical description from character data
- `{PERSONALITY}`: Personality traits for expression guidance
- `{LENS}`, `{FSTOP}`, `{ISO}`, `{SHUTTER}`: Camera settings from template
- `{CROP}`, `{ANGLE}`: Composition from template
- `{REF_URL}`: Master reference image URL
- `{REF_WEIGHT}`: Reference strength (0.85-0.95)
- `{POSE_INSTRUCTIONS}`: Specific pose guidance from template

## Create seed data from the following.

Below is a proposed JSON seed payload for the planned `ReferenceShots` collection. You can import this into the DB (via a small script or Payload seed) to pre-populate all default shots. Fields are free-text where appropriate (no enforced dictionaries), but canonical values are suggested for consistency.

- lensMm: 35 | 50 | 85
- mode: Action/Body | Conversation | Emotion | Hands
- angle: front | 3q_left | 3q_right | profile_left | profile_right | back
- crop: full | 3q | mcu | cu | hands
- expression: neutral | determined | concerned | thoughtful | vulnerable | resolute | subtle_concern (extend as needed)
- pose: a_pose | t_pose | hand_centered | relaxed (extend as needed)
- fStop: number (e.g., 4, 2.8, 2.5)
- iso: number (e.g., 200)
- shutterSpeed: string (e.g., "1/250")
- referenceWeight: number (0.85 to 0.95)
- pack: core | addon
- fileNamePattern uses: {CHAR}, {LENS}{MODE}, {ANGLE}, {CROP}, {EXPR}, {N}
- promptTemplate uses placeholders: {CHARACTER}, {PHYSIQUE_TRAITS}, {PERSONALITY}, {LENS}, {FSTOP}, {ISO}, {SHUTTER}, {CROP}, {ANGLE}, {REF_URL}, {REF_WEIGHT}

```json
[
  {
    "slug": "35a_front_full_a_pose_v1",
    "shotName": "35mm FRONT FULL (A pose)",
    "lensMm": 35,
    "mode": "Action/Body",
    "angle": "front",
    "crop": "full",
    "expression": "neutral",
    "pose": "a_pose",
    "fStop": 4.0,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "Neutral full-body studio reference at 35mm with relaxed A pose; wardrobe and proportions visibility.",
    "usageNotes": "Use for blocking, wardrobe checks, and establishing full-body proportions.",
    "tags": ["core", "full-body", "studio", "neutral"],
    "fileNamePattern": "{CHAR}_35A_FRONT_FULL_NEUTRAL_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; physique/traits: {PHYSIQUE_TRAITS}; personality cues: {PERSONALITY}; neutral seamless studio background; natural/soft key fill; HDR; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle, matched eye level; focus: crisp eyes, accurate skin tones, visible pores, authentic eye moisture; magazine quality realism; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props. Pose: relaxed A pose, feet shoulder width, arms natural."
  },
  {
    "slug": "35a_3qleft_3q_v1",
    "shotName": "35mm 3QLEFT 3Q",
    "lensMm": 35,
    "mode": "Action/Body",
    "angle": "3q_left",
    "crop": "3q",
    "expression": "neutral",
    "pose": "relaxed",
    "fStop": 4.0,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "3/4 left, mid-thigh crop at 35mm; preserves body geometry and wardrobe readability.",
    "usageNotes": "Use for movement planning and silhouette checks at slight angle.",
    "tags": ["core", "3q", "body"],
    "fileNamePattern": "{CHAR}_35A_3QLEFT_3Q_NEUTRAL_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; physique/traits: {PHYSIQUE_TRAITS}; personality cues: {PERSONALITY}; neutral seamless studio background; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    "slug": "35a_3qright_3q_v1",
    "shotName": "35mm 3QRIGHT 3Q",
    "lensMm": 35,
    "mode": "Action/Body",
    "angle": "3q_right",
    "crop": "3q",
    "expression": "neutral",
    "pose": "relaxed",
    "fStop": 4.0,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "3/4 right counterpart at 35mm for balanced turnaround and body continuity.",
    "usageNotes": "Pair with 3QLEFT for left-right consistency in body coverage.",
    "tags": ["core", "3q", "body"],
    "fileNamePattern": "{CHAR}_35A_3QRIGHT_3Q_NEUTRAL_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; neutral seamless studio background; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    "slug": "50c_front_cu_neutral_v1",
    "shotName": "50mm FRONT CU (NEUTRAL)",
    "lensMm": 50,
    "mode": "Conversation",
    "angle": "front",
    "crop": "cu",
    "expression": "neutral",
    "pose": "relaxed",
    "fStop": 2.8,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "Conversation baseline portrait; balanced perspective and facial neutrality.",
    "usageNotes": "Use for dialogue singles and neutral emotion calibration.",
    "tags": ["core", "conversation", "cu"],
    "fileNamePattern": "{CHAR}_50C_FRONT_CU_NEUTRAL_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; personality cues: {PERSONALITY}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    "slug": "50c_3qleft_cu_thoughtful_v1",
    "shotName": "50mm 3QLEFT CU (THOUGHTFUL)",
    "lensMm": 50,
    "mode": "Conversation",
    "angle": "3q_left",
    "crop": "cu",
    "expression": "thoughtful",
    "pose": "relaxed",
    "fStop": 2.8,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "Convo-mode close-up with introspective tone at 3/4 left for subtle facial geometry.",
    "usageNotes": "Use for reflective dialogue and quieter beats.",
    "tags": ["core", "conversation", "cu", "thoughtful"],
    "fileNamePattern": "{CHAR}_50C_3QLEFT_CU_THOUGHTFUL_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; personality cues: {PERSONALITY}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    "slug": "50c_3qright_cu_determined_v1",
    "shotName": "50mm 3QRIGHT CU (DETERMINED)",
    "lensMm": 50,
    "mode": "Conversation",
    "angle": "3q_right",
    "crop": "cu",
    "expression": "determined",
    "pose": "relaxed",
    "fStop": 2.8,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "Dialog CU with assertive energy; 3/4 right variant for cross-coverage.",
    "usageNotes": "Use for decisive statements and resolve.",
    "tags": ["core", "conversation", "cu", "determined"],
    "fileNamePattern": "{CHAR}_50C_3QRIGHT_CU_DETERMINED_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    "slug": "85e_front_mcu_subtle_concern_v1",
    "shotName": "85mm FRONT MCU (SUBTLE_CONCERN)",
    "lensMm": 85,
    "mode": "Emotion",
    "angle": "front",
    "crop": "mcu",
    "expression": "subtle_concern",
    "pose": "relaxed",
    "fStop": 2.5,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "Emotional medium-close-up with micro-expression fidelity at 85mm.",
    "usageNotes": "Use for reaction inserts and nuanced beats.",
    "tags": ["core", "emotion", "mcu", "subtle_concern"],
    "fileNamePattern": "{CHAR}_85E_FRONT_MCU_SUBTLE_CONCERN_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    "slug": "85e_3qleft_mcu_resolute_v1",
    "shotName": "85mm 3QLEFT MCU (RESOLUTE)",
    "lensMm": 85,
    "mode": "Emotion",
    "angle": "3q_left",
    "crop": "mcu",
    "expression": "resolute",
    "pose": "relaxed",
    "fStop": 2.5,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "MCU with steady presence; left variant complements front/back coverage.",
    "usageNotes": "Use to communicate quiet strength.",
    "tags": ["core", "emotion", "mcu", "resolute"],
    "fileNamePattern": "{CHAR}_85E_3QLEFT_MCU_RESOLUTE_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },
  {
    "slug": "85e_3qright_mcu_vulnerable_v1",
    "shotName": "85mm 3QRIGHT MCU (VULNERABLE)",
    "lensMm": 85,
    "mode": "Emotion",
    "angle": "3q_right",
    "crop": "mcu",
    "expression": "vulnerable",
    "pose": "relaxed",
    "fStop": 2.5,
    "iso": 200,
    "shutterSpeed": "1/250",
    "referenceWeight": 0.9,
    "pack": "core",
    "description": "MCU variant capturing tenderness/vulnerability at 85mm.",
    "usageNotes": "Use for exposed moments and reveals.",
    "tags": ["core", "emotion", "mcu", "vulnerable"],
    "fileNamePattern": "{CHAR}_85E_3QRIGHT_MCU_VULNERABLE_v{N}.jpg",
    "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props."
  },

  { "slug": "85e_profile_left_mcu_v1", "shotName": "85mm PROFILE LEFT MCU", "lensMm": 85, "mode": "Emotion", "angle": "profile_left", "crop": "mcu", "expression": "neutral", "pose": "relaxed", "fStop": 2.5, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Left profile MCU for facial structure reference.", "usageNotes": "Use for model alignment and silhouette edges.", "tags": ["addon", "profile", "mcu"], "fileNamePattern": "{CHAR}_85E_PROFILEL_MCU_NEUTRAL_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props." },
  { "slug": "85e_profile_right_mcu_v1", "shotName": "85mm PROFILE RIGHT MCU", "lensMm": 85, "mode": "Emotion", "angle": "profile_right", "crop": "mcu", "expression": "neutral", "pose": "relaxed", "fStop": 2.5, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Right profile MCU variant for symmetry checks.", "usageNotes": "Use with PROFILE LEFT for bilateral reference.", "tags": ["addon", "profile", "mcu"], "fileNamePattern": "{CHAR}_85E_PROFILER_MCU_NEUTRAL_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props." },
  { "slug": "35a_back_full_v1", "shotName": "35mm BACK FULL", "lensMm": 35, "mode": "Action/Body", "angle": "back", "crop": "full", "expression": "neutral", "pose": "relaxed", "fStop": 4.0, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Full-body back for hair, costume back, and posture references.", "usageNotes": "Use for wardrobe back checks and rigging.", "tags": ["addon", "full", "back"], "fileNamePattern": "{CHAR}_35A_BACK_FULL_NEUTRAL_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props." },
  { "slug": "macro_hands_cu_v1", "shotName": "HANDS CU (macro)", "lensMm": 85, "mode": "Hands", "angle": "front", "crop": "hands", "expression": "neutral", "pose": "hand_centered", "fStop": 5.6, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Macro hands close-up for texture and identity markers.", "usageNotes": "Use for hand continuity and prop interaction planning.", "tags": ["addon", "hands", "macro"], "fileNamePattern": "{CHAR}_85H_FRONT_HANDS_NEUTRAL_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props. Pose: hands centered to frame." },
  { "slug": "35a_front_full_t_pose_v1", "shotName": "35mm FRONT FULL (T pose)", "lensMm": 35, "mode": "Action/Body", "angle": "front", "crop": "full", "expression": "neutral", "pose": "t_pose", "fStop": 4.0, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Calibration T pose for rig and proportion baselining.", "usageNotes": "Use for rigging and model calibration.", "tags": ["addon", "full", "t_pose"], "fileNamePattern": "{CHAR}_35A_FRONT_FULL_TPOSE_NEUTRAL_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props. Pose: T pose, arms horizontal." },
  { "slug": "50c_front_cu_concerned_v1", "shotName": "50mm FRONT CU (CONCERNED)", "lensMm": 50, "mode": "Conversation", "angle": "front", "crop": "cu", "expression": "concerned", "pose": "relaxed", "fStop": 2.8, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Conversation CU with concern expression to complete expression trio.", "usageNotes": "Use to convey worry, doubt, or care.", "tags": ["addon", "conversation", "cu", "concerned"], "fileNamePattern": "{CHAR}_50C_FRONT_CU_CONCERNED_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props." },
  { "slug": "35a_3qleft_full_a_pose_v2", "shotName": "35mm 3QLEFT FULL (A pose)", "lensMm": 35, "mode": "Action/Body", "angle": "3q_left", "crop": "full", "expression": "neutral", "pose": "a_pose", "fStop": 4.0, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Full-body 3/4 left in A pose for more pose guidance coverage.", "usageNotes": "Use when additional A-pose viewpoint is needed.", "tags": ["addon", "full", "a_pose"], "fileNamePattern": "{CHAR}_35A_3QLEFT_FULL_APOSE_NEUTRAL_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props. Pose: relaxed A pose." },
  { "slug": "35a_front_3q_a_pose_v2", "shotName": "35mm FRONT 3Q (A pose)", "lensMm": 35, "mode": "Action/Body", "angle": "front", "crop": "3q", "expression": "neutral", "pose": "a_pose", "fStop": 4.0, "iso": 200, "shutterSpeed": "1/250", "referenceWeight": 0.9, "pack": "addon", "description": "Front mid-thigh A pose for blocking+wardrobe at slightly tighter crop.", "usageNotes": "Use when full body is not required but pose clarity is.", "tags": ["addon", "3q", "a_pose"], "fileNamePattern": "{CHAR}_35A_FRONT_3Q_APOSE_NEUTRAL_v{N}.jpg", "promptTemplate": "Ultra detailed, photorealistic studio reference of {CHARACTER}; camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s; composition: {CROP} crop, {ANGLE} angle; reference_image: {REF_URL} | reference_weight: {REF_WEIGHT}; --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props." }
]
```

## Technical Specifications

### Shot Requirements (15 Minimum)

**Core 9 (Essential 3×3 Matrix)**:
1. 35mm FRONT FULL (A pose) - f/4, ISO 200, 1/250s
2. 35mm 3QLEFT 3Q - f/4, ISO 200, 1/250s
3. 35mm 3QRIGHT 3Q - f/4, ISO 200, 1/250s
4. 50mm FRONT CU (NEUTRAL) - f/2.8, ISO 200, 1/250s
5. 50mm 3QLEFT CU (THOUGHTFUL) - f/2.8, ISO 200, 1/250s
6. 50mm 3QRIGHT CU (DETERMINED) - f/2.8, ISO 200, 1/250s
7. 85mm FRONT MCU (SUBTLE_CONCERN) - f/2.5, ISO 200, 1/250s
8. 85mm 3QLEFT MCU (RESOLUTE) - f/2.5, ISO 200, 1/250s
9. 85mm 3QRIGHT MCU (VULNERABLE) - f/2.5, ISO 200, 1/250s

**Add-on Shots (6+ Additional)**:
- 85mm PROFILE LEFT/RIGHT MCU - Profile structure reference
- 35mm BACK FULL - Wardrobe and hair reference
- 85mm HANDS CU (macro) - f/5.6 for texture depth
- 35mm FRONT FULL (T pose) - Calibration reference
- 50mm FRONT CU (CONCERNED) - Expression variation
- 35mm 3QLEFT FULL (A pose) - Additional angle coverage

### Lens Usage Guidelines
- **35mm (Action/Body)**: Walk-ups, blocking, full-body clarity, wardrobe
- **50mm (Conversation)**: Dialogue singles, natural perspective
- **85mm (Emotion)**: Emotional beats, reaction inserts, micro-expressions

### File Naming Convention
`{CHAR}_{LENS}{MODE}_{ANGLE}_{CROP}_{EXPR}_v{N}.jpg`

Examples:
- `MayaChen_35A_FRONT_FULL_NEUTRAL_v1.jpg`
- `JohnDoe_50C_3QLEFT_CU_THOUGHTFUL_v1.jpg`
- `SarahSmith_85E_FRONT_MCU_VULNERABLE_v1.jpg`

### Generation Parameters
- **Reference Weight**: 0.85-0.95 (consistent across pack)
- **Seed Locking**: Same seed for pack consistency, increment for versions
- **Pose Guidance**: 0.35-0.55 strength for natural variation
- **Background**: Neutral seamless studio background
- **Lighting**: Natural/soft key fill, HDR

### Quality Standards
- **Resolution**: 1024x1024 minimum (portrait 768x1024 for full body)
- **Focus**: Crisp eyes, accurate skin tones, visible pores
- **Consistency**: >85% similarity to master reference
- **Technical**: Proper exposure, no artifacts, magazine quality

## Example Implementation

### Sample Character: Maya Chen
```
Ultra detailed, photorealistic studio reference of Maya Chen;
lean build from physical work, calloused hands, eyes that shift between determination and vulnerability;
personality: determined, impulsive, carries emotional weight but masks it with action;
deep connection to cars as escape and memory;
neutral seamless studio background; natural lighting; HDR;
camera: 35mm, f/4, ISO 200, 1/250s;
composition: full crop, front angle, matched eye level;
focus: crisp eyes, accurate skin tones, authentic skin texture, realistic eye moisture;
reference_image: https://media.rumbletv.com/media/68c32931957ccd9d1edcccd2_initial_1757690719619.jpg |
reference_weight: 0.90;
--negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs, text, watermarks, props.
Pose: relaxed A pose, feet shoulder width, arms natural.
```

## Next Steps

1. **Immediate**: Create ReferenceShots collection and seed data
2. **Phase 1**: Implement enhanced generation service
3. **Phase 2**: Add intelligent reference search
4. **Phase 3**: UI integration and testing
5. **Future**: Advanced features (custom templates, batch operations)

## API Endpoints

### Core Generation
- `POST /api/v1/characters/{id}/generate-core-set` - Generate complete 360° reference set
- `POST /api/v1/characters/{id}/generate-360-set` - Legacy endpoint (enhanced)

### Reference Search
- `POST /api/v1/characters/{id}/find-reference-image` - Find best reference for prompt
- `GET /api/v1/characters/{id}/reference-images` - List all reference images

### Template Management
- `GET /api/v1/reference-shots` - List all shot templates
- `POST /api/v1/reference-shots` - Create new template (admin)

## Implementation Plan

### Phase 1: Foundation (Data Structures)
**Status**: Ready to implement

1. **Create ReferenceShots Collection**
   - Define Payload CMS collection with all required fields
   - Set up admin interface for template management
   - Configure relationships and validation

2. **Enhance Characters Collection**
   - Update imageGallery field schema
   - Add new metadata fields for lens, angle, crop, expression
   - Maintain backward compatibility with existing data

3. **Create Seed Data Script**
   - Populate ReferenceShots with 15+ default templates
   - Include Core 9 + Add-on shots
   - Validate all template data

### Phase 2: Generation Engine
**Status**: Ready to implement

1. **Enhance ImageGenerationService**
   - Update prompt generation to use templates
   - Implement placeholder substitution system
   - Add support for reference weight and camera settings

2. **Create CoreSetGenerationService**
   - Dedicated service for 360° set generation
   - Template-based generation workflow
   - Quality validation integration
   - Progress tracking and error handling

3. **Update API Endpoints**
   - Enhance existing generate-core-set endpoint
   - Add template selection and customization
   - Improve error handling and status reporting

### Phase 3: Intelligent Search
**Status**: Ready to implement

1. **Create ReferenceSearchService**
   - Prompt analysis and keyword extraction
   - Scoring algorithm for template matching
   - Context-aware selection logic
   - Reasoning explanation generation

2. **Implement Search API**
   - Create find-reference-image endpoint
   - Return best match with detailed reasoning
   - Support for fallback options
   - Performance optimization

3. **UI Integration**
   - Add search functionality to admin interface
   - Real-time reference suggestions
   - Visual preview of selected references
