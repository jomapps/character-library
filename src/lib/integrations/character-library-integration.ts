/**
 * Character Library Integration Utilities
 * 
 * High-level integration functions for Novel Movie <-> Character Library workflows
 */

import { characterLibraryClient, NovelMovieCharacterData } from '../services/character-library-client'
import { CHARACTER_LIBRARY_CONFIG } from '../config/character-library'

export interface CharacterSyncResult {
  success: boolean
  characterLibraryId?: string
  status: 'created' | 'error' | 'skipped'
  error?: string
  warnings?: string[]
}

export interface ProjectSyncResult {
  success: boolean
  totalCharacters: number
  synced: number
  errors: number
  results: CharacterSyncResult[]
  summary: string
}

/**
 * Sync a single character to Character Library
 */
export async function syncCharacterToLibrary(
  character: any,
  projectId: string,
  projectName?: string
): Promise<CharacterSyncResult> {
  try {
    console.log(`Syncing character to Character Library: ${character.name}`)

    // Check if Character Library is available
    const healthCheck = await characterLibraryClient.checkHealth()
    if (!healthCheck.isHealthy) {
      return {
        success: false,
        status: 'error',
        error: `Character Library service unavailable: ${healthCheck.error}`,
        warnings: ['Character created locally but not synced to Character Library']
      }
    }

    // Map character data to Character Library format
    const characterData = characterLibraryClient.mapToCharacterLibraryFormat(character)

    // Create character in Character Library
    const result = await characterLibraryClient.createCharacter(
      characterData,
      projectId,
      projectName
    )

    if (result.success) {
      return {
        success: true,
        characterLibraryId: result.characterId,
        status: 'created'
      }
    } else {
      return {
        success: false,
        status: 'error',
        error: result.error,
        warnings: ['Character created locally but sync to Character Library failed']
      }
    }
  } catch (error) {
    console.error('Character Library sync error:', error)
    return {
      success: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown sync error',
      warnings: ['Character created locally but sync to Character Library failed']
    }
  }
}

/**
 * Sync multiple characters to Character Library
 */
export async function syncProjectCharactersToLibrary(
  characters: any[],
  projectId: string,
  projectName?: string
): Promise<ProjectSyncResult> {
  const results: CharacterSyncResult[] = []
  let synced = 0
  let errors = 0

  console.log(`Syncing ${characters.length} characters to Character Library for project: ${projectId}`)

  for (const character of characters) {
    const result = await syncCharacterToLibrary(character, projectId, projectName)
    results.push(result)

    if (result.success) {
      synced++
    } else {
      errors++
    }
  }

  const success = errors === 0
  const summary = success 
    ? `Successfully synced all ${synced} characters to Character Library`
    : `Synced ${synced}/${characters.length} characters. ${errors} failed.`

  return {
    success,
    totalCharacters: characters.length,
    synced,
    errors,
    results,
    summary
  }
}

/**
 * Generate visual assets for a character
 */
export async function generateCharacterVisualAssets(
  characterLibraryId: string,
  character: any
): Promise<{
  success: boolean
  masterReference?: any
  coreSet?: any
  error?: string
}> {
  try {
    console.log(`Generating visual assets for character: ${character.name}`)

    // Generate master reference image
    const masterPrompt = buildMasterReferencePrompt(character)
    const masterResult = await characterLibraryClient.generateInitialImage(
      characterLibraryId,
      masterPrompt
    )

    if (!masterResult.success) {
      return {
        success: false,
        error: `Failed to generate master reference: ${masterResult.error}`
      }
    }

    // Generate 360° core reference set
    const coreSetResult = await characterLibraryClient.generateCoreSet(characterLibraryId)

    if (!coreSetResult.success) {
      return {
        success: false,
        masterReference: masterResult.data,
        error: `Failed to generate core set: ${coreSetResult.error}`
      }
    }

    return {
      success: true,
      masterReference: masterResult.data,
      coreSet: coreSetResult.data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate visual assets'
    }
  }
}

