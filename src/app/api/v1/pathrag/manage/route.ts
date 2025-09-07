/**
 * PathRAG Knowledge Base Management API
 * POST /api/v1/pathrag/manage - Perform management operations
 * GET /api/v1/pathrag/manage - Get management interface info
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { pathragService } from '../../../../../services/PathRAGService'

interface ManagementRequest {
  action: 'sync_all' | 'sync_character' | 'delete_entity' | 'health_check' | 'get_stats'
  characterId?: string
  entityName?: string
  force?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ManagementRequest = await request.json()

    if (!body.action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    console.log(`PathRAG management action: ${body.action}`)

    switch (body.action) {
      case 'health_check':
        return await handleHealthCheck()
      
      case 'get_stats':
        return await handleGetStats()
      
      case 'sync_all':
        return await handleSyncAll(body.force || false)
      
      case 'sync_character':
        if (!body.characterId) {
          return NextResponse.json(
            { error: 'characterId is required for sync_character action' },
            { status: 400 }
          )
        }
        return await handleSyncCharacter(body.characterId)
      
      case 'delete_entity':
        if (!body.entityName) {
          return NextResponse.json(
            { error: 'entityName is required for delete_entity action' },
            { status: 400 }
          )
        }
        return await handleDeleteEntity(body.entityName)
      
      default:
        return NextResponse.json(
          { error: `Unknown action: ${body.action}` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('PathRAG management API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error during PathRAG management',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Return management interface information
    const healthResult = await pathragService.checkHealth()
    const statsResult = await pathragService.getStats()

    return NextResponse.json({
      success: true,
      data: {
        description: 'PathRAG Knowledge Base Management API',
        serviceHealth: {
          healthy: healthResult.healthy,
          details: healthResult.details,
          error: healthResult.error,
        },
        statistics: statsResult.success ? statsResult.stats : null,
        availableActions: {
          health_check: 'Check PathRAG service health and connectivity',
          get_stats: 'Get knowledge base statistics',
          sync_all: 'Sync all characters to PathRAG (use force=true to resync existing)',
          sync_character: 'Sync specific character by ID',
          delete_entity: 'Delete entity from knowledge base by name',
        },
        serviceConfig: pathragService.getConfig(),
        timestamp: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('PathRAG management GET API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleHealthCheck() {
  const result = await pathragService.checkHealth()
  
  return NextResponse.json({
    success: result.healthy,
    data: {
      healthy: result.healthy,
      details: result.details,
      error: result.error,
      serviceConfig: pathragService.getConfig(),
      timestamp: new Date().toISOString(),
    },
  })
}

async function handleGetStats() {
  const result = await pathragService.getStats()
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Failed to get PathRAG statistics',
        details: result.error
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      statistics: result.stats,
      serviceConfig: pathragService.getConfig(),
      timestamp: new Date().toISOString(),
    },
  })
}

async function handleSyncAll(force: boolean) {
  const payload = await getPayload({ config })
  
  console.log(`Starting bulk sync of all characters (force: ${force})`)

  // Get all characters
  const charactersResult = await payload.find({
    collection: 'characters',
    limit: 1000, // Adjust as needed
  })

  const characters = charactersResult.docs
  const results = []
  let successCount = 0
  let errorCount = 0

  for (const character of characters) {
    try {
      // Skip if already synced and not forcing
      if (!force && character.pathragSynced) {
        results.push({
          characterId: character.id,
          characterName: character.name,
          status: 'skipped',
          reason: 'Already synced (use force=true to resync)',
        })
        continue
      }

      console.log(`Syncing character: ${character.name}`)
      
      const syncResult = await pathragService.syncCharacterToKnowledgeBase(character)
      
      if (syncResult.success) {
        // Update character sync status
        await payload.update({
          collection: 'characters',
          id: character.id,
          data: {
            pathragSynced: true,
            pathragLastSync: new Date().toISOString(),
            pathragDocumentCount: syncResult.documentsInserted || 0,
          },
        })

        results.push({
          characterId: character.id,
          characterName: character.name,
          status: 'success',
          documentsInserted: syncResult.documentsInserted,
        })
        successCount++
      } else {
        results.push({
          characterId: character.id,
          characterName: character.name,
          status: 'error',
          error: syncResult.error,
        })
        errorCount++
      }

    } catch (error) {
      results.push({
        characterId: character.id,
        characterName: character.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown sync error',
      })
      errorCount++
    }
  }

  console.log(`Bulk sync completed: ${successCount} success, ${errorCount} errors`)

  return NextResponse.json({
    success: errorCount === 0,
    message: `Synced ${successCount}/${characters.length} characters successfully`,
    data: {
      totalCharacters: characters.length,
      successCount,
      errorCount,
      results,
      timestamp: new Date().toISOString(),
    },
  })
}

async function handleSyncCharacter(characterId: string) {
  const payload = await getPayload({ config })
  
  console.log(`Syncing individual character: ${characterId}`)

  // Get the character
  const character = await payload.findByID({
    collection: 'characters',
    id: characterId,
  })

  if (!character) {
    return NextResponse.json(
      { error: 'Character not found' },
      { status: 404 }
    )
  }

  // Sync to PathRAG
  const syncResult = await pathragService.syncCharacterToKnowledgeBase(character)
  
  if (!syncResult.success) {
    return NextResponse.json(
      { 
        error: 'Character sync failed',
        details: syncResult.error
      },
      { status: 500 }
    )
  }

  // Update character sync status
  await payload.update({
    collection: 'characters',
    id: characterId,
    data: {
      pathragSynced: true,
      pathragLastSync: new Date().toISOString(),
      pathragDocumentCount: syncResult.documentsInserted || 0,
    },
  })

  console.log(`✓ Successfully synced character: ${character.name}`)

  return NextResponse.json({
    success: true,
    message: `Successfully synced character: ${character.name}`,
    data: {
      characterId,
      characterName: character.name,
      documentsInserted: syncResult.documentsInserted,
      timestamp: new Date().toISOString(),
    },
  })
}

async function handleDeleteEntity(entityName: string) {
  console.log(`Deleting entity from PathRAG: ${entityName}`)

  const deleteResult = await pathragService.deleteEntity(entityName)
  
  if (!deleteResult.success) {
    return NextResponse.json(
      { 
        error: 'Entity deletion failed',
        details: deleteResult.error
      },
      { status: 500 }
    )
  }

  console.log(`✓ Successfully deleted entity: ${entityName}`)

  return NextResponse.json({
    success: true,
    message: `Successfully deleted entity: ${entityName}`,
    data: {
      entityName,
      relationshipsDeleted: deleteResult.relationshipsDeleted,
      timestamp: new Date().toISOString(),
    },
  })
}
