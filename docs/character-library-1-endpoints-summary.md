# Character Library API Endpoints Summary

## Health & System
- `GET /api/health` - Service health check and status

## Character CRUD Operations
- `GET /api/v1/characters` - List all characters with pagination and search
- `POST /api/v1/characters` - Create a new character
- `GET /api/v1/characters/{id}` - Get specific character by ID
- `PATCH /api/v1/characters/{id}` - Update character data
- `DELETE /api/v1/characters/{id}` - Delete character

## Novel Movie Integration
- `POST /api/v1/characters/novel-movie` - Create character with Novel Movie project integration
- `PUT /api/v1/characters/{id}/novel-movie-sync` - Sync character data with Novel Movie project
- `GET /api/v1/characters/by-project/{projectId}` - Get all characters for a specific Novel Movie project

## Character Search & Discovery
- `POST /api/v1/characters/search` - Search characters with similarity matching to avoid duplication
- `POST /api/v1/characters/query` - Query character knowledge base with natural language (PathRAG)
- `GET /api/v1/characters/query` - Get query stats and health information

## Image Generation
- `POST /api/v1/characters/{id}/generate-image` - Generate basic character image
- `POST /api/v1/characters/{id}/generate-initial-image` - Generate character's first reference image
- `POST /api/v1/characters/{id}/generate-scene-image` - Generate character image for specific scene context
- `POST /api/v1/characters/{id}/generate-core-set` - Generate core reference image set
- `POST /api/v1/characters/{id}/generate-360-set` - Generate complete 360° reference image set
- `POST /api/v1/characters/{id}/generate-smart-image` - Generate image using smart AI prompting
- `PUT /api/v1/characters/{id}/reference-image` - Update character's master reference image
- `GET /api/v1/characters/{id}/reference-image` - Get character's current reference image

## Character Relationships
- `GET /api/v1/characters/{id}/relationships` - Get character's relationships
- `POST /api/v1/characters/{id}/relationships` - Create or update character relationships
- `GET /api/v1/characters/relationships/graph` - Get relationship graph for all characters

## Quality & Validation
- `GET /api/v1/characters/{id}/quality-metrics` - Get comprehensive quality metrics for character
- `POST /api/v1/characters/{id}/validate-consistency` - Validate character's narrative and visual consistency
- `POST /api/v1/characters/validate-project-consistency` - Validate consistency across entire project
- `POST /api/v1/characters/batch-validate` - Batch validate multiple characters

## Bulk Operations
- `POST /api/v1/characters/bulk/novel-movie` - Bulk create characters for Novel Movie projects
- `POST /api/v1/characters/batch-generate-scenes` - Generate scene images for multiple characters

## Advanced Image Generation
- `POST /api/v1/characters/generate-initial-image` - Generate initial character reference (global endpoint)
- `POST /api/v1/characters/generate-interaction` - Generate character interaction images
- `POST /api/v1/characters/generate-relationship-image` - Generate images showing character relationships

## PathRAG Management
- `POST /api/v1/pathrag/manage` - Manage PathRAG knowledge base operations
