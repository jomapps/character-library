# Character Library Workflows

## 1. Novel Movie Character Creation Workflow

### Standard Character Creation
```
1. Novel Movie App creates character
   POST /api/v1/characters/novel-movie
   ├── Validates character data
   ├── Generates unique character ID
   ├── Creates character record
   └── Sets up Novel Movie integration

2. Automatic PathRAG Sync
   POST /api/v1/pathrag/manage (internal)
   ├── Extracts character knowledge
   ├── Indexes character data
   └── Enables natural language queries

3. Initial Quality Assessment
   GET /api/v1/characters/{id}/quality-metrics
   ├── Analyzes data completeness
   ├── Checks for missing fields
   └── Generates baseline metrics

4. Optional: Initial Image Generation
   POST /api/v1/characters/{id}/generate-initial-image
   ├── Uses exact user prompt (no modifications)
   ├── Generates image via Fal.ai nano-banana model
   ├── Uploads to R2 storage
   ├── Processes with DINOv3 for feature extraction
   ├── Assigns unique DINOv3 asset ID
   ├── Updates character record with master reference
   └── Triggers quality recalculation
```

### Duplicate Prevention Workflow
```
1. Pre-Creation Search
   POST /api/v1/characters/search
   ├── Query: character description
   ├── Similarity threshold: 0.7+
   └── Returns potential duplicates

2. Decision Point
   If similar characters found:
   ├── Use existing character
   ├── Update with new project association
   └── Skip creation
   
   If no similar characters:
   ├── Proceed with creation
   └── Continue to standard workflow
```

## 2. Character Image Generation Workflow

### Complete Image Set Generation
```
1. Initial Reference Image
   POST /api/v1/characters/{id}/generate-initial-image
   ├── Uses character description
   ├── Creates master reference
   └── Sets baseline visual identity

2. Set Master Reference
   PUT /api/v1/characters/{id}/reference-image
   ├── Confirms master image
   ├── Updates character record
   └── Enables advanced generation

3. Generate 360° Reference Set
   POST /api/v1/characters/{id}/generate-360-set
   ├── Creates 8 angle views
   ├── Maintains visual consistency
   └── Builds complete reference library

4. Scene-Specific Images
   POST /api/v1/characters/{id}/generate-scene-image
   ├── Context-aware generation
   ├── Mood and lighting adaptation
   └── Scene-specific variations
```

### Master Reference Reset Workflow
```
⚠️ CRITICAL OPERATION: Complete Character Reset

1. Delete Master Reference
   DELETE /api/v1/characters/{id}/reference-image
   ├── Removes master reference image
   ├── Resets processing status
   └── Clears quality metrics

2. Cascade Reset (Automatic)
   ├── Core set generation status → false
   ├── Image gallery → cleared
   ├── Quality metrics → reset
   ├── Scene context images → cleared
   └── Validation history → cleared

3. Character State After Reset
   ├── Character data preserved (name, bio, etc.)
   ├── Novel Movie integration preserved
   ├── Relationships preserved
   └── All visual content removed

4. Recovery Path
   Must restart image generation workflow:
   ├── POST /api/v1/characters/{id}/generate-initial-image
   ├── PUT /api/v1/characters/{id}/reference-image
   ├── POST /api/v1/characters/{id}/generate-360-set
   └── POST /api/v1/characters/{id}/generate-scene-image
```

### Image Quality Workflow
```
1. Generation with Quality Threshold
   All image endpoints support qualityThreshold parameter
   ├── Minimum quality: 75/100
   ├── Retry on low quality
   └── Track quality metrics

2. Quality Validation
   GET /api/v1/characters/{id}/quality-metrics
   ├── Visual consistency score
   ├── Reference image quality
   └── Generation success rate

3. Quality Improvement
   If quality < threshold:
   ├── Regenerate with adjusted parameters
   ├── Update reference images
   └── Recalculate metrics
```

## 3. Character Discovery & Search Workflow

### Natural Language Query Workflow
```
1. Knowledge Base Query
   POST /api/v1/characters/query
   ├── Natural language input
   ├── PathRAG processing
   └── Contextual character information

2. Query Optimization
   GET /api/v1/characters/query?action=stats
   ├── Check knowledge base health
   ├── Verify indexing status
   └── Optimize query parameters

3. Result Processing
   ├── Multiple response formats
   ├── Relevance scoring
   └── Character detail linking
```

