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
**Purpose**: Get specific character
```bash
curl https://character.ft.tc/api/v1/characters/character-id
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

### GET /api/v1/characters/by-project/{projectId}
**Purpose**: Get all characters for a project
**Params**: `limit`, `page`, `includeImages`
```bash
curl "https://character.ft.tc/api/v1/characters/by-project/project-123?includeImages=true"
```

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
curl -X POST https://character.ft.tc/api/v1/characters/CHARACTER_ID/generate-initial-image \
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
    "characterId": "CHARACTER_ID",
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

### POST /api/v1/characters/{id}/generate-360-set
**Purpose**: Generate complete 360° reference image set
```bash
curl -X POST https://character.ft.tc/api/v1/characters/CHARACTER_ID/generate-360-set \
  -H "Content-Type: application/json" \
  -d '{
    "style": "character_production",
    "qualityThreshold": 75,
    "imageCount": 8
  }'
```

### PUT /api/v1/characters/{id}/reference-image
**Purpose**: Update character's master reference image
```bash
curl -X PUT https://character.ft.tc/api/v1/characters/CHARACTER_ID/reference-image \
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
curl -X DELETE https://character.ft.tc/api/v1/characters/CHARACTER_ID/reference-image
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

### POST /api/v1/characters/{id}/generate-scene-image
**Purpose**: Generate character image for specific scene
```bash
curl -X POST https://character.ft.tc/api/v1/characters/CHARACTER_ID/generate-scene-image \
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
curl https://character.ft.tc/api/v1/characters/CHARACTER_ID/quality-metrics
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
curl https://character.ft.tc/api/v1/characters/CHARACTER_ID/relationships
```

### GET /api/v1/characters/relationships/graph
**Purpose**: Get relationship graph for all characters
```bash
curl https://character.ft.tc/api/v1/characters/relationships/graph
```

## 🆕 New Features & Enhancements

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
