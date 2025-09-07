# Character Library API Reference

Complete API documentation for the Character Library service, including all Novel Movie integration endpoints.

## Base URL

```
Production: https://character.ft.tc
Development: http://localhost:3003
```

## Authentication

All API requests require authentication. Include your API key in the request headers:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## Novel Movie Integration Endpoints

### Character Management

#### Create Novel Movie Character

Create a character with Novel Movie specific fields and project integration.

```http
POST /api/v1/characters/novel-movie
```

**Request Body:**
```json
{
  "novelMovieProjectId": "project-123",
  "projectName": "My Movie Project",
  "characterData": {
    "name": "John Doe",
    "status": "in_development",
    "age": 35,
    "height": "6 feet",
    "eyeColor": "blue",
    "hairColor": "brown",
    "biography": { /* RichText content */ },
    "personality": { /* RichText content */ },
    "relationships": [
      {
        "characterId": "other-char-id",
        "relationshipType": "friend",
        "strength": 8,
        "conflictLevel": 2
      }
    ]
  },
  "syncSettings": {
    "autoSync": true,
    "conflictResolution": "novel-movie-wins"
  }
}
```

**Response:**
```json
{
  "success": true,
  "character": { /* Character object */ },
  "characterId": "generated-character-id",
  "syncStatus": "synced"
}
```

#### Sync Novel Movie Character

Bidirectional synchronization with conflict resolution.

```http
PUT /api/v1/characters/{characterId}/novel-movie-sync
```

**Request Body:**
```json
{
  "characterData": { /* Updated character data */ },
  "lastModified": "2025-09-07T05:34:51.566Z",
  "changeSet": ["biography", "personality", "relationships"],
  "conflictResolution": "novel-movie-wins"
}
```

**Response:**
```json
{
  "success": true,
  "character": { /* Updated character */ },
  "syncStatus": "synced",
  "conflicts": [ /* Array of conflicts if any */ ]
}
```

#### Bulk Novel Movie Operations

Bulk character operations for Novel Movie projects.

```http
POST /api/v1/characters/bulk/novel-movie
```

**Request Body:**
```json
{
  "projectId": "project-123",
  "operation": "create",
  "characters": [
    {
      "characterData": { /* Character 1 data */ }
    },
    {
      "id": "existing-char-id",
      "characterData": { /* Character 2 data */ },
      "lastModified": "2025-09-07T05:34:51.566Z",
      "changeSet": ["biography"]
    }
  ],
  "syncSettings": {
    "conflictResolution": "manual"
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "characterId": "char-1",
      "characterName": "John Doe",
      "success": true,
      "operation": "create",
      "syncStatus": "synced"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "conflicts": 0
  }
}
```

### Scene-Specific Image Generation

#### Generate Scene Image

Generate character image for specific scene context.

```http
POST /api/v1/characters/{characterId}/generate-scene-image
```

**Request Body:**
```json
{
  "sceneContext": "Character walking through a dark alley at night",
  "sceneType": "action",
  "additionalCharacters": ["other-char-id"],
  "environmentContext": "urban alley",
  "mood": "tense",
  "lightingStyle": "dramatic shadows",
  "style": "character_scene",
  "referenceImageAssetId": "reference-image-id"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.url/generated-image.jpg",
  "mediaId": "media-id",
  "sceneContext": {
    "sceneId": "scene_1234567890",
    "sceneType": "action",
    "generatedAt": "2025-09-07T05:34:51.566Z",
    "qualityScore": 85
  },
  "validationNotes": "Image generated successfully with high consistency"
}
```

#### Generate Character Interaction

Generate image showing character interactions.

```http
POST /api/v1/characters/generate-interaction
```

**Request Body:**
```json
{
  "primaryCharacterId": "char-1",
  "secondaryCharacterIds": ["char-2", "char-3"],
  "interactionType": "confrontation",
  "sceneDescription": "Heated argument in a restaurant",
  "environmentContext": "upscale restaurant",
  "mood": "tense",
  "lightingStyle": "warm restaurant lighting",
  "style": "character_interaction"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.url/interaction-image.jpg",
  "mediaId": "media-id",
  "interactionContext": {
    "interactionId": "interaction_1234567890",
    "characterIds": ["char-1", "char-2", "char-3"],
    "interactionType": "confrontation",
    "generatedAt": "2025-09-07T05:34:51.566Z",
    "qualityScore": 88
  }
}
```