### Similarity Search Workflow
```
1. Character Similarity Analysis
   POST /api/v1/characters/search
   ├── Text similarity matching
   ├── Physical attribute comparison
   ├── Personality trait analysis
   └── Configurable similarity threshold

2. Project-Scoped Search
   ├── Limit search to specific project
   ├── Cross-project duplicate detection
   └── Global character discovery

3. Search Result Actions
   ├── Use existing similar character
   ├── Modify existing character
   └── Create new character with awareness
```

## 4. Character Validation & Quality Workflow

### Individual Character Validation
```
1. Comprehensive Quality Check
   GET /api/v1/characters/{id}/quality-metrics
   ├── Data completeness analysis
   ├── Visual consistency scoring
   ├── Relationship integrity check
   └── Historical quality tracking

2. Consistency Validation
   POST /api/v1/characters/{id}/validate-consistency
   ├── Cross-reference validation
   ├── Image-text alignment check
   ├── Narrative consistency analysis
   └── Issue identification

3. Quality Improvement Actions
   Based on validation results:
   ├── Fill missing data fields
   ├── Regenerate inconsistent images
   ├── Update character descriptions
   └── Resolve narrative conflicts
```

### Project-Wide Validation Workflow
```
1. Project Consistency Check
   POST /api/v1/characters/validate-project-consistency
   ├── Cross-character consistency
   ├── Relationship validation
   ├── Visual style consistency
   └── Narrative coherence

2. Batch Character Validation
   POST /api/v1/characters/batch-validate
   ├── Multiple character processing
   ├── Parallel validation execution
   ├── Aggregated quality reporting
   └── Bulk issue identification

3. Project Quality Dashboard
   ├── Overall project health score
   ├── Character-by-character breakdown
   ├── Priority issue identification
   └── Improvement recommendations
```

## 5. Character Relationship Management Workflow

### Relationship Creation & Management
```
1. Define Character Relationships
   POST /api/v1/characters/{id}/relationships
   ├── Relationship type definition
   ├── Bidirectional relationship setup
   ├── Relationship strength scoring
   └── Context and history tracking

2. Relationship Visualization
   GET /api/v1/characters/relationships/graph
   ├── Network graph generation
   ├── Relationship strength visualization
   ├── Character cluster identification
   └── Narrative connection mapping

3. Relationship Image Generation
   POST /api/v1/characters/generate-relationship-image
   ├── Multi-character scene generation
   ├── Relationship dynamic visualization
   ├── Interaction context rendering
   └── Emotional tone representation
```

## 6. Novel Movie Synchronization Workflow

### Bidirectional Sync Process
```
1. Character Data Sync
   PUT /api/v1/characters/{id}/novel-movie-sync
   ├── Detect data changes
   ├── Apply conflict resolution rules
   ├── Update character records
   └── Log sync history

2. Project-Level Sync
   GET /api/v1/characters/by-project/{projectId}
   ├── Retrieve all project characters
   ├── Batch sync operations
   ├── Project consistency maintenance
   └── Sync status reporting

3. Conflict Resolution
   Configurable resolution strategies:
   ├── Novel Movie wins
   ├── Character Library wins
   ├── Manual resolution required
   └── Merge strategies
```

## 7. Bulk Operations Workflow

### Bulk Character Creation
```
1. Bulk Novel Movie Import
   POST /api/v1/characters/bulk/novel-movie
   ├── Multiple character processing
   ├── Batch validation
   ├── Parallel creation
   └── Progress tracking

2. Batch Scene Generation
   POST /api/v1/characters/batch-generate-scenes
   ├── Multiple character scene images
   ├── Consistent scene context
   ├── Parallel image generation
   └── Quality aggregation
```

## 8. Error Handling & Recovery Workflows

### Failure Recovery
```
1. Image Generation Failures
   ├── Automatic retry with adjusted parameters
   ├── Fallback to previous reference images
   ├── Quality threshold adjustment
   └── Manual intervention triggers

2. Sync Failures
   ├── Queue failed sync operations
   ├── Background retry mechanisms
   ├── Conflict resolution workflows
   └── Manual sync triggers

3. Data Consistency Issues
   ├── Automatic consistency checks
   ├── Issue identification and flagging
   ├── Suggested resolution actions
   └── Manual review workflows
```

