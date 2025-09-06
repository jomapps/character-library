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
