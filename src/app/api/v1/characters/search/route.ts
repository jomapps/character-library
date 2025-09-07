/**
 * Character Search with Similarity API
 * 
 * This endpoint provides character search functionality with similarity matching
 * to help avoid character duplication and find similar existing characters.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface CharacterSearchRequest {
  query: string
  similarityThreshold?: number // 0-1, default 0.7
  includePhysical?: boolean
  includePersonality?: boolean
  projectId?: string
  limit?: number
}

export interface CharacterSearchResponse {
  success: boolean
  matches: Array<{
    character: any
    similarity: number
    matchingFields: string[]
  }>
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<CharacterSearchResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: CharacterSearchRequest = await request.json()

    console.log(`Searching characters with query: "${body.query}"`)

    // Validate required fields
    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        matches: [],
        error: 'Query is required',
      }, { status: 400 })
    }

    // Extract parameters with defaults
    const query = body.query.trim().toLowerCase()
    const similarityThreshold = body.similarityThreshold || 0.7
    const includePhysical = body.includePhysical !== false // default true
    const includePersonality = body.includePersonality !== false // default true
    const limit = body.limit || 20

    // Build search criteria
    const whereClause: any = {}
    
    if (body.projectId) {
      whereClause['novelMovieIntegration.projectId'] = {
        equals: body.projectId,
      }
    }

    // Get all characters for similarity comparison
    const characters = await payload.find({
      collection: 'characters',
      where: whereClause,
      limit: 1000, // Get a large set for comparison
      depth: 1,
    })

    console.log(`Found ${characters.docs.length} characters to compare against`)

    // Calculate similarity for each character
    const matches: Array<{
      character: any
      similarity: number
      matchingFields: string[]
    }> = []

    for (const character of characters.docs) {
      const similarity = calculateCharacterSimilarity(
        query,
        character,
        includePhysical,
        includePersonality
      )

      if (similarity.score >= similarityThreshold) {
        matches.push({
          character: {
            id: character.id,
            characterId: character.characterId,
            name: character.name,
            status: character.status,
            biography: character.biography,
            personality: character.personality,
            physicalDescription: character.physicalDescription,
            age: character.age,
            height: character.height,
            eyeColor: character.eyeColor,
            hairColor: character.hairColor,
            novelMovieIntegration: character.novelMovieIntegration,
            createdAt: character.createdAt,
          },
          similarity: similarity.score,
          matchingFields: similarity.matchingFields,
        })
      }
    }

    // Sort by similarity score (highest first) and limit results
    matches.sort((a, b) => b.similarity - a.similarity)
    const limitedMatches = matches.slice(0, limit)

    console.log(`Found ${limitedMatches.length} matches above threshold ${similarityThreshold}`)

    return NextResponse.json({
      success: true,
      matches: limitedMatches,
    })

  } catch (error) {
    console.error('Character search error:', error)
    return NextResponse.json({
      success: false,
      matches: [],
      error: error instanceof Error ? error.message : 'Failed to search characters',
    }, { status: 500 })
  }
}

function calculateCharacterSimilarity(
  query: string,
  character: any,
  includePhysical: boolean,
  includePersonality: boolean
): { score: number; matchingFields: string[] } {
  const matchingFields: string[] = []
  let totalScore = 0
  let fieldCount = 0

  // Helper function to extract text from rich text
  const extractText = (richText: any): string => {
    if (!richText || !richText.root || !richText.root.children) {
      return ''
    }
    
    let text = ''
    function extract(node: any) {
      if (node.text) {
        text += node.text + ' '
      }
      if (node.children) {
        node.children.forEach(extract)
      }
    }
    
    richText.root.children.forEach(extract)
    return text.trim().toLowerCase()
  }

  // Helper function to calculate text similarity (simple word overlap)
  const calculateTextSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0
    
    const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 2))
    const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 2))
    
    const intersection = new Set([...words1].filter(w => words2.has(w)))
    const union = new Set([...words1, ...words2])
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  // Check name similarity
  if (character.name) {
    const nameSimilarity = calculateTextSimilarity(query, character.name.toLowerCase())
    if (nameSimilarity > 0.3) {
      totalScore += nameSimilarity * 2 // Weight name matches higher
      matchingFields.push('name')
    }
    fieldCount++
  }

  // Check biography similarity
  if (character.biography) {
    const biographyText = extractText(character.biography)
    const bioSimilarity = calculateTextSimilarity(query, biographyText)
    if (bioSimilarity > 0.1) {
      totalScore += bioSimilarity
      matchingFields.push('biography')
    }
    fieldCount++
  }

  // Check personality similarity (if enabled)
  if (includePersonality && character.personality) {
    const personalityText = extractText(character.personality)
    const personalitySimilarity = calculateTextSimilarity(query, personalityText)
    if (personalitySimilarity > 0.1) {
      totalScore += personalitySimilarity
      matchingFields.push('personality')
    }
    fieldCount++
  }

  // Check physical description similarity (if enabled)
  if (includePhysical && character.physicalDescription) {
    const physicalText = extractText(character.physicalDescription)
    const physicalSimilarity = calculateTextSimilarity(query, physicalText)
    if (physicalSimilarity > 0.1) {
      totalScore += physicalSimilarity
      matchingFields.push('physicalDescription')
    }
    fieldCount++
  }

  // Check physical attributes
  if (includePhysical) {
    const physicalAttributes = [
      character.eyeColor,
      character.hairColor,
      character.height,
    ].filter(Boolean).join(' ').toLowerCase()

    if (physicalAttributes) {
      const attrSimilarity = calculateTextSimilarity(query, physicalAttributes)
      if (attrSimilarity > 0.1) {
        totalScore += attrSimilarity
        matchingFields.push('physicalAttributes')
      }
      fieldCount++
    }
  }

  // Calculate average similarity score
  const averageScore = fieldCount > 0 ? totalScore / fieldCount : 0

  return {
    score: Math.min(averageScore, 1), // Cap at 1.0
    matchingFields,
  }
}
