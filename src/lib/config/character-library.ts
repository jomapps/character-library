/**
 * Character Library Service Configuration
 * 
 * Configuration settings for integrating with the external Character Library service
 */

export const CHARACTER_LIBRARY_CONFIG = {
  baseUrl: process.env.CHARACTER_LIBRARY_API_URL || 'https://character.ft.tc',
  timeout: parseInt(process.env.CHARACTER_LIBRARY_TIMEOUT || '60000'),
  retryAttempts: parseInt(process.env.CHARACTER_LIBRARY_RETRY_ATTEMPTS || '3'),
  qualityThreshold: 70,
  consistencyThreshold: 85,
  defaultStyle: 'character_production',
  maxRetries: 5
}

export interface CharacterLibraryEndpoints {
  health: '/api/health'
  createNovelMovieCharacter: '/api/v1/characters/novel-movie'
  syncCharacter: '/api/v1/characters/{id}/novel-movie-sync'
  generateSceneImage: '/api/v1/characters/{id}/generate-scene-image'
  generateInitialImage: '/api/v1/characters/{id}/generate-initial-image'
  generateCoreSet: '/api/v1/characters/{id}/generate-core-set'
  queryCharacters: '/api/v1/characters/query'
  validateConsistency: '/api/v1/characters/validate-project-consistency'
  batchValidate: '/api/v1/characters/batch-validate'
  qualityMetrics: '/api/v1/characters/{id}/quality-metrics'
  relationships: '/api/v1/characters/{id}/relationships'
  relationshipGraph: '/api/v1/characters/relationships/graph'
}

export const ENDPOINTS: CharacterLibraryEndpoints = {
  health: '/api/health',
  createNovelMovieCharacter: '/api/v1/characters/novel-movie',
  syncCharacter: '/api/v1/characters/{id}/novel-movie-sync',
  generateSceneImage: '/api/v1/characters/{id}/generate-scene-image',
  generateInitialImage: '/api/v1/characters/{id}/generate-initial-image',
  generateCoreSet: '/api/v1/characters/{id}/generate-core-set',
  queryCharacters: '/api/v1/characters/query',
  validateConsistency: '/api/v1/characters/validate-project-consistency',
  batchValidate: '/api/v1/characters/batch-validate',
  qualityMetrics: '/api/v1/characters/{id}/quality-metrics',
  relationships: '/api/v1/characters/{id}/relationships',
  relationshipGraph: '/api/v1/characters/relationships/graph'
}

export interface CharacterLibraryEnvironment {
  CHARACTER_LIBRARY_API_URL: string
  CHARACTER_LIBRARY_TIMEOUT: string
  CHARACTER_LIBRARY_RETRY_ATTEMPTS: string
}

/**
 * Validate that required environment variables are set
 */
export function validateCharacterLibraryConfig(): {
  isValid: boolean
  missingVars: string[]
  warnings: string[]
} {
  const missingVars: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  if (!process.env.CHARACTER_LIBRARY_API_URL) {
    warnings.push('CHARACTER_LIBRARY_API_URL not set, using default: https://character.ft.tc')
  }

  // Validate URL format
  const baseUrl = CHARACTER_LIBRARY_CONFIG.baseUrl
  try {
    new URL(baseUrl)
  } catch (error) {
    missingVars.push('CHARACTER_LIBRARY_API_URL must be a valid URL')
  }

  // Validate timeout
  if (isNaN(CHARACTER_LIBRARY_CONFIG.timeout) || CHARACTER_LIBRARY_CONFIG.timeout <= 0) {
    warnings.push('CHARACTER_LIBRARY_TIMEOUT should be a positive number, using default: 60000')
  }

  // Validate retry attempts
  if (isNaN(CHARACTER_LIBRARY_CONFIG.retryAttempts) || CHARACTER_LIBRARY_CONFIG.retryAttempts <= 0) {
    warnings.push('CHARACTER_LIBRARY_RETRY_ATTEMPTS should be a positive number, using default: 3')
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings
  }
}

/**
 * Get Character Library service status
 */
export function getCharacterLibraryStatus() {
  const config = validateCharacterLibraryConfig()
  
  return {
    configured: config.isValid,
    baseUrl: CHARACTER_LIBRARY_CONFIG.baseUrl,
    timeout: CHARACTER_LIBRARY_CONFIG.timeout,
    retryAttempts: CHARACTER_LIBRARY_CONFIG.retryAttempts,
    qualityThreshold: CHARACTER_LIBRARY_CONFIG.qualityThreshold,
    consistencyThreshold: CHARACTER_LIBRARY_CONFIG.consistencyThreshold,
    issues: config.missingVars,
    warnings: config.warnings
  }
}