/**
 * Validate character consistency across a project
 */
export async function validateProjectCharacterConsistency(
  projectId: string
): Promise<{
  success: boolean
  validationResults?: any
  error?: string
}> {
  try {
    console.log(`Validating character consistency for project: ${projectId}`)

    const result = await characterLibraryClient.validateProjectConsistency(projectId)

    return {
      success: result.success,
      validationResults: result.data,
      error: result.error
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate project consistency'
    }
  }
}

/**
 * Query character information using natural language
 */
export async function queryCharacterInformation(
  query: string
): Promise<{
  success: boolean
  result?: string
  error?: string
}> {
  try {
    console.log(`Querying character information: "${query.substring(0, 50)}..."`)

    const result = await characterLibraryClient.queryCharacters(query)

    return {
      success: result.success,
      result: result.data?.result,
      error: result.error
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to query character information'
    }
  }
}

/**
 * Build master reference prompt from character data
 */
function buildMasterReferencePrompt(character: any): string {
  const parts: string[] = []

  // Basic description
  if (character.physicalDescription?.description) {
    parts.push(character.physicalDescription.description)
  }

  // Physical attributes
  if (character.physicalDescription?.age) {
    parts.push(`${character.physicalDescription.age} years old`)
  }

  if (character.physicalDescription?.height) {
    parts.push(`height: ${character.physicalDescription.height}`)
  }

  if (character.physicalDescription?.eyeColor) {
    parts.push(`${character.physicalDescription.eyeColor} eyes`)
  }

  if (character.physicalDescription?.hairColor) {
    parts.push(`${character.physicalDescription.hairColor} hair`)
  }

  // Clothing
  if (character.physicalDescription?.clothing) {
    parts.push(`wearing ${character.physicalDescription.clothing}`)
  }

  // Character role context
  if (character.role) {
    parts.push(`character role: ${character.role}`)
  }

  if (character.archetype) {
    parts.push(`archetype: ${character.archetype}`)
  }

  const prompt = parts.join(', ')
  return prompt || `Portrait of ${character.name}, detailed character design`
}

/**
 * Get Character Library service status
 */
export async function getCharacterLibraryServiceStatus(): Promise<{
  available: boolean
  configured: boolean
  baseUrl: string
  error?: string
  warnings?: string[]
}> {
  const healthCheck = await characterLibraryClient.checkHealth()
  
  return {
    available: healthCheck.isHealthy,
    configured: !!CHARACTER_LIBRARY_CONFIG.baseUrl,
    baseUrl: CHARACTER_LIBRARY_CONFIG.baseUrl,
    error: healthCheck.error,
    warnings: healthCheck.isHealthy ? [] : [
      'Character Library service is not available',
      'Characters will be created locally but not synced to external service'
    ]
  }
}

/**
 * Handle Character Library integration gracefully
 */
export async function handleCharacterLibraryIntegration(
  character: any,
  projectId: string,
  projectName?: string
): Promise<{
  characterLibraryId: string | null
  status: 'created' | 'error' | 'skipped'
  error?: string
  warnings?: string[]
}> {
  try {
    // Check service availability
    const serviceStatus = await getCharacterLibraryServiceStatus()
    
    if (!serviceStatus.available) {
      return {
        characterLibraryId: null,
        status: 'skipped',
        error: serviceStatus.error,
        warnings: serviceStatus.warnings
      }
    }

    // Attempt sync
    const syncResult = await syncCharacterToLibrary(character, projectId, projectName)
    
    return {
      characterLibraryId: syncResult.characterLibraryId || null,
      status: syncResult.status,
      error: syncResult.error,
      warnings: syncResult.warnings
    }
  } catch (error) {
    return {
      characterLibraryId: null,
      status: 'error',
      error: error instanceof Error ? error.message : 'Character Library integration failed',
      warnings: ['Character created locally but not synced to Character Library']
    }
  }
}
