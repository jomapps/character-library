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

### Enhanced 360° Professional Reference Set Generation
```
1. Initial Reference Image
   POST /api/v1/characters/{id}/generate-initial-image
   ├── Uses exact user prompt (no modifications)
   ├── Creates master reference with DINOv3 processing
   └── Sets baseline visual identity

2. Set Master Reference
   PUT /api/v1/characters/{id}/reference-image
   ├── Confirms master image
   ├── Updates character record
   └── Enables advanced generation

3. Generate Enhanced 360° Core Set
   POST /api/v1/characters/{id}/generate-core-set
   ├── Core 9 Essential Shots:
   │   ├── 35mm (Action/Body): Front, ¾ Left, ¾ Right
   │   ├── 50mm (Conversation): Front, ¾ Left, ¾ Right
   │   └── 85mm (Emotion): Front, ¾ Left, ¾ Right
   ├── Optional Add-on Shots:
   │   ├── Profile L/R (85mm)
   │   ├── Back Full (35mm)
   │   ├── Hands Close-up (macro)
   │   ├── T-pose Calibration (35mm)
   │   └── Expression Variations (50mm)
   ├── Technical Metadata:
   │   ├── Camera settings (lens, f-stop, ISO, shutter)
   │   ├── Composition details (angle, crop, expression)
   │   └── Quality metrics (consistency, validation scores)
   └── Professional File Naming: {CHAR}_{LENS}{MODE}_{ANGLE}_{CROP}_{EXPR}_v{N}.jpg

4. Smart Image Generation
   POST /api/v1/characters/{id}/generate-smart-image
   ├── AI-powered reference selection
   ├── Intelligent prompt analysis
   ├── Quality validation and retry logic
   └── Optimal reference image matching

5. Scene-Specific Images
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
   Must restart enhanced image generation workflow:
   ├── POST /api/v1/characters/{id}/generate-initial-image
   ├── PUT /api/v1/characters/{id}/reference-image
   ├── POST /api/v1/characters/{id}/generate-core-set (Enhanced 360° system)
   ├── POST /api/v1/characters/{id}/generate-smart-image (Optional)
   └── POST /api/v1/characters/{id}/generate-scene-image
```

### Enhanced Image Quality Workflow
```
1. Generation with Quality Threshold
   All image endpoints support qualityThreshold parameter
   ├── Minimum quality: 75/100 (configurable)
   ├── Individual shot quality tracking
   ├── Consistency score validation
   ├── Retry on low quality with different parameters
   └── Track comprehensive quality metrics

2. Professional Quality Validation
   GET /api/v1/characters/{id}/quality-metrics
   ├── Visual consistency score across all shots
   ├── Individual reference image quality scores
   ├── Technical metadata validation
   ├── Core set completion status
   └── Generation success rate statistics

3. Quality Improvement Process
   If quality < threshold:
   ├── Analyze failed shots and reasons
   ├── Regenerate with adjusted camera parameters
   ├── Update reference images with better alternatives
   ├── Recalculate comprehensive metrics
   └── Validate against professional standards

4. Core Set Quality Assurance
   Enhanced 360° core set includes:
   ├── Quality score per shot (0-100)
   ├── Consistency score per shot (0-100)
   ├── Technical validation (metadata completeness)
   ├── Professional standards compliance
   └── Overall set quality assessment
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
   ├── MongoDB ObjectId (id) → Database operations (24-char hex: 68c07c4305803df129909509)
   ├── Business ID (characterId) → Human-readable references (68bc1741-leo-1757445189931-190445-8a70d8f1-389)
   ├── External Service IDs → DINOv3, PathRAG, FAL.ai
   └── Project IDs → Novel Movie integration

2. API Response Consistency
   All character endpoints return:
   ├── id: MongoDB ObjectId (for database operations)
   ├── characterId: Business identifier (for display/search)
   ├── External service IDs when applicable
   └── Proper error handling for ID mismatches

3. Service Integration ID Mapping
   ├── DINOv3: dinoAssetId for media assets
   ├── PathRAG: characterId (business ID) for knowledge base
   ├── FAL.ai: Request IDs for image generation
   └── Novel Movie: projectId for project association

4. UI/API Consistency Rules
   ├── Character Profile shows both "CharacterID" and "DB ID"
   ├── API testing forms specify which ID type to use
   ├── Documentation examples use real MongoDB ObjectId format
   └── Error messages guide users to correct ID type
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

## 8. Enhanced 360° Professional Reference Workflow

### Professional Shot Template System
```
1. Core 9 Essential Shots (3×3 Matrix)
   Lenses: 35mm (Action/Body), 50mm (Conversation), 85mm (Emotion)
   Angles: FRONT, ¾ LEFT, ¾ RIGHT

   Technical Specifications:
   ├── 35mm shots: f/4, ISO 200, 1/250s (full body clarity, wardrobe)
   ├── 50mm shots: f/2.8, ISO 200, 1/250s (dialogue singles, conversation mode)
   └── 85mm shots: f/2.5, ISO 200, 1/250s (emotional beats, micro expressions)

