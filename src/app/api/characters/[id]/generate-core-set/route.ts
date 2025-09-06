/**
 * API endpoint for generating 360° core reference set for a character
 * POST /api/characters/[id]/generate-core-set
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '../../../../../payload.config'
import { characterWorkflowService } from '../../../../../services/CharacterWorkflowService'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { id: characterId } = await params

    console.log(`Starting 360° core set generation for character: ${characterId}`)

    // Get the character document
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
    })

    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 })
    }

    // Check if master reference image exists and is processed
    if (!character.masterReferenceImage) {
      return NextResponse.json(
        { error: 'Master reference image is required before generating core set' },
        { status: 400 },
      )
    }

    if (!character.masterReferenceProcessed) {
      return NextResponse.json(
        { error: 'Master reference image must be processed before generating core set' },
        { status: 400 },
      )
    }

    // Get the master reference media document
    const masterRefId =
      typeof character.masterReferenceImage === 'string'
        ? character.masterReferenceImage
        : character.masterReferenceImage.id

    const masterRefMedia = await payload.findByID({
      collection: 'media',
      id: masterRefId,
    })

    if (!masterRefMedia || !masterRefMedia.dinoAssetId) {
      return NextResponse.json(
        { error: 'Master reference image not properly processed with DINOv3' },
        { status: 400 },
      )
    }

    // Build character description from persona data
    const characterDescription = buildCharacterDescription(character)

    // Generate the 360° core set
    const result = await characterWorkflowService.generate360CoreSet(
      character.characterId || characterId,
      masterRefMedia.dinoAssetId,
      characterDescription,
      payload,
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Core set generation failed',
          details: {
            generatedImages: result.generatedImages,
            failedImages: result.failedImages,
            totalAttempts: result.totalAttempts,
          },
        },
        { status: 500 },
      )
    }

    // Update character document with core set results
    const coreSetImages = result.generatedImages
      .filter((img) => img.isValid)
      .map((img) => ({
        imageFile: img.imageId,
        isCoreReference: true,
        dinoAssetId: img.dinoAssetId,
        dinoProcessingStatus: 'validation_success' as const,
        qualityScore: img.qualityScore,
        consistencyScore: img.consistencyScore,
        shotType: `${img.angle}_degree_turnaround`,
        tags: `360° core reference, ${img.angle}° angle, turnaround`,
        validationNotes: `Generated as part of 360° core set. Quality: ${img.qualityScore}, Consistency: ${img.consistencyScore}`,
      }))

    // Add core set images to character gallery
    const updatedImageGallery = [...(character.imageGallery || []), ...coreSetImages]

    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        imageGallery: updatedImageGallery,
        coreSetGenerated: true,
        coreSetGeneratedAt: new Date().toISOString(),
        coreSetQuality: {
          successCount: result.generatedImages.filter((img) => img.isValid).length,
          totalAttempts: result.totalAttempts,
          averageQuality:
            result.generatedImages.reduce((sum, img) => sum + img.qualityScore, 0) /
            result.generatedImages.length,
          averageConsistency:
            result.generatedImages.reduce((sum, img) => sum + img.consistencyScore, 0) /
            result.generatedImages.length,
        },
      },
    })

    console.log(`✓ 360° core set generation completed for character: ${character.name}`)

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${result.generatedImages.filter((img) => img.isValid).length}/8 core reference images`,
      data: {
        characterId,
        characterName: character.name,
        generatedImages: result.generatedImages,
        failedImages: result.failedImages,
        totalAttempts: result.totalAttempts,
        coreSetImages: coreSetImages.map((img) => ({
          imageId: img.imageFile,
          angle: img.shotType,
          qualityScore: img.qualityScore,
          consistencyScore: img.consistencyScore,
        })),
      },
    })
  } catch (error) {
    console.error('Core set generation API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during core set generation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

/**
 * Build character description from persona data for image generation
 */
function buildCharacterDescription(character: any): string {
  const parts: string[] = []

  // Add basic info
  if (character.name) {
    parts.push(character.name)
  }

  // Add physical description
  if (character.age) {
    parts.push(`${character.age} years old`)
  }

  if (character.physicalDescription) {
    // Extract key physical traits from rich text
    const physicalText = extractTextFromRichText(character.physicalDescription)
    if (physicalText) {
      parts.push(physicalText.substring(0, 200)) // Limit length
    }
  }

  // Add basic physical attributes
  const physicalAttribs: string[] = []
  if (character.eyeColor) physicalAttribs.push(`${character.eyeColor} eyes`)
  if (character.hairColor) physicalAttribs.push(`${character.hairColor} hair`)
  if (character.height) physicalAttribs.push(`${character.height} tall`)

  if (physicalAttribs.length > 0) {
    parts.push(physicalAttribs.join(', '))
  }

  // Add clothing/style if available
  if (character.clothing) {
    const clothingText = extractTextFromRichText(character.clothing)
    if (clothingText) {
      parts.push(clothingText.substring(0, 100))
    }
  }

  return parts.join(', ')
}

/**
 * Extract plain text from Payload rich text field
 */
function extractTextFromRichText(richText: any): string {
  if (!richText) return ''

  if (typeof richText === 'string') {
    return richText
  }

  // Handle Lexical rich text format
  if (richText.root && richText.root.children) {
    return extractTextFromLexicalNodes(richText.root.children)
  }

  return ''
}

/**
 * Extract text from Lexical nodes recursively
 */
function extractTextFromLexicalNodes(nodes: any[]): string {
  let text = ''

  for (const node of nodes) {
    if (node.type === 'text') {
      text += node.text || ''
    } else if (node.children) {
      text += extractTextFromLexicalNodes(node.children)
    }

    // Add space between paragraphs
    if (node.type === 'paragraph') {
      text += ' '
    }
  }

  return text.trim()
}
