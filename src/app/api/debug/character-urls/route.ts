/**
 * Debug endpoint to inspect character image URLs and asset IDs
 * GET /api/debug/character-urls?characterId=<id>
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const characterId = searchParams.get('characterId')
    
    if (!characterId) {
      return NextResponse.json({
        error: 'Missing characterId parameter',
        usage: '/api/debug/character-urls?characterId=<character-id>'
      }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Get character with full media details
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 3, // Include all related media
    })

    if (!character) {
      return NextResponse.json({
        error: 'Character not found',
        characterId
      }, { status: 404 })
    }

    // Extract master reference image details
    let masterRefDetails = null
    if (character.masterReferenceImage) {
      const masterRefId = typeof character.masterReferenceImage === 'string' 
        ? character.masterReferenceImage 
        : character.masterReferenceImage.id

      const masterRefMedia = await payload.findByID({
        collection: 'media',
        id: masterRefId,
      })

      masterRefDetails = {
        mediaId: masterRefId,
        dinoAssetId: masterRefMedia.dinoAssetId,
        dinoMediaUrl: masterRefMedia.dinoMediaUrl,
        filename: masterRefMedia.filename,
        url: masterRefMedia.url,
        dinoProcessingStatus: masterRefMedia.dinoProcessingStatus
      }
    }

    // Extract image gallery details
    const galleryDetails = character.imageGallery?.map((item: any) => {
      const imageFile = item.imageFile
      const mediaId = typeof imageFile === 'string' ? imageFile : imageFile?.id
      
      return {
        mediaId,
        dinoAssetId: item.dinoAssetId,
        isCoreReference: item.isCoreReference,
        shotType: item.shotType,
        dinoProcessingStatus: item.dinoProcessingStatus,
        qualityScore: item.qualityScore,
        consistencyScore: item.consistencyScore
      }
    }) || []

    // Test URL accessibility for master reference
    let masterRefUrlTest = null
    if (masterRefDetails?.dinoMediaUrl) {
      try {
        const response = await fetch(masterRefDetails.dinoMediaUrl, { method: 'HEAD' })
        masterRefUrlTest = {
          url: masterRefDetails.dinoMediaUrl,
          accessible: response.ok,
          status: response.status
        }
      } catch (error) {
        masterRefUrlTest = {
          url: masterRefDetails.dinoMediaUrl,
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Construct fallback URLs for comparison
    const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://media.rumbletv.com'
    const fallbackUrls = {
      characterIdAsUrl: `${baseUrl}/${characterId}`,
      characterIdWithExt: `${baseUrl}/${characterId}.jpg`,
      masterRefAssetId: masterRefDetails?.dinoAssetId ? `${baseUrl}/${masterRefDetails.dinoAssetId}` : null,
      masterRefAssetIdWithExt: masterRefDetails?.dinoAssetId ? `${baseUrl}/${masterRefDetails.dinoAssetId}.jpg` : null
    }

    const result = {
      character: {
        id: character.id,
        characterId: character.characterId,
        name: character.name,
        masterReferenceProcessed: character.masterReferenceProcessed
      },
      masterReference: masterRefDetails,
      masterRefUrlTest,
      imageGallery: galleryDetails,
      fallbackUrls,
      r2Config: {
        publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
        bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME
      },
      timestamp: new Date().toISOString()
    }

    console.log(`Character URL debug for ${characterId}:`, JSON.stringify(result, null, 2))

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Character URL debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
