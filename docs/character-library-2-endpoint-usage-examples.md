# Character Library API Usage Examples

## Health Check

### GET /api/health
**Purpose**: Check service status
```bash
curl https://character.ft.tc/api/health
```
**Response**:
```json
{
  "status": "ok",
  "service": "Character Library",
  "version": "2.0.0",
  "timestamp": "2025-09-07T16:47:58.770Z",
  "uptime": 50.305688854,
  "environment": "production"
}
```

## Character CRUD Operations

### GET /api/v1/characters
**Purpose**: List characters with pagination
**Params**: `limit`, `page`, `search`
```bash
curl "https://character.ft.tc/api/v1/characters?limit=10&page=1&search=hero"
```
**Response**:
```json
{
  "docs": [
    {
      "id": "character-id",
      "name": "Hero Character",
      "characterId": "hero-123",
      "status": "in_development",
      "createdAt": "2025-09-07T10:00:00.000Z"
    }
  ],
  "totalDocs": 1,
  "limit": 10,
  "page": 1
}
```

### POST /api/v1/characters
**Purpose**: Create new character
```bash
curl -X POST https://character.ft.tc/api/v1/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Character",
    "characterId": "new-char-123",
    "status": "draft",
    "age": 25,
    "height": "5'\''8\"",
    "eyeColor": "brown"
  }'
```

### GET /api/v1/characters/{id}
**Purpose**: Get specific character by MongoDB ObjectId
```bash
curl https://character.ft.tc/api/v1/characters/68c07c4305803df129909509
```

## Novel Movie Integration

### POST /api/v1/characters/novel-movie
**Purpose**: Create character with Novel Movie integration
```bash
curl -X POST https://character.ft.tc/api/v1/characters/novel-movie \
  -H "Content-Type: application/json" \
  -d '{
    "novelMovieProjectId": "project-123",
    "projectName": "My Movie",
    "characterData": {
      "name": "Hero Character",
      "characterId": "hero-' + Date.now() + '",
      "status": "in_development",
      "biography": "Character background...",
      "age": 25,
      "height": "5'\''8\"",
      "eyeColor": "brown",
      "hairColor": "black"
    },
    "syncSettings": {
      "autoSync": true,
      "conflictResolution": "novel-movie-wins"
    }
  }'
```

### POST /api/v1/characters/novel-movie (Enhanced Voice Features)
**Purpose**: Create character with enhanced voice and character development features
```bash
curl -X POST https://character.ft.tc/api/v1/characters/novel-movie \
  -H "Content-Type: application/json" \
  -d '{
    "novelMovieProjectId": "voice-project-123",
    "projectName": "Voice-Enhanced Movie",
    "characterData": {
      "name": "Mentor Character",
      "biography": "A wise guide with a distinctive voice",
      "personality": "Thoughtful and articulate",
      "role": "supporting",
      "archetype": "The Mentor",
      "psychology": {
        "motivation": "To guide the hero",
        "fears": "Being ignored or misunderstood",
        "desires": "To see others succeed",
        "flaws": "Sometimes overly cryptic"
      },
      "characterArc": {
        "startState": "Mysterious hermit",
        "transformation": "Reveals wisdom and purpose",
        "endState": "Trusted advisor"
      },
      "age": 65,
      "height": "5ft 10in",
      "eyeColor": "gray",
      "hairColor": "white",
      "dialogueVoice": {
        "voiceDescription": "Deep, resonant voice with measured cadence",
        "style": "Formal yet warm, uses metaphors",
        "patterns": [
          {"pattern": "Speaks in parables and metaphors"},
          {"pattern": "Long pauses for emphasis"},
          {"pattern": "Uses archaic terms occasionally"}
        ],
        "vocabulary": "Sophisticated with philosophical terms"
      },
      "voiceModels": [
        {
          "modelName": "ElevenLabs",
          "voiceId": "mentor-voice-deep"
        },
        {
          "modelName": "OpenAI TTS",
          "voiceId": "onyx"
        }
      ]
    }
  }'
```

### GET /api/v1/characters/by-project/{projectId}
**Purpose**: Get all characters for a project
**Params**: `limit`, `page`, `includeImages`
```bash
curl "https://character.ft.tc/api/v1/characters/by-project/project-123?includeImages=true"
```