## 9. ID Consistency & Data Integrity Workflows

### ID Type Management
```
1. Character Identification
   ├── MongoDB ObjectId (id) → Database operations
   ├── Business ID (characterId) → Human-readable references
   ├── External Service IDs → DINOv3, PathRAG, FAL.ai
   └── Project IDs → Novel Movie integration

2. API Response Consistency
   All character endpoints return:
   ├── id: MongoDB ObjectId
   ├── characterId: Business identifier
   ├── External service IDs when applicable
   └── Proper error handling for ID mismatches

3. Service Integration ID Mapping
   ├── DINOv3: dinoAssetId for media assets
   ├── PathRAG: characterId for knowledge base
   ├── FAL.ai: Request IDs for image generation
   └── Novel Movie: projectId for project association
```

### Data Integrity Validation
```
1. ID Consistency Checks
   ├── Validate MongoDB ObjectId format
   ├── Verify characterId uniqueness
   ├── Check external service ID mapping
   └── Ensure relationship ID validity

2. Cascade Validation
   When master reference deleted:
   ├── Verify all dependent data cleared
   ├── Check external service cleanup
   ├── Validate relationship integrity
   └── Confirm quality metric reset

3. Recovery Procedures
   ├── ID mismatch resolution
   ├── Orphaned reference cleanup
   ├── Service synchronization repair
   └── Data consistency restoration
```

## 8. DINOv3 Integration Workflow

### Image Processing Pipeline
```
1. Image Generation Complete
   ├── Image stored in R2 with public URL
   ├── Image buffer available for processing
   └── Character record updated with media reference

2. DINOv3 Upload Process
   POST https://dino.ft.tc/api/v1/upload-media
   ├── Download image from R2 public URL
   ├── Validate image format and integrity
   ├── Upload to DINOv3 service
   └── Receive unique asset ID

3. Feature Extraction
   DINOv3 Processing Pipeline:
   ├── Image analysis and feature extraction
   ├── Quality assessment and validation
   ├── Similarity vector generation
   └── Asset metadata creation

4. Integration Complete
   ├── Update media record with DINOv3 asset ID
   ├── Store DINOv3 media URL (if provided)
   ├── Enable similarity matching capabilities
   └── Ready for smart reference selection
```

### Error Handling & Recovery
```
1. Upload Failures
   ├── Invalid image format detection
   ├── Corrupted file handling
   ├── Network timeout recovery
   └── Retry mechanism with exponential backoff

2. Processing Failures
   ├── DINOv3 service unavailable
   ├── Feature extraction errors
   ├── Asset ID assignment failures
   └── Graceful degradation to PayloadCMS URLs

3. URL Prioritization System
   Priority 1: DINOv3 media URL
   ├── Best performance and features
   └── Direct access to processed assets

   Priority 2: PayloadCMS URL
   ├── Reliable fallback option
   └── Standard media delivery

   Priority 3: Constructed fallback URL
   ├── Emergency access method
   └── Ensures image availability
```

## 9. Prompt Control System Workflow

### Exact Prompt Processing
```
1. User Prompt Received
   ├── Original prompt logged for tracking
   ├── Style parameter set to 'none' (automatic)
   └── No modifications applied

2. Image Generation Request
   POST Fal.ai nano-banana model
   ├── Exact user prompt sent to AI model
   ├── No style-based enhancements added
   ├── No reference sheet formatting applied
   └── Pure user intent preserved

3. Detailed Logging
   Console Output:
   ├── "Original user prompt: [exact text]"
   ├── "🚫 PROMPT MODIFICATION DISABLED"
   ├── "🎨 FINAL PROMPT SENT TO FAL.AI: [exact text]"
   └── Full request parameters logged

4. Quality Assurance
   ├── Prompt integrity verification
   ├── Character encoding preservation
   ├── Special character handling
   └── Length validation (within model limits)
```

### Legacy Compatibility
```
For other endpoints (non-initial image generation):
├── Standard prompt enhancement still available
├── Style-based modifications preserved
├── Reference sheet formatting maintained
└── Backward compatibility ensured
```
