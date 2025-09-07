/**
 * Project Characters API
 * 
 * This endpoint retrieves all characters associated with a specific Novel Movie project.
 * It filters characters based on their novelMovieIntegration.projectId field.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface ProjectCharactersResponse {
  success: boolean
  characters: any[]
  count: number
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<ProjectCharactersResponse>> {
  try {
    const payload = await getPayload({ config })
    const { projectId } = await params
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const includeImages = searchParams.get('includeImages') === 'true'

    console.log(`Fetching characters for project: ${projectId}`)

    // Query characters that have this project ID in their novelMovieIntegration
    const characters = await payload.find({
      collection: 'characters',
      where: {
        'novelMovieIntegration.projectId': {
          equals: projectId,
        },
      },
      limit,
      page,
      sort: '-createdAt',
      depth: includeImages ? 3 : 2, // Include media if requested
    })

    console.log(`Found ${characters.docs.length} characters for project ${projectId}`)

    // Transform the response to match the expected format
    const transformedCharacters = characters.docs.map(character => ({
      id: character.id,
      characterId: character.characterId,
      name: character.name,
      status: character.status,
      biography: character.biography,
      personality: character.personality,
      motivations: character.motivations,
      backstory: character.backstory,
      physicalDescription: character.physicalDescription,
      voiceDescription: character.voiceDescription,
      clothing: character.clothing,
      age: character.age,
      height: character.height,
      eyeColor: character.eyeColor,
      hairColor: character.hairColor,
      relationships: character.relationships,
      skills: character.skills,
      masterReferenceImage: character.masterReferenceImage,
      imageGallery: includeImages ? character.imageGallery : undefined,
      novelMovieIntegration: character.novelMovieIntegration,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      characters: transformedCharacters,
      count: characters.totalDocs,
    })

  } catch (error) {
    console.error('Project characters fetch error:', error)
    return NextResponse.json({
      success: false,
      characters: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch project characters',
    }, { status: 500 })
  }
}