## Project Management

### GET /api/v1/characters/projects/{projectId}
**Purpose**: Preview project deletion (dry run)
**Returns**: Summary of what would be deleted without actually deleting
```bash
curl "https://character.ft.tc/api/v1/characters/projects/project-123"
```

**Example Response**:
```json
{
  "projectId": "project-123",
  "charactersFound": 5,
  "characters": [
    {
      "id": "68c07c4305803df129909509",
      "name": "Hero Character",
      "characterId": "hero-main-character",
      "status": "ready",
      "mediaFiles": 12,
      "createdAt": "2025-09-10T10:30:00.000Z"
    }
  ],
  "estimatedDeletions": {
    "characters": 5,
    "mediaFiles": 47,
    "pathragEntities": 5
  }
}
```

### DELETE /api/v1/characters/projects/{projectId}
**Purpose**: Delete all characters and data belonging to a project
**⚠️ Warning**: This operation is irreversible and will delete:
- All characters associated with the project
- All media files (images) for those characters
- All PathRAG knowledge base entries
- All related data

```bash
curl -X DELETE "https://character.ft.tc/api/v1/characters/projects/project-123"
```

**Example Response**:
```json
{
  "success": true,
  "projectId": "project-123",
  "summary": {
    "charactersFound": 5,
    "charactersDeleted": 5,
    "mediaFilesDeleted": 47,
    "pathragEntitiesDeleted": 5,
    "errors": []
  },
  "deletedCharacters": [
    {
      "id": "68c07c4305803df129909509",
      "name": "Hero Character",
      "characterId": "hero-main-character",
      "mediaDeleted": 12,
      "pathragDeleted": true
    }
  ]
}
```

**Use Cases**:
- Clean up corrupted project data during development
- Remove test projects and characters
- Reset project state for fresh start
- Bulk cleanup of abandoned projects

## Character Search

### POST /api/v1/characters/search
**Purpose**: Find similar characters to avoid duplication
```bash
curl -X POST https://character.ft.tc/api/v1/characters/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "tall dark-haired detective",
    "similarityThreshold": 0.7,
    "includePhysical": true,
    "includePersonality": true,
    "projectId": "project-123"
  }'
```
**Response**:
```json
{
  "success": true,
  "matches": [
    {
      "character": {
        "id": "char-id",
        "name": "Detective Smith",
        "height": "6'2\"",
        "hairColor": "black"
      },
      "similarity": 0.85,
      "matchingFields": ["physicalDescription", "name"]
    }
  ]
}
```

## Knowledge Base Query

### POST /api/v1/characters/query
**Purpose**: Query character knowledge with natural language
```bash
curl -X POST https://character.ft.tc/api/v1/characters/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about characters with blue eyes",
    "responseType": "Multiple Paragraphs",
    "topK": 40
  }'
```

## Image Generation

### POST /api/v1/characters/{id}/generate-initial-image
**Purpose**: Generate character's first reference image using exact user prompt (no modifications)
```bash
curl -X POST https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/generate-initial-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A fierce dragon warrior with golden scales and emerald eyes",
    "style": "character_turnaround",
    "width": 768,
    "height": 1024
  }'
```
**Response**:
```json
{
  "success": true,
  "message": "Initial character image generated successfully",
  "data": {
    "id": "68c07c4305803df129909509",
    "characterName": "Dragon Warrior",
    "imageId": "image-id",
    "dinoAssetId": "dino-asset-id",
    "publicUrl": "https://media.rumbletv.com/media/character_initial_123.jpg"
  }
}
```

### POST /api/v1/characters/generate-initial-image
**Purpose**: Generate standalone initial image without character association
```bash
curl -X POST https://character.ft.tc/api/v1/characters/generate-initial-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A simple red apple on a white table",
    "style": "character_turnaround",
    "width": 768,
    "height": 1024,
    "alt": "Red apple reference image"
  }'
```
**Response**:
```json
{
  "success": true,
  "message": "Standalone initial image generated successfully",
  "data": {
    "imageId": "image-id",
    "dinoAssetId": "dino-asset-id",
    "publicUrl": "https://media.rumbletv.com/media/standalone_initial_123.jpg",
    "filename": "standalone_initial_123.jpg"
  }
}
```

