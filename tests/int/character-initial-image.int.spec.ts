import { getPayload, Payload } from 'payload'
import configPromise from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let testCharacterId: string
let testImageId: string

describe('Character Initial Image Generation API', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: configPromise })
    
    // Create a test character for the character-specific endpoint
    const character = await payload.create({
      collection: 'characters',
      data: {
        name: 'Test Character for Initial Image',
        characterId: 'test-char-initial-img',
        biography: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'A test character for initial image generation',
                    version: 1
                  }
                ],
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
        age: 25,
        height: '6 feet',
        hairColor: 'Black',
        eyeColor: 'Blue',
        physicalDescription: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'A brave warrior with silver armor. Scar across left cheek.',
                    version: 1
                  }
                ],
                version: 1
              }
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1
          }
        },
      },
    })
    testCharacterId = character.id
  })

  afterAll(async () => {
    // Clean up test data
    if (testCharacterId) {
      try {
        await payload.delete({
          collection: 'characters',
          id: testCharacterId,
        })
      } catch (error) {
        console.warn('Failed to delete test character:', error)
      }
    }
    
    if (testImageId) {
      try {
        await payload.delete({
          collection: 'media',
          id: testImageId,
        })
      } catch (error) {
        console.warn('Failed to delete test image:', error)
      }
    }
  })

  describe('POST /api/characters/generate-initial-image (Standalone)', () => {
    it('should generate an initial character image without requiring an existing character', async () => {
      const response = await fetch('http://localhost:3000/api/characters/generate-initial-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A brave knight in silver armor with black hair and blue eyes',
          style: 'character_turnaround',
          alt: 'Test generated character image',
        }),
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.imageId).toBeDefined()
      expect(result.data.dinoAssetId).toBeDefined()
      expect(result.data.publicUrl).toBeDefined()
      expect(result.data.filename).toBeDefined()
      
      // Store for cleanup
      testImageId = result.data.imageId
      
      // Verify the image was created in the media collection
      const media = await payload.findByID({
        collection: 'media',
        id: result.data.imageId,
      })
      
      expect(media).toBeDefined()
      expect(media.dinoAssetId).toBe(result.data.dinoAssetId)
      expect(media.alt).toContain('Test generated character image')
    }, 60000) // 60 second timeout for image generation

    it('should return error when prompt is missing', async () => {
      const response = await fetch('http://localhost:3000/api/characters/generate-initial-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toBe('Prompt is required')
    })

    it('should enhance prompt for reference image generation', async () => {
      const response = await fetch('http://localhost:3000/api/characters/generate-initial-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A magical elf',
          style: 'character_turnaround',
        }),
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      
      // The prompt should have been enhanced with reference image terms
      // We can't directly test the enhanced prompt, but we can verify the image was generated
      expect(result.data.imageId).toBeDefined()
    }, 60000)
  })

  describe('POST /api/characters/[id]/generate-initial-image (Character-specific)', () => {
    it('should generate an initial image for an existing character', async () => {
      const response = await fetch(`http://localhost:3000/api/characters/${testCharacterId}/generate-initial-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A brave knight in silver armor with black hair and blue eyes',
          style: 'character_turnaround',
        }),
      })

      expect(response.status).toBe(200)
      
      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data.characterId).toBe(testCharacterId)
      expect(result.data.characterName).toBe('Test Character for Initial Image')
      expect(result.data.imageId).toBeDefined()
      expect(result.data.dinoAssetId).toBeDefined()
      expect(result.data.publicUrl).toBeDefined()
      
      // Verify the character was updated with the master reference image
      const updatedCharacter = await payload.findByID({
        collection: 'characters',
        id: testCharacterId,
      })
      
      expect(updatedCharacter.masterReferenceImage).toBe(result.data.imageId)
      expect(updatedCharacter.masterReferenceProcessed).toBeDefined()
    }, 60000)

    it('should return error when character not found', async () => {
      const response = await fetch('http://localhost:3000/api/characters/nonexistent-id/generate-initial-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A test character',
        }),
      })

      expect(response.status).toBe(404)
      
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toBe('Character not found')
    })

    it('should return error when character already has master reference image', async () => {
      // First, generate an initial image
      await fetch(`http://localhost:3000/api/characters/${testCharacterId}/generate-initial-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A brave knight in silver armor',
        }),
      })

      // Try to generate another initial image
      const response = await fetch(`http://localhost:3000/api/characters/${testCharacterId}/generate-initial-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Another knight',
        }),
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toContain('already has a master reference image')
    }, 60000)

    it('should return error when prompt is missing', async () => {
      // Create a new character without master reference image
      const newCharacter = await payload.create({
        collection: 'characters',
        data: {
          name: 'Test Character 2',
          characterId: 'test-char-2',
          biography: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Another test character',
                      version: 1
                    }
                  ],
                  version: 1
                }
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1
            }
          },
        },
      })

      const response = await fetch(`http://localhost:3000/api/characters/${newCharacter.id}/generate-initial-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
      
      const result = await response.json()
      expect(result.success).toBe(false)
      expect(result.error).toBe('Prompt is required')

      // Clean up
      await payload.delete({
        collection: 'characters',
        id: newCharacter.id,
      })
    })
  })

  describe('Public URL Generation', () => {
    it('should generate valid public URLs for images', async () => {
      const response = await fetch('http://localhost:3000/api/characters/generate-initial-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'A test character for URL validation',
        }),
      })

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.data.publicUrl).toBeDefined()
      
      // Verify URL format
      const url = new URL(result.data.publicUrl)
      expect(url.protocol).toBe('https:')
      expect(url.pathname).toContain(result.data.dinoAssetId)
      
      // Clean up
      await payload.delete({
        collection: 'media',
        id: result.data.imageId,
      })
    }, 60000)
  })
})
