/**
 * ID Utilities for Character Library System
 * 
 * Standardized utilities for handling different ID types and ensuring consistency
 * across the application.
 */

/**
 * Extract MongoDB ObjectId from media reference
 * Handles both string IDs and populated media objects
 */
export function extractMediaId(mediaRef: string | { id: string } | null | undefined): string | null {
  if (!mediaRef) return null
  
  if (typeof mediaRef === 'string') {
    return mediaRef
  }
  
  if (typeof mediaRef === 'object' && mediaRef.id) {
    return mediaRef.id
  }
  
  return null
}

/**
 * Extract DINOv3 asset ID from media reference
 * Handles both string IDs and populated media objects with dinoAssetId
 */
export function extractDinoAssetId(mediaRef: string | { dinoAssetId?: string } | null | undefined): string | null {
  if (!mediaRef) return null
  
  if (typeof mediaRef === 'string') {
    // If it's just a string, we can't extract dinoAssetId without a database lookup
    return null
  }
  
  if (typeof mediaRef === 'object' && mediaRef.dinoAssetId) {
    return mediaRef.dinoAssetId
  }
  
  return null
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id)
}

/**
 * Validate character ID format (human-readable business ID)
 */
export function isValidCharacterId(characterId: string): boolean {
  return /^[a-z0-9-]+$/.test(characterId)
}

/**
 * Generate character ID from name
 * Consistent with the logic in Characters collection
 */
export function generateCharacterId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Standardized API response format for character data
 */
export interface StandardCharacterResponse {
  id: string           // MongoDB ObjectId for database operations
  characterId: string  // Human-readable business identifier
  name: string
  [key: string]: any   // Additional character fields
}

/**
 * Format character data for API response with consistent ID fields
 */
export function formatCharacterResponse(character: any): StandardCharacterResponse {
  return {
    id: character.id,
    characterId: character.characterId,
    name: character.name,
    ...character,
  }
}

/**
 * Extract image gallery item IDs consistently
 */
export function extractGalleryImageIds(imageGallery: any[]): Array<{
  imageId: string | null
  dinoAssetId: string | null
  shotType?: string
  isCoreReference: boolean
}> {
  return (imageGallery || []).map((item: any) => ({
    imageId: extractMediaId(item.imageFile),
    dinoAssetId: item.dinoAssetId || null,
    shotType: item.shotType,
    isCoreReference: item.isCoreReference || false,
  }))
}

/**
 * Validate external service ID format
 */
export function validateServiceId(serviceId: string, serviceName: string): boolean {
  switch (serviceName) {
    case 'dino':
      // DINOv3 asset IDs are typically alphanumeric with hyphens
      return /^[a-zA-Z0-9-_]+$/.test(serviceId)
    case 'pathrag':
      // PathRAG uses character IDs which follow our character ID format
      return isValidCharacterId(serviceId)
    case 'fal':
      // FAL.ai request IDs are typically UUIDs or similar
      return /^[a-zA-Z0-9-_]+$/.test(serviceId)
    default:
      // Generic validation for unknown services
      return serviceId.length > 0 && serviceId.length < 256
  }
}

/**
 * Error types for ID validation
 */
export class IDValidationError extends Error {
  constructor(
    message: string,
    public idType: string,
    public providedValue: any
  ) {
    super(message)
    this.name = 'IDValidationError'
  }
}

/**
 * Validate and throw error if ID is invalid
 */
export function validateRequiredId(id: any, idType: 'objectId' | 'characterId' | 'serviceId', serviceName?: string): string {
  if (!id || typeof id !== 'string') {
    throw new IDValidationError(`${idType} is required and must be a string`, idType, id)
  }
  
  switch (idType) {
    case 'objectId':
      if (!isValidObjectId(id)) {
        throw new IDValidationError(`Invalid MongoDB ObjectId format: ${id}`, idType, id)
      }
      break
    case 'characterId':
      if (!isValidCharacterId(id)) {
        throw new IDValidationError(`Invalid character ID format: ${id}`, idType, id)
      }
      break
    case 'serviceId':
      if (!serviceName || !validateServiceId(id, serviceName)) {
        throw new IDValidationError(`Invalid ${serviceName} service ID format: ${id}`, idType, id)
      }
      break
  }
  
  return id
}

/**
 * Safe ID extraction with validation
 */
export function safeExtractId(
  source: any,
  idField: string,
  idType: 'objectId' | 'characterId' | 'serviceId',
  serviceName?: string
): string | null {
  try {
    const id = source?.[idField]
    if (!id) return null
    
    return validateRequiredId(id, idType, serviceName)
  } catch (error) {
    console.warn(`ID extraction failed for ${idField}:`, error)
    return null
  }
}

/**
 * Relationship ID validation helper
 */
export function validateRelationshipIds(relationships: any[]): Array<{
  characterId: string
  isValid: boolean
  error?: string
}> {
  return relationships.map(rel => {
    try {
      const characterId = validateRequiredId(rel.characterId, 'objectId')
      return { characterId, isValid: true }
    } catch (error) {
      return {
        characterId: rel.characterId,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      }
    }
  })
}