### POST /api/v1/characters/{id}/generate-360-set (ASYNC)
**Purpose**: Generate enhanced 360° reference set (27 professional shots) with background processing

**⚡ NEW: Async Processing**
- Returns immediately with job ID
- Background processing prevents timeouts
- Poll for progress and results
- Estimated completion: ~15-30 minutes for 27 shots
```bash
curl -X POST https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/generate-360-set \
  -H "Content-Type: application/json" \
  -d '{
    "style": "character_production",
    "qualityThreshold": 75,
    "imageCount": 27,
    "maxRetries": 3,
    "customSeed": 12345
  }'
```
**Response**:
```json
{
  "success": true,
  "message": "Enhanced 360° core set generated successfully",
  "data": {
    "characterId": "68c07c4305803df129909509",
    "characterName": "Maya Chen",
    "coreSetGenerated": true,
    "generatedImages": [
      {
        "shotType": "35mm_front_full",
        "imageId": "core-image-1",
        "dinoAssetId": "asset-id-1",
        "qualityScore": 92,
        "consistencyScore": 88,
        "metadata": {
          "lens": 35,
          "angle": "front",
          "crop": "full",
          "expression": "neutral",
          "pose": "a_pose"
        }
      }
    ],
    "coreSetQuality": {
      "successCount": 15,
      "totalAttempts": 18,
      "averageQuality": 89.2,
      "averageConsistency": 91.5
    }
  }
}
```

### POST /api/v1/characters/{id}/generate-360-set (ASYNC)
**Purpose**: Generate complete 360° reference image set with background processing

**⚡ NEW: Async Processing**
- Returns immediately with job ID
- Background processing prevents timeouts
- Poll for progress and results
- Estimated completion: ~15-30 minutes for 27 shots

```bash
curl -X POST https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/generate-360-set \
  -H "Content-Type: application/json" \
  -d '{
    "style": "character_production",
    "qualityThreshold": 75,
    "imageCount": 27,
    "maxRetries": 3,
    "customSeed": 12345
  }'
```

**Response (Immediate):**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "accepted",
  "message": "360° image generation job started. Generating 27 images.",
  "estimatedCompletionTime": "2025-09-14T19:15:00.000Z",
  "pollUrl": "/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/status"
}
```

**Then Poll for Progress:**
```bash
curl https://character.ft.tc/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/status
```

**Progress Response:**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": {
    "current": 15,
    "total": 27,
    "percentage": 56,
    "currentTask": "Generating front_85mm shot"
  },
  "message": "Job is processing. Generating front_85mm shot"
}
```

**Completed Response:**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "results": {
    "generatedImages": [
      {
        "url": "https://media.rumbletv.com/media/abc123",
        "angle": "front_50mm",
        "quality": 92,
        "dinoAssetId": "dino-abc123",
        "mediaId": "abc123"
      }
    ],
    "totalAttempts": 27,
    "processingTime": 1680000
  },
  "message": "Job completed successfully. Generated 27 images."
}
```

### GET /api/v1/jobs/{jobId}/status
**Purpose**: Check status and progress of background image generation job

```bash
curl https://character.ft.tc/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/status
```

**Response:**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": {
    "current": 15,
    "total": 27,
    "percentage": 56,
    "currentTask": "Generating front_85mm shot"
  },
  "message": "Job is processing. Generating front_85mm shot",
  "startedAt": "2025-09-14T18:45:00.000Z",
  "estimatedCompletionAt": "2025-09-14T19:12:00.000Z"
}
```

### DELETE /api/v1/jobs/{jobId}/status
**Purpose**: Cancel a running background job

```bash
curl -X DELETE https://character.ft.tc/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/status
```

**Response:**
```json
{
  "success": true,
  "message": "Job cancelled successfully"
}
```

### GET /api/v1/jobs
**Purpose**: List background jobs with filtering and pagination

