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
