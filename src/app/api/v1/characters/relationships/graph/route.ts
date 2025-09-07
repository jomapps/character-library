/**
 * Character Relationship Graph API
 * 
 * This endpoint provides a comprehensive view of character relationships within a project,
 * returning data suitable for graph visualization and relationship analysis.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface RelationshipGraphNode {
  id: string
  name: string
  status: string
  characterId: string
  projectId?: string
  metadata: {
    age?: number
    role?: string
    totalRelationships: number
    averageRelationshipStrength: number
    averageConflictLevel: number
  }
}

export interface RelationshipGraphEdge {
  id: string
  source: string
  target: string
  relationshipType: string
  relationshipDynamic?: string
  storyContext?: string
  strength: number
  conflictLevel: number
  visualCues: string[]
  bidirectional: boolean
}

export interface RelationshipGraphResponse {
  success: boolean
  projectId?: string
  nodes: RelationshipGraphNode[]
  edges: RelationshipGraphEdge[]
  statistics: {
    totalCharacters: number
    totalRelationships: number
    averageConnectionsPerCharacter: number
    mostConnectedCharacter: {
      id: string
      name: string
      connectionCount: number
    }
    relationshipTypes: Array<{
      type: string
      count: number
    }>
    averageStrength: number
    averageConflictLevel: number
  }
  error?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<RelationshipGraphResponse>> {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    console.log(`Generating relationship graph${projectId ? ` for project: ${projectId}` : ''}`)

    // Build query based on whether projectId is provided
    let whereClause: any = {}
    if (projectId) {
      whereClause = {
        'novelMovieIntegration.projectId': {
          equals: projectId,
        },
      }
    }

    // Get all characters (with or without project filter)
    const characters = await payload.find({
      collection: 'characters',
      where: whereClause,
      limit: 1000, // Reasonable limit for relationship graphs
      depth: 2,
    })

    if (!characters.docs || characters.docs.length === 0) {
      return NextResponse.json({
        success: true,
        projectId: projectId || undefined,
        nodes: [],
        edges: [],
        statistics: {
          totalCharacters: 0,
          totalRelationships: 0,
          averageConnectionsPerCharacter: 0,
          mostConnectedCharacter: { id: '', name: '', connectionCount: 0 },
          relationshipTypes: [],
          averageStrength: 0,
          averageConflictLevel: 0,
        },
      })
    }

    // Build nodes
    const nodes: RelationshipGraphNode[] = characters.docs.map(character => {
      const relationships = character.enhancedRelationships || []
      const totalRelationships = relationships.length
      const averageStrength = totalRelationships > 0 
        ? relationships.reduce((sum: number, rel: any) => sum + (rel.strength || 5), 0) / totalRelationships
        : 0
      const averageConflictLevel = totalRelationships > 0
        ? relationships.reduce((sum: number, rel: any) => sum + (rel.conflictLevel || 1), 0) / totalRelationships
        : 0

      return {
        id: character.id,
        name: character.name,
        status: character.status || 'draft',
        characterId: character.characterId || character.id,
        projectId: character.novelMovieIntegration?.projectId || undefined,
        metadata: {
          age: character.age ?? undefined,
          role: (character as any).role || 'unknown',
          totalRelationships,
          averageRelationshipStrength: Math.round(averageStrength * 100) / 100,
          averageConflictLevel: Math.round(averageConflictLevel * 100) / 100,
        },
      }
    })

    // Build edges (relationships)
    const edges: RelationshipGraphEdge[] = []
    const processedPairs = new Set<string>()

    characters.docs.forEach(character => {
      const relationships = character.enhancedRelationships || []
      
      relationships.forEach((relationship: any) => {
        const sourceId = character.id
        const targetId = relationship.characterId
        
        // Create a consistent pair identifier to avoid duplicates
        const pairId = [sourceId, targetId].sort().join('-')
        
        if (!processedPairs.has(pairId)) {
          processedPairs.add(pairId)
          
          // Check if there's a reverse relationship
          const targetCharacter = characters.docs.find(c => c.id === targetId)
          const reverseRelationship = targetCharacter?.enhancedRelationships?.find(
            (rel: any) => rel.characterId === sourceId
          )
          
          const edge: RelationshipGraphEdge = {
            id: `${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            relationshipType: relationship.relationshipType,
            relationshipDynamic: relationship.relationshipDynamic,
            storyContext: relationship.storyContext,
            strength: relationship.strength || 5,
            conflictLevel: relationship.conflictLevel || 1,
            visualCues: relationship.visualCues || [],
            bidirectional: !!reverseRelationship,
          }
          
          edges.push(edge)
        }
      })
    })

    // Calculate statistics
    const totalCharacters = nodes.length
    const totalRelationships = edges.length
    const averageConnectionsPerCharacter = totalCharacters > 0 
      ? Math.round((totalRelationships * 2) / totalCharacters * 100) / 100 // *2 because each edge connects 2 nodes
      : 0

    // Find most connected character
    const connectionCounts = nodes.map(node => ({
      id: node.id,
      name: node.name,
      connectionCount: node.metadata.totalRelationships,
    }))
    const mostConnectedCharacter = connectionCounts.reduce(
      (max, current) => current.connectionCount > max.connectionCount ? current : max,
      { id: '', name: '', connectionCount: 0 }
    )

    // Count relationship types
    const relationshipTypeCounts = new Map<string, number>()
    edges.forEach(edge => {
      const type = edge.relationshipType
      relationshipTypeCounts.set(type, (relationshipTypeCounts.get(type) || 0) + 1)
    })

    const relationshipTypes = Array.from(relationshipTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    // Calculate average strength and conflict levels
    const averageStrength = edges.length > 0
      ? Math.round(edges.reduce((sum, edge) => sum + edge.strength, 0) / edges.length * 100) / 100
      : 0
    const averageConflictLevel = edges.length > 0
      ? Math.round(edges.reduce((sum, edge) => sum + edge.conflictLevel, 0) / edges.length * 100) / 100
      : 0

    const statistics = {
      totalCharacters,
      totalRelationships,
      averageConnectionsPerCharacter,
      mostConnectedCharacter,
      relationshipTypes,
      averageStrength,
      averageConflictLevel,
    }

    console.log(`Generated relationship graph with ${totalCharacters} characters and ${totalRelationships} relationships`)

    return NextResponse.json({
      success: true,
      projectId: projectId || undefined,
      nodes,
      edges,
      statistics,
    })

  } catch (error) {
    console.error('Relationship graph generation error:', error)
    return NextResponse.json({
      success: false,
      projectId: undefined,
      nodes: [],
      edges: [],
      statistics: {
        totalCharacters: 0,
        totalRelationships: 0,
        averageConnectionsPerCharacter: 0,
        mostConnectedCharacter: { id: '', name: '', connectionCount: 0 },
        relationshipTypes: [],
        averageStrength: 0,
        averageConflictLevel: 0,
      },
      error: error instanceof Error ? error.message : 'Failed to generate relationship graph',
    }, { status: 500 })
  }
}