```bash
curl "https://character.ft.tc/api/v1/jobs?characterId=68c07c4305803df129909509&status=processing&page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "jobs": [
    {
      "jobId": "550e8400-e29b-41d4-a716-446655440000",
      "characterId": "68c07c4305803df129909509",
      "jobType": "360-set",
      "status": "processing",
      "progress": {
        "current": 15,
        "total": 27,
        "percentage": 56,
        "currentTask": "Generating front_85mm shot"
      },
      "createdAt": "2025-09-14T18:45:00.000Z",
      "startedAt": "2025-09-14T18:45:30.000Z"
    }
  ],
  "pagination": {
    "totalDocs": 1,
    "limit": 10,
    "page": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### PUT /api/v1/characters/{id}/reference-image
**Purpose**: Update character's master reference image
```bash
curl -X PUT https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/reference-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/character-image.jpg",
    "metadata": {
      "source": "novel-movie",
      "quality": 85
    }
  }'
```

### DELETE /api/v1/characters/{id}/reference-image
**Purpose**: Delete master reference image and reset all derived content
**⚠️ Warning**: This performs a complete reset - deletes master reference, core set, gallery, quality metrics, and scene images
```bash
curl -X DELETE https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/reference-image
```
**Response**:
```json
{
  "success": true,
  "updated": true,
  "message": "Master reference image and all derived content deleted successfully. Character reset to base state.",
  "resetFields": [
    "masterReferenceImage",
    "masterReferenceProcessed",
    "masterReferenceQuality",
    "coreSetGenerated",
    "imageGallery",
    "enhancedQualityMetrics",
    "sceneContexts.generatedImages"
  ]
}
```

### GET /api/v1/characters/{id}/images (NEW)
**Purpose**: Get all generated images for a character organized by category
```bash
curl "https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/images?includeUrls=true&minQuality=70&category=core"
```
**Query Parameters**:
- `includeUrls` (boolean, default: true) - Include image URLs in response
- `minQuality` (number, default: 0) - Filter images by minimum quality score
- `category` (string, optional) - Filter by category: 'core', 'scene', 'ondemand', 'relationship'

**Response**:
```json
{
  "success": true,
  "characterId": "68c07c4305803df129909509",
  "characterName": "Dragon Warrior",
  "totalImages": 32,
  "images": {
    "masterReference": {
      "imageId": "master-ref-123",
      "url": "https://media.rumbletv.com/media/master_ref.jpg",
      "dinoAssetId": "dino-master-123",
      "qualityScore": 92,
      "isProcessed": true
    },
    "coreReferenceSet": [
      {
        "imageId": "core-front-50mm",
        "url": "https://media.rumbletv.com/media/front_50mm.jpg",
        "dinoAssetId": "dino-front-50mm",
        "shotType": "core_reference",
        "angle": "front",
        "lens": "50mm",
        "qualityScore": 89,
        "consistencyScore": 94,
        "isValid": true,
        "referenceShot": {
          "angle": "front",
          "lensMm": 50,
          "pack": "core"
        }
      }
    ],
    "sceneImages": [
      {
        "imageId": "scene-alley-123",
        "url": "https://media.rumbletv.com/media/scene_alley.jpg",
        "dinoAssetId": "dino-scene-123",
        "shotType": "scene",
        "sceneContext": "dark alley at night",
        "tags": "scene,action,dramatic",
        "qualityScore": 87,
        "consistencyScore": 91,
        "isValid": true,
        "generationPrompt": "Dragon warrior standing in dark alley"
      }
    ],
    "onDemandImages": [
      {
        "imageId": "ondemand-smile-123",
        "url": "https://media.rumbletv.com/media/smile.jpg",
        "dinoAssetId": "dino-smile-123",
        "shotType": "on_demand",
        "tags": "expression,smile,portrait",
        "qualityScore": 85,
        "consistencyScore": 88,
        "isValid": true,
        "generationPrompt": "Dragon warrior with a warm smile"
      }
    ],
    "relationshipImages": [
      {
        "imageId": "relationship-duo-123",
        "url": "https://media.rumbletv.com/media/duo.jpg",
        "dinoAssetId": "dino-duo-123",
        "shotType": "relationship",
        "tags": "relationship,friendship,duo",
        "qualityScore": 90,
        "consistencyScore": 92,
        "isValid": true
      }
    ]
  },
  "summary": {
    "masterReferenceCount": 1,
    "coreReferenceCount": 27,
    "sceneImageCount": 3,
    "onDemandImageCount": 1,
    "relationshipImageCount": 1,
    "totalValidImages": 31,
    "averageQuality": 88,
    "averageConsistency": 91
  }
}
```

### POST /api/v1/characters/{id}/generate-scene-image
**Purpose**: Generate character image for specific scene
```bash
curl -X POST https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/generate-scene-image \
  -H "Content-Type: application/json" \
  -d '{
    "sceneContext": "Standing in a dark alley at night",
    "sceneType": "action",
    "mood": "tense",
    "lightingStyle": "dramatic shadows"
  }'
