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

### 3. Enhanced 360° Image Generation Pipeline (Async)
```
Character Data → POST /api/v1/characters/{id}/generate-initial-image
              ↓
Exact Prompt Processing (no modifications) → Fal.ai nano-banana
              ↓
Image Generated → R2 Storage Upload → Public URL Created
              ↓
DINOv3 Integration → Feature Extraction → Asset ID Assignment
              ↓
Reference Image → PUT /api/v1/characters/{id}/reference-image
                ↓
Enhanced 360° Core Set → POST /api/v1/characters/{id}/generate-360-set (ASYNC)
                       ↓
Background Job Processing → Returns Job ID → Poll for Progress
                       ↓
Professional Reference Library (27 shots):
├── Core 9 Essential: 3 lenses × 3 angles
│   ├── 35mm (Action/Body): Front, ¾ Left, ¾ Right
│   ├── 50mm (Conversation): Front, ¾ Left, ¾ Right
│   └── 85mm (Emotion): Front, ¾ Left, ¾ Right
└── Add-on Shots: Profile L/R, Back, Hands, T-pose, Expressions
                       ↓
Structured Metadata → Technical specs, shot classification, quality metrics
                    ↓
Scene Images → POST /api/v1/characters/{id}/generate-scene-image
             ↓
Smart Image Generation → POST /api/v1/characters/{id}/generate-smart-image

⚠️ RESET FLOW:
DELETE /api/v1/characters/{id}/reference-image → Clears ALL derived content
                                               ↓
                                    Character reset to base state
                                               ↓
                                    Must restart from generate-initial-image
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

### Project Management Layer
- **Preview**: `GET /api/v1/characters/projects/{projectId}` - Safe preview of deletion scope
- **Cleanup**: `DELETE /api/v1/characters/projects/{projectId}` - Complete project data removal

### Search & Discovery Layer
- **Similarity Search**: `POST /api/v1/characters/search` - Analyzes existing characters
- **Knowledge Query**: `POST /api/v1/characters/query` - Requires PathRAG sync

### Async Job Management Layer (NEW)
- **Job Status**: `GET /api/v1/jobs/{jobId}/status` - Monitor background job progress
- **Job Cancellation**: `DELETE /api/v1/jobs/{jobId}/status` - Cancel running jobs
- **Job Listing**: `GET /api/v1/jobs` - List and filter background jobs
- **Dependencies**:
  ├── Requires valid job ID from generate-360-set
  ├── Job status polling for external app integration
  └── Background service must be running
- **Query Stats**: `GET /api/v1/characters/query` - PathRAG health check

### Enhanced Image Generation Layer
```
Character Data (Required)
    ↓
generate-initial-image (First image with exact prompt)
    ↓
reference-image (Set master reference)
    ↓
generate-core-set (Enhanced 360° professional reference set - sync)
    ├── Core 9 Essential Shots (3 lenses × 3 angles)
    ├── Add-on Shots (profiles, back, hands, poses)
    ├── Technical Metadata (lens, f-stop, ISO, etc.)
    └── Quality Metrics (consistency, validation scores)
    ↓
generate-360-set (ASYNC - Background processing)
    ├── Returns job ID immediately
    ├── Background processing (27 shots)
    ├── Real-time progress tracking
    └── Poll for completion
    ↓
generate-smart-image (AI-powered reference selection)
    ↓
generate-scene-image (Context-specific images)

⚠️ CRITICAL DEPENDENCY:
DELETE reference-image → RESETS ALL:
- Core set (360° images)
- Image gallery with metadata
- Quality metrics
- Scene images
- Validation history
- Technical specifications
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

