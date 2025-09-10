/**
 * Project Data Management API
 * 
 * This endpoint handles complete project data management including deletion of all
 * characters and associated data belonging to a specific Novel Movie project.
 * 
 * DELETE /api/v1/characters/projects/{projectId}
 * - Deletes all characters associated with the project
 * - Removes all media files (images) for those characters
 * - Cleans up PathRAG knowledge base entries
 * - Provides detailed deletion summary
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PathRAGService } from '@/services/PathRAGService'

export interface ProjectDeletionResponse {
  success: boolean
  projectId: string
  summary: {
    charactersFound: number
    charactersDeleted: number
    mediaFilesDeleted: number
    pathragEntitiesDeleted: number
    errors: string[]
  }
  deletedCharacters: Array<{
    id: string
    name: string
    characterId: string
    mediaDeleted: number
    pathragDeleted: boolean
    error?: string
  }>
  error?: string
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<ProjectDeletionResponse>> {
  try {
    const payload = await getPayload({ config })
    const { projectId } = await params
    const pathragService = new PathRAGService()

    console.log(`🗑️ Starting project deletion for: ${projectId}`)

    // Initialize response structure
    const response: ProjectDeletionResponse = {
      success: false,
      projectId,
      summary: {
        charactersFound: 0,
        charactersDeleted: 0,
        mediaFilesDeleted: 0,
        pathragEntitiesDeleted: 0,
        errors: []
      },
      deletedCharacters: []
    }

    // Step 1: Find all characters for this project
    console.log(`📋 Finding characters for project: ${projectId}`)
    const characters = await payload.find({
      collection: 'characters',
      where: {
        'novelMovieIntegration.projectId': {
          equals: projectId,
        },
      },
      limit: 1000, // Set high limit to get all characters
      depth: 3, // Include all media details
    })

    response.summary.charactersFound = characters.docs.length
    console.log(`📊 Found ${characters.docs.length} characters for project ${projectId}`)

    if (characters.docs.length === 0) {
      console.log(`⚠️ No characters found for project: ${projectId}`)
      return NextResponse.json({
        ...response,
        success: true,
      })
    }

    // Step 2: Delete each character and associated data
    for (const character of characters.docs) {
      console.log(`🔄 Processing character: ${character.name} (${character.id})`)
      
      const characterResult: {
        id: string
        name: string
        characterId: string
        mediaDeleted: number
        pathragDeleted: boolean
        error?: string
      } = {
        id: character.id,
        name: character.name,
        characterId: character.characterId || 'unknown',
        mediaDeleted: 0,
        pathragDeleted: false,
      }

      try {
        // Step 2a: Delete associated media files
        const mediaToDelete = []
        
        // Collect all media references
        if (character.masterReferenceImage) {
          mediaToDelete.push(character.masterReferenceImage)
        }
        
        if (character.imageGallery && Array.isArray(character.imageGallery)) {
          for (const galleryItem of character.imageGallery) {
            if (galleryItem.imageFile) {
              mediaToDelete.push(galleryItem.imageFile)
            }
          }
        }

        // Delete media files
        for (const media of mediaToDelete) {
          try {
            const mediaId = typeof media === 'string' ? media : media.id
            if (mediaId) {
              await payload.delete({
                collection: 'media',
                id: mediaId,
              })
              characterResult.mediaDeleted++
              response.summary.mediaFilesDeleted++
              console.log(`🖼️ Deleted media: ${mediaId}`)
            }
          } catch (mediaError) {
            console.error(`❌ Failed to delete media: ${mediaError}`)
            response.summary.errors.push(`Failed to delete media for ${character.name}: ${mediaError}`)
          }
        }

        // Step 2b: Delete from PathRAG knowledge base
        if (character.characterId) {
          try {
            const pathragResult = await pathragService.deleteEntity(character.characterId)
            if (pathragResult.success) {
              characterResult.pathragDeleted = true
              response.summary.pathragEntitiesDeleted++
              console.log(`🧠 Deleted from PathRAG: ${character.characterId}`)
            }
          } catch (pathragError) {
            console.error(`❌ PathRAG deletion failed for ${character.characterId}:`, pathragError)
            response.summary.errors.push(`PathRAG deletion failed for ${character.name}: ${pathragError}`)
          }
        } else {
          console.log(`⚠️ No characterId found for ${character.name}, skipping PathRAG deletion`)
        }

        // Step 2c: Delete the character itself
        await payload.delete({
          collection: 'characters',
          id: character.id,
        })
        
        response.summary.charactersDeleted++
        console.log(`✅ Deleted character: ${character.name} (${character.id})`)

      } catch (characterError) {
        console.error(`❌ Failed to delete character ${character.name}:`, characterError)
        characterResult.error = String(characterError)
        response.summary.errors.push(`Failed to delete character ${character.name}: ${characterError}`)
      }

      response.deletedCharacters.push(characterResult)
    }

    // Step 3: Final summary
    const hasErrors = response.summary.errors.length > 0
    response.success = !hasErrors || response.summary.charactersDeleted > 0

    console.log(`📊 Project deletion summary for ${projectId}:`)
    console.log(`   Characters found: ${response.summary.charactersFound}`)
    console.log(`   Characters deleted: ${response.summary.charactersDeleted}`)
    console.log(`   Media files deleted: ${response.summary.mediaFilesDeleted}`)
    console.log(`   PathRAG entities deleted: ${response.summary.pathragEntitiesDeleted}`)
    console.log(`   Errors: ${response.summary.errors.length}`)

    if (hasErrors) {
      console.log(`⚠️ Project deletion completed with errors`)
      return NextResponse.json(response, { status: 207 }) // Multi-status
    } else {
      console.log(`✅ Project deletion completed successfully`)
      return NextResponse.json(response)
    }

  } catch (error) {
    console.error('Project deletion error:', error)
    return NextResponse.json({
      success: false,
      projectId: (await params).projectId,
      summary: {
        charactersFound: 0,
        charactersDeleted: 0,
        mediaFilesDeleted: 0,
        pathragEntitiesDeleted: 0,
        errors: [String(error)]
      },
      deletedCharacters: [],
      error: 'Failed to delete project data',
    }, { status: 500 })
  }
}

// GET endpoint to preview what would be deleted (dry run)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config })
    const { projectId } = await params

    console.log(`🔍 Preview deletion for project: ${projectId}`)

    // Find all characters for this project
    const characters = await payload.find({
      collection: 'characters',
      where: {
        'novelMovieIntegration.projectId': {
          equals: projectId,
        },
      },
      limit: 1000,
      depth: 3,
    })

    const preview = {
      projectId,
      charactersFound: characters.docs.length,
      characters: characters.docs.map(char => {
        const mediaCount = [
          char.masterReferenceImage ? 1 : 0,
          char.imageGallery ? char.imageGallery.length : 0
        ].reduce((a, b) => a + b, 0)

        return {
          id: char.id,
          name: char.name,
          characterId: char.characterId,
          status: char.status,
          mediaFiles: mediaCount,
          createdAt: char.createdAt,
        }
      }),
      estimatedDeletions: {
        characters: characters.docs.length,
        mediaFiles: characters.docs.reduce((total, char) => {
          return total + 
            (char.masterReferenceImage ? 1 : 0) + 
            (char.imageGallery ? char.imageGallery.length : 0)
        }, 0),
        pathragEntities: characters.docs.length,
      }
    }

    return NextResponse.json(preview)

  } catch (error) {
    console.error('Project preview error:', error)
    return NextResponse.json({
      error: 'Failed to preview project deletion',
      projectId: (await params).projectId,
    }, { status: 500 })
  }
}
