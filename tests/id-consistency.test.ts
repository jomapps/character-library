/**
 * ID Consistency Validation Tests
 * 
 * These tests validate that IDs are handled consistently across the Character Library system
 * and identify any mismatches between different ID types and usage patterns.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload, Payload } from 'payload'
import configPromise from '@/payload.config'

let payload: Payload

describe('ID Consistency Validation', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })
  })

  describe('Database Schema ID Consistency', () => {
    it('should have consistent primary key types across collections', async () => {
      // Test that all collections use string type for id field
      const collections = ['users', 'media', 'characters']
      
      for (const collectionName of collections) {
        const testDoc = await payload.create({
          collection: collectionName as any,
          data: getTestData(collectionName),
        })
        
        expect(typeof testDoc.id).toBe('string')
        expect(testDoc.id).toMatch(/^[a-f\d]{24}$/i) // MongoDB ObjectId format
        
        // Clean up
        await payload.delete({
          collection: collectionName as any,
          id: testDoc.id,
        })
      }
    })

    it('should generate characterId consistently from name', async () => {
      const testCharacter = {
        name: 'Test Character Name!@#',
        status: 'draft',
      }

      const character = await payload.create({
        collection: 'characters',
        data: testCharacter,
      })

      expect(character.characterId).toBe('test-character-name')
      expect(character.characterId).toMatch(/^[a-z0-9-]+$/)
      
      // Clean up
      await payload.delete({
        collection: 'characters',
        id: character.id,
      })
    })

    it('should handle unique characterId constraints', async () => {
      const testData = {
        name: 'Unique Test Character',
        characterId: 'unique-test-char',
        status: 'draft',
      }

      const character1 = await payload.create({
        collection: 'characters',
        data: testData,
      })

      // Attempt to create duplicate characterId should fail
      await expect(
        payload.create({
          collection: 'characters',
          data: testData,
        })
      ).rejects.toThrow()

      // Clean up
      await payload.delete({
        collection: 'characters',
        id: character1.id,
      })
    })
  })

  describe('API Endpoint ID Handling', () => {
    it('should accept MongoDB ObjectId in path parameters', async () => {
      const character = await createTestCharacter()
      
      // Test that API endpoints accept the MongoDB ObjectId
      const response = await fetch(`/api/v1/characters/${character.id}`)
      expect(response.status).not.toBe(404)
      
      await cleanupTestCharacter(character.id)
    })

    it('should return consistent ID fields in responses', async () => {
      const character = await createTestCharacter()
      
      const response = await fetch(`/api/v1/characters/${character.id}`)
      const data = await response.json()
      
      // Should include both id and characterId
      expect(data.id).toBe(character.id)
      expect(data.characterId).toBeTruthy()
      expect(typeof data.characterId).toBe('string')
      
      await cleanupTestCharacter(character.id)
    })

    it('should handle search by both name and characterId', async () => {
      const character = await createTestCharacter()
      
      // Search by name
      const nameResponse = await fetch(`/api/v1/characters?search=${encodeURIComponent(character.name)}`)
      const nameData = await nameResponse.json()
      expect(nameData.docs.some((c: any) => c.id === character.id)).toBe(true)
      
      // Search by characterId
      const idResponse = await fetch(`/api/v1/characters?search=${character.characterId}`)
      const idData = await idResponse.json()
      expect(idData.docs.some((c: any) => c.id === character.id)).toBe(true)
      
      await cleanupTestCharacter(character.id)
    })
  })

  describe('External Service ID Integration', () => {
    it('should handle missing dinoAssetId gracefully', async () => {
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: 'Test media without DINOv3 processing',
        },
      })

      expect(media.dinoAssetId).toBeNull()
      expect(media.dinoProcessingStatus).toBe('pending')
      
      await payload.delete({
        collection: 'media',
        id: media.id,
      })
    })

    it('should validate dinoAssetId format when present', async () => {
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: 'Test media with DINOv3 processing',
          dinoAssetId: 'test-asset-id-123',
          dinoProcessingStatus: 'validation_success',
        },
      })

      expect(media.dinoAssetId).toBe('test-asset-id-123')
      expect(typeof media.dinoAssetId).toBe('string')
      
      await payload.delete({
        collection: 'media',
        id: media.id,
      })
    })
  })

  describe('Relationship ID Consistency', () => {
    it('should handle character relationships with proper ID types', async () => {
      const character1 = await createTestCharacter('Character One')
      const character2 = await createTestCharacter('Character Two')
      
      // Add relationship using MongoDB ObjectId
      const updatedCharacter = await payload.update({
        collection: 'characters',
        id: character1.id,
        data: {
          enhancedRelationships: [
            {
              characterId: character2.id, // Should accept MongoDB ObjectId
              relationshipType: 'friend',
              strength: 8,
              conflictLevel: 2,
            },
          ],
        },
      })

      expect(updatedCharacter.enhancedRelationships).toHaveLength(1)
      expect(updatedCharacter.enhancedRelationships[0].characterId).toBe(character2.id)
      
      await cleanupTestCharacter(character1.id)
      await cleanupTestCharacter(character2.id)
    })
  })

  describe('Nested Array ID Consistency', () => {
    it('should handle optional IDs in nested arrays', async () => {
      const character = await createTestCharacter()
      
      const updatedCharacter = await payload.update({
        collection: 'characters',
        id: character.id,
        data: {
          skills: [
            {
              skill: 'Swordsmanship',
              level: 'expert',
              description: 'Master of blade combat',
            },
          ],
          sceneContexts: [
            {
              sceneId: 'scene-001',
              sceneType: 'action',
              generatedImages: [
                {
                  imageId: 'image-001',
                },
              ],
            },
          ],
        },
      })

      // Check that nested array elements have optional IDs
      expect(updatedCharacter.skills[0].id).toBeDefined()
      expect(updatedCharacter.sceneContexts[0].id).toBeDefined()
      expect(updatedCharacter.sceneContexts[0].generatedImages[0].id).toBeDefined()
      
      await cleanupTestCharacter(character.id)
    })
  })
})

// Helper functions
function getTestData(collectionName: string): any {
  switch (collectionName) {
    case 'users':
      return {
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123',
      }
    case 'media':
      return {
        alt: 'Test media file',
      }
    case 'characters':
      return {
        name: `Test Character ${Date.now()}`,
        status: 'draft',
      }
    default:
      throw new Error(`Unknown collection: ${collectionName}`)
  }
}

async function createTestCharacter(name?: string): Promise<any> {
  return await payload.create({
    collection: 'characters',
    data: {
      name: name || `Test Character ${Date.now()}`,
      status: 'draft',
    },
  })
}

async function cleanupTestCharacter(id: string): Promise<void> {
  await payload.delete({
    collection: 'characters',
    id,
  })
}

describe('API Response ID Consistency', () => {
  it('should return consistent ID fields across different endpoints', async () => {
    const character = await createTestCharacter()

    // Test individual character endpoint
    const individualResponse = await fetch(`/api/v1/characters/${character.id}`)
    const individualData = await individualResponse.json()

    // Test list endpoint
    const listResponse = await fetch('/api/v1/characters?limit=1')
    const listData = await listResponse.json()

    // Both should have consistent ID structure
    expect(individualData.id).toBeTruthy()
    expect(individualData.characterId).toBeTruthy()

    if (listData.docs.length > 0) {
      expect(listData.docs[0].id).toBeTruthy()
      expect(listData.docs[0].characterId).toBeTruthy()
    }

    await cleanupTestCharacter(character.id)
  })

  it('should handle Novel Movie integration ID correctly', async () => {
    const novelMovieData = {
      novelMovieProjectId: 'test-project-123',
      projectName: 'Test Project',
      characterData: {
        name: 'Novel Movie Test Character',
        status: 'draft',
      },
    }

    const response = await fetch('/api/v1/characters/novel-movie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novelMovieData),
    })

    if (response.ok) {
      const data = await response.json()

      // Should return proper ID structure
      expect(data.success).toBe(true)
      expect(data.character.id).toBeTruthy()
      expect(data.character.characterId).toBeTruthy()
      expect(data.characterId).toBe(data.character.id) // This should be fixed

      await cleanupTestCharacter(data.character.id)
    }
  })
})

describe('Service Integration ID Validation', () => {
  it('should validate DINOv3 service ID integration', async () => {
    // Mock DINOv3 service response
    const mockDinoAssetId = 'mock-dino-asset-123'

    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test DINOv3 integration',
        dinoAssetId: mockDinoAssetId,
        dinoProcessingStatus: 'validation_success',
      },
    })

    // Verify the asset ID is stored correctly
    expect(media.dinoAssetId).toBe(mockDinoAssetId)

    // Test that character can reference this media
    const character = await payload.create({
      collection: 'characters',
      data: {
        name: 'DINOv3 Test Character',
        masterReferenceImage: media.id,
      },
    })

    expect(character.masterReferenceImage).toBe(media.id)

    await cleanupTestCharacter(character.id)
    await payload.delete({ collection: 'media', id: media.id })
  })

  it('should validate PathRAG service ID integration', async () => {
    const character = await createTestCharacter('PathRAG Test Character')

    // Verify character has proper characterId for PathRAG sync
    expect(character.characterId).toBeTruthy()
    expect(typeof character.characterId).toBe('string')
    expect(character.characterId).toMatch(/^[a-z0-9-]+$/)

    await cleanupTestCharacter(character.id)
  })
})

describe('Master Reference Image Deletion', () => {
  it('should delete master reference and reset all derived content', async () => {
    // Create character with master reference and derived content
    const character = await payload.create({
      collection: 'characters',
      data: {
        name: 'Master Reference Test Character',
        status: 'draft',
        masterReferenceProcessed: true,
        coreSetGenerated: true,
        coreSetGeneratedAt: new Date().toISOString(),
        imageGallery: [
          {
            imageFile: 'test-image-id',
            isCoreReference: true,
            dinoAssetId: 'test-dino-asset',
          },
        ],
        enhancedQualityMetrics: {
          narrativeConsistency: 85,
          crossSceneConsistency: 90,
          lastValidated: new Date().toISOString(),
        },
        sceneContexts: [
          {
            sceneId: 'test-scene',
            sceneType: 'action',
            generatedImages: [
              { imageId: 'scene-image-1' },
              { imageId: 'scene-image-2' },
            ],
            qualityScores: [{ score: 85 }, { score: 90 }],
            lastGenerated: new Date().toISOString(),
          },
        ],
      },
    })

    // Delete master reference image
    const response = await fetch(`/api/v1/characters/${character.id}/reference-image`, {
      method: 'DELETE',
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.resetFields).toContain('masterReferenceImage')
    expect(data.resetFields).toContain('imageGallery')

    // Verify character was reset
    const updatedCharacter = await payload.findByID({
      collection: 'characters',
      id: character.id,
    })

    // Master reference should be cleared
    expect(updatedCharacter.masterReferenceImage).toBeNull()
    expect(updatedCharacter.masterReferenceProcessed).toBe(false)
    expect(updatedCharacter.masterReferenceQuality).toBeNull()

    // Core set should be reset
    expect(updatedCharacter.coreSetGenerated).toBe(false)
    expect(updatedCharacter.coreSetGeneratedAt).toBeNull()

    // Image gallery should be cleared
    expect(updatedCharacter.imageGallery).toEqual([])

    // Quality metrics should be reset
    expect(updatedCharacter.enhancedQualityMetrics.narrativeConsistency).toBeNull()
    expect(updatedCharacter.enhancedQualityMetrics.crossSceneConsistency).toBeNull()
    expect(updatedCharacter.enhancedQualityMetrics.lastValidated).toBeNull()

    // Scene contexts should have generated images cleared
    expect(updatedCharacter.sceneContexts).toHaveLength(1)
    expect(updatedCharacter.sceneContexts[0].generatedImages).toEqual([])
    expect(updatedCharacter.sceneContexts[0].qualityScores).toEqual([])
    expect(updatedCharacter.sceneContexts[0].lastGenerated).toBeNull()

    await cleanupTestCharacter(character.id)
  })

  it('should handle deletion when no master reference exists', async () => {
    const character = await createTestCharacter()

    const response = await fetch(`/api/v1/characters/${character.id}/reference-image`, {
      method: 'DELETE',
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.success).toBe(true)

    await cleanupTestCharacter(character.id)
  })

  it('should return 404 for non-existent character', async () => {
    const response = await fetch('/api/v1/characters/000000000000000000000000/reference-image', {
      method: 'DELETE',
    })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('Character not found')
  })
})
