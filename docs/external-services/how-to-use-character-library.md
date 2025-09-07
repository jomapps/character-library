# Character Library API Documentation

## Overview

The Character Library is a state-of-the-art Digital Asset Management system for character data, built on Payload CMS v3 with Next.js. It provides comprehensive APIs for managing character personas, generating AI-powered character images, and querying character knowledge using natural language.

### Key Features

- **Character Management**: Complete CRUD operations for character data including personas, biographies, and relationships
- **AI-Powered Image Generation**: Generate character images with consistency validation using DINOv3 service
- **Natural Language Queries**: Query character knowledge base using PathRAG service
- **Quality Assurance**: Automated image consistency and quality validation
- **360° Core Reference Sets**: Generate comprehensive character reference images
- **Novel Movie Integration**: Specialized endpoints for Novel Movie production workflow integration
- **Scene-Specific Image Generation**: Context-aware image generation for specific scenes and interactions
- **Relationship Management**: Advanced character relationship tracking and visualization
- **Batch Operations**: Efficient bulk processing for large-scale projects

### Target Audience

- Game developers and studios
- Animation and film production teams
- Content creators and writers
- Applications requiring character asset management
- **Novel Movie production systems** (specialized integration)
- AI-powered storytelling platforms
- Character-driven content management systems

## Base URL and Authentication

**Base URL**: `http://localhost:3000` (development) or your deployed domain

**Authentication**: The API uses Payload CMS's built-in authentication system. Most endpoints are currently configured with open access (`read: () => true`), but this can be configured based on your security requirements.

## API Reference

### 1. Character Query API (PathRAG Integration)

#### POST /api/v1/characters/query
Query the character knowledge base using natural language.

**Request Body**:
```json
{
  "query": "Tell me about characters with blue eyes",
  "options": {
    "responseType": "Multiple Paragraphs",
    "topK": 40,
    "onlyContext": false,
    "maxTokens": {
      "textUnit": 4000,
      "globalContext": 3000,
      "localContext": 5000
    }
  }
}
```

**Parameters**:
- `query` (string, required): Natural language query about characters
- `options` (object, optional):
  - `responseType`: "Multiple Paragraphs" | "Single Paragraph" | "Bullet Points" | "Detailed Explanation"
  - `topK` (number): Number of relevant results to consider (default: 40)
  - `onlyContext` (boolean): Return only context without generated response
  - `maxTokens` (object): Token limits for different context types

