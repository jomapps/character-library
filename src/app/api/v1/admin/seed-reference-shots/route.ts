/**
 * Admin API endpoint to seed reference shots
 * POST /api/v1/admin/seed-reference-shots
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { referenceShots } from '../../../../../scripts/seed-reference-shots'

export async function POST(_request: NextRequest) {
  try {
    console.log('🌱 Starting ReferenceShots seed process via API...')
    
    const payload = await getPayload({ config })
    
    // Check if any reference shots already exist
    const existing = await payload.find({
      collection: 'reference-shots',
      limit: 1,
    })
    
    if (existing.totalDocs > 0) {
      return NextResponse.json({
        success: false,
        message: 'ReferenceShots collection already has data. Delete existing reference shots first to re-seed.',
        existingCount: existing.totalDocs,
      })
    }
    
    console.log(`📝 Creating ${referenceShots.length} reference shot templates...`)
    
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    
    for (const shot of referenceShots) {
      try {
        await payload.create({
          collection: 'reference-shots',
          data: shot as any, // Type assertion needed for seed data
        })
        console.log(`✅ Created: ${shot.shotName}`)
        successCount++
      } catch (error) {
        const errorMsg = `Failed to create ${shot.shotName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
        errorCount++
      }
    }
    
    console.log('\n🎉 Seed process completed!')
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📊 Total: ${referenceShots.length}`)
    
    return NextResponse.json({
      success: successCount > 0,
      message: `Seed process completed. Created ${successCount}/${referenceShots.length} reference shots.`,
      results: {
        successCount,
        errorCount,
        totalAttempts: referenceShots.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
    
  } catch (error) {
    console.error('💥 Seed process failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Seed process failed',
    }, { status: 500 })
  }
}

export async function GET(_request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Get current reference shots count
    const existing = await payload.find({
      collection: 'reference-shots',
      limit: 0, // Just get count
    })
    
    return NextResponse.json({
      success: true,
      currentCount: existing.totalDocs,
      availableTemplates: referenceShots.length,
      needsSeeding: existing.totalDocs === 0,
      templates: referenceShots.map(shot => ({
        slug: shot.slug,
        shotName: shot.shotName,
        pack: shot.pack,
        lens: shot.lensMm,
        mode: shot.mode,
      })),
    })
    
  } catch (error) {
    console.error('Failed to check reference shots:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check reference shots',
    }, { status: 500 })
  }
}