### Enhanced Image Asset Management
- **Reference Chain**: initial → reference → enhanced 360° core set → scene images → smart images
- **Professional Metadata**: Technical specs (lens, f-stop, ISO, shutter), composition details, shot classification
- **Quality Tracking**: Individual image quality scores, consistency metrics, validation status
- **Asset Linking**: Images linked to character records, DINOv3 asset IDs, and reference shot templates
- **Smart File Naming**: Standardized naming convention: `{CHAR}_{LENS}{MODE}_{ANGLE}_{CROP}_{EXPR}_v{N}.jpg`
- **Unified Image Access**: `GET /api/v1/characters/{id}/images` - **NEW**: Single endpoint for all character images organized by category

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

### Batch Operations & Async Processing
- Bulk endpoints for multiple character operations
- **Async 360° Generation**: Background processing prevents timeouts
- **Real-time Progress Tracking**: Monitor job status and current task
- **Job Management**: Start, monitor, cancel, and list background jobs
- **External App Integration**: Perfect for long-running operations

## 🆕 DINOv3 Integration Architecture

### Service Integration Flow
```
Character Library API ←→ DINOv3 Service (https://dino.ft.tc)
                    ↓
Image Processing Pipeline:
1. Image Generation Complete
2. R2 Storage Upload
3. DINOv3 Upload & Processing
4. Feature Extraction
5. Asset ID Assignment
6. Media Record Update
```

### Data Flow with DINOv3
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Image         │    │   DINOv3        │    │   Media         │
│   Generation    │───►│   Processing    │───►│   Management    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   R2 Storage    │    │   Feature       │    │   URL           │
│   Upload        │    │   Extraction    │    │   Prioritization│
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Error Handling & Fallbacks
```
DINOv3 Processing Success:
├── Asset ID assigned
├── DINOv3 media URL available
├── Feature extraction complete
└── Smart reference selection enabled

DINOv3 Processing Failure:
├── Graceful degradation to PayloadCMS URLs
├── Error logging and monitoring
├── Retry mechanisms for transient failures
└── Manual recovery procedures available
```

## 🎯 Prompt Control Integration

### Processing Flow
```
User Prompt Input → Prompt Control System → Image Generation
                 ↓
Style Detection: 'none' for initial images
                 ↓
Bypass Enhancement → Exact Prompt Preservation
                 ↓
Fal.ai API Call → Image Generation → DINOv3 Processing
```

### Logging & Debugging
```
Console Output Chain:
1. "Original user prompt: [exact text]"
2. "🚫 PROMPT MODIFICATION DISABLED"
3. "🎨 FINAL PROMPT SENT TO FAL.AI: [exact text]"
4. "Fal.ai request parameters: {...}"
5. "DINOv3 processing: processing - Asset ID: [id]"
6. "✓ Image generated successfully"
```

### Rate Limiting
- Image generation endpoints have rate limits
- Query endpoints have usage quotas
- Bulk operations have concurrency limits

## 🆕 Recent System Enhancements

### DINOv3 Integration Improvements
```
Enhanced Upload Process:
1. Image Generation Complete → R2 Storage Upload
2. Robust Image Download → Buffer Validation
3. DINOv3 Upload with Retry Logic → Asset ID Assignment
4. Feature Extraction → Quality Validation Complete

Success Rate Improvement: 60% → 100%
```

### Prompt Control System
```
Initial Image Generation Flow:
User Prompt → Style Detection ('none') → Bypass Enhancement → Exact Prompt → FAL.ai
                                                                              ↓
Console Logging Chain:                                              Image Generation
1. "Original user prompt: [exact text]"                                     ↓
2. "🚫 PROMPT MODIFICATION DISABLED"                              DINOv3 Processing
3. "🎨 FINAL PROMPT SENT TO FAL.AI: [exact text]"                          ↓
                                                                    Asset ID Assignment
```

### Enhanced Error Handling
```
Error Recovery Workflow:
API Request → Validation → Processing → Error Detection → Retry Logic → Success/Failure
                                              ↓
                                    Detailed Error Logging:
                                    - Request/Response details
                                    - DINOv3 processing status
                                    - Prompt transformation chain
                                    - Actionable error messages
```