**Response**:
```json
{
  "success": true,
  "data": {
    "result": "Generated response about characters...",
    "query": "Tell me about characters with blue eyes",
    "contextUsed": ["context1", "context2"],
    "processingTime": 1234
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Invalid query (empty or missing)
- `503`: PathRAG service unavailable
- `500`: Internal server error

#### GET /api/v1/characters/query
Get API information and example queries.

**Query Parameters**:
- `action=stats`: Get PathRAG knowledge base statistics
- `action=health`: Check PathRAG service health

**Response**:
```json
{
  "success": true,
  "data": {
    "description": "Character Knowledge Query API powered by PathRAG",
    "endpoints": {
      "POST /api/v1/characters/query": "Query character knowledge base with natural language",
      "GET /api/v1/characters/query?action=stats": "Get PathRAG knowledge base statistics"
    },
    "exampleQueries": [
      "Tell me about the character named Jax",
      "What are the personality traits of characters in the database?",
      "Which characters have combat skills?"
    ]
  }
}
```

### 2. Character Image Generation

#### POST /api/v1/characters/[id]/generate-image
Generate on-demand images for a specific character.

**URL Parameters**:
- `id` (string): Character ID

**Request Body**:
```json
{
  "prompt": "Character in a forest setting",
  "shotType": "medium_shot",
  "tags": "forest, outdoor",
  "style": "character_production",
  "count": 1
}
```

**Parameters**:
- `prompt` (string, required): Description for image generation
- `shotType` (string, optional): Type of shot (e.g., "close_up", "medium_shot", "full_body")
- `tags` (string, optional): Tags for categorization
- `style` (string, optional): "character_turnaround" | "character_production" | "custom"
- `count` (number, optional): Number of images to generate (default: 1)

**Response**:
```json
{
  "success": true,
  "message": "Image generated and validated successfully",
  "data": {
    "characterId": "character_id",
    "imageId": "generated_image_id",
    "dinoAssetId": "dino_asset_key",
    "qualityScore": 0.85,
    "consistencyScore": 0.92,
    "isValid": true,
    "validationNotes": "High quality image with good consistency"
  }
}
```

#### POST /api/v1/characters/[id]/generate-smart-image
**NEW** Generate character images with intelligent reference selection and adaptive retry logic.

**URL Parameters**:
- `id` (string): Character ID

**Request Body**:
```json
{
  "prompt": "Character in a forest setting",
  "characterName": "Optional character name for context",
  "maxRetries": 3,
  "qualityThreshold": 70,
  "consistencyThreshold": 85,
  "style": "character_production",
  "tags": "forest, outdoor"
}
```

**Parameters**:
- `prompt` (string, required): Description for image generation
- `characterName` (string, optional): Character name for enhanced context
- `maxRetries` (number, optional): Maximum retry attempts (default: 3)
- `qualityThreshold` (number, optional): Minimum quality score (default: 70)
- `consistencyThreshold` (number, optional): Minimum consistency score (default: 85)
- `style` (string, optional): Generation style
- `tags` (string, optional): Tags for categorization

**Response**:
```json
{
  "success": true,
  "message": "Smart image generated successfully",
  "data": {
    "characterId": "character_id",
    "characterName": "Character Name",
    "imageId": "generated_image_id",
    "dinoAssetId": "dino_asset_key",
    "publicUrl": "https://...",
    "selectedReferenceId": "ref_image_id",
    "selectedReferenceType": "master_reference",
    "qualityScore": 0.88,
    "consistencyScore": 0.92,
    "attempts": 1,
    "generationTime": 45000,
    "validationNotes": "High quality image with excellent consistency",
    "filename": "character_forest_scene.jpg"
  }
}
```

#### POST /api/v1/characters/[id]/generate-core-set
Generate a 360° core reference set for a character.

**URL Parameters**:
- `id` (string): Character ID

**Request Body**: Empty (uses character's master reference image)

**Response**:
```json
{
  "success": true,
  "message": "360° core set generated successfully",
  "data": {
    "characterId": "character_id",
    "generatedImages": [
      {
        "imageId": "image_1",
        "shotType": "front_view",
        "qualityScore": 0.88,
        "consistencyScore": 0.91,
        "isValid": true
      }
    ],
    "summary": {
      "totalGenerated": 8,
      "validImages": 7,
      "averageQuality": 0.86
    }
  }
}
```

#### POST /api/v1/characters/[id]/generate-scene-image
**NEW** Generate character images tailored for specific scenes with context-aware prompting.

**URL Parameters**:
- `id` (string): Character ID

**Request Body**:
```json
{
  "sceneContext": "Character walking through a dark alley at night",
  "sceneType": "action",
  "additionalCharacters": ["char-2", "char-3"],
  "environmentContext": "urban alley",
  "mood": "tense",
  "lightingStyle": "dramatic shadows",
  "style": "character_scene",
  "referenceImageAssetId": "optional_reference_id"
}
```

**Parameters**:
- `sceneContext` (string, required): Description of the scene
- `sceneType` (string, required): "dialogue" | "action" | "emotional" | "establishing"
- `additionalCharacters` (array, optional): Other character IDs in the scene
- `environmentContext` (string, optional): Environmental setting
- `mood` (string, optional): Scene mood
- `lightingStyle` (string, optional): Lighting description
- `style` (string, optional): Generation style
- `referenceImageAssetId` (string, optional): Specific reference image to use

**Response**:
```json
{
  "success": true,
  "message": "Scene image generated successfully",
  "data": {
    "characterId": "character_id",
    "imageId": "scene_image_id",
    "sceneContext": "Character walking through a dark alley at night",
    "sceneType": "action",
    "qualityScore": 0.85,
    "consistencyScore": 0.90,
    "publicUrl": "https://...",
    "filename": "character_alley_scene.jpg"
  }
}
```

### 3. Character Validation

#### POST /api/v1/characters/[id]/validate-consistency
Validate consistency across all character gallery images.

**URL Parameters**:
- `id` (string): Character ID

**Response**:
```json
{
  "success": true,
  "message": "Validated 5 images, 4 passed all checks",
  "data": {
    "characterId": "character_id",
    "characterName": "Character Name",
    "validationResults": [
      {
        "imageId": "image_1",
        "consistencyScore": 0.92,
        "qualityScore": 0.88,
        "isConsistent": true,
        "isQualityValid": true,
        "isOverallValid": true,
        "recommendations": ["Consider adjusting lighting"]
      }
    ],
    "summary": {
      "total": 5,
      "consistent": 4,
      "qualityValid": 5,
      "overallValid": 4
    }
  }
}
```

#### POST /api/v1/characters/batch-validate
**NEW** Validate multiple characters simultaneously with aggregated results.

**Request Body**:
```json
{
  "characterIds": ["char-1", "char-2", "char-3"],
  "validationType": "complete",
  "qualityThreshold": 80,
  "consistencyThreshold": 85,
  "includeRecommendations": true
}
```

**Parameters**:
- `characterIds` (array, required): Array of character IDs to validate
- `validationType` (string, required): "visual" | "narrative" | "complete"
- `qualityThreshold` (number, optional): Minimum quality score (default: 70)
- `consistencyThreshold` (number, optional): Minimum consistency score (default: 85)
- `includeRecommendations` (boolean, optional): Include improvement recommendations

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "characterId": "char-1",
      "characterName": "Character One",
      "success": true,
      "validationType": "complete",
      "overallScore": 88,
      "visualScore": 90,
      "narrativeScore": 85,
      "relationshipScore": 89,
      "issues": [],
      "recommendations": ["Consider adding more diverse poses"]
    }
  ],
  "summary": {
    "totalCharacters": 3,
    "validatedCharacters": 3,
    "failedValidations": 0,
    "averageScore": 87,
    "scoreDistribution": {
      "excellent": 2,
      "good": 1,
      "fair": 0,
      "poor": 0
    }
  }
}
```