#### Batch Scene Generation

Generate images for multiple scenes in batch.

```http
POST /api/v1/characters/batch-generate-scenes
```

**Request Body:**
```json
{
  "projectId": "project-123",
  "scenes": [
    {
      "sceneId": "scene-001",
      "characters": ["char-1", "char-2"],
      "sceneDescription": "Opening dialogue scene",
      "requiredShots": ["medium_shot", "close_up"],
      "sceneType": "dialogue",
      "environmentContext": "coffee shop",
      "mood": "casual"
    }
  ],
  "batchSettings": {
    "maxConcurrent": 3,
    "style": "character_scene",
    "qualityThreshold": 80
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "sceneId": "scene-001",
      "success": true,
      "generatedImages": [
        {
          "characterId": "char-1",
          "imageUrl": "https://storage.url/scene-001-char-1.jpg",
          "mediaId": "media-id-1",
          "shotType": "medium_shot",
          "qualityScore": 85
        }
      ]
    }
  ],
  "summary": {
    "totalScenes": 1,
    "successfulScenes": 1,
    "failedScenes": 0,
    "totalImages": 2,
    "averageQuality": 85
  }
}
```

### Character Relationships

#### Create Character Relationship

Create relationship between characters.

```http
POST /api/v1/characters/{characterId}/relationships
```

**Request Body:**
```json
{
  "relatedCharacterId": "other-character-id",
  "relationshipType": "mentor",
  "relationshipDynamic": "Wise teacher guiding young student",
  "storyContext": "Met during training academy",
  "visualCues": ["respectful distance", "teaching gestures"],
  "strength": 9,
  "conflictLevel": 1,
  "bidirectional": true
}
```

**Response:**
```json
{
  "success": true,
  "relationship": {
    "id": "char-1-char-2",
    "characterId": "char-1",
    "relatedCharacterId": "char-2",
    "relationshipType": "mentor",
    "relationshipDynamic": "Wise teacher guiding young student",
    "storyContext": "Met during training academy",
    "visualCues": ["respectful distance", "teaching gestures"],
    "strength": 9,
    "conflictLevel": 1,
    "createdAt": "2025-09-07T05:34:51.566Z"
  },
  "reverseRelationship": {
    "id": "char-2-char-1",
    "characterId": "char-2",
    "relatedCharacterId": "char-1",
    "relationshipType": "student"
  }
}
```

#### Get Character Relationships

Get all relationships for a character.

```http
GET /api/v1/characters/{characterId}/relationships
```

**Response:**
```json
{
  "success": true,
  "character": {
    "id": "char-1",
    "name": "John Doe",
    "status": "in_development"
  },
  "relationships": [
    {
      "characterId": "char-2",
      "characterName": "Jane Smith",
      "relationshipType": "mentor",
      "relationshipDynamic": "Wise teacher guiding young student",
      "strength": 9,
      "conflictLevel": 1,
      "relatedCharacter": {
        "id": "char-2",
        "name": "Jane Smith",
        "status": "ready"
      }
    }
  ]
}
```

#### Update Character Relationship

Update an existing relationship.

```http
PUT /api/v1/characters/{characterId}/relationships
```

**Request Body:**
```json
{
  "relatedCharacterId": "other-character-id",
  "relationshipType": "friend",
  "relationshipDynamic": "Close childhood friends",
  "strength": 8,
  "conflictLevel": 2
}
```

#### Get Relationship Graph

Get character relationship graph for visualization.

```http
GET /api/v1/characters/relationships/graph?projectId=project-123
```

**Response:**
```json
{
  "success": true,
  "projectId": "project-123",
  "nodes": [
    {
      "id": "char-1",
      "name": "John Doe",
      "status": "in_development",
      "characterId": "john-doe-001",
      "projectId": "project-123",
      "metadata": {
        "age": 35,
        "totalRelationships": 2,
        "averageRelationshipStrength": 8.5,
        "averageConflictLevel": 1.5
      }
    }
  ],
  "edges": [
    {
      "id": "char-1-char-2",
      "source": "char-1",
      "target": "char-2",
      "relationshipType": "mentor",
      "strength": 9,
      "conflictLevel": 1,
      "visualCues": ["respectful distance", "teaching gestures"],
      "bidirectional": true
    }
  ],
  "statistics": {
    "totalCharacters": 5,
    "totalRelationships": 8,
    "averageConnectionsPerCharacter": 3.2,
    "mostConnectedCharacter": {
      "id": "char-1",
      "name": "John Doe",
      "connectionCount": 4
    },
    "relationshipTypes": [
      { "type": "friend", "count": 3 },
      { "type": "mentor", "count": 2 }
    ],
    "averageStrength": 7.5,
    "averageConflictLevel": 2.1
  }
}
```