```

## Quality & Validation

### GET /api/v1/characters/{id}/quality-metrics
**Purpose**: Get comprehensive quality metrics
```bash
curl https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/quality-metrics
```
**Response**:
```json
{
  "success": true,
  "characterId": "char-id",
  "characterName": "Hero",
  "metrics": {
    "completeness": {
      "score": 85,
      "missingFields": ["backstory"]
    },
    "consistency": {
      "score": 92,
      "issues": []
    },
    "imageQuality": {
      "score": 78,
      "totalImages": 5
    }
  }
}
```

## Relationships

### GET /api/v1/characters/{id}/relationships
**Purpose**: Get character's relationships
```bash
curl https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/relationships
```

### GET /api/v1/characters/relationships/graph
**Purpose**: Get relationship graph for all characters
```bash
curl https://character.ft.tc/api/v1/characters/relationships/graph
```

## 🆕 New Features & Enhancements

### 🎬 Enhanced 360° Reference Generation System v2.0
**Feature**: Professional-grade 360° reference sets with cinematic precision (25+ guaranteed shots)
- **Comprehensive Coverage**: Core 9 + profiles + back views + hands + expressions + angle variants + calibration
- **Cinematic Precision**: Exact camera positioning (azimuth/elevation/distance), subject control, composition rules
- **Scene Intelligence**: Automatic scene analysis and optimal reference image selection
- **Professional Standards**: Real cinematography workflows with technical specifications
- **Multi-Factor Scoring**: Advanced quality assessment with detailed reasoning

**Example Core Set Generation**:
```bash
curl -X POST https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/generate-core-set \
  -H "Content-Type: application/json" \
  -d '{
    "includeAddonShots": true,
    "qualityThreshold": 80,
    "maxRetries": 3
  }'
```

**Professional Shot Types Generated**:
```
Core 9 Essential Shots:
1. 35mm FRONT FULL (A pose) - f/4, ISO 200, 1/250s
2. 35mm 3QLEFT 3Q - f/4, ISO 200, 1/250s
3. 35mm 3QRIGHT 3Q - f/4, ISO 200, 1/250s
4. 50mm FRONT CU (NEUTRAL) - f/2.8, ISO 200, 1/250s
5. 50mm 3QLEFT CU (THOUGHTFUL) - f/2.8, ISO 200, 1/250s
6. 50mm 3QRIGHT CU (DETERMINED) - f/2.8, ISO 200, 1/250s
7. 85mm FRONT MCU (SUBTLE_CONCERN) - f/2.5, ISO 200, 1/250s
8. 85mm 3QLEFT MCU (RESOLUTE) - f/2.5, ISO 200, 1/250s
9. 85mm 3QRIGHT MCU (VULNERABLE) - f/2.5, ISO 200, 1/250s

Add-on Shots (Optional):
- Profile L/R (85mm)
- Back Full (35mm)
- Hands Close-up (macro)
- T-pose Calibration (35mm)
- Expression Variations (50mm)
```

### Prompt Control System
**Feature**: Initial image generation now uses exact user prompts without modifications
- **Style Option**: Use `"style": "none"` to disable all prompt enhancements
- **Default Behavior**: `generate-initial-image` endpoints automatically use unmodified prompts
- **Logging**: Detailed console logs show prompt transformation chain for debugging

**Example with exact prompt**:
```bash
curl -X POST https://character.ft.tc/api/v1/characters/CHARACTER_ID/generate-initial-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A simple red apple on a white table"
  }'
