# Character Library API Documentation

## Overview

The Character Library is a state-of-the-art Digital Asset Management system for character data, built on Payload CMS v3 with Next.js. It provides comprehensive APIs for managing character personas, generating AI-powered character images, and querying character knowledge using natural language.

### Key Features

- **Character Management**: Complete CRUD operations for character data including personas, biographies, and relationships
- **AI-Powered Image Generation**: Generate character images with consistency validation using DINOv3 service
- **Natural Language Queries**: Query character knowledge base using PathRAG service
- **Quality Assurance**: Automated image consistency and quality validation
- **360° Core Reference Sets**: Generate comprehensive character reference images

### Target Audience

- Game developers and studios
- Animation and film production teams
- Content creators and writers
- Applications requiring character asset management

## Base URL and Authentication

**Base URL**: `http://localhost:3000` (development) or your deployed domain

**Authentication**: The API uses Payload CMS's built-in authentication system. Most endpoints are currently configured with open access (`read: () => true`), but this can be configured based on your security requirements.

## API Reference

### 1. Character Query API (PathRAG Integration)

#### POST /api/characters/query
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

#### GET /api/characters/query
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
      "POST /api/characters/query": "Query character knowledge base with natural language",
      "GET /api/characters/query?action=stats": "Get PathRAG knowledge base statistics"
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

#### POST /api/characters/[id]/generate-image
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

#### POST /api/characters/[id]/generate-core-set
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

### 3. Character Validation

#### POST /api/characters/[id]/validate-consistency
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

### 4. PathRAG Management

#### POST /api/pathrag/manage
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

### 6. GraphQL API

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
  const response = await fetch('http://localhost:3000/api/characters/query', {
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

// Generate character image
const generateImage = async (characterId, prompt) => {
  const response = await fetch(`http://localhost:3000/api/characters/${characterId}/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      style: 'character_production'
    })
  });
  
  return await response.json();
};

// Get all characters
const getCharacters = async () => {
  const response = await fetch('http://localhost:3000/api/characters');
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
        url = f"{self.base_url}/api/characters/query"
        payload = {
            "query": query,
            "options": {
                "responseType": response_type,
                "topK": 20
            }
        }
        
        response = requests.post(url, json=payload)
        return response.json()
    
    def generate_image(self, character_id, prompt, style="character_production"):
        url = f"{self.base_url}/api/characters/{character_id}/generate-image"
        payload = {
            "prompt": prompt,
            "style": style
        }
        
        response = requests.post(url, json=payload)
        return response.json()
    
    def get_characters(self):
        url = f"{self.base_url}/api/characters"
        response = requests.get(url)
        return response.json()

# Usage
client = CharacterLibraryClient()
result = client.query_characters("Tell me about warrior characters")
print(result['data']['result'])
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
curl -X POST http://localhost:3000/api/characters/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about characters with magical abilities"}'
```

2. **Get all characters**:
```bash
curl http://localhost:3000/api/characters
```

3. **Generate character image**:
```bash
curl -X POST http://localhost:3000/api/characters/CHARACTER_ID/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Character in battle armor"}'
```

### Basic Workflow

1. **Create a character** using the Payload CMS admin panel or REST API
2. **Upload a master reference image** to establish the character's visual identity
3. **Generate a 360° core set** for comprehensive reference angles
4. **Query character information** using natural language
5. **Generate additional images** as needed for your project
6. **Validate consistency** across all character images

## Rate Limits and Constraints

- **Image Generation**: Limited by external AI service capacity
- **PathRAG Queries**: No explicit rate limits, but consider reasonable usage
- **File Uploads**: Limited by server configuration and storage capacity
- **Concurrent Operations**: Image generation and validation are resource-intensive

## Support and Resources

- **GraphQL Playground**: `/api/graphql-playground` for interactive API exploration
- **Admin Panel**: `/admin` for visual character management
- **Health Checks**: Use `/api/characters/query?action=health` to verify service status

For additional support or questions about integrating with the Character Library API, please refer to the project documentation or contact the development team.