2. Add-on Professional Shots (6+ Additional)
   ├── Profile L/R (85mm): Character side views
   ├── Back Full (35mm): Rear view for complete reference
   ├── Hands Close-up (macro): Detail shots for animation reference
   ├── T-pose Calibration (35mm): Technical reference pose
   └── Expression Variations (50mm): Neutral, Determined, Concerned

3. Universal Prompt Template System
   Base Template:
   "Ultra detailed, photorealistic studio reference of {CHARACTER};
   physique/traits: {PHYSIQUE_TRAITS}; personality cues: {PERSONALITY};
   neutral seamless studio background; natural/soft key fill; HDR;
   camera: {LENS}mm, f/{FSTOP}, ISO {ISO}, 1/{SHUTTER}s;
   composition: {CROP} crop, {ANGLE} angle, matched eye level;
   reference_image: {REF_URL} | reference_weight: {0.85-0.95}
   --negatives: CGI, 3D, illustration, cartoon, uncanny valley, extra limbs"
```

### Generation Execution Workflow
```
1. Pre-Generation Setup
   ├── Validate master reference image exists
   ├── Extract character traits and personality
   ├── Prepare shot templates with metadata
   └── Set quality thresholds and retry limits

2. Core 9 Generation Process
   For each shot in Core 9:
   ├── Apply shot-specific template
   ├── Generate with consistent reference weight (0.85-0.95)
   ├── Validate quality and consistency scores
   ├── Retry with adjusted parameters if needed
   └── Store with structured metadata

3. Add-on Shots (Optional)
   If includeAddonShots = true:
   ├── Generate profile shots (L/R)
   ├── Generate back view and hands close-up
   ├── Generate T-pose calibration
   ├── Generate expression variations
   └── Apply same quality validation process

4. Post-Generation Processing
   ├── Update character imageGallery with all shots
   ├── Set coreSetGenerated = true
   ├── Calculate overall quality metrics
   ├── Store generation statistics and metadata
   └── Enable advanced image generation features
```

## 9. DINOv3 Integration Workflow

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

## 10. Migration & Upgrade Workflow

### For Existing Users
```
Migration Path (No Breaking Changes):
1. Existing Functionality Preserved
   ├── All current API endpoints work unchanged
   ├── Existing prompt enhancement behavior maintained
   ├── Current image generation workflows continue
   └── No code changes required

2. Enhanced Features Available
   ├── Improved error handling and recovery
   ├── Better DINOv3 integration reliability
   ├── Enhanced logging for troubleshooting
   └── Opt-in prompt control features

3. UI Improvements
   ├── Character Profile shows both ID types clearly
   ├── API testing forms include helpful guidance
   ├── Search functionality clarified
   └── Error messages provide actionable guidance
```

### For Developers
```
Development Workflow Updates:
1. New Style Option Available
   ├── Use style: 'none' for unmodified prompts
   ├── Automatic application for initial image generation
   ├── Detailed logging for prompt transformation
   └── Backward compatibility maintained

2. Enhanced Debugging Capabilities
   ├── Comprehensive request/response logging
   ├── DINOv3 processing status tracking
   ├── Step-by-step prompt modification logs
   └── Rich error context with actionable information

3. DINOv3 Integration Benefits
   ├── Automatic asset ID management
   ├── Improved upload success rates (100%)
   ├── Quality validation and error handling
   └── Intelligent URL prioritization system
```

## 11. Future Enhancement Roadmap

### Planned Features
```
Short-term (Next Quarter):
├── Batch image processing with DINOv3
├── Advanced similarity matching algorithms
├── Custom prompt enhancement profiles
└── Real-time processing status updates

Medium-term (6 months):
├── Enhanced quality metrics integration
├── DINOv3 processing metrics dashboard
├── Prompt modification analytics
└── Image quality trend analysis