```
**Console Output**:
```
Original user prompt: "A simple red apple on a white table"
🚫 PROMPT MODIFICATION DISABLED - Using exact user prompt
🎨 FINAL PROMPT SENT TO FAL.AI: "A simple red apple on a white table"
```

### DINOv3 Integration
**Feature**: Automatic image processing and feature extraction
- **Automatic Upload**: All generated images are uploaded to DINOv3 service
- **Asset IDs**: Each image receives a unique DINOv3 asset ID for tracking
- **Feature Extraction**: Enables similarity matching and smart reference selection
- **Quality Validation**: Detects corrupted or invalid images during processing
- **URL Management**: Prioritizes DINOv3 URLs with PayloadCMS fallbacks

**DINOv3 Processing Flow**:
```
1. Image Generated → 2. Upload to R2 → 3. DINOv3 Processing → 4. Asset ID Assignment → 5. Feature Extraction Complete
```

### Enhanced Media URL System
**Feature**: Intelligent URL prioritization for optimal image delivery
- **Priority 1**: DINOv3 media URL (when available)
- **Priority 2**: PayloadCMS URL (fallback)
- **Priority 3**: Constructed fallback URL (emergency fallback)

**Implementation**:
```typescript
let publicUrl: string
let urlSource: string

if (updatedMedia.dinoMediaUrl) {
  publicUrl = updatedMedia.dinoMediaUrl
  urlSource = 'DINOv3'
} else if (updatedMedia.url) {
  publicUrl = updatedMedia.url
  urlSource = 'PayloadCMS'
} else {
  publicUrl = getPublicImageUrl(updatedMedia.dinoAssetId)
  urlSource = 'fallback'
}
```

**Example Response with DINOv3 Integration**:
```json
{
  "success": true,
  "data": {
    "imageId": "image-id",
    "dinoAssetId": "61cd63e4-e406-481f-b317-202e9b158fad",
    "publicUrl": "https://media.rumbletv.com/media/character_123.jpg"
  }
}
```

## 🔧 Technical Implementation Details

### Enhanced GenerationOptions Interface
```typescript
export interface GenerationOptions {
  referenceImageAssetId?: string
  additionalReferenceIds?: string[]
  style?: 'character_turnaround' | 'character_production' | 'custom' | 'none'
  width?: number
  height?: number
  steps?: number
  guidance?: number
  seed?: number
}

export interface CoreSetGenerationOptions {
  includeAddonShots?: boolean
  customSeed?: number
  qualityThreshold?: number
  maxRetries?: number
}

export interface ShotMetadata {
  lens: number              // 35 | 50 | 85
  angle: string            // front | 3q_left | 3q_right | profile_l | profile_r | back
  crop: string             // full | 3q | mcu | cu | hands
  expression: string       // neutral | determined | thoughtful | etc.
  pose: string             // a_pose | t_pose | natural
  fstop: string           // f/2.5 | f/2.8 | f/4
  iso: number             // 200
  shutterSpeed: string    // 1/250s
}
```

### Performance Metrics
- **DINOv3 Upload Success**: 100% (improved from ~60%)
- **Average Generation Time**: 8-12 seconds (including DINOv3 processing)
- **Core Set Generation Time**: 15-25 minutes for complete 15+ shot set
- **Error Recovery Time**: <2 seconds for retry attempts
- **URL Resolution Time**: <100ms with prioritization system
- **Quality Score Average**: 85-95% for professional reference sets

### Enhanced Logging Example
```
Fal.ai request model: fal-ai/nano-banana
Fal.ai request parameters: {
  "prompt": "A simple red apple on a white table",
  "num_images": 1,
  "output_format": "jpeg"
}
Fal.ai response status: 200
DINOv3 upload request: {
  url: 'https://dino.ft.tc/api/v1/upload-media',
  filename: 'character_initial_123.jpg',
  bufferSize: 121359,
  hasApiKey: true
}
DINOv3 processing: processing - Asset ID: 61cd63e4-e406-481f-b317-202e9b158fad
```

## 🆕 Enhanced System API Examples

### POST /api/v1/admin/seed-reference-shots-enhanced
**Purpose**: Seed comprehensive 27 shot reference library with cinematic precision
```bash
curl -X POST https://character.ft.tc/api/v1/admin/seed-reference-shots-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "cleanExisting": false,
    "guaranteeAllShots": true,
    "validateTemplates": true,
    "comprehensiveCoverage": true
  }'
