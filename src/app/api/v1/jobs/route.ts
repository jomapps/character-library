/**
 * Jobs Listing API
 * 
 * This endpoint allows listing and filtering background image generation jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface JobsListResponse {
  success: boolean
  jobs: Array<{
    jobId: string
    characterId: string
    jobType: 'core-set' | '360-set' | 'single-image'
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
    progress: {
      current: number
      total: number
      percentage: number
      currentTask?: string
    }
    createdAt: string
    startedAt?: string
    completedAt?: string
    estimatedCompletionAt?: string
  }>
  pagination: {
    totalDocs: number
    limit: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  error?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<JobsListResponse>> {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const characterId = searchParams.get('characterId')
    const status = searchParams.get('status')
    const jobType = searchParams.get('jobType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100) // Max 100 per page

    console.log(`📋 Listing jobs - page: ${page}, limit: ${limit}`)

    // Build query
    const query: any = {}

    if (characterId) {
      query.characterId = { equals: characterId }
    }

    if (status) {
      query.status = { equals: status }
    }

    if (jobType) {
      query.jobType = { equals: jobType }
    }

    // Get jobs from database
    const result = await payload.find({
      collection: 'image-generation-jobs',
      where: query,
      sort: '-createdAt', // Most recent first
      page,
      limit,
    })

    // Format response
    const jobs = result.docs.map(job => ({
      jobId: job.jobId,
      characterId: job.characterId,
      jobType: job.jobType,
      status: job.status,
      progress: {
        current: job.progress?.current || 0,
        total: job.progress?.total || 0,
        percentage: job.progress?.percentage || 0,
        currentTask: job.progress?.currentTask || undefined,
      },
      createdAt: job.createdAt,
      startedAt: job.startedAt || undefined,
      completedAt: job.completedAt || undefined,
      estimatedCompletionAt: job.estimatedCompletionAt || undefined,
    }))

    const response: JobsListResponse = {
      success: true,
      jobs,
      pagination: {
        totalDocs: result.totalDocs,
        limit: result.limit,
        page: result.page || 1,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage || false,
        hasPrevPage: result.hasPrevPage || false,
      },
    }

    console.log(`📋 Found ${jobs.length} jobs (${result.totalDocs} total)`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Jobs listing error:', error)
    
    return NextResponse.json({
      success: false,
      jobs: [],
      pagination: {
        totalDocs: 0,
        limit: 10,
        page: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      error: error instanceof Error ? error.message : 'Failed to list jobs',
    }, { status: 500 })
  }
}
