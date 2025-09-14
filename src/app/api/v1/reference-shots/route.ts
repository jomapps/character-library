/**
 * Reference Shots Template Management API
 * 
 * GET /api/v1/reference-shots - List all shot templates
 * POST /api/v1/reference-shots - Create new template (admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface ReferenceShot {
  slug: string
  shotName: string
  lensMm: number
  mode: string
  angle: string
  crop: string
  expression: string
  pose: string
  fStop: number
  iso: number
  shutterSpeed: string
  referenceWeight: number
  pack: string
  description: string
  usageNotes: string
  tags: Array<{ tag: string }>
  fileNamePattern: string
  promptTemplate: string
}

export interface ListReferenceShotsResponse {
  success: boolean
  totalShots: number
  coreShots: number
  addonShots: number
  shots: ReferenceShot[]
  groupedByPack?: {
    core: ReferenceShot[]
    addon: ReferenceShot[]
  }
  groupedByLens?: {
    '35mm': ReferenceShot[]
    '50mm': ReferenceShot[]
    '85mm': ReferenceShot[]
  }
  error?: string
}

export interface CreateReferenceShotRequest {
  slug: string
  shotName: string
  lensMm: 35 | 50 | 85
  mode: 'Action/Body' | 'Conversation' | 'Emotion' | 'Hands'
  angle: string
  crop: string
  expression: string
  pose: string
  fStop: number
  iso: number
  shutterSpeed: string
  referenceWeight: number
  pack: 'core' | 'addon'
  description: string
  usageNotes: string
  tags: string[]
  fileNamePattern: string
  promptTemplate: string
}

export interface CreateReferenceShotResponse {
  success: boolean
  created: boolean
  shot?: ReferenceShot
  error?: string
}

/**
 * GET /api/v1/reference-shots
 * List all reference shot templates
 */
export async function GET(request: NextRequest): Promise<NextResponse<ListReferenceShotsResponse>> {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const pack = searchParams.get('pack') // 'core' | 'addon' | null
    const lens = searchParams.get('lens') // '35' | '50' | '85' | null
    const groupBy = searchParams.get('groupBy') // 'pack' | 'lens' | null

    console.log('📋 Listing reference shot templates')

    // Build query filters
    const where: any = {}
    if (pack) {
      where.pack = { equals: pack }
    }
    if (lens) {
      where.lensMm = { equals: parseInt(lens) }
    }

    // Get reference shots
    const result = await payload.find({
      collection: 'reference-shots',
      where,
      limit: 100, // Reasonable limit for templates
      sort: 'pack,lensMm,shotName', // Sort by pack, then lens, then name
    })

    const shots = result.docs as ReferenceShot[]
    const coreShots = shots.filter(shot => shot.pack === 'core').length
    const addonShots = shots.filter(shot => shot.pack === 'addon').length

    // Group shots if requested
    let groupedByPack: { core: ReferenceShot[], addon: ReferenceShot[] } | undefined
    let groupedByLens: { '35mm': ReferenceShot[], '50mm': ReferenceShot[], '85mm': ReferenceShot[] } | undefined

    if (groupBy === 'pack') {
      groupedByPack = {
        core: shots.filter(shot => shot.pack === 'core'),
        addon: shots.filter(shot => shot.pack === 'addon'),
      }
    }

    if (groupBy === 'lens') {
      groupedByLens = {
        '35mm': shots.filter(shot => shot.lensMm === 35),
        '50mm': shots.filter(shot => shot.lensMm === 50),
        '85mm': shots.filter(shot => shot.lensMm === 85),
      }
    }

    console.log(`📊 Found ${shots.length} reference shots (${coreShots} core, ${addonShots} addon)`)

    return NextResponse.json({
      success: true,
      totalShots: shots.length,
      coreShots,
      addonShots,
      shots,
      groupedByPack,
      groupedByLens,
    })

  } catch (error) {
    console.error('Failed to list reference shots:', error)
    return NextResponse.json({
      success: false,
      totalShots: 0,
      coreShots: 0,
      addonShots: 0,
      shots: [],
      error: error instanceof Error ? error.message : 'Failed to list reference shots',
    }, { status: 500 })
  }
}

/**
 * POST /api/v1/reference-shots
 * Create new reference shot template (admin only)
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateReferenceShotResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: CreateReferenceShotRequest = await request.json()

    console.log(`🎬 Creating new reference shot template: ${body.shotName}`)

    // Validate required fields
    if (!body.slug || !body.shotName || !body.lensMm || !body.mode) {
      return NextResponse.json({
        success: false,
        created: false,
        error: 'Missing required fields: slug, shotName, lensMm, mode',
      }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await payload.find({
      collection: 'reference-shots',
      where: {
        slug: { equals: body.slug }
      },
      limit: 1,
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json({
        success: false,
        created: false,
        error: `Reference shot with slug '${body.slug}' already exists`,
      }, { status: 409 })
    }

    // Convert tags array to required format
    const formattedTags = body.tags.map(tag => ({ tag }))

    // Create the reference shot
    const shot = await payload.create({
      collection: 'reference-shots',
      data: {
        ...body,
        tags: formattedTags,
      },
    })

    console.log(`✅ Created reference shot: ${shot.shotName}`)

    return NextResponse.json({
      success: true,
      created: true,
      shot: shot as ReferenceShot,
    })

  } catch (error) {
    console.error('Failed to create reference shot:', error)
    return NextResponse.json({
      success: false,
      created: false,
      error: error instanceof Error ? error.message : 'Failed to create reference shot',
    }, { status: 500 })
  }
}
