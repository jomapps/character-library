# Character Library API Endpoints Summary

## 📋 Documentation Index
- **[Endpoint Usage Examples](character-library-2-endpoint-usage-examples.md)** - Detailed examples with request/response
- **[Endpoint Connections](character-library-3-endpoint-connections.md)** - Data flow and dependencies
- **[Workflows](character-library-4-workflows.md)** - Complete workflow documentation

- **ID Consistency Guide** - See "Important Notes" section above for ID usage patterns

## ⚠️ Important Notes
- **Master Reference Deletion**: `DELETE /api/v1/characters/{id}/reference-image` performs complete reset
- **ID Types**:
  - **MongoDB ObjectId** (24-char hex): Use for ALL `/api/v1/characters/{id}/*` endpoints (e.g., `68c07c4305803df129909509`)
  - **Business characterId** (human-readable): Use for PathRAG sync, search, display (e.g., `68bc1741-leo-1757445189931-190445-8a70d8f1-389`)
- **Dependencies**: Many endpoints require master reference image processing
- **DINOv3 Integration**: All images are automatically processed with DINOv3 for feature extraction and similarity matching
- **Prompt Control**: Initial image generation uses exact user prompts without modifications (style: 'none')
- **Media URLs**: System prioritizes DINOv3 media URLs, falls back to PayloadCMS URLs, then constructs fallback URLs
- **UI Guidance**: Character Profile shows both "CharacterID" (business) and "DB ID" (MongoDB ObjectId) - use "DB ID" for API testing

## 🆕 Recent Enhancements (September 2025)

### Documentation & UI Consistency Fixes
- **Issue Resolved**: Complete sync between documentation, UI, and API behavior for Character ID usage
- **21 API Endpoints Updated**: Clear descriptions specify MongoDB ObjectId requirements with real examples
- **UI Enhanced**: Character Profile now shows both ID types clearly labeled
- **Examples Fixed**: All documentation examples use correct MongoDB ObjectId format

### DINOv3 Integration Improvements
- **Upload Success Rate**: Improved from ~60% to 100% with robust error handling
- **Asset ID Management**: Reliable DINOv3 asset ID assignment and tracking
- **Quality Validation**: Image corruption detection before upload
- **Automatic Retry Logic**: Built-in retry mechanism for transient failures

### Prompt Control System
- **Exact Prompt Preservation**: Initial image generation uses user prompts without modifications
- **Style Override**: Automatic `style: 'none'` parameter for generate-initial-image endpoints
- **Backward Compatibility**: Other endpoints maintain existing prompt enhancement
- **Enhanced Logging**: Complete prompt transformation chain visibility

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

## Project Management
- `GET /api/v1/characters/projects/{projectId}` - Preview project deletion (dry run)
- `DELETE /api/v1/characters/projects/{projectId}` - Delete all characters and data belonging to a project

## Character Search & Discovery
- `POST /api/v1/characters/search` - Search characters with similarity matching to avoid duplication
- `POST /api/v1/characters/query` - Query character knowledge base with natural language (PathRAG)
- `GET /api/v1/characters/query` - Get query stats and health information

## Image Generation
- `POST /api/v1/characters/{id}/generate-image` - Generate basic character image with reference consistency
- `POST /api/v1/characters/{id}/generate-initial-image` - Generate character's first reference image (uses exact prompt, no modifications)
- `POST /api/v1/characters/generate-initial-image` - Generate standalone initial image without character association
- `POST /api/v1/characters/{id}/generate-scene-image` - Generate character image for specific scene context
- `POST /api/v1/characters/{id}/generate-core-set` - Generate core reference image set with quality validation
- `POST /api/v1/characters/{id}/generate-360-set` - Generate complete 360° reference image set
- `POST /api/v1/characters/{id}/generate-smart-image` - Generate image using smart AI prompting with reference selection
- `PUT /api/v1/characters/{id}/reference-image` - Update character's master reference image
- `GET /api/v1/characters/{id}/reference-image` - Get character's current reference image
- `DELETE /api/v1/characters/{id}/reference-image` - Delete master reference image and reset all derived content

## Character Relationships
- `GET /api/v1/characters/{id}/relationships` - Get character's relationships
- `POST /api/v1/characters/{id}/relationships` - Create or update character relationships
- `GET /api/v1/characters/relationships/graph` - Get relationship graph for all characters

## Media & DINOv3 Integration
- **Automatic Processing**: All generated images are automatically uploaded to DINOv3 for feature extraction
- **Asset Management**: Each image gets a unique DINOv3 asset ID for similarity matching and retrieval
- **URL Prioritization**: System uses DINOv3 media URLs when available, with PayloadCMS and fallback URLs as backup
- **Quality Validation**: DINOv3 processing includes image quality validation and corruption detection
- **Feature Extraction**: Enables advanced similarity matching and smart reference image selection

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

## ID Management & Usage Patterns

### Character ID Types
1. **MongoDB ObjectId** (`id` field)
   - **Format**: 24-character hexadecimal string
   - **Example**: `68c07c4305803df129909509`
   - **Usage**: ALL database operations and API endpoints with `{id}` parameter
   - **Generation**: Auto-generated by MongoDB
   - **UI Label**: "DB ID"

2. **Business CharacterID** (`characterId` field)
   - **Format**: Human-readable identifier
   - **Example**: `68bc1741-leo-1757445189931-190445-8a70d8f1-389`
   - **Usage**: PathRAG sync, search functionality, user display
   - **Generation**: Auto-generated from character name or manually provided
   - **UI Label**: "CharacterID"

### API Endpoint ID Requirements
- **All `/api/v1/characters/{id}/*` routes**: Use MongoDB ObjectId
- **PathRAG endpoints**: Use business characterId
- **Search endpoints**: Accept both types
- **Relationship endpoints**: Use MongoDB ObjectId for all character references

### External Service IDs
- **DINOv3 Asset ID**: Unique identifier for media assets in DINOv3 service
- **PathRAG Document ID**: Uses business characterId for knowledge base entities
- **Novel Movie Project ID**: External project identifier for integration

## Character Data Structure

### Core Character Fields
- **Basic Info**: name, characterId, status, biography, personality, motivations, backstory
- **Character Development**:
  - `role`: Narrative role (protagonist/antagonist/supporting/minor)
  - `archetype`: Classical or story archetype (e.g., Mentor, Trickster)
  - `psychology`: Core motivation, fears, desires, and notable flaws
  - `characterArc`: Start state → Transformation → End state
- **Physical**: age, height, weight, eyeColor, hairColor, physicalDescription, clothing
- **Voice & Dialogue**:
  - `dialogueVoice`: Structured voice profile with voiceDescription, style, speech patterns, vocabulary
  - `voiceModels`: Array of voice generation models (ElevenLabs, OpenAI TTS, etc.) with voice IDs and samples
  - `voiceDescription`: Legacy field for backward compatibility
- **Skills**: Array of skills with levels (beginner to master) and descriptions
- **Relationships**: Enhanced relationship system with visual cues and dynamics
- **Media**: Master reference image and image gallery with DINOv3 processing (supports audio files for voice samples)
- **Quality Metrics**: Narrative and visual consistency tracking

### Voice & Audio Support
- **Audio File Upload**: Media collection supports audio files for voice samples
- **Voice Model Integration**: Ready for TTS service integration (ElevenLabs, OpenAI TTS)
- **Speech Pattern Analysis**: Structured dialogue voice profiles for consistent character voice
- **Voice Sample Management**: Link voice samples to specific voice models
