/**
 * Character Quality Metrics API
 * 
 * This endpoint provides comprehensive quality metrics for a specific character,
 * including visual consistency, narrative completeness, and relationship integrity.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface QualityMetrics {
  overallScore: number
  visualMetrics: {
    hasReferenceImage: boolean
    referenceImageQuality: number | null
    coreSetCompleteness: number
    averageImageQuality: number | null
    averageConsistencyScore: number | null
    totalImages: number
    coreReferenceCount: number
    lowQualityImageCount: number
    inconsistentImageCount: number
  }
  narrativeMetrics: {
    completenessScore: number
    biographyCompleteness: boolean
    personalityCompleteness: boolean
    motivationsCompleteness: boolean
    backstoryCompleteness: boolean
    physicalDescriptionCompleteness: boolean
    voiceDescriptionCompleteness: boolean
    skillsCount: number
    missingFields: string[]
  }
  relationshipMetrics: {
    totalRelationships: number
    averageRelationshipStrength: number | null
    averageConflictLevel: number | null
    relationshipTypes: Array<{
      type: string
      count: number
    }>
    orphanedRelationships: number
    bidirectionalRelationships: number
    strongRelationships: number // strength > 7
    conflictualRelationships: number // conflict > 7
  }
  technicalMetrics: {
    lastUpdated: Date
    lastValidated: Date | null
    syncStatus: string | null
    pathragSynced: boolean
    masterReferenceProcessed: boolean
    coreSetGenerated: boolean
    validationHistory: Array<{
      timestamp: Date
      validationType: string
      score: number
      notes?: string
    }>
  }
  recommendations: string[]
  issues: Array<{
    type: 'visual' | 'narrative' | 'relationship' | 'technical'
    severity: 'error' | 'warning' | 'info'
    description: string
    suggestedFix: string
  }>
}

export interface QualityMetricsResponse {
  success: boolean
  characterId: string
  characterName: string
  metrics: QualityMetrics
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<QualityMetricsResponse>> {
  try {
    const payload = await getPayload({ config })
    const { id: characterId } = await params

    console.log(`Generating quality metrics for character: ${characterId}`)

    // Get the character with full details
    const character = await payload.findByID({
      collection: 'characters',
      id: characterId,
      depth: 3,
    })

    if (!character) {
      return NextResponse.json({
        success: false,
        characterId,
        characterName: '',
        metrics: {} as QualityMetrics,
        error: 'Character not found',
      }, { status: 404 })
    }

    // Calculate visual metrics
    const visualMetrics = calculateVisualMetrics(character)
    
    // Calculate narrative metrics
    const narrativeMetrics = calculateNarrativeMetrics(character)
    
    // Calculate relationship metrics
    const relationshipMetrics = calculateRelationshipMetrics(character)
    
    // Calculate technical metrics
    const technicalMetrics = calculateTechnicalMetrics(character)
    
    // Calculate overall score
    const overallScore = Math.round(
      (visualMetrics.averageImageQuality || 0) * 0.3 +
      narrativeMetrics.completenessScore * 0.4 +
      (relationshipMetrics.averageRelationshipStrength || 0) * 10 * 0.2 +
      (technicalMetrics.pathragSynced ? 100 : 50) * 0.1
    )

    // Generate recommendations and issues
    const { recommendations, issues } = generateRecommendationsAndIssues(
      character,
      visualMetrics,
      narrativeMetrics,
      relationshipMetrics,
      technicalMetrics
    )

    const metrics: QualityMetrics = {
      overallScore,
      visualMetrics,
      narrativeMetrics,
      relationshipMetrics,
      technicalMetrics,
      recommendations,
      issues,
    }

    console.log(`Quality metrics generated: Overall score ${overallScore}`)

    return NextResponse.json({
      success: true,
      characterId: character.id,
      characterName: character.name,
      metrics,
    })

  } catch (error) {
    console.error('Quality metrics generation error:', error)
    return NextResponse.json({
      success: false,
      characterId: '',
      characterName: '',
      metrics: {} as QualityMetrics,
      error: error instanceof Error ? error.message : 'Failed to generate quality metrics',
    }, { status: 500 })
  }
}

function calculateVisualMetrics(character: any): QualityMetrics['visualMetrics'] {
  const imageGallery = character.imageGallery || []
  const coreImages = imageGallery.filter((img: any) => img.isCoreReference)
  
  const qualityScores = imageGallery
    .map((img: any) => img.qualityScore)
    .filter((score: number) => score !== null && score !== undefined)
  
  const consistencyScores = imageGallery
    .map((img: any) => img.consistencyScore)
    .filter((score: number) => score !== null && score !== undefined)

  const averageImageQuality = qualityScores.length > 0
    ? qualityScores.reduce((sum: number, score: number) => sum + score, 0) / qualityScores.length
    : null

  const averageConsistencyScore = consistencyScores.length > 0
    ? consistencyScores.reduce((sum: number, score: number) => sum + score, 0) / consistencyScores.length
    : null

  const lowQualityImageCount = qualityScores.filter((score: number) => score < 70).length
  const inconsistentImageCount = consistencyScores.filter((score: number) => score < 85).length

  // Core set completeness (expecting 8 angles: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
  const coreSetCompleteness = Math.min(100, (coreImages.length / 8) * 100)

  return {
    hasReferenceImage: !!character.masterReferenceImage,
    referenceImageQuality: character.masterReferenceImage?.qualityScore || null,
    coreSetCompleteness,
    averageImageQuality,
    averageConsistencyScore,
    totalImages: imageGallery.length,
    coreReferenceCount: coreImages.length,
    lowQualityImageCount,
    inconsistentImageCount,
  }
}

function calculateNarrativeMetrics(character: any): QualityMetrics['narrativeMetrics'] {
  const requiredFields = [
    'biography',
    'personality',
    'motivations',
    'backstory',
    'physicalDescription',
    'voiceDescription'
  ]

  const missingFields: string[] = []
  let completedFields = 0

  for (const field of requiredFields) {
    if (hasContent(character[field])) {
      completedFields++
    } else {
      missingFields.push(field)
    }
  }

  const completenessScore = Math.round((completedFields / requiredFields.length) * 100)

  return {
    completenessScore,
    biographyCompleteness: hasContent(character.biography),
    personalityCompleteness: hasContent(character.personality),
    motivationsCompleteness: hasContent(character.motivations),
    backstoryCompleteness: hasContent(character.backstory),
    physicalDescriptionCompleteness: hasContent(character.physicalDescription),
    voiceDescriptionCompleteness: hasContent(character.voiceDescription),
    skillsCount: (character.skills || []).length,
    missingFields,
  }
}

function calculateRelationshipMetrics(character: any): QualityMetrics['relationshipMetrics'] {
  const relationships = character.enhancedRelationships || []
  
  const strengths = relationships
    .map((rel: any) => rel.strength)
    .filter((strength: number) => strength !== null && strength !== undefined)
  
  const conflictLevels = relationships
    .map((rel: any) => rel.conflictLevel)
    .filter((level: number) => level !== null && level !== undefined)

  const averageRelationshipStrength = strengths.length > 0
    ? strengths.reduce((sum: number, strength: number) => sum + strength, 0) / strengths.length
    : null

  const averageConflictLevel = conflictLevels.length > 0
    ? conflictLevels.reduce((sum: number, level: number) => sum + level, 0) / conflictLevels.length
    : null

  // Count relationship types
  const relationshipTypeCounts = new Map<string, number>()
  relationships.forEach((rel: any) => {
    const type = rel.relationshipType
    relationshipTypeCounts.set(type, (relationshipTypeCounts.get(type) || 0) + 1)
  })

  const relationshipTypes = Array.from(relationshipTypeCounts.entries())
    .map(([type, count]) => ({ type, count }))

  const strongRelationships = relationships.filter((rel: any) => rel.strength > 7).length
  const conflictualRelationships = relationships.filter((rel: any) => rel.conflictLevel > 7).length

  return {
    totalRelationships: relationships.length,
    averageRelationshipStrength,
    averageConflictLevel,
    relationshipTypes,
    orphanedRelationships: 0, // Would need to check against all characters
    bidirectionalRelationships: 0, // Would need to check reverse relationships
    strongRelationships,
    conflictualRelationships,
  }
}

function calculateTechnicalMetrics(character: any): QualityMetrics['technicalMetrics'] {
  const validationHistory = character.enhancedQualityMetrics?.validationHistory || []

  return {
    lastUpdated: new Date(character.updatedAt),
    lastValidated: character.enhancedQualityMetrics?.lastValidated 
      ? new Date(character.enhancedQualityMetrics.lastValidated)
      : null,
    syncStatus: character.novelMovieIntegration?.syncStatus || null,
    pathragSynced: !!character.pathragSynced,
    masterReferenceProcessed: !!character.masterReferenceProcessed,
    coreSetGenerated: !!character.coreSetGenerated,
    validationHistory: validationHistory.map((entry: any) => ({
      timestamp: new Date(entry.timestamp),
      validationType: entry.validationType,
      score: entry.score,
      notes: entry.notes,
    })),
  }
}

function generateRecommendationsAndIssues(
  character: any,
  visualMetrics: QualityMetrics['visualMetrics'],
  narrativeMetrics: QualityMetrics['narrativeMetrics'],
  relationshipMetrics: QualityMetrics['relationshipMetrics'],
  technicalMetrics: QualityMetrics['technicalMetrics']
): { recommendations: string[]; issues: QualityMetrics['issues'] } {
  
  const recommendations: string[] = []
  const issues: QualityMetrics['issues'] = []

  // Visual recommendations and issues
  if (!visualMetrics.hasReferenceImage) {
    issues.push({
      type: 'visual',
      severity: 'error',
      description: 'Missing master reference image',
      suggestedFix: 'Upload or generate a master reference image',
    })
    recommendations.push('Generate a master reference image for visual consistency')
  }

  if (visualMetrics.coreSetCompleteness < 50) {
    issues.push({
      type: 'visual',
      severity: 'warning',
      description: 'Incomplete core reference set',
      suggestedFix: 'Generate 360° core reference images',
    })
    recommendations.push('Complete the 360° core reference set for better consistency')
  }

  if (visualMetrics.lowQualityImageCount > 0) {
    issues.push({
      type: 'visual',
      severity: 'warning',
      description: `${visualMetrics.lowQualityImageCount} low quality images`,
      suggestedFix: 'Regenerate or improve low quality images',
    })
  }

  // Narrative recommendations and issues
  if (narrativeMetrics.completenessScore < 70) {
    issues.push({
      type: 'narrative',
      severity: 'warning',
      description: 'Incomplete character development',
      suggestedFix: `Complete missing fields: ${narrativeMetrics.missingFields.join(', ')}`,
    })
    recommendations.push('Complete character development fields for better narrative consistency')
  }

  if (narrativeMetrics.skillsCount === 0) {
    issues.push({
      type: 'narrative',
      severity: 'info',
      description: 'No skills defined',
      suggestedFix: 'Add character skills and abilities',
    })
  }

  // Relationship recommendations and issues
  if (relationshipMetrics.totalRelationships === 0) {
    issues.push({
      type: 'relationship',
      severity: 'info',
      description: 'No relationships defined',
      suggestedFix: 'Add character relationships for story depth',
    })
    recommendations.push('Define character relationships to enhance story dynamics')
  }

  // Technical recommendations and issues
  if (!technicalMetrics.pathragSynced) {
    issues.push({
      type: 'technical',
      severity: 'warning',
      description: 'Not synced to PathRAG knowledge base',
      suggestedFix: 'Sync character to PathRAG for query capabilities',
    })
  }

  if (!technicalMetrics.lastValidated) {
    recommendations.push('Run validation to ensure character quality and consistency')
  }

  // General recommendations
  if (recommendations.length === 0 && issues.length === 0) {
    recommendations.push('Character quality looks excellent! Consider periodic updates as story evolves.')
  }

  return { recommendations, issues }
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
