/**
 * Batch Character Validation API
 * 
 * This endpoint performs validation on multiple characters simultaneously,
 * supporting different validation types and providing aggregated results.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface BatchValidationRequest {
  characterIds: string[]
  validationType: 'visual' | 'narrative' | 'complete'
  qualityThreshold?: number
  consistencyThreshold?: number
  includeRecommendations?: boolean
}

export interface ValidationResult {
  characterId: string
  characterName: string
  success: boolean
  validationType: string
  overallScore: number
  visualScore?: number
  narrativeScore?: number
  relationshipScore?: number
  issues: Array<{
    type: 'visual' | 'narrative' | 'relationship' | 'technical'
    severity: 'error' | 'warning' | 'info'
    description: string
    suggestedFix?: string
  }>
  recommendations?: string[]
  error?: string
}

export interface BatchValidationResponse {
  success: boolean
  results: ValidationResult[]
  summary: {
    totalCharacters: number
    validatedCharacters: number
    failedValidations: number
    averageScore: number
    scoreDistribution: {
      excellent: number // 90-100
      good: number      // 70-89
      fair: number      // 50-69
      poor: number      // 0-49
    }
    issuesSummary: {
      totalIssues: number
      errors: number
      warnings: number
      info: number
    }
  }
  recommendations: string[]
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<BatchValidationResponse>> {
  try {
    const payload = await getPayload({ config })
    const body: BatchValidationRequest = await request.json()

    console.log(`Batch validation for ${body.characterIds.length} characters`)
    console.log(`Validation type: ${body.validationType}`)

    // Validate required fields
    if (!body.characterIds || body.characterIds.length === 0) {
      return NextResponse.json({
        success: false,
        results: [],
        summary: {
          totalCharacters: 0,
          validatedCharacters: 0,
          failedValidations: 0,
          averageScore: 0,
          scoreDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
          issuesSummary: { totalIssues: 0, errors: 0, warnings: 0, info: 0 },
        },
        recommendations: [],
        error: 'characterIds array is required and cannot be empty',
      }, { status: 400 })
    }

    if (!['visual', 'narrative', 'complete'].includes(body.validationType)) {
      return NextResponse.json({
        success: false,
        results: [],
        summary: {
          totalCharacters: 0,
          validatedCharacters: 0,
          failedValidations: 0,
          averageScore: 0,
          scoreDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
          issuesSummary: { totalIssues: 0, errors: 0, warnings: 0, info: 0 },
        },
        recommendations: [],
        error: 'validationType must be one of: visual, narrative, complete',
      }, { status: 400 })
    }

    const results: ValidationResult[] = []
    let validatedCharacters = 0
    let failedValidations = 0
    let totalScore = 0

    // Process characters in batches to avoid overwhelming the system
    const batchSize = 10
    for (let i = 0; i < body.characterIds.length; i += batchSize) {
      const batch = body.characterIds.slice(i, i + batchSize)
      
      const batchPromises = batch.map(characterId => 
        validateCharacter(characterId, body, payload)
      )

      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
          if (result.value.success) {
            validatedCharacters++
            totalScore += result.value.overallScore
          } else {
            failedValidations++
          }
        } else {
          const characterId = batch[index]
          results.push({
            characterId,
            characterName: 'Unknown',
            success: false,
            validationType: body.validationType,
            overallScore: 0,
            issues: [],
            error: result.reason.message || 'Validation failed',
          })
          failedValidations++
        }
      })

      // Add a small delay between batches
      if (i + batchSize < body.characterIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Calculate summary statistics
    const averageScore = validatedCharacters > 0 ? Math.round(totalScore / validatedCharacters) : 0

    const scoreDistribution = {
      excellent: results.filter(r => r.overallScore >= 90).length,
      good: results.filter(r => r.overallScore >= 70 && r.overallScore < 90).length,
      fair: results.filter(r => r.overallScore >= 50 && r.overallScore < 70).length,
      poor: results.filter(r => r.overallScore < 50).length,
    }

    const allIssues = results.flatMap(r => r.issues)
    const issuesSummary = {
      totalIssues: allIssues.length,
      errors: allIssues.filter(i => i.severity === 'error').length,
      warnings: allIssues.filter(i => i.severity === 'warning').length,
      info: allIssues.filter(i => i.severity === 'info').length,
    }

    // Generate batch-level recommendations
    const batchRecommendations = generateBatchRecommendations(results, issuesSummary, scoreDistribution)

    console.log(`Batch validation completed: ${validatedCharacters}/${body.characterIds.length} successful`)

    return NextResponse.json({
      success: failedValidations === 0,
      results,
      summary: {
        totalCharacters: body.characterIds.length,
        validatedCharacters,
        failedValidations,
        averageScore,
        scoreDistribution,
        issuesSummary,
      },
      recommendations: batchRecommendations,
    }, { status: failedValidations === 0 ? 200 : 207 }) // 207 Multi-Status for partial success

  } catch (error) {
    console.error('Batch validation error:', error)
    return NextResponse.json({
      success: false,
      results: [],
      summary: {
        totalCharacters: 0,
        validatedCharacters: 0,
        failedValidations: 0,
        averageScore: 0,
        scoreDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
        issuesSummary: { totalIssues: 0, errors: 0, warnings: 0, info: 0 },
      },
      recommendations: [],
      error: error instanceof Error ? error.message : 'Failed to perform batch validation',
    }, { status: 500 })
  }
}

async function validateCharacter(
  characterId: string,
  request: BatchValidationRequest,
  payload: any
): Promise<ValidationResult> {
  try {
    console.log(`Validating character: ${characterId}`)

    // Get the character
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 3,
    })

    if (!character) {
      return {
        characterId,
        characterName: 'Unknown',
        success: false,
        validationType: request.validationType,
        overallScore: 0,
        issues: [],
        error: 'Character not found',
      }
    }

    const issues: ValidationResult['issues'] = []
    let visualScore = 100
    let narrativeScore = 100
    let relationshipScore = 100

    // Perform validation based on type
    if (request.validationType === 'visual' || request.validationType === 'complete') {
      const visualIssues = validateVisualAspects(character, request.consistencyThreshold || 85)
      issues.push(...visualIssues)
      visualScore = calculateScoreFromIssues(visualIssues, 100)
    }

    if (request.validationType === 'narrative' || request.validationType === 'complete') {
      const narrativeIssues = validateNarrativeAspects(character)
      issues.push(...narrativeIssues)
      narrativeScore = calculateScoreFromIssues(narrativeIssues, 100)
    }

    if (request.validationType === 'complete') {
      const relationshipIssues = validateRelationshipAspects(character)
      issues.push(...relationshipIssues)
      relationshipScore = calculateScoreFromIssues(relationshipIssues, 100)
    }

    // Calculate overall score based on validation type
    let overallScore: number
    switch (request.validationType) {
      case 'visual':
        overallScore = visualScore
        break
      case 'narrative':
        overallScore = narrativeScore
        break
      case 'complete':
        overallScore = Math.round((visualScore + narrativeScore + relationshipScore) / 3)
        break
      default:
        overallScore = 0
    }

    // Generate recommendations if requested
    const recommendations = request.includeRecommendations 
      ? generateCharacterRecommendations(issues, character)
      : undefined

    // Update character with validation results
    await payload.update({
      collection: 'characters',
      id: characterId,
      data: {
        enhancedQualityMetrics: {
          ...character.enhancedQualityMetrics,
          lastValidated: new Date(),
          validationHistory: [
            ...(character.enhancedQualityMetrics?.validationHistory || []),
            {
              timestamp: new Date(),
              validationType: request.validationType,
              score: overallScore,
              notes: `Batch validation: ${issues.length} issues found`,
            },
          ],
        },
      },
    })

    return {
      characterId: character.id,
      characterName: character.name,
      success: true,
      validationType: request.validationType,
      overallScore,
      visualScore: request.validationType === 'visual' || request.validationType === 'complete' ? visualScore : undefined,
      narrativeScore: request.validationType === 'narrative' || request.validationType === 'complete' ? narrativeScore : undefined,
      relationshipScore: request.validationType === 'complete' ? relationshipScore : undefined,
      issues,
      recommendations,
    }

  } catch (error) {
    console.error(`Error validating character ${characterId}:`, error)
    return {
      characterId,
      characterName: 'Unknown',
      success: false,
      validationType: request.validationType,
      overallScore: 0,
      issues: [],
      error: error instanceof Error ? error.message : 'Validation failed',
    }
  }
}

function validateVisualAspects(character: any, consistencyThreshold: number): ValidationResult['issues'] {
  const issues: ValidationResult['issues'] = []

  if (!character.masterReferenceImage) {
    issues.push({
      type: 'visual',
      severity: 'error',
      description: 'Missing master reference image',
      suggestedFix: 'Generate or upload a master reference image',
    })
  }

  const imageGallery = character.imageGallery || []
  const coreImages = imageGallery.filter((img: any) => img.isCoreReference)

  if (coreImages.length === 0) {
    issues.push({
      type: 'visual',
      severity: 'warning',
      description: 'No core reference images',
      suggestedFix: 'Generate 360° core reference set',
    })
  }

  const lowConsistencyImages = imageGallery.filter(
    (img: any) => img.consistencyScore && img.consistencyScore < consistencyThreshold
  )

  if (lowConsistencyImages.length > 0) {
    issues.push({
      type: 'visual',
      severity: 'warning',
      description: `${lowConsistencyImages.length} images below consistency threshold`,
      suggestedFix: 'Regenerate low-consistency images',
    })
  }

  return issues
}

function validateNarrativeAspects(character: any): ValidationResult['issues'] {
  const issues: ValidationResult['issues'] = []

  const requiredFields = ['biography', 'personality', 'motivations', 'physicalDescription']
  
  for (const field of requiredFields) {
    if (!character[field] || !hasContent(character[field])) {
      issues.push({
        type: 'narrative',
        severity: 'warning',
        description: `Missing ${field}`,
        suggestedFix: `Add detailed ${field} content`,
      })
    }
  }

  return issues
}

function validateRelationshipAspects(character: any): ValidationResult['issues'] {
  const issues: ValidationResult['issues'] = []

  const relationships = character.enhancedRelationships || []

  if (relationships.length === 0) {
    issues.push({
      type: 'relationship',
      severity: 'info',
      description: 'No relationships defined',
      suggestedFix: 'Add character relationships for story depth',
    })
  }

  return issues
}

function calculateScoreFromIssues(issues: ValidationResult['issues'], baseScore: number): number {
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

function generateCharacterRecommendations(issues: ValidationResult['issues'], _character: any): string[] {
  const recommendations: string[] = []

  const errorCount = issues.filter(i => i.severity === 'error').length
  const warningCount = issues.filter(i => i.severity === 'warning').length

  if (errorCount > 0) {
    recommendations.push(`Address ${errorCount} critical errors`)
  }

  if (warningCount > 0) {
    recommendations.push(`Review ${warningCount} warnings for improvement`)
  }

  if (issues.length === 0) {
    recommendations.push('Character quality is excellent!')
  }

  return recommendations
}

function generateBatchRecommendations(
  results: ValidationResult[],
  issuesSummary: any,
  scoreDistribution: any
): string[] {
  const recommendations: string[] = []

  if (issuesSummary.errors > 0) {
    recommendations.push(`Address ${issuesSummary.errors} critical errors across all characters`)
  }

  if (scoreDistribution.poor > 0) {
    recommendations.push(`Focus on improving ${scoreDistribution.poor} characters with poor scores`)
  }

  if (scoreDistribution.excellent === results.length) {
    recommendations.push('All characters have excellent quality scores!')
  }

  const commonIssues = findCommonIssues(results)
  if (commonIssues.length > 0) {
    recommendations.push(`Common issues to address: ${commonIssues.join(', ')}`)
  }

  return recommendations
}

function findCommonIssues(results: ValidationResult[]): string[] {
  const issueCount = new Map<string, number>()
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      issueCount.set(issue.description, (issueCount.get(issue.description) || 0) + 1)
    })
  })

  return Array.from(issueCount.entries())
    .filter(([_, count]) => count >= Math.ceil(results.length * 0.3)) // Issues affecting 30% or more
    .map(([description, _]) => description)
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