#### Generate Relationship Image

Generate image showing character relationships.

```http
POST /api/v1/characters/generate-relationship-image
```

**Request Body:**
```json
{
  "characterIds": ["char-1", "char-2"],
  "relationshipContext": "Mentor teaching student in training dojo",
  "visualStyle": "character_relationship",
  "environmentContext": "training dojo",
  "mood": "inspiring",
  "lightingStyle": "soft natural light",
  "emphasizeRelationship": true,
  "style": "character_relationship"
}
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://storage.url/relationship-image.jpg",
  "mediaId": "media-id",
  "relationshipAnalysis": {
    "primaryRelationship": {
      "type": "mentor",
      "strength": 9,
      "conflictLevel": 1,
      "visualCues": ["respectful distance", "teaching gestures"]
    },
    "characterDynamics": [
      {
        "characterId": "char-1",
        "role": "authority",
        "prominence": 0.9
      },
      {
        "characterId": "char-2",
        "role": "subordinate",
        "prominence": 0.7
      }
    ]
  },
  "validationNotes": "Relationship dynamics successfully captured in image"
}
```

### Quality Assurance & Validation

#### Get Character Quality Metrics

Get comprehensive quality metrics for a character.

```http
GET /api/v1/characters/{characterId}/quality-metrics
```

**Response:**
```json
{
  "success": true,
  "characterId": "char-1",
  "characterName": "John Doe",
  "metrics": {
    "overallScore": 85,
    "visualMetrics": {
      "hasReferenceImage": true,
      "referenceImageQuality": 92,
      "coreSetCompleteness": 75,
      "averageImageQuality": 88,
      "averageConsistencyScore": 91,
      "totalImages": 12,
      "coreReferenceCount": 6,
      "lowQualityImageCount": 1,
      "inconsistentImageCount": 0
    },
    "narrativeMetrics": {
      "completenessScore": 90,
      "biographyCompleteness": true,
      "personalityCompleteness": true,
      "motivationsCompleteness": true,
      "backstoryCompleteness": false,
      "physicalDescriptionCompleteness": true,
      "voiceDescriptionCompleteness": false,
      "skillsCount": 5,
      "missingFields": ["backstory", "voiceDescription"]
    },
    "relationshipMetrics": {
      "totalRelationships": 3,
      "averageRelationshipStrength": 7.5,
      "averageConflictLevel": 2.1,
      "relationshipTypes": [
        { "type": "friend", "count": 2 },
        { "type": "mentor", "count": 1 }
      ],
      "orphanedRelationships": 0,
      "bidirectionalRelationships": 3,
      "strongRelationships": 2,
      "conflictualRelationships": 0
    },
    "technicalMetrics": {
      "lastUpdated": "2025-09-07T05:34:51.566Z",
      "lastValidated": "2025-09-07T05:30:00.000Z",
      "syncStatus": "synced",
      "pathragSynced": true,
      "masterReferenceProcessed": true,
      "coreSetGenerated": true,
      "validationHistory": [
        {
          "timestamp": "2025-09-07T05:30:00.000Z",
          "validationType": "complete",
          "score": 85,
          "notes": "Overall quality good, minor improvements needed"
        }
      ]
    },
    "recommendations": [
      "Complete missing backstory and voice description",
      "Generate remaining core reference images for 100% completeness"
    ],
    "issues": [
      {
        "type": "narrative",
        "severity": "warning",
        "description": "Missing backstory",
        "suggestedFix": "Add detailed backstory content"
      }
    ]
  }
}
```

#### Validate Project Consistency

Validate character consistency across entire project.

```http
POST /api/v1/characters/validate-project-consistency
```

**Request Body:**
```json
{
  "projectId": "project-123",
  "validationRules": [
    {
      "type": "visual",
      "severity": "error",
      "description": "Visual consistency below threshold",
      "threshold": 85
    }
  ],
  "includeVisualValidation": true,
  "includeNarrativeValidation": true,
  "includeRelationshipValidation": true,
  "qualityThreshold": 80,
  "consistencyThreshold": 85
}
```

