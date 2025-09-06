/**
 * API endpoint for individual character operations
 * GET /api/characters/[id] - Get character by ID
 * PATCH /api/characters/[id] - Update character
 * DELETE /api/characters/[id] - Delete character
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    const character = await payload.findByID({
      collection: 'characters',
      id,
      depth: 3, // Include all related media with full details
    })

    if (!character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(character)
  } catch (error) {
    console.error('Character fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params
    const body = await request.json()

    const character = await payload.update({
      collection: 'characters',
      id,
      data: body,
    })

    return NextResponse.json(character)
  } catch (error) {
    console.error('Character update error:', error)
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getPayload({ config })
    const { id } = await params

    await payload.delete({
      collection: 'characters',
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Character deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    )
  }
}