#### POST /api/v1/characters/validate-project-consistency
**NEW** Validate character consistency across an entire project.

**Request Body**:
```json
{
  "projectId": "project-123",
  "includeVisualValidation": true,
  "includeNarrativeValidation": true,
  "includeRelationshipValidation": true,
  "qualityThreshold": 80,
  "consistencyThreshold": 85
}
```

**Parameters**:
- `projectId` (string, required): Project identifier
- `includeVisualValidation` (boolean, optional): Include visual consistency checks
- `includeNarrativeValidation` (boolean, optional): Include narrative coherence checks
- `includeRelationshipValidation` (boolean, optional): Include relationship validation
- `qualityThreshold` (number, optional): Minimum quality threshold
- `consistencyThreshold` (number, optional): Minimum consistency threshold

**Response**:
```json
{
  "success": true,
  "projectId": "project-123",
  "validationResults": {
    "overallScore": 85,
    "visualConsistencyScore": 88,
    "narrativeConsistencyScore": 82,
    "relationshipConsistencyScore": 87,
    "issues": [
      {
        "type": "visual",
        "severity": "warning",
        "characterId": "char-1",
        "description": "Slight inconsistency in eye color across images",
        "suggestedFix": "Review and standardize eye color in reference images"
      }
    ],
    "recommendations": [
      "Standardize lighting conditions across character images",
      "Review relationship dynamics for consistency"
    ]
  }
}
```

### 4. PathRAG Management

#### POST /api/v1/pathrag/manage
Perform PathRAG knowledge base management operations.

**Request Body**:
```json
{
  "action": "sync_all",
  "force": false
}
```

**Actions**:
- `sync_all`: Sync all characters to PathRAG
- `sync_character`: Sync specific character (requires `characterId`)
- `delete_entity`: Delete entity from knowledge base (requires `entityName`)
- `health_check`: Check PathRAG service health
- `get_stats`: Get knowledge base statistics

**Response**:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "action": "sync_all",
    "charactersProcessed": 10,
    "documentsInserted": 45,
    "processingTime": 2500
  }
}
```

### 5. Payload CMS REST API

The application provides full Payload CMS REST API access for all collections:

#### Characters Collection
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get specific character
- `POST /api/characters` - Create new character
- `PATCH /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

#### Media Collection
- `GET /api/media` - List all media files
- `GET /api/media/:id` - Get specific media file
- `POST /api/media` - Upload new media file
- `PATCH /api/media/:id` - Update media metadata
- `DELETE /api/media/:id` - Delete media file

#### Users Collection
- `GET /api/users` - List users (requires authentication)
- `POST /api/users` - Create user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout

### 6. Relationship Management

#### POST /api/v1/characters/[id]/relationships
**NEW** Create and manage character relationships.

