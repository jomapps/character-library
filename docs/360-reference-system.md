# 360° Reference System - Complete Guide

## Overview

The 360° Reference System generates **27 professional reference images** per character with precise cinematographic positioning. This system provides comprehensive coverage for movie generation with film-industry standard camera work.

## System Architecture

### Core Components
1. **ReferenceShots Collection**: 27 shot templates with precise camera parameters
2. **EnhancedCoreSetGenerationService**: Professional 360° set generation
3. **EnhancedReferenceSearchService**: Scene-aware intelligent image selection
4. **SceneAnalysisEngine**: Automatic scene understanding and recommendation
5. **EnhancedPromptBuilder**: Precision cinematographic prompt generation
6. **Quality Control**: Multi-factor validation with DINOv3 integration

## The 27 Essential Shots

### Core Foundation (9 shots)
**3 lenses × 3 angles for complete coverage:**
- **35mm Action/Body**: front (0°), 3q_left (-35°), 3q_right (+35°)
- **50mm Conversation**: front (0°), 3q_left (-35°), 3q_right (+35°)
- **85mm Emotion**: front (0°), 3q_left (-35°), 3q_right (+35°)

### Essential Extensions (18 shots)
**Complete professional coverage:**
- **Profile Structure (2)**: Left (-90°) and right (+90°) profiles
- **Back Coverage (2)**: Full body (180°) and 3/4 back views
- **Detail Work (1)**: Hands close-up for prop interaction
- **Calibration (1)**: T-pose for rigging alignment
- **Expression Variants (4)**: Concerned, thoughtful, determined, vulnerable
- **Angle Dynamics (4)**: High/low angles, extended 3/4 variants (±45°)
- **Intimate Framing (4)**: Tight close-ups with subtle angles (±15°, ±25°)

**Total: 27 shots (all priority 1 - always generated)**

## Technical Specifications

### Camera Positioning
- **Azimuth**: Horizontal position (-180° to +180°)
- **Elevation**: Vertical position (-90° to +90°)
- **Distance**: Physical distance in meters
- **Subject Control**: Calculated yaw, gaze direction, composition

### Professional Standards
- **35mm lens**: 3.4m distance for action/body work
- **50mm lens**: 2.1m distance for natural conversation
- **85mm lens**: 1.5m distance for emotional intimacy
- **Composition**: Rule of thirds, headroom, professional framing

### Enhanced Prompt Template
```
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
```

## API Endpoints

### Generate Complete 360° Set
```bash
POST /api/v1/characters/{id}/generate-core-set
```

**Request:**
```json
{
  "includeAddonShots": true,
  "qualityThreshold": 75,
  "maxRetries": 3,
  "customSeed": 12345
}
```

**Response:**
```json
{
  "success": true,
  "message": "360° reference set generated successfully",
  "data": {
    "characterId": "...",
    "generatedImages": 27,
    "failedImages": 0,
    "totalAttempts": 27,
    "enhancedMetrics": {
      "averageCameraAccuracy": 92,
      "averageCompositionCompliance": 88,
      "averageCinematicQuality": 90
    }
  }
}
```

### Scene-Based Reference Search
```bash
POST /api/v1/characters/{id}/find-reference-for-scene
```

**Request:**
```json
{
  "sceneDescription": "Intimate dialogue between two characters, emotional revelation",
  "sceneType": "dialogue",
  "emotionalIntensity": 8,
  "includeAlternatives": true
}
```

### Seed Reference Templates
```bash
POST /api/v1/admin/seed-reference-shots-enhanced
```

**Request:**
```json
{
  "cleanExisting": true,
  "guaranteeAllShots": true,
  "validateTemplates": true
}
```

## Usage Workflow

### 1. Initial Setup
```bash
# Seed the 27 reference shot templates
curl -X POST "http://localhost:3000/api/v1/admin/seed-reference-shots-enhanced" \
  -H "Content-Type: application/json" \
  -d '{"cleanExisting": true, "guaranteeAllShots": true}'
```

### 2. Generate Character Set
```bash
# Generate complete 27-shot reference set
curl -X POST "http://localhost:3000/api/v1/characters/{id}/generate-core-set" \
  -H "Content-Type: application/json" \
  -d '{"qualityThreshold": 80}'
```

### 3. Scene-Based Selection
```bash
# Find best reference for specific scene
curl -X POST "http://localhost:3000/api/v1/characters/{id}/find-reference-for-scene" \
  -H "Content-Type: application/json" \
  -d '{"sceneDescription": "Character looking determined before big decision"}'
```

## Quality Assurance

### Validation Metrics
- **Camera Accuracy**: Precision of camera parameter execution (0-100)
- **Composition Compliance**: Rule of thirds, headroom adherence (0-100)
- **Cinematic Quality**: Overall professional standard (0-100)
- **Consistency Score**: DINOv3 validation against master reference (0-100)

### Success Criteria
- **Generation Success Rate**: >95% first-attempt success
- **Quality Threshold**: All metrics >75 (configurable)
- **Scene Match Accuracy**: >90% relevant selection
- **Processing Time**: <30 seconds per character set

## Implementation Files

### Core Services
- `src/services/EnhancedCoreSetGenerationService.ts` - Main generation logic
- `src/services/EnhancedPromptBuilder.ts` - Prompt template system
- `src/services/EnhancedReferenceSearchService.ts` - Scene-based search
- `src/services/SceneAnalysisEngine.ts` - Scene understanding
- `src/services/EnhancedSeedingService.ts` - Template seeding

### Database Schema
- `src/collections/ReferenceShots.ts` - Shot template collection
- `src/collections/Characters.ts` - Enhanced image gallery fields

### API Routes
- `src/app/api/v1/characters/[id]/generate-core-set/route.ts`
- `src/app/api/v1/characters/[id]/find-reference-for-scene/route.ts`
- `src/app/api/v1/admin/seed-reference-shots-enhanced/route.ts`

---

**System Status**: ✅ Operational  
**Shot Count**: 27 essential shots  
**Version**: Enhanced v2.0  
**Last Updated**: September 2025
