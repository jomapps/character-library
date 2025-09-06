/**
 * API endpoint for character CRUD operations
 * GET /api/characters - List characters with optional search
 * POST /api/characters - Create new character
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    let whereClause: any = {}

    // Add search functionality
    if (search) {
      whereClause = {
        or: [
          {
            name: {
              contains: search,
            },
          },
          {
            characterId: {
              contains: search,
            },
          },
        ],
      }
    }

    const characters = await payload.find({
      collection: 'characters',
      where: whereClause,
      limit,
      page,
      sort: '-createdAt',
      depth: 2, // Include related media
    })

    return NextResponse.json(characters)
  } catch (error) {
    console.error('Characters API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const character = await payload.create({
      collection: 'characters',
      data: body,
    })

    return NextResponse.json(character, { status: 201 })
  } catch (error) {
    console.error('Character creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    )
  }
}