**URL Parameters**:
- `id` (string): Character ID

**Request Body**:
```json
{
  "relatedCharacterId": "other-char-id",
  "relationshipType": "mentor",
  "relationshipDynamic": "Wise teacher guiding young student",
  "storyContext": "Met during training academy",
  "visualCues": ["respectful distance", "teaching gestures"],
  "strength": 9,
  "conflictLevel": 1,
  "bidirectional": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Relationship created successfully",
  "data": {
    "relationshipId": "rel-123",
    "characterId": "char-1",
    "relatedCharacterId": "char-2",
    "relationshipType": "mentor",
    "strength": 9,
    "conflictLevel": 1
  }
}
```

#### GET /api/v1/characters/relationships/graph
**NEW** Get relationship graph for visualization and analysis.

**Query Parameters**:
- `projectId` (string, optional): Filter by project ID

**Response**:
```json
{
  "success": true,
  "nodes": [
    {
      "id": "char-1",
      "name": "Character One",
      "status": "ready",
      "characterId": "char-1",
      "metadata": {
        "totalRelationships": 3,
        "averageRelationshipStrength": 7.5,
        "averageConflictLevel": 2.1
      }
    }
  ],
  "edges": [
    {
      "id": "rel-123",
      "source": "char-1",
      "target": "char-2",
      "relationshipType": "mentor",
      "strength": 9,
      "conflictLevel": 1,
      "bidirectional": true
    }
  ],
  "statistics": {
    "totalCharacters": 5,
    "totalRelationships": 8,
    "averageConnectionsPerCharacter": 3.2
  }
}
```

#### POST /api/v1/characters/generate-interaction
**NEW** Generate images showing multiple characters interacting.

**Request Body**:
```json
{
  "primaryCharacterId": "char-1",
  "secondaryCharacterIds": ["char-2", "char-3"],
  "interactionType": "confrontation",
  "sceneDescription": "Heated argument in a restaurant",
  "environmentContext": "upscale restaurant",
  "mood": "tense",
  "lightingStyle": "dramatic",
  "style": "character_interaction"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Interaction image generated successfully",
  "data": {
    "imageId": "interaction_image_id",
    "primaryCharacterId": "char-1",
    "secondaryCharacterIds": ["char-2", "char-3"],
    "interactionType": "confrontation",
    "qualityScore": 0.87,
    "publicUrl": "https://...",
    "filename": "character_confrontation.jpg"
  }
}
```

#### POST /api/v1/characters/generate-relationship-image
**NEW** Generate images that showcase character relationships with visual cues.

**Request Body**:
```json
{
  "characterIds": ["char-1", "char-2"],
  "relationshipContext": "Mentor teaching student",
  "visualStyle": "character_relationship",
  "environmentContext": "training ground",
  "mood": "inspiring",
  "lightingStyle": "warm",
  "emphasizeRelationship": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Relationship image generated successfully",
  "data": {
    "imageId": "relationship_image_id",
    "characterIds": ["char-1", "char-2"],
    "relationshipContext": "Mentor teaching student",
    "qualityScore": 0.89,
    "publicUrl": "https://...",
    "filename": "mentor_student_relationship.jpg"
  }
}
```

### 7. GraphQL API

#### POST /api/graphql
GraphQL endpoint for complex queries and mutations.

**GraphQL Playground**: Available at `/api/graphql-playground` for interactive query development.

## Character Data Model

### Character Schema
```typescript
interface Character {
  id: string
  name: string
  status: 'draft' | 'in_development' | 'ready' | 'in_production' | 'archived'
  characterId: string
  biography: RichTextContent
  personality: RichTextContent
  motivations: RichTextContent
  relationships: RichTextContent
  backstory: RichTextContent
  skills: Array<{
    skill: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    description: string
  }>
  physicalDescription: RichTextContent
  voiceDescription: RichTextContent
  clothing: RichTextContent
  age: number
  height: string
  weight: string
  eyeColor: string
  hairColor: string
  masterReferenceImage: MediaReference
  imageGallery: Array<{
    imageFile: MediaReference
    isCoreReference: boolean
    dinoAssetId: string
    qualityScore: number
    consistencyScore: number
    shotType: string
    tags: string
  }>
}
```

## Integration Examples

