/**
 * Batch Scene Generation API
 * 
 * This endpoint handles batch generation of character images for multiple scenes
 * in a screenplay or project, optimizing for efficiency and consistency.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { imageGenerationService } from '@/services/ImageGenerationService'

export interface BatchSceneRequest {
  projectId: string
  scenes: Array<{
    sceneId: string
    characters: string[] // Character IDs
    sceneDescription: string
    requiredShots: string[]
    sceneType?: 'dialogue' | 'action' | 'emotional' | 'establishing'
    environmentContext?: string
    mood?: string
    lightingStyle?: string
  }>
  batchSettings?: {
    maxConcurrent?: number
    style?: string
    qualityThreshold?: number
  }
}

export interface BatchSceneResponse {
  success: boolean
  results: Array<{
    sceneId: string
    success: boolean
    generatedImages: Array<{
      characterId: string
      imageUrl?: string
      mediaId?: string
      shotType: string
      qualityScore?: number
    }>
    error?: string
  }>
  summary: {
    totalScenes: number
    successfulScenes: number
    failedScenes: number
    totalImages: number
    averageQuality?: number
  }
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<BatchSceneResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: BatchSceneRequest = await request.json()

    console.log(`Batch scene generation for project: ${body.projectId}`)
    console.log(`Processing ${body.scenes.length} scenes`)

    // Validate required fields
    if (!body.projectId) {
      return NextResponse.json({
        success: false,
        results: [],
        summary: { totalScenes: 0, successfulScenes: 0, failedScenes: 0, totalImages: 0 },
        error: 'projectId is required',
      }, { status: 400 })
    }

    if (!body.scenes || body.scenes.length === 0) {
      return NextResponse.json({
        success: false,
        results: [],
        summary: { totalScenes: 0, successfulScenes: 0, failedScenes: 0, totalImages: 0 },
        error: 'scenes array is required and cannot be empty',
      }, { status: 400 })
    }

    // Get all unique characters involved in the scenes
    const allCharacterIds = [...new Set(body.scenes.flatMap(scene => scene.characters))]
    const charactersMap = new Map()

    console.log(`Loading ${allCharacterIds.length} unique characters`)

    // Load all characters at once for efficiency
    await Promise.all(
      allCharacterIds.map(async (id) => {
        try {
          const character = await payload.findByID({
            collection: 'characters',
            id,
            depth: 3,
          })
          charactersMap.set(id, character)
          return character
        } catch (error) {
          console.error(`Failed to load character ${id}:`, error)
          return null
        }
      })
    )

    const results: BatchSceneResponse['results'] = []
    let successfulScenes = 0
    let failedScenes = 0
    let totalImages = 0
    let totalQuality = 0
    let qualityCount = 0

    const maxConcurrent = body.batchSettings?.maxConcurrent || 3

    // Process scenes in batches to avoid overwhelming the system
    for (let i = 0; i < body.scenes.length; i += maxConcurrent) {
      const sceneBatch = body.scenes.slice(i, i + maxConcurrent)
      
      const batchPromises = sceneBatch.map(scene => 
        processScene(scene, charactersMap, payload, body.batchSettings)
      )

      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach((result, index) => {
        const scene = sceneBatch[index]
        
        if (result.status === 'fulfilled' && result.value.success) {
          results.push(result.value)
          successfulScenes++
          totalImages += result.value.generatedImages.length
          
          // Calculate quality metrics
          result.value.generatedImages.forEach(img => {
            if (img.qualityScore) {
              totalQuality += img.qualityScore
              qualityCount++
            }
          })
        } else {
          const error = result.status === 'rejected' ? result.reason.message : result.value.error
          results.push({
            sceneId: scene.sceneId,
            success: false,
            generatedImages: [],
            error: error || 'Unknown error',
          })
          failedScenes++
        }
      })

      // Add a small delay between batches to prevent overwhelming the system
      if (i + maxConcurrent < body.scenes.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    const averageQuality = qualityCount > 0 ? totalQuality / qualityCount : undefined

    console.log(`Batch generation completed: ${successfulScenes}/${body.scenes.length} scenes successful`)

    return NextResponse.json({
      success: failedScenes === 0,
      results,
      summary: {
        totalScenes: body.scenes.length,
        successfulScenes,
        failedScenes,
        totalImages,
        averageQuality,
      },
    }, { status: failedScenes === 0 ? 200 : 207 }) // 207 Multi-Status for partial success

  } catch (error) {
    console.error('Batch scene generation error:', error)
    return NextResponse.json({
      success: false,
      results: [],
      summary: { totalScenes: 0, successfulScenes: 0, failedScenes: 0, totalImages: 0 },
      error: error instanceof Error ? error.message : 'Failed to process batch generation',
    }, { status: 500 })
  }
}

async function processScene(
  scene: BatchSceneRequest['scenes'][0],
  charactersMap: Map<string, any>,
  payload: any,
  _batchSettings?: BatchSceneRequest['batchSettings']
): Promise<BatchSceneResponse['results'][0]> {
  
  console.log(`Processing scene: ${scene.sceneId}`)

  const generatedImages: BatchSceneResponse['results'][0]['generatedImages'] = []

  try {
    // Get characters for this scene
    const sceneCharacters = scene.characters
      .map(id => charactersMap.get(id))
      .filter(char => char !== null)

    if (sceneCharacters.length === 0) {
      throw new Error('No valid characters found for scene')
    }

    // Generate images for each required shot type
    for (const shotType of scene.requiredShots) {
      // For each character in the scene
      for (const character of sceneCharacters) {
        try {
          const prompt = buildScenePrompt(character, scene, shotType)
          
          // Get reference image
          const referenceImageAssetId = (typeof character.masterReferenceImage === 'object' ? character.masterReferenceImage?.dinoAssetId : null) ||
            character.imageGallery?.find((img: any) => img.isCoreReference)?.dinoAssetId

          if (!referenceImageAssetId) {
            console.warn(`No reference image for character ${character.id}, skipping`)
            continue
          }

          // Generate image
          const generationResult = await imageGenerationService.generateImage(prompt, {
            referenceImageAssetId,
            style: 'custom',
            additionalReferenceIds: character.imageGallery
              ?.filter((img: any) => img.isCoreReference)
              ?.map((img: any) => img.dinoAssetId)
              ?.filter((id: any) => id)
              ?.slice(0, 2) // Limit for batch processing
          })

          if (!generationResult.success || !generationResult.imageBuffer) {
            console.error(`Image generation failed for ${character.name} in scene ${scene.sceneId}`)
            continue
          }

          // Default quality score for generated images
          const defaultQualityScore = 85

          // Upload image
          const filename = `${scene.sceneId}_${character.id}_${shotType}_${Date.now()}.jpg`
          const mediaResult = await uploadGeneratedImage(
            generationResult.imageBuffer,
            filename,
            payload
          )

          if (mediaResult.success) {
            generatedImages.push({
              characterId: character.id,
              imageUrl: mediaResult.imageUrl,
              mediaId: mediaResult.mediaId,
              shotType,
              qualityScore: defaultQualityScore,
            })

            // Update character with the new image
            await payload.update({
              collection: 'characters',
              id: character.id,
              data: {
                imageGallery: [
                  ...(character.imageGallery || []),
                  {
                    imageFile: mediaResult.mediaId,
                    isCoreReference: false,
                    shotType: shotType,
                    tags: `scene,${scene.sceneId},${shotType}`,
                    qualityScore: defaultQualityScore,
                    consistencyScore: 90, // Default consistency score
                  },
                ],
                sceneContexts: [
                  ...(character.sceneContexts || []),
                  {
                    sceneId: scene.sceneId,
                    sceneType: scene.sceneType || 'general',
                    generatedImages: [{ imageId: mediaResult.mediaId }],
                    qualityScores: [{ score: defaultQualityScore }],
                    lastGenerated: new Date().toISOString(),
                  },
                ],
              },
            })
          }

        } catch (error) {
          console.error(`Error generating image for ${character.name} in scene ${scene.sceneId}:`, error)
          // Continue with other characters/shots
        }
      }
    }

    return {
      sceneId: scene.sceneId,
      success: generatedImages.length > 0,
      generatedImages,
      error: generatedImages.length === 0 ? 'No images generated successfully' : undefined,
    }

  } catch (error) {
    return {
      sceneId: scene.sceneId,
      success: false,
      generatedImages: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function buildScenePrompt(character: any, scene: any, shotType: string): string {
  let prompt = `${character.name}, `

  // Add physical description
  if (character.physicalDescription) {
    const physicalDesc = extractTextFromRichText(character.physicalDescription)
    prompt += `${physicalDesc}, `
  }

  // Add basic attributes
  if (character.age) prompt += `age ${character.age}, `
  if (character.eyeColor) prompt += `${character.eyeColor} eyes, `
  if (character.hairColor) prompt += `${character.hairColor} hair, `

  // Add scene description
  prompt += `in scene: ${scene.sceneDescription}, `

  // Add shot type
  prompt += `${shotType} shot, `

  // Add scene-specific elements
  if (scene.environmentContext) prompt += `environment: ${scene.environmentContext}, `
  if (scene.mood) prompt += `mood: ${scene.mood}, `
  if (scene.lightingStyle) prompt += `lighting: ${scene.lightingStyle}, `

  prompt += 'high quality, detailed, cinematic'

  return prompt
}

function extractTextFromRichText(richText: any): string {
  if (!richText || !richText.root || !richText.root.children) {
    return ''
  }
  
  return richText.root.children
    .map((child: any) => child.text || '')
    .join(' ')
    .trim()
}

async function uploadGeneratedImage(
  imageBuffer: Buffer,
  filename: string,
  payload: any
): Promise<{ success: boolean; mediaId?: string; imageUrl?: string; error?: string }> {
  try {
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Generated scene image: ${filename}`,
      },
      file: {
        data: imageBuffer,
        mimetype: 'image/jpeg',
        name: filename,
        size: imageBuffer.length,
      },
    })

    return {
      success: true,
      mediaId: media.id,
      imageUrl: media.url,
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}