Long-term (1 year):
├── Error rate monitoring and alerting
├── Advanced workflow automation
├── Multi-model image generation support
└── Enhanced relationship visualization
```

### Monitoring & Observability
```
Planned Monitoring Features:
├── DINOv3 processing metrics dashboard
├── Prompt modification analytics
├── Image quality trend analysis
├── Error rate monitoring and alerting
├── Performance metrics tracking
└── User workflow analytics
```

## 12. Project Data Management Workflow

### Safe Project Cleanup Process
```
1. Preview Deletion (Dry Run)
   ├── GET /api/v1/characters/projects/{projectId}
   ├── Review characters and media count
   ├── Verify project scope is correct
   └── Confirm deletion is intended

2. Execute Deletion
   ├── DELETE /api/v1/characters/projects/{projectId}
   ├── Characters deleted from database
   ├── Media files removed from storage
   ├── PathRAG entities cleaned up
   └── Detailed summary provided

3. Verification
   ├── Check deletion summary for errors
   ├── Verify character count is zero
   ├── Confirm media cleanup completed
   └── Validate PathRAG cleanup success
```

### Project Cleanup Use Cases
```
Development Cleanup:
├── Remove corrupted test data
├── Clean up failed experiments
├── Reset development environment
└── Remove abandoned prototypes

Production Maintenance:
├── Archive completed projects
├── Remove deprecated characters
├── Clean up unused media assets
└── Maintain database hygiene

Emergency Recovery:
├── Remove corrupted project data
├── Clean up after failed imports
├── Reset project to known good state
└── Recover from data corruption
```

### Safety Features
```
Built-in Protections:
├── Preview mode shows exact deletion scope
├── Detailed logging of all operations
├── Error handling with partial success reporting
├── No cascading deletions beyond project scope
└── Comprehensive operation summary

Best Practices:
├── Always preview before deletion
├── Backup critical projects before cleanup
├── Use during low-traffic periods
├── Monitor logs for any errors
└── Verify results after completion
```

## 13. Voice & Dialogue Management Workflow

### Character Voice Development Process
```
1. Character Creation with Voice Profile
   ├── Define basic character traits
   ├── Set narrative role and archetype
   ├── Establish psychology and character arc
   └── Create initial voice description

2. Dialogue Voice Profile Setup
   ├── POST /api/v1/characters/novel-movie
   ├── Define voice style and characteristics
   ├── Set speech patterns and vocabulary
   └── Document voice description details

3. Voice Model Integration
   ├── Add voice models (ElevenLabs, OpenAI TTS)
   ├── Set voice IDs for each model
   ├── Upload voice samples to media collection
   └── Link samples to voice models

4. Voice Sample Management
   ├── Upload audio files via media collection
   ├── Associate samples with voice models
   ├── Test voice generation with different models
   └── Refine voice IDs based on results
```

### Voice Generation Workflow
```
Voice Model Setup:
├── Character created with dialogueVoice profile
├── Voice models added with model names
├── Voice IDs configured for each model
├── Voice samples uploaded and linked
└── Ready for TTS integration

TTS Integration Process:
├── Select appropriate voice model
├── Use voice ID for generation
├── Apply speech patterns from profile
├── Generate audio with character voice
└── Validate against voice samples

Quality Assurance:
├── Compare generated voice to samples
├── Verify speech patterns are followed
├── Check vocabulary consistency
├── Test different dialogue contexts
└── Refine voice profile as needed
```

### Voice Data Structure
```
Character Voice Fields:
├── dialogueVoice (group)
│   ├── voiceDescription (rich text)
│   ├── style (text)
│   ├── patterns (array of speech patterns)
│   └── vocabulary (textarea)
├── voiceModels (array)
│   ├── modelName (ElevenLabs, OpenAI TTS, etc.)
│   ├── voiceId (model-specific identifier)
│   └── voiceSample (media relationship)
└── voiceDescription (legacy field)

Media Collection Support:
├── Audio file upload capability
├── Voice sample storage
├── DINOv3 processing skipped for audio
├── Direct URL access for playback
└── Relationship linking to characters
```

### Voice Workflow Use Cases
```
Character Development:
├── Create consistent character voice
├── Define speech patterns and style
├── Document vocabulary preferences
└── Establish voice evolution arc

Production Workflow:
├── Generate dialogue audio
├── Maintain voice consistency
├── Apply character-specific patterns
└── Quality check against samples

Voice Model Management:
├── Test multiple TTS services
├── Compare voice quality
├── Switch between voice models
└── Maintain backup voice options

Audio Asset Management:
├── Store reference voice samples
├── Organize by character and model
├── Version control voice changes
└── Archive unused voice assets
```