### JavaScript/Node.js Example
```javascript
// Query character knowledge
const queryCharacters = async (query) => {
  const response = await fetch('http://localhost:3000/api/v1/characters/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: query,
      options: {
        responseType: 'Multiple Paragraphs',
        topK: 20
      }
    })
  });

  const result = await response.json();
  return result.data.result;
};

// Generate smart character image (recommended)
const generateSmartImage = async (characterId, prompt) => {
  const response = await fetch(`http://localhost:3000/api/v1/characters/${characterId}/generate-smart-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      style: 'character_production',
      maxRetries: 3,
      qualityThreshold: 75
    })
  });

  return await response.json();
};

// Generate scene-specific image
const generateSceneImage = async (characterId, sceneData) => {
  const response = await fetch(`http://localhost:3000/api/v1/characters/${characterId}/generate-scene-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sceneContext: sceneData.context,
      sceneType: sceneData.type,
      mood: sceneData.mood,
      lightingStyle: sceneData.lighting,
      style: 'character_scene'
    })
  });

  return await response.json();
};

// Validate multiple characters
const batchValidate = async (characterIds) => {
  const response = await fetch('http://localhost:3000/api/v1/characters/batch-validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      characterIds: characterIds,
      validationType: 'complete',
      includeRecommendations: true
    })
  });

  return await response.json();
};

// Get relationship graph
const getRelationshipGraph = async (projectId) => {
  const url = projectId
    ? `http://localhost:3000/api/v1/characters/relationships/graph?projectId=${projectId}`
    : 'http://localhost:3000/api/v1/characters/relationships/graph';

  const response = await fetch(url);
  return await response.json();
};

// Get all characters
const getCharacters = async () => {
  const response = await fetch('http://localhost:3000/api/v1/characters');
  return await response.json();
};
```

### Python Example
```python
import requests
import json

class CharacterLibraryClient:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url

    def query_characters(self, query, response_type="Multiple Paragraphs"):
        url = f"{self.base_url}/api/v1/characters/query"
        payload = {
            "query": query,
            "options": {
                "responseType": response_type,
                "topK": 20
            }
        }

        response = requests.post(url, json=payload)
        return response.json()

    def generate_smart_image(self, character_id, prompt, style="character_production"):
        url = f"{self.base_url}/api/v1/characters/{character_id}/generate-smart-image"
        payload = {
            "prompt": prompt,
            "style": style,
            "maxRetries": 3,
            "qualityThreshold": 75
        }

        response = requests.post(url, json=payload)
        return response.json()

    def generate_scene_image(self, character_id, scene_context, scene_type, mood=None):
        url = f"{self.base_url}/api/v1/characters/{character_id}/generate-scene-image"
        payload = {
            "sceneContext": scene_context,
            "sceneType": scene_type,
            "mood": mood,
            "style": "character_scene"
        }

        response = requests.post(url, json=payload)
        return response.json()

    def batch_validate_characters(self, character_ids, validation_type="complete"):
        url = f"{self.base_url}/api/v1/characters/batch-validate"
        payload = {
            "characterIds": character_ids,
            "validationType": validation_type,
            "includeRecommendations": True
        }

        response = requests.post(url, json=payload)
        return response.json()

    def get_relationship_graph(self, project_id=None):
        url = f"{self.base_url}/api/v1/characters/relationships/graph"
        if project_id:
            url += f"?projectId={project_id}"

        response = requests.get(url)
        return response.json()

    def create_novel_movie_character(self, project_id, character_data):
        url = f"{self.base_url}/api/v1/characters/novel-movie"
        payload = {
            "novelMovieProjectId": project_id,
            "characterData": character_data,
            "syncSettings": {
                "autoSync": True,
                "conflictResolution": "novel-movie-wins"
            }
        }

        response = requests.post(url, json=payload)
        return response.json()

    def get_characters(self):
        url = f"{self.base_url}/api/v1/characters"
        response = requests.get(url)
        return response.json()

# Usage Examples
client = CharacterLibraryClient()

# Query characters
result = client.query_characters("Tell me about warrior characters")
print(result['data']['result'])

# Generate smart image
smart_image = client.generate_smart_image("char-123", "Character in battle armor")
print(f"Generated image: {smart_image['data']['publicUrl']}")

# Validate multiple characters
validation = client.batch_validate_characters(["char-1", "char-2", "char-3"])
print(f"Validation results: {validation['summary']}")
```

## Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "error": "Query is required and cannot be empty"
}
```

**404 Not Found**:
```json
{
  "error": "Character not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "details": "Specific error message"
}
```

**503 Service Unavailable**:
```json
{
  "error": "PathRAG service is not available",
  "details": "Service health check failed"
}
```

### Best Practices

1. **Always check the `success` field** in responses before processing data
2. **Handle service unavailability** (503 errors) with retry logic
3. **Validate required parameters** before making requests
4. **Use appropriate timeouts** for image generation operations (can take 30+ seconds)
5. **Monitor rate limits** if implemented in your deployment

## Getting Started

### Prerequisites
- Node.js 18.20.2+ or 20.9.0+
- MongoDB database
- Environment variables configured (see `.env.example`)

### Quick Start

1. **Query character knowledge**:
```bash
curl -X POST http://localhost:3000/api/v1/characters/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about characters with magical abilities"}'
```

2. **Get all characters**:
```bash
curl http://localhost:3000/api/v1/characters
```

3. **Generate smart character image** (recommended):
```bash
curl -X POST http://localhost:3000/api/v1/characters/CHARACTER_ID/generate-smart-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Character in battle armor", "style": "character_production"}'
```

4. **Generate scene-specific image**:
```bash
curl -X POST http://localhost:3000/api/v1/characters/CHARACTER_ID/generate-scene-image \
  -H "Content-Type: application/json" \
  -d '{"sceneContext": "Character in a dark forest", "sceneType": "action", "mood": "mysterious"}'
```

5. **Validate multiple characters**:
```bash
curl -X POST http://localhost:3000/api/v1/characters/batch-validate \
  -H "Content-Type: application/json" \
  -d '{"characterIds": ["char-1", "char-2"], "validationType": "complete"}'
```

6. **Get relationship graph**:
```bash
curl http://localhost:3000/api/v1/characters/relationships/graph
```

### Basic Workflow

1. **Create a character** using the Payload CMS admin panel or REST API
2. **Upload a master reference image** to establish the character's visual identity
3. **Generate a 360° core set** for comprehensive reference angles
4. **Query character information** using natural language
5. **Generate additional images** using smart generation for best results
6. **Set up character relationships** if working with multiple characters
7. **Use scene-specific generation** for production-ready images
8. **Validate consistency** across all character images

### Advanced Workflow for Production Teams

1. **Set up Novel Movie project** with proper sync configuration
2. **Bulk import characters** using the bulk operations API
3. **Establish character relationships** and dynamics
4. **Generate scene-specific images** for production workflows
5. **Use batch validation** to ensure project-wide consistency
6. **Generate interaction images** for multi-character scenes
7. **Monitor quality metrics** and optimize based on recommendations

## Latest Features & Enhancements

### Smart Image Generation
- **Intelligent Reference Selection**: Automatically selects the best reference image based on prompt analysis
- **Adaptive Retry Logic**: Automatically retries with different approaches if initial generation fails
- **Enhanced Quality Control**: Improved validation with configurable thresholds

### Scene-Specific Generation
- **Context-Aware Generation**: Generates images tailored for specific scenes with environmental context
- **Mood and Lighting Control**: Applies appropriate mood and lighting based on scene requirements
- **Multi-Character Support**: Handles character interactions with relationship dynamics

### Batch Operations & Validation
- **Batch Character Validation**: Validate multiple characters simultaneously with aggregated results
- **Project-Wide Consistency**: Comprehensive project validation with detailed reporting
- **Bulk Character Operations**: Efficient handling of multiple characters for large projects

### Novel Movie Integration
- **Enhanced Project Management**: Specialized endpoints for Novel Movie production workflows
- **Bidirectional Synchronization**: Seamless sync between Novel Movie and Character Library
- **Advanced Relationship Management**: Complex relationship modeling with visual cues

### Relationship Management
- **Dynamic Relationship Modeling**: Complex relationship types with strength and conflict metrics
- **Relationship Graph Visualization**: Comprehensive network analysis and visualization
- **Interaction Generation**: Multi-character image generation with relationship awareness

## Rate Limits and Constraints

- **Image Generation**: 30-60 seconds per image (single), batch operations optimized
- **Smart Generation**: 45-90 seconds per image (includes analysis and retry logic)
- **Scene Generation**: 60-120 seconds per image (includes context processing)
- **PathRAG Queries**: No explicit rate limits, but consider reasonable usage
- **File Uploads**: Limited by server configuration and storage capacity
- **Concurrent Operations**: Image generation and validation are resource-intensive
- **Batch Operations**: Configurable concurrency limits for optimal performance

## Novel Movie Integration

The Character Library provides specialized endpoints for seamless integration with Novel Movie production systems.

### Novel Movie Character Management

#### POST /api/v1/characters/novel-movie
**NEW** Create characters specifically for Novel Movie projects with enhanced integration.

**Request Body**:
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
        "relationshipDynamic": "Close childhood friend",
        "storyContext": "Grew up together in the same neighborhood",
        "visualCues": ["comfortable body language", "shared jokes"],
        "strength": 8,
        "conflictLevel": 2
      }
    ],
    "skills": [
      {
        "skill": "Combat",
        "level": "advanced",
        "description": "Trained in martial arts"
      }
    ]
  },
  "syncSettings": {
    "autoSync": true,
    "conflictResolution": "novel-movie-wins"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Novel Movie character created successfully",
  "data": {
    "characterId": "char-123",
    "novelMovieProjectId": "project-123",
    "syncStatus": "synced",
    "createdAt": "2025-09-07T05:34:51.566Z"
  }
}
```

#### Sync Character Changes
```http
PUT /api/v1/characters/{characterId}/novel-movie-sync
Content-Type: application/json

