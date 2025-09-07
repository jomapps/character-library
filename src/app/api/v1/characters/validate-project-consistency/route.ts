/**
 * Project Character Consistency Validation API
 * 
 * This endpoint validates character consistency across an entire project,
 * checking visual consistency, narrative coherence, and relationship integrity.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'


export interface ConsistencyRule {
  type: 'visual' | 'narrative' | 'relationship' | 'temporal'
  severity: 'error' | 'warning' | 'info'
  description: string
  threshold?: number
}

export interface ProjectConsistencyRequest {
  projectId: string
  validationRules?: ConsistencyRule[]
  includeVisualValidation?: boolean
  includeNarrativeValidation?: boolean
  includeRelationshipValidation?: boolean
  qualityThreshold?: number
  consistencyThreshold?: number
}

export interface ConsistencyIssue {
  type: 'visual' | 'narrative' | 'relationship' | 'temporal'
  severity: 'error' | 'warning' | 'info'
  characterId: string
  characterName: string
  description: string
  details: string
  suggestedFix?: string
  relatedCharacters?: string[]
  affectedImages?: string[]
  score?: number
}

export interface ProjectConsistencyResponse {
  success: boolean
  projectId: string
  validationResults: {
    overallScore: number
    visualConsistencyScore: number
    narrativeConsistencyScore: number
    relationshipConsistencyScore: number
    issues: ConsistencyIssue[]
    characterScores: Array<{
      characterId: string
      characterName: string
      overallScore: number
      visualScore: number
      narrativeScore: number
      relationshipScore: number
    }>
  }
  summary: {
    totalCharacters: number
    charactersValidated: number
    totalIssues: number
    errorCount: number
    warningCount: number
    infoCount: number
  }
  recommendations: string[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<ProjectConsistencyResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: ProjectConsistencyRequest = await request.json()

    console.log(`Validating project consistency for project: ${body.projectId}`)

    // Validate required fields
    if (!body.projectId) {
      return NextResponse.json({
        success: false,
        projectId: '',
        validationResults: {
          overallScore: 0,
          visualConsistencyScore: 0,
          narrativeConsistencyScore: 0,
          relationshipConsistencyScore: 0,
          issues: [],
          characterScores: [],
        },
        summary: {
          totalCharacters: 0,
          charactersValidated: 0,
          totalIssues: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
        },
        recommendations: [],
        error: 'projectId is required',
      }, { status: 400 })
    }

    // Get all characters for the project
    const characters = await payload.find({
      collection: 'characters',
      where: {
        'novelMovieIntegration.projectId': {
          equals: body.projectId,
        },
      },
      limit: 1000,
      depth: 3,
    })

    if (!characters.docs || characters.docs.length === 0) {
      return NextResponse.json({
        success: true,
        projectId: body.projectId,
        validationResults: {
          overallScore: 100,
          visualConsistencyScore: 100,
          narrativeConsistencyScore: 100,
          relationshipConsistencyScore: 100,
          issues: [],
          characterScores: [],
        },
        summary: {
          totalCharacters: 0,
          charactersValidated: 0,
          totalIssues: 0,
          errorCount: 0,
          warningCount: 0,
          infoCount: 0,
        },
        recommendations: ['No characters found for this project'],
      })
    }

    console.log(`Found ${characters.docs.length} characters to validate`)

    const issues: ConsistencyIssue[] = []
    const characterScores: ProjectConsistencyResponse['validationResults']['characterScores'] = []

    // Validate each character
    for (const character of characters.docs) {
      console.log(`Validating character: ${character.name}`)

      const characterIssues: ConsistencyIssue[] = []
      let visualScore = 100
      let narrativeScore = 100
      let relationshipScore = 100

      // Visual consistency validation
      if (body.includeVisualValidation !== false) {
        const visualIssues = await validateVisualConsistency(character, body.consistencyThreshold || 85)
        characterIssues.push(...visualIssues)
        visualScore = calculateScoreFromIssues(visualIssues, 100)
      }

      // Narrative consistency validation
      if (body.includeNarrativeValidation !== false) {
        const narrativeIssues = validateNarrativeConsistency(character)
        characterIssues.push(...narrativeIssues)
        narrativeScore = calculateScoreFromIssues(narrativeIssues, 100)
      }

      // Relationship consistency validation
      if (body.includeRelationshipValidation !== false) {
        const relationshipIssues = validateRelationshipConsistency(character, characters.docs)
        characterIssues.push(...relationshipIssues)
        relationshipScore = calculateScoreFromIssues(relationshipIssues, 100)
      }

      // Apply custom validation rules
      if (body.validationRules) {
        const customIssues = applyCustomValidationRules(character, body.validationRules)
        characterIssues.push(...customIssues)
      }

      issues.push(...characterIssues)

      const overallScore = Math.round((visualScore + narrativeScore + relationshipScore) / 3)

      characterScores.push({
        characterId: character.id,
        characterName: character.name,
        overallScore,
        visualScore,
        narrativeScore,
        relationshipScore,
      })

      // Update character with validation results
      await payload.update({
        collection: 'characters',
        id: character.id,
        data: {
          enhancedQualityMetrics: {
            ...character.enhancedQualityMetrics,
            narrativeConsistency: narrativeScore,
            crossSceneConsistency: visualScore,
            relationshipVisualConsistency: relationshipScore,
            lastValidated: new Date().toISOString(),
            validationHistory: [
              ...(character.enhancedQualityMetrics?.validationHistory || []),
              {
                timestamp: new Date().toISOString(),
                validationType: 'complete',
                score: overallScore,
                notes: `Project validation: ${characterIssues.length} issues found`,
              },
            ],
          },
        },
      })
    }

    // Calculate overall scores
    const overallScore = characterScores.length > 0
      ? Math.round(characterScores.reduce((sum, char) => sum + char.overallScore, 0) / characterScores.length)
      : 100

    const visualConsistencyScore = characterScores.length > 0
      ? Math.round(characterScores.reduce((sum, char) => sum + char.visualScore, 0) / characterScores.length)
      : 100

    const narrativeConsistencyScore = characterScores.length > 0
      ? Math.round(characterScores.reduce((sum, char) => sum + char.narrativeScore, 0) / characterScores.length)
      : 100

    const relationshipConsistencyScore = characterScores.length > 0
      ? Math.round(characterScores.reduce((sum, char) => sum + char.relationshipScore, 0) / characterScores.length)
      : 100

    // Count issues by severity
    const errorCount = issues.filter(issue => issue.severity === 'error').length
    const warningCount = issues.filter(issue => issue.severity === 'warning').length
    const infoCount = issues.filter(issue => issue.severity === 'info').length

    // Generate recommendations
    const recommendations = generateRecommendations(issues, characterScores)

    console.log(`Validation completed: ${issues.length} issues found, overall score: ${overallScore}`)

    return NextResponse.json({
      success: true,
      projectId: body.projectId,
      validationResults: {
        overallScore,
        visualConsistencyScore,
        narrativeConsistencyScore,
        relationshipConsistencyScore,
        issues,
        characterScores,
      },
      summary: {
        totalCharacters: characters.docs.length,
        charactersValidated: characters.docs.length,
        totalIssues: issues.length,
        errorCount,
        warningCount,
        infoCount,
      },
      recommendations,
    })

  } catch (error) {
    console.error('Project consistency validation error:', error)
    return NextResponse.json({
      success: false,
      projectId: '',
      validationResults: {
        overallScore: 0,
        visualConsistencyScore: 0,
        narrativeConsistencyScore: 0,
        relationshipConsistencyScore: 0,
        issues: [],
        characterScores: [],
      },
      summary: {
        totalCharacters: 0,
        charactersValidated: 0,
        totalIssues: 0,
        errorCount: 0,
        warningCount: 0,
        infoCount: 0,
      },
      recommendations: [],
      error: error instanceof Error ? error.message : 'Failed to validate project consistency',
    }, { status: 500 })
  }
}

async function validateVisualConsistency(character: any, threshold: number): Promise<ConsistencyIssue[]> {
  const issues: ConsistencyIssue[] = []

  // Check if character has master reference image
  if (!character.masterReferenceImage) {
    issues.push({
      type: 'visual',
      severity: 'error',
      characterId: character.id,
      characterName: character.name,
      description: 'Missing master reference image',
      details: 'Character does not have a master reference image for consistency validation',
      suggestedFix: 'Generate or upload a master reference image',
    })
    return issues
  }

  // Check image gallery consistency
  const imageGallery = character.imageGallery || []
  const coreImages = imageGallery.filter((img: any) => img.isCoreReference)

  if (coreImages.length === 0) {
    issues.push({
      type: 'visual',
      severity: 'warning',
      characterId: character.id,
      characterName: character.name,
      description: 'No core reference images',
      details: 'Character lacks 360° core reference set for comprehensive consistency',
      suggestedFix: 'Generate 360° core reference set',
    })
  }

  // Check consistency scores
  const lowConsistencyImages = imageGallery.filter(
    (img: any) => img.consistencyScore && img.consistencyScore < threshold
  )

  if (lowConsistencyImages.length > 0) {
    issues.push({
      type: 'visual',
      severity: 'warning',
      characterId: character.id,
      characterName: character.name,
      description: `${lowConsistencyImages.length} images below consistency threshold`,
      details: `Images with consistency scores below ${threshold}%`,
      suggestedFix: 'Regenerate low-consistency images or adjust reference images',
      affectedImages: lowConsistencyImages.map((img: any) => img.imageFile),
    })
  }

  return issues
}

function validateNarrativeConsistency(character: any): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = []

  // Check for missing essential character development fields
  const requiredFields = ['biography', 'personality', 'motivations']
  
  for (const field of requiredFields) {
    if (!character[field] || !hasContent(character[field])) {
      issues.push({
        type: 'narrative',
        severity: 'warning',
        characterId: character.id,
        characterName: character.name,
        description: `Missing ${field}`,
        details: `Character lacks ${field} information for narrative consistency`,
        suggestedFix: `Add detailed ${field} content`,
      })
    }
  }

  // Check physical description consistency
  if (!character.physicalDescription || !hasContent(character.physicalDescription)) {
    issues.push({
      type: 'narrative',
      severity: 'warning',
      characterId: character.id,
      characterName: character.name,
      description: 'Missing physical description',
      details: 'Character lacks detailed physical description',
      suggestedFix: 'Add comprehensive physical description',
    })
  }

  return issues
}

function validateRelationshipConsistency(character: any, allCharacters: any[]): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = []
  const relationships = character.enhancedRelationships || []

  // Check for orphaned relationships
  for (const relationship of relationships) {
    const relatedCharacter = allCharacters.find(c => c.id === relationship.characterId)
    
    if (!relatedCharacter) {
      issues.push({
        type: 'relationship',
        severity: 'error',
        characterId: character.id,
        characterName: character.name,
        description: 'Orphaned relationship',
        details: `Relationship references non-existent character: ${relationship.characterId}`,
        suggestedFix: 'Remove orphaned relationship or verify character ID',
        relatedCharacters: [relationship.characterId],
      })
    }
  }

  return issues
}

function applyCustomValidationRules(character: any, rules: ConsistencyRule[]): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = []

  for (const rule of rules) {
    // This is a simplified implementation - in practice, you'd have more sophisticated rule evaluation
    if (rule.type === 'visual' && rule.threshold) {
      const imageGallery = character.imageGallery || []
      const lowQualityImages = imageGallery.filter(
        (img: any) => img.qualityScore && img.qualityScore < rule.threshold!
      )

      if (lowQualityImages.length > 0) {
        issues.push({
          type: rule.type,
          severity: rule.severity,
          characterId: character.id,
          characterName: character.name,
          description: rule.description,
          details: `${lowQualityImages.length} images below quality threshold of ${rule.threshold}`,
          affectedImages: lowQualityImages.map((img: any) => img.imageFile),
        })
      }
    }
  }

  return issues
}

function calculateScoreFromIssues(issues: ConsistencyIssue[], baseScore: number): number {
  let score = baseScore

  for (const issue of issues) {
    switch (issue.severity) {
      case 'error':
        score -= 20
        break
      case 'warning':
        score -= 10
        break
      case 'info':
        score -= 2
        break
    }
  }

  return Math.max(0, score)
}

function generateRecommendations(issues: ConsistencyIssue[], characterScores: any[]): string[] {
  const recommendations: string[] = []

  const errorCount = issues.filter(i => i.severity === 'error').length
  const warningCount = issues.filter(i => i.severity === 'warning').length

  if (errorCount > 0) {
    recommendations.push(`Address ${errorCount} critical errors that may affect character consistency`)
  }

  if (warningCount > 0) {
    recommendations.push(`Review ${warningCount} warnings to improve character quality`)
  }

  const lowScoringCharacters = characterScores.filter(c => c.overallScore < 70)
  if (lowScoringCharacters.length > 0) {
    recommendations.push(`Focus on improving ${lowScoringCharacters.length} characters with scores below 70%`)
  }

  const missingReferenceIssues = issues.filter(i => i.description.includes('Missing master reference'))
  if (missingReferenceIssues.length > 0) {
    recommendations.push('Generate master reference images for characters missing them')
  }

  if (recommendations.length === 0) {
    recommendations.push('Character consistency looks good! Consider periodic re-validation as content evolves.')
  }

  return recommendations
}

function hasContent(richText: any): boolean {
  if (!richText || !richText.root || !richText.root.children) {
    return false
  }
  
  const text = richText.root.children
    .map((child: any) => child.text || '')
    .join('')
    .trim()
  
  return text.length > 0
}