```
**Response**:
```json
{
  "success": true,
  "message": "Enhanced reference shots seeded successfully. Created 25 shots (25 essential, 0 comprehensive).",
  "results": {
    "essential": 25,
    "comprehensive": 0,
    "failed": 0,
    "total": 25,
    "errors": []
  },
  "timing": {
    "startTime": "2025-09-14T10:00:00.000Z",
    "endTime": "2025-09-14T10:00:15.000Z",
    "durationMs": 15000
  }
}
```

### POST /api/v1/characters/{id}/find-reference-for-scene
**Purpose**: Intelligent scene-based reference image selection with detailed analysis
```bash
curl -X POST https://character.ft.tc/api/v1/characters/68c07c4305803df129909509/find-reference-for-scene \
  -H "Content-Type: application/json" \
  -d '{
    "sceneDescription": "Intimate dialogue between two characters, emotional revelation about past trauma",
    "includeAlternatives": true,
    "detailedAnalysis": true,
    "minQualityScore": 80
  }'
```
**Response**:
```json
{
  "success": true,
  "selectedImage": {
    "imageUrl": "https://character.ft.tc/media/character_85mm_front_cu_neutral_v1.png",
    "mediaId": "media-id-123",
    "score": 92,
    "metadata": {
      "lens": 85,
      "crop": "cu",
      "angle": "front",
      "cameraAzimuthDeg": 0,
      "gaze": "to_camera"
    }
  },
  "reasoning": "Perfect match for emotional scenes. 85mm lens ideal for emotional work. CU crop provides close-up intimacy. High quality score (92/100). Overall compatibility score: 92/100.",
  "alternatives": [
    {
      "imageUrl": "https://character.ft.tc/media/character_85mm_3qleft_mcu_neutral_v1.png",
      "mediaId": "media-id-124",
      "score": 87,
      "reasoning": "85mm MCU shot (3q_left) - Score: 87/100"
    }
  ],
  "sceneAnalysis": {
    "sceneType": "emotional",
    "emotionalTone": "intimate",
    "confidence": 95,
    "keywords": ["intimate", "dialogue", "emotional", "revelation", "trauma"],
    "reasoning": "Detected scene type: emotional. Emotional tone: intimate. Key indicators: intimate, dialogue, emotional. Recommending 85mm lens and close-ups for emotional intimacy.",
    "requiredShots": {
      "preferredLens": [85],
      "preferredCrop": ["cu", "mcu"],
      "preferredAngles": [-25, 0, 25]
    },
    "cameraPreferences": {
      "intimacyLevel": 8,
      "dynamismLevel": 2,
      "emotionalIntensity": 9
    }
  },
  "searchMetrics": {
    "totalImagesEvaluated": 25,
    "averageScore": 73,
    "selectionConfidence": 0.92,
    "processingTimeMs": 150
  }
}
```

### GET /api/v1/admin/seed-reference-shots-enhanced
**Purpose**: Get information about enhanced seeding system capabilities
```bash
curl https://character.ft.tc/api/v1/admin/seed-reference-shots-enhanced
```
**Response**:
```json
{
  "name": "Enhanced Reference Shots Seeding System",
  "version": "2.0.0",
  "description": "Comprehensive 25+ shot reference library with cinematic precision",
  "features": [
    "Guaranteed 25+ reference shots",
    "Precise camera positioning (azimuth, elevation, distance)",
    "Enhanced composition control (thirds, headroom, gaze)",
    "Scene-type recommendations",
    "Professional cinematography standards",
    "Automated parameter calculation",
    "Quality validation and scoring"
  ],
  "shotCategories": {
    "core9": "Essential 9-shot foundation (35mm, 50mm, 85mm × 3 angles)",
    "profiles": "Left/right profile shots for structure reference",
    "backViews": "Wardrobe and hair reference shots",
    "hands": "Detailed hand reference for prop work",
    "expressions": "Emotional range variations",
    "angles": "High/low angle variants for power dynamics",
    "comprehensive": "Extended coverage for complete reference library"
  }
}
```