{
  "characterData": { /* Updated character data */ },
  "lastModified": "2025-09-07T05:34:51.566Z",
  "changeSet": ["biography", "personality", "relationships"],
  "conflictResolution": "novel-movie-wins"
}
```

#### POST /api/v1/characters/bulk/novel-movie
**NEW** Perform bulk character operations for Novel Movie projects.

**Request Body**:
```json
{
  "projectId": "project-123",
  "operation": "create",
  "characters": [
    {
      "characterData": {
        "name": "Character One",
        "status": "in_development",
        "age": 25,
        "biography": { /* RichText content */ },
        "personality": { /* RichText content */ }
      }
    },
    {
      "characterData": {
        "name": "Character Two",
        "status": "draft",
        "age": 30,
        "biography": { /* RichText content */ },
        "personality": { /* RichText content */ }
      }
    }
  ],
  "syncSettings": {
    "conflictResolution": "manual",
    "autoSync": true
  }
}
```

**Parameters**:
- `projectId` (string, required): Novel Movie project ID
- `operation` (string, required): "create" | "update" | "sync"
- `characters` (array, required): Array of character data
- `syncSettings` (object, optional): Synchronization configuration

**Response**:
```json
{
  "success": true,
  "message": "Bulk operation completed successfully",
  "data": {
    "projectId": "project-123",
    "operation": "create",
    "totalCharacters": 2,
    "successfulOperations": 2,
    "failedOperations": 0,
    "results": [
      {
        "characterId": "char-124",
        "name": "Character One",
        "success": true,
        "syncStatus": "synced"
      },
      {
        "characterId": "char-125",
        "name": "Character Two",
        "success": true,
        "syncStatus": "synced"
      }
    ],
    "processingTime": 5000
  }
}
```

### Scene-Specific Image Generation

#### Generate Scene Image
```http
POST /api/v1/characters/{characterId}/generate-scene-image
Content-Type: application/json

