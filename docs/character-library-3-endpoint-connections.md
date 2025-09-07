# Character Library API Endpoint Connections

## High-Level Architecture

The Character Library API is organized into interconnected layers that work together to provide comprehensive character management:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   Character     │    │   Knowledge     │
│   Integration   │◄──►│   Management    │◄──►│   Base (RAG)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Image         │    │   Quality &     │    │   Relationship  │
│   Generation    │    │   Validation    │    │   Management    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Data Flow

### 1. Character Creation Flow
```
Novel Movie App → POST /api/v1/characters/novel-movie
                ↓
Character Created → Auto-sync to PathRAG → POST /api/v1/pathrag/manage
                ↓
Quality Metrics Generated → GET /api/v1/characters/{id}/quality-metrics
                ↓
Initial Image Generation → POST /api/v1/characters/{id}/generate-initial-image
```

### 2. Character Discovery Flow
```
Search Request → POST /api/v1/characters/search
               ↓
Similarity Analysis → Character Matches Returned
                    ↓
If Similar Found → Use Existing Character
If Not Found → Create New Character → POST /api/v1/characters/novel-movie
```

### 3. Image Generation Pipeline
```
Character Data → POST /api/v1/characters/{id}/generate-initial-image
              ↓
Reference Image → PUT /api/v1/characters/{id}/reference-image
                ↓
360° Set → POST /api/v1/characters/{id}/generate-360-set
         ↓
Scene Images → POST /api/v1/characters/{id}/generate-scene-image
```

## Endpoint Dependencies

### Character Management Core
- **Base**: `GET/POST /api/v1/characters` - Foundation for all character operations
- **Individual**: `GET/PATCH/DELETE /api/v1/characters/{id}` - Depends on character existence
- **Project Listing**: `GET /api/v1/characters/by-project/{projectId}` - Filters base character list

### Novel Movie Integration Layer
- **Creation**: `POST /api/v1/characters/novel-movie` - Enhanced version of base character creation
- **Sync**: `PUT /api/v1/characters/{id}/novel-movie-sync` - Requires existing character
- **Bulk**: `POST /api/v1/characters/bulk/novel-movie` - Batch version of novel-movie creation

### Search & Discovery Layer
- **Similarity Search**: `POST /api/v1/characters/search` - Analyzes existing characters
- **Knowledge Query**: `POST /api/v1/characters/query` - Requires PathRAG sync
- **Query Stats**: `GET /api/v1/characters/query` - PathRAG health check

### Image Generation Layer
```
Character Data (Required)
    ↓
generate-initial-image (First image)
    ↓
reference-image (Set master reference)
    ↓
generate-360-set (Complete reference set)
    ↓
generate-scene-image (Context-specific images)
```

### Quality & Validation Layer
- **Individual Metrics**: `GET /api/v1/characters/{id}/quality-metrics` - Requires character data
- **Consistency Check**: `POST /api/v1/characters/{id}/validate-consistency` - Requires images + data
- **Project Validation**: `POST /api/v1/characters/validate-project-consistency` - Batch validation
- **Batch Validation**: `POST /api/v1/characters/batch-validate` - Multiple character validation

### Relationship Management Layer
- **Individual**: `GET/POST /api/v1/characters/{id}/relationships` - Character-specific relationships
- **Graph**: `GET /api/v1/characters/relationships/graph` - Global relationship network
- **Relationship Images**: `POST /api/v1/characters/generate-relationship-image` - Visual relationships

## Data Synchronization Points

### PathRAG Knowledge Base
- **Trigger Points**: Character creation, updates, relationship changes
- **Endpoints**: All character CRUD operations automatically sync to PathRAG
- **Query Interface**: `POST /api/v1/characters/query` for natural language queries

### Novel Movie Integration
- **Bidirectional Sync**: Changes in either system trigger sync
- **Conflict Resolution**: Configurable resolution strategies
- **Project Isolation**: Characters grouped by Novel Movie project ID

### Image Asset Management
- **Reference Chain**: initial → reference → 360° set → scene images
- **Quality Tracking**: Each generation updates quality metrics
- **Asset Linking**: Images linked to character records and external asset IDs

## Error Handling & Fallbacks

### Character Not Found
- Individual endpoints return 404
- Batch operations skip missing characters
- Search operations return empty results

### Image Generation Failures
- Fallback to previous reference images
- Quality metrics reflect generation failures
- Retry mechanisms for transient failures

### PathRAG Sync Issues
- Character operations continue without sync
- Query endpoints return service unavailable
- Background sync retry mechanisms

## Performance Considerations

### Caching Layers
- Character data cached at API level
- Image URLs cached with CDN integration
- Relationship graphs cached for performance

### Batch Operations
- Bulk endpoints for multiple character operations
- Async processing for image generation
- Progress tracking for long-running operations

### Rate Limiting
- Image generation endpoints have rate limits
- Query endpoints have usage quotas
- Bulk operations have concurrency limits