**Response:**
```json
{
  "success": true,
  "projectId": "project-123",
  "validationResults": {
    "overallScore": 82,
    "visualConsistencyScore": 88,
    "narrativeConsistencyScore": 75,
    "relationshipConsistencyScore": 85,
    "issues": [
      {
        "type": "narrative",
        "severity": "warning",
        "characterId": "char-1",
        "characterName": "John Doe",
        "description": "Missing backstory",
        "details": "Character lacks backstory information for narrative consistency",
        "suggestedFix": "Add detailed backstory content"
      }
    ],
    "characterScores": [
      {
        "characterId": "char-1",
        "characterName": "John Doe",
        "overallScore": 85,
        "visualScore": 90,
        "narrativeScore": 80,
        "relationshipScore": 85
      }
    ]
  },
  "summary": {
    "totalCharacters": 5,
    "charactersValidated": 5,
    "totalIssues": 3,
    "errorCount": 0,
    "warningCount": 3,
    "infoCount": 0
  },
  "recommendations": [
    "Review 3 warnings to improve character quality",
    "Focus on improving narrative completeness across characters"
  ]
}
```

#### Batch Character Validation

Validate multiple characters simultaneously.

```http
POST /api/v1/characters/batch-validate
```

**Request Body:**
```json
{
  "characterIds": ["char-1", "char-2", "char-3"],
  "validationType": "complete",
  "qualityThreshold": 80,
  "consistencyThreshold": 85,
  "includeRecommendations": true
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "characterId": "char-1",
      "characterName": "John Doe",
      "success": true,
      "validationType": "complete",
      "overallScore": 85,
      "visualScore": 90,
      "narrativeScore": 80,
      "relationshipScore": 85,
      "issues": [
        {
          "type": "narrative",
          "severity": "warning",
          "description": "Missing backstory",
          "suggestedFix": "Add detailed backstory content"
        }
      ],
      "recommendations": [
        "Complete missing backstory for better narrative consistency"
      ]
    }
  ],
  "summary": {
    "totalCharacters": 3,
    "validatedCharacters": 3,
    "failedValidations": 0,
    "averageScore": 83,
    "scoreDistribution": {
      "excellent": 1,
      "good": 2,
      "fair": 0,
      "poor": 0
    },
    "issuesSummary": {
      "totalIssues": 5,
      "errors": 0,
      "warnings": 5,
      "info": 0
    }
  },
  "recommendations": [
    "Review 5 warnings for improvement",
    "All characters have good quality scores!"
  ]
}
```

## Standard Character Endpoints

### CRUD Operations

#### List Characters
```http
GET /api/v1/characters?limit=10&page=1&sort=-createdAt
```

#### Create Character
```http
POST /api/v1/characters
```

#### Get Character
```http
GET /api/v1/characters/{characterId}
```

#### Update Character
```http
PUT /api/v1/characters/{characterId}
```

#### Delete Character
```http
DELETE /api/v1/characters/{characterId}
```

### Image Generation

#### Generate Character Image
```http
POST /api/v1/characters/{characterId}/generate-image
```

#### Generate Core Reference Set
```http
POST /api/v1/characters/{characterId}/generate-core-set
```

#### Validate Visual Consistency
```http
POST /api/v1/characters/{characterId}/validate-consistency
```

### Knowledge Base

#### Sync to PathRAG
```http
POST /api/v1/characters/{characterId}/sync-to-pathrag
```

#### Query Knowledge Base
```http
POST /api/v1/characters/query-knowledge
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": { /* Additional error details */ }
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate relationship)
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server error

## Rate Limiting

API requests are rate limited:
- **Standard endpoints**: 100 requests per minute
- **Image generation**: 10 requests per minute
- **Batch operations**: 5 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

## Webhooks

Configure webhooks to receive notifications about character events:

### Webhook Events
- `character.created`
- `character.updated`
- `character.deleted`
- `image.generated`
- `validation.completed`
- `sync.completed`

### Webhook Payload
```json
{
  "event": "character.updated",
  "timestamp": "2025-09-07T05:34:51.566Z",
  "data": {
    "characterId": "char-1",
    "projectId": "project-123",
    "changes": ["biography", "personality"]
  }
}
```
```