{
  "sceneContext": "Character walking through a dark alley at night",
  "sceneType": "action",
  "mood": "tense",
  "lightingStyle": "dramatic shadows",
  "environmentContext": "urban alley",
  "style": "character_scene"
}
```

#### Generate Character Interaction
```http
POST /api/v1/characters/generate-interaction
Content-Type: application/json

{
  "primaryCharacterId": "char-1",
  "secondaryCharacterIds": ["char-2", "char-3"],
  "interactionType": "confrontation",
  "sceneDescription": "Heated argument in a restaurant",
  "mood": "tense",
  "environmentContext": "upscale restaurant"
}
```

#### POST /api/v1/characters/batch-generate-scenes
**NEW** Generate images for multiple scenes efficiently with batch processing.

**Request Body**:
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
      "mood": "casual",
      "lightingStyle": "natural"
    },
    {
      "sceneId": "scene-002",
      "characters": ["char-1"],
      "sceneDescription": "Character alone in contemplation",
      "requiredShots": ["close_up"],
      "sceneType": "emotional"
    }
  ],
  "batchSettings": {
    "maxConcurrent": 3,
    "style": "character_scene",
    "qualityThreshold": 80
  }
}
```

**Parameters**:
- `projectId` (string, required): Project identifier
- `scenes` (array, required): Array of scene definitions
- `batchSettings` (object, optional): Batch processing configuration

