/**
 * Character Query API using PathRAG
 * POST /api/characters/query - Query character knowledge base with natural language
 * GET /api/characters/query/stats - Get PathRAG knowledge base statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { pathragService } from '../../../../../services/PathRAGService'

interface CharacterQueryRequest {
  query: string
  options?: {
    responseType?: 'Multiple Paragraphs' | 'Single Paragraph' | 'Bullet Points' | 'Detailed Explanation'
    topK?: number
    onlyContext?: boolean
    maxTokens?: {
      textUnit?: number
      globalContext?: number
      localContext?: number
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CharacterQueryRequest = await request.json()

    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required and cannot be empty' },
        { status: 400 }
      )
    }

    console.log(`Processing character query: "${body.query.substring(0, 100)}..."`)

    // Check PathRAG service health first
    const healthCheck = await pathragService.checkHealth()
    if (!healthCheck.healthy) {
      return NextResponse.json(
        { 
          error: 'PathRAG service is not available',
          details: healthCheck.error || 'Service health check failed'
        },
        { status: 503 }
      )
    }

    // Query the PathRAG knowledge base
    const queryResult = await pathragService.queryCharacterKnowledge(
      body.query,
      body.options || {}
    )

    if (!queryResult.success) {
      return NextResponse.json(
        { 
          error: 'Query failed',
          details: queryResult.error || 'Unknown query error'
        },
        { status: 500 }
      )
    }

    console.log(`✓ Character query completed successfully`)

    return NextResponse.json({
      success: true,
      data: {
        query: body.query,
        result: queryResult.result,
        originalQuery: queryResult.query,
        options: body.options,
        timestamp: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Character query API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error during character query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      // Get PathRAG knowledge base statistics
      const statsResult = await pathragService.getStats()
      
      if (!statsResult.success) {
        return NextResponse.json(
          { 
            error: 'Failed to get PathRAG statistics',
            details: statsResult.error || 'Unknown stats error'
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          pathragStats: statsResult.stats,
          serviceConfig: pathragService.getConfig(),
          timestamp: new Date().toISOString(),
        },
      })
    }

    if (action === 'health') {
      // Check PathRAG service health
      const healthResult = await pathragService.checkHealth()
      
      return NextResponse.json({
        success: healthResult.healthy,
        data: {
          healthy: healthResult.healthy,
          details: healthResult.details,
          error: healthResult.error,
          serviceConfig: pathragService.getConfig(),
          timestamp: new Date().toISOString(),
        },
      })
    }

    // Default: return available query options and examples
    return NextResponse.json({
      success: true,
      data: {
        description: 'Character Knowledge Query API powered by PathRAG',
        endpoints: {
          'POST /api/v1/characters/query': 'Query character knowledge base with natural language',
          'GET /api/v1/characters/query?action=stats': 'Get PathRAG knowledge base statistics',
          'GET /api/v1/characters/query?action=health': 'Check PathRAG service health',
        },
        queryOptions: {
          responseType: [
            'Multiple Paragraphs',
            'Single Paragraph', 
            'Bullet Points',
            'Detailed Explanation'
          ],
          topK: 'Number of top results to retrieve (default: 40)',
          onlyContext: 'Return only context without LLM response (default: false)',
          maxTokens: {
            textUnit: 'Maximum tokens for text units (default: 4000)',
            globalContext: 'Maximum tokens for global context (default: 3000)',
            localContext: 'Maximum tokens for local context (default: 5000)',
          },
        },
        exampleQueries: [
          'Tell me about the character named Jax',
          'What are the personality traits of characters in the database?',
          'Which characters have combat skills?',
          'Describe the relationships between characters',
          'What characters have blue eyes and dark hair?',
          'Tell me about the backstory of characters from noble families',
          'Which characters are motivated by revenge?',
          'Describe the physical appearance of warrior characters',
        ],
        serviceConfig: pathragService.getConfig(),
        timestamp: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('Character query GET API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
