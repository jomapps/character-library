export interface ApiEndpoint {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description: string
  category: string
  fields: ApiField[]
  examples?: any[]
}

export interface ApiField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'select'
  required: boolean
  description: string
  placeholder?: string
  options?: string[]
  defaultValue?: any
}

export const apiEndpoints: ApiEndpoint[] = [
  // Character Management
  {
    id: 'characters-list',
    name: 'List Characters',
    method: 'GET',
    path: '/api/v1/characters',
    description: 'Get all characters from the database',
    category: 'Character Management',
    fields: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of characters to return',
        placeholder: '10',
        defaultValue: 10
      },
      {
        name: 'page',
        type: 'number',
        required: false,
        description: 'Page number for pagination',
        placeholder: '1',
        defaultValue: 1
      }
    ]
  },
  {
    id: 'characters-get',
    name: 'Get Character',
    method: 'GET',
    path: '/api/v1/characters/{id}',
    description: 'Get a specific character by ID',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      }
    ]
  },
  {
    id: 'characters-create',
    name: 'Create Character',
    method: 'POST',
    path: '/api/v1/characters',
    description: 'Create a new character',
    category: 'Character Management',
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Character name',
        placeholder: 'Enter character name'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Character description',
        placeholder: 'Enter character description'
      },
      {
        name: 'persona',
        type: 'object',
        required: false,
        description: 'Character persona data (JSON)',
        placeholder: '{"traits": [], "background": ""}'
      }
    ]
  },
  {
    id: 'characters-update',
    name: 'Update Character',
    method: 'PATCH',
    path: '/api/v1/characters/{id}',
    description: 'Update an existing character',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      },
      {
        name: 'name',
        type: 'string',
        required: false,
        description: 'Character name',
        placeholder: 'Enter character name'
      },
      {
        name: 'description',
        type: 'string',
        required: false,
        description: 'Character description',
        placeholder: 'Enter character description'
      }
    ]
  },
  {
    id: 'characters-delete',
    name: 'Delete Character',
    method: 'DELETE',
    path: '/api/v1/characters/{id}',
    description: 'Delete a character',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      }
    ]
  },
  {
    id: 'characters-generate-core-set',
    name: 'Generate Core Set',
    method: 'POST',
    path: '/api/v1/characters/{id}/generate-core-set',
    description: 'Generate 360° core reference set for a character',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      },
      {
        name: 'options',
        type: 'object',
        required: false,
        description: 'Generation options (JSON)',
        placeholder: '{"style": "realistic", "quality": "high"}'
      }
    ]
  },
  {
    id: 'characters-generate-image',
    name: 'Generate Image',
    method: 'POST',
    path: '/api/v1/characters/{id}/generate-image',
    description: 'Generate a new image for a character',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      },
      {
        name: 'prompt',
        type: 'string',
        required: false,
        description: 'Custom prompt for image generation',
        placeholder: 'Enter custom prompt'
      },
      {
        name: 'style',
        type: 'string',
        required: false,
        description: 'Image style',
        placeholder: 'realistic, anime, cartoon, etc.'
      }
    ]
  },
  {
    id: 'characters-generate-smart-image',
    name: 'Generate Smart Image',
    method: 'POST',
    path: '/api/v1/characters/{id}/generate-smart-image',
    description: 'Generate an intelligent image using reference selection',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      },
      {
        name: 'prompt',
        type: 'string',
        required: false,
        description: 'Custom prompt for image generation',
        placeholder: 'Enter custom prompt'
      },
      {
        name: 'useSmartSelection',
        type: 'boolean',
        required: false,
        description: 'Use smart reference selection',
        defaultValue: true
      }
    ]
  },
  {
    id: 'characters-generate-initial-image',
    name: 'Generate Initial Image',
    method: 'POST',
    path: '/api/v1/characters/{id}/generate-initial-image',
    description: 'Generate the first image for a character',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      },
      {
        name: 'prompt',
        type: 'string',
        required: false,
        description: 'Custom prompt for image generation',
        placeholder: 'Enter custom prompt'
      }
    ]
  },
  {
    id: 'characters-validate-consistency',
    name: 'Validate Consistency',
    method: 'POST',
    path: '/api/v1/characters/{id}/validate-consistency',
    description: 'Validate character consistency across images',
    category: 'Character Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'Enter character ID'
      },
      {
        name: 'threshold',
        type: 'number',
        required: false,
        description: 'Consistency threshold (0-1)',
        placeholder: '0.8',
        defaultValue: 0.8
      }
    ]
  },

  // Character Query (PathRAG)
  {
    id: 'characters-query',
    name: 'Query Characters',
    method: 'POST',
    path: '/api/v1/characters/query',
    description: 'Query character knowledge base with natural language',
    category: 'Character Query',
    fields: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Natural language query',
        placeholder: 'Tell me about characters with blue eyes'
      },
      {
        name: 'responseType',
        type: 'select',
        required: false,
        description: 'Response format',
        options: ['Multiple Paragraphs', 'Single Paragraph', 'Bullet Points', 'Detailed Explanation'],
        defaultValue: 'Multiple Paragraphs'
      },
      {
        name: 'topK',
        type: 'number',
        required: false,
        description: 'Number of top results to consider',
        placeholder: '40',
        defaultValue: 40
      },
      {
        name: 'onlyContext',
        type: 'boolean',
        required: false,
        description: 'Return only context without generated response',
        defaultValue: false
      }
    ]
  },
  {
    id: 'characters-query-stats',
    name: 'Query Stats',
    method: 'GET',
    path: '/api/v1/characters/query',
    description: 'Get PathRAG knowledge base statistics',
    category: 'Character Query',
    fields: [
      {
        name: 'action',
        type: 'string',
        required: true,
        description: 'Action type',
        defaultValue: 'stats'
      }
    ]
  },
  {
    id: 'characters-query-health',
    name: 'Query Health',
    method: 'GET',
    path: '/api/v1/characters/query',
    description: 'Check PathRAG service health',
    category: 'Character Query',
    fields: [
      {
        name: 'action',
        type: 'string',
        required: true,
        description: 'Action type',
        defaultValue: 'health'
      }
    ]
  },

  // PathRAG Management
  {
    id: 'pathrag-manage',
    name: 'PathRAG Management',
    method: 'POST',
    path: '/api/v1/pathrag/manage',
    description: 'Perform PathRAG knowledge base management operations',
    category: 'PathRAG Management',
    fields: [
      {
        name: 'action',
        type: 'select',
        required: true,
        description: 'Management action',
        options: ['sync_all', 'sync_character', 'delete_entity', 'health_check', 'get_stats']
      },
      {
        name: 'characterId',
        type: 'string',
        required: false,
        description: 'Character ID (required for sync_character)',
        placeholder: 'Enter character ID'
      },
      {
        name: 'entityName',
        type: 'string',
        required: false,
        description: 'Entity name (required for delete_entity)',
        placeholder: 'Enter entity name'
      },
      {
        name: 'force',
        type: 'boolean',
        required: false,
        description: 'Force operation (for sync_all)',
        defaultValue: false
      }
    ]
  },
  {
    id: 'pathrag-info',
    name: 'PathRAG Info',
    method: 'GET',
    path: '/api/v1/pathrag/manage',
    description: 'Get PathRAG management interface information',
    category: 'PathRAG Management',
    fields: []
  },

  // Quality Assurance
  {
    id: 'qa-run',
    name: 'Run QA',
    method: 'POST',
    path: '/api/v1/qa',
    description: 'Run quality assurance on assets',
    category: 'Quality Assurance',
    fields: [
      {
        name: 'assetIds',
        type: 'array',
        required: true,
        description: 'Asset IDs to analyze (comma-separated)',
        placeholder: 'asset1,asset2,asset3'
      },
      {
        name: 'masterReferenceAssetId',
        type: 'string',
        required: false,
        description: 'Master reference asset ID',
        placeholder: 'Enter master reference ID'
      },
      {
        name: 'qualityThreshold',
        type: 'number',
        required: false,
        description: 'Quality threshold (0-1)',
        placeholder: '0.8',
        defaultValue: 0.8
      },
      {
        name: 'consistencyThreshold',
        type: 'number',
        required: false,
        description: 'Consistency threshold (0-1)',
        placeholder: '0.7',
        defaultValue: 0.7
      },
      {
        name: 'strictMode',
        type: 'boolean',
        required: false,
        description: 'Enable strict mode',
        defaultValue: false
      }
    ]
  },
  {
    id: 'qa-config-get',
    name: 'Get QA Config',
    method: 'GET',
    path: '/api/v1/qa/config',
    description: 'Get current QA configuration',
    category: 'Quality Assurance',
    fields: []
  },
  {
    id: 'qa-config-update',
    name: 'Update QA Config',
    method: 'PUT',
    path: '/api/v1/qa/config',
    description: 'Update QA configuration',
    category: 'Quality Assurance',
    fields: [
      {
        name: 'qualityThreshold',
        type: 'number',
        required: false,
        description: 'Quality threshold (0-1)',
        placeholder: '0.8'
      },
      {
        name: 'consistencyThreshold',
        type: 'number',
        required: false,
        description: 'Consistency threshold (0-1)',
        placeholder: '0.7'
      },
      {
        name: 'strictMode',
        type: 'boolean',
        required: false,
        description: 'Enable strict mode',
        defaultValue: false
      }
    ]
  },

  // Media Management
  {
    id: 'media-list',
    name: 'List Media',
    method: 'GET',
    path: '/api/media',
    description: 'Get all media files',
    category: 'Media Management',
    fields: [
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of media files to return',
        placeholder: '10',
        defaultValue: 10
      },
      {
        name: 'page',
        type: 'number',
        required: false,
        description: 'Page number for pagination',
        placeholder: '1',
        defaultValue: 1
      }
    ]
  },
  {
    id: 'media-get',
    name: 'Get Media',
    method: 'GET',
    path: '/api/media/{id}',
    description: 'Get a specific media file by ID',
    category: 'Media Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Media ID',
        placeholder: 'Enter media ID'
      }
    ]
  },
  {
    id: 'media-upload',
    name: 'Upload Media',
    method: 'POST',
    path: '/api/media',
    description: 'Upload a new media file',
    category: 'Media Management',
    fields: [
      {
        name: 'file',
        type: 'string',
        required: true,
        description: 'File to upload (base64 or file path)',
        placeholder: 'Select file or enter base64 data'
      },
      {
        name: 'alt',
        type: 'string',
        required: false,
        description: 'Alt text for the media',
        placeholder: 'Enter alt text'
      }
    ]
  },
  {
    id: 'media-update',
    name: 'Update Media',
    method: 'PATCH',
    path: '/api/media/{id}',
    description: 'Update media metadata',
    category: 'Media Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Media ID',
        placeholder: 'Enter media ID'
      },
      {
        name: 'alt',
        type: 'string',
        required: false,
        description: 'Alt text for the media',
        placeholder: 'Enter alt text'
      }
    ]
  },
  {
    id: 'media-delete',
    name: 'Delete Media',
    method: 'DELETE',
    path: '/api/media/{id}',
    description: 'Delete a media file',
    category: 'Media Management',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Media ID',
        placeholder: 'Enter media ID'
      }
    ]
  },

  // Novel Movie Integration
  {
    id: 'novel-movie-create',
    name: 'Create Novel Movie Character',
    method: 'POST',
    path: '/api/v1/characters/novel-movie',
    description: 'Create character with Novel Movie specific fields and project integration',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'novelMovieProjectId',
        type: 'string',
        required: true,
        description: 'Novel Movie project ID',
        placeholder: 'project-123'
      },
      {
        name: 'projectName',
        type: 'string',
        required: false,
        description: 'Project name for reference',
        placeholder: 'My Movie Project'
      },
      {
        name: 'characterData',
        type: 'object',
        required: true,
        description: 'Character data including name, status, physical attributes, etc.'
      }
    ]
  },
  {
    id: 'get-project-characters',
    name: 'Get Project Characters',
    method: 'GET',
    path: '/api/v1/characters/by-project/{projectId}',
    description: 'Get all characters associated with a Novel Movie project',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'projectId',
        type: 'string',
        required: true,
        description: 'Novel Movie project ID',
        placeholder: 'project-123'
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum number of characters to return',
        placeholder: '50'
      },
      {
        name: 'includeImages',
        type: 'boolean',
        required: false,
        description: 'Include image gallery data',
        placeholder: 'true'
      }
    ]
  },
  {
    id: 'update-reference-image',
    name: 'Update Reference Image',
    method: 'PUT',
    path: '/api/v1/characters/{id}/reference-image',
    description: 'Update character\'s master reference image',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      },
      {
        name: 'imageUrl',
        type: 'string',
        required: false,
        description: 'Image URL (if using external image)',
        placeholder: 'https://example.com/image.jpg'
      },
      {
        name: 'mediaId',
        type: 'string',
        required: false,
        description: 'Media ID (if using uploaded media)',
        placeholder: 'media-id'
      }
    ]
  },
  {
    id: 'delete-reference-image',
    name: 'Delete Reference Image',
    method: 'DELETE',
    path: '/api/v1/characters/{id}/reference-image',
    description: 'Delete character\'s master reference image and reset all derived content (core set, gallery, quality metrics)',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      }
    ]
  },
  {
    id: 'generate-360-set',
    name: 'Generate 360° Image Set',
    method: 'POST',
    path: '/api/v1/characters/{id}/generate-360-set',
    description: 'Generate complete 360° reference image set for character',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      },
      {
        name: 'style',
        type: 'select',
        required: false,
        description: 'Image generation style',
        options: ['character_production', 'cinematic', 'realistic']
      },
      {
        name: 'qualityThreshold',
        type: 'number',
        required: false,
        description: 'Minimum quality threshold (0-100)',
        placeholder: '75'
      },
      {
        name: 'imageCount',
        type: 'number',
        required: false,
        description: 'Number of images to generate',
        placeholder: '8'
      }
    ]
  },
  {
    id: 'search-characters',
    name: 'Search Characters',
    method: 'POST',
    path: '/api/v1/characters/search',
    description: 'Search for similar characters to avoid duplication',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query text',
        placeholder: 'tall dark-haired detective'
      },
      {
        name: 'similarityThreshold',
        type: 'number',
        required: false,
        description: 'Similarity threshold (0-1)',
        placeholder: '0.7'
      },
      {
        name: 'includePhysical',
        type: 'boolean',
        required: false,
        description: 'Include physical attributes in search',
        placeholder: 'true'
      },
      {
        name: 'includePersonality',
        type: 'boolean',
        required: false,
        description: 'Include personality traits in search',
        placeholder: 'true'
      },
      {
        name: 'projectId',
        type: 'string',
        required: false,
        description: 'Limit search to specific project',
        placeholder: 'project-123'
      }
    ]
  },
  {
    id: 'novel-movie-sync',
    name: 'Sync Novel Movie Character',
    method: 'PUT',
    path: '/api/v1/characters/{id}/novel-movie-sync',
    description: 'Bidirectional synchronization with conflict resolution',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      },
      {
        name: 'characterData',
        type: 'object',
        required: true,
        description: 'Updated character data'
      },
      {
        name: 'lastModified',
        type: 'string',
        required: true,
        description: 'Last modification timestamp',
        placeholder: '2025-09-07T05:34:51.566Z'
      },
      {
        name: 'changeSet',
        type: 'array',
        required: true,
        description: 'Array of changed field names'
      }
    ]
  },
  {
    id: 'novel-movie-bulk',
    name: 'Bulk Novel Movie Operations',
    method: 'POST',
    path: '/api/v1/characters/bulk/novel-movie',
    description: 'Bulk character operations for Novel Movie projects',
    category: 'Novel Movie Integration',
    fields: [
      {
        name: 'projectId',
        type: 'string',
        required: true,
        description: 'Project ID',
        placeholder: 'project-123'
      },
      {
        name: 'operation',
        type: 'select',
        required: true,
        description: 'Operation type',
        options: ['create', 'update', 'sync']
      },
      {
        name: 'characters',
        type: 'array',
        required: true,
        description: 'Array of character data objects'
      }
    ]
  },

  // Scene-Specific Image Generation
  {
    id: 'generate-scene-image',
    name: 'Generate Scene Image',
    method: 'POST',
    path: '/api/v1/characters/{id}/generate-scene-image',
    description: 'Generate character image for specific scene context',
    category: 'Scene Image Generation',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      },
      {
        name: 'sceneContext',
        type: 'string',
        required: true,
        description: 'Description of the scene',
        placeholder: 'Character walking through a dark alley at night'
      },
      {
        name: 'sceneType',
        type: 'select',
        required: true,
        description: 'Type of scene',
        options: ['dialogue', 'action', 'emotional', 'establishing']
      },
      {
        name: 'mood',
        type: 'string',
        required: false,
        description: 'Scene mood',
        placeholder: 'tense, happy, dramatic'
      },
      {
        name: 'lightingStyle',
        type: 'string',
        required: false,
        description: 'Lighting style',
        placeholder: 'dramatic shadows, soft lighting'
      }
    ]
  },
  {
    id: 'generate-interaction',
    name: 'Generate Character Interaction',
    method: 'POST',
    path: '/api/v1/characters/generate-interaction',
    description: 'Generate image showing character interactions',
    category: 'Scene Image Generation',
    fields: [
      {
        name: 'primaryCharacterId',
        type: 'string',
        required: true,
        description: 'Primary character ID',
        placeholder: 'character-1'
      },
      {
        name: 'secondaryCharacterIds',
        type: 'array',
        required: true,
        description: 'Array of secondary character IDs'
      },
      {
        name: 'interactionType',
        type: 'string',
        required: true,
        description: 'Type of interaction',
        placeholder: 'conversation, confrontation, collaboration'
      },
      {
        name: 'sceneDescription',
        type: 'string',
        required: true,
        description: 'Description of the interaction scene',
        placeholder: 'Heated argument in a restaurant'
      }
    ]
  },
  {
    id: 'batch-generate-scenes',
    name: 'Batch Generate Scenes',
    method: 'POST',
    path: '/api/v1/characters/batch-generate-scenes',
    description: 'Generate images for multiple scenes in batch',
    category: 'Scene Image Generation',
    fields: [
      {
        name: 'projectId',
        type: 'string',
        required: true,
        description: 'Project ID',
        placeholder: 'project-123'
      },
      {
        name: 'scenes',
        type: 'array',
        required: true,
        description: 'Array of scene objects with characters and descriptions'
      },
      {
        name: 'maxConcurrent',
        type: 'number',
        required: false,
        description: 'Maximum concurrent generations',
        defaultValue: 3
      }
    ]
  },

  // Character Relationships
  {
    id: 'create-relationship',
    name: 'Create Character Relationship',
    method: 'POST',
    path: '/api/v1/characters/{id}/relationships',
    description: 'Create relationship between characters',
    category: 'Character Relationships',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      },
      {
        name: 'relatedCharacterId',
        type: 'string',
        required: true,
        description: 'Related character ID',
        placeholder: 'other-character-id'
      },
      {
        name: 'relationshipType',
        type: 'string',
        required: true,
        description: 'Type of relationship',
        placeholder: 'friend, enemy, mentor, family'
      },
      {
        name: 'strength',
        type: 'number',
        required: false,
        description: 'Relationship strength (1-10)',
        defaultValue: 5
      },
      {
        name: 'conflictLevel',
        type: 'number',
        required: false,
        description: 'Conflict level (1-10)',
        defaultValue: 1
      }
    ]
  },
  {
    id: 'get-relationships',
    name: 'Get Character Relationships',
    method: 'GET',
    path: '/api/v1/characters/{id}/relationships',
    description: 'Get all relationships for a character',
    category: 'Character Relationships',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      }
    ]
  },
  {
    id: 'relationship-graph',
    name: 'Get Relationship Graph',
    method: 'GET',
    path: '/api/v1/characters/relationships/graph',
    description: 'Get character relationship graph for visualization',
    category: 'Character Relationships',
    fields: [
      {
        name: 'projectId',
        type: 'string',
        required: false,
        description: 'Filter by project ID',
        placeholder: 'project-123'
      }
    ]
  },
  {
    id: 'generate-relationship-image',
    name: 'Generate Relationship Image',
    method: 'POST',
    path: '/api/v1/characters/generate-relationship-image',
    description: 'Generate image showing character relationships',
    category: 'Character Relationships',
    fields: [
      {
        name: 'characterIds',
        type: 'array',
        required: true,
        description: 'Array of character IDs'
      },
      {
        name: 'relationshipContext',
        type: 'string',
        required: true,
        description: 'Context of the relationship',
        placeholder: 'Mentor teaching student'
      },
      {
        name: 'visualStyle',
        type: 'string',
        required: false,
        description: 'Visual style for the image',
        defaultValue: 'character_relationship'
      }
    ]
  },

  // Quality Assurance & Validation
  {
    id: 'quality-metrics',
    name: 'Get Quality Metrics',
    method: 'GET',
    path: '/api/v1/characters/{id}/quality-metrics',
    description: 'Get comprehensive quality metrics for a character',
    category: 'Quality Assurance',
    fields: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Character ID',
        placeholder: 'character-id'
      }
    ]
  },
  {
    id: 'validate-project-consistency',
    name: 'Validate Project Consistency',
    method: 'POST',
    path: '/api/v1/characters/validate-project-consistency',
    description: 'Validate character consistency across entire project',
    category: 'Quality Assurance',
    fields: [
      {
        name: 'projectId',
        type: 'string',
        required: true,
        description: 'Project ID to validate',
        placeholder: 'project-123'
      },
      {
        name: 'includeVisualValidation',
        type: 'boolean',
        required: false,
        description: 'Include visual consistency validation',
        defaultValue: true
      },
      {
        name: 'includeNarrativeValidation',
        type: 'boolean',
        required: false,
        description: 'Include narrative consistency validation',
        defaultValue: true
      },
      {
        name: 'consistencyThreshold',
        type: 'number',
        required: false,
        description: 'Consistency threshold (0-100)',
        defaultValue: 85
      }
    ]
  },
  {
    id: 'batch-validate',
    name: 'Batch Character Validation',
    method: 'POST',
    path: '/api/v1/characters/batch-validate',
    description: 'Validate multiple characters simultaneously',
    category: 'Quality Assurance',
    fields: [
      {
        name: 'characterIds',
        type: 'array',
        required: true,
        description: 'Array of character IDs to validate'
      },
      {
        name: 'validationType',
        type: 'select',
        required: true,
        description: 'Type of validation to perform',
        options: ['visual', 'narrative', 'complete']
      },
      {
        name: 'includeRecommendations',
        type: 'boolean',
        required: false,
        description: 'Include improvement recommendations',
        defaultValue: true
      }
    ]
  }
]

export const getEndpointById = (id: string): ApiEndpoint | undefined => {
  return apiEndpoints.find(endpoint => endpoint.id === id)
}

export const getEndpointsByCategory = (category: string): ApiEndpoint[] => {
  return apiEndpoints.filter(endpoint => endpoint.category === category)
}

export const getAllCategories = (): string[] => {
  return Array.from(new Set(apiEndpoints.map(endpoint => endpoint.category)))
}