**Response**:
```json
{
  "success": true,
  "message": "Batch scene generation completed",
  "data": {
    "projectId": "project-123",
    "totalScenes": 2,
    "successfulScenes": 2,
    "failedScenes": 0,
    "results": [
      {
        "sceneId": "scene-001",
        "success": true,
        "generatedImages": [
          {
            "imageId": "img-001",
            "shotType": "medium_shot",
            "qualityScore": 0.88,
            "publicUrl": "https://..."
          }
        ]
      }
    ],
    "processingTime": 180000,
    "averageQuality": 0.87
  }
}
```

### Character Relationships

#### Create Relationship
```http
POST /api/v1/characters/{characterId}/relationships
Content-Type: application/json

{
  "relatedCharacterId": "other-char-id",
  "relationshipType": "mentor",
  "relationshipDynamic": "Wise teacher guiding young student",
  "storyContext": "Met during training academy",
  "visualCues": ["respectful distance", "teaching gestures"],
  "strength": 9,
  "conflictLevel": 1,
  "bidirectional": true
}
```

#### Get Relationship Graph
```http
GET /api/v1/characters/relationships/graph?projectId=project-123
```

#### Generate Relationship Image
```http
POST /api/v1/characters/generate-relationship-image
Content-Type: application/json

{
  "characterIds": ["char-1", "char-2"],
  "relationshipContext": "Mentor teaching student",
  "visualStyle": "character_relationship",
  "mood": "inspiring",
  "emphasizeRelationship": true
}
```

### Quality Assurance & Validation

#### Get Character Quality Metrics
```http
GET /api/v1/characters/{characterId}/quality-metrics
```

#### Validate Project Consistency
```http
POST /api/v1/characters/validate-project-consistency
Content-Type: application/json

{
  "projectId": "project-123",
  "includeVisualValidation": true,
  "includeNarrativeValidation": true,
  "includeRelationshipValidation": true,
  "consistencyThreshold": 85,
  "qualityThreshold": 80
}
```

#### Batch Character Validation
```http
POST /api/v1/characters/batch-validate
Content-Type: application/json

{
  "characterIds": ["char-1", "char-2", "char-3"],
  "validationType": "complete",
  "qualityThreshold": 80,
  "consistencyThreshold": 85,
  "includeRecommendations": true
}
```

### Novel Movie Integration Features

- **Project-Specific Character Management**: Characters are linked to specific Novel Movie projects
- **Bidirectional Synchronization**: Changes can be synced between Novel Movie and Character Library
- **Conflict Resolution**: Automatic and manual conflict resolution strategies
- **Scene Context Tracking**: Characters track their appearances across different scenes
- **Relationship-Aware Generation**: Images consider character relationships and dynamics
- **Comprehensive Validation**: Project-wide consistency validation and quality metrics
- **Batch Processing**: Efficient handling of multiple characters and operations

## Support and Resources

- **GraphQL Playground**: `/api/graphql-playground` for interactive API exploration
- **Admin Panel**: `/admin` for visual character management
- **Health Checks**:
  - Service health: `GET /api/health`
  - PathRAG health: `GET /api/v1/characters/query?action=health`
  - PathRAG stats: `GET /api/v1/characters/query?action=stats`
  - PathRAG management: `GET /api/v1/pathrag/manage`
- **API Testing**: Use the comprehensive endpoint list in `/src/lib/api-endpoints.ts` for testing
- **Quality Assurance**: Monitor QA configuration at `GET /api/v1/qa/config`

### API Versioning
All new endpoints use the `/api/v1/` prefix for versioning. Legacy endpoints without versioning are still supported but new features are only available in versioned endpoints.

### Best Practices for New Features
1. **Use Smart Generation**: Prefer `/generate-smart-image` over `/generate-image` for better results
2. **Batch Operations**: Use batch endpoints for multiple operations to improve performance
3. **Scene Context**: Use scene-specific generation for production workflows
4. **Relationship Management**: Establish relationships before generating interaction images
5. **Quality Monitoring**: Regularly validate characters and monitor quality metrics

For additional support or questions about integrating with the Character Library API, please refer to the project documentation or contact the development team.
