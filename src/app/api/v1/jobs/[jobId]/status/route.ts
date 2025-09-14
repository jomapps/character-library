/**
 * Job Status Polling API
 * 
 * This endpoint allows external apps to poll the status of background image generation jobs
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { BackgroundJobService } from '../../../../../../services/BackgroundJobService'

export interface JobStatusResponse {
  success: boolean
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: {
    current: number
    total: number
    percentage: number
    currentTask?: string
  }
  results?: {
    generatedImages: Array<{
      url: string
      angle: string
      quality: number
      dinoAssetId?: string
      mediaId?: string
    }>
    failedImages: Array<{
      angle: string
      error: string
      attempts: number
    }>
    totalAttempts: number
    processingTime: number
  }
  error?: string
  startedAt?: string
  completedAt?: string
  estimatedCompletionAt?: string
  message?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse<JobStatusResponse>> {
  try {
    const payload = await getPayload({ config })
    const { jobId } = await params

    console.log(`📊 Checking status for job: ${jobId}`)

    // Get job from database
    const result = await payload.find({
      collection: 'image-generation-jobs',
      where: { jobId: { equals: jobId } },
      limit: 1,
    })

    if (!result.docs || result.docs.length === 0) {
      return NextResponse.json({
        success: false,
        jobId,
        status: 'failed',
        progress: { current: 0, total: 0, percentage: 0 },
        error: 'Job not found',
      }, { status: 404 })
    }

    const job = result.docs[0]
    
    // Check if job is still active in background service
    const backgroundJobService = BackgroundJobService.getInstance()
    const isActive = backgroundJobService.isJobActive(jobId)

    // Prepare response
    const response: JobStatusResponse = {
      success: true,
      jobId: job.jobId,
      status: job.status,
      progress: {
        current: job.progress?.current || 0,
        total: job.progress?.total || 0,
        percentage: job.progress?.percentage || 0,
        currentTask: job.progress?.currentTask || undefined,
      },
      startedAt: job.startedAt || undefined,
      completedAt: job.completedAt || undefined,
      estimatedCompletionAt: job.estimatedCompletionAt || undefined,
    }

    // Add results if job is completed
    if (job.status === 'completed' && job.results) {
      // Type assertion since we know the structure from our service
      response.results = job.results as JobStatusResponse['results']
      const results = job.results as any
      response.message = `Job completed successfully. Generated ${results.generatedImages?.length || 0} images.`
    }

    // Add error if job failed
    if (job.status === 'failed') {
      response.error = job.error || 'Job failed for unknown reason'
      response.message = 'Job failed. Please check the error details.'
    }

    // Add processing message
    if (job.status === 'processing') {
      response.message = `Job is processing. ${response.progress.currentTask || 'Working...'}`
      
      // Update estimated completion if still active
      if (isActive && response.progress.percentage > 0 && job.startedAt) {
        const elapsed = Date.now() - new Date(job.startedAt).getTime()
        const estimatedTotal = (elapsed / response.progress.percentage) * 100
        const remaining = estimatedTotal - elapsed
        response.estimatedCompletionAt = new Date(Date.now() + remaining).toISOString()
      }
    }

    // Add pending message
    if (job.status === 'pending') {
      response.message = 'Job is queued and will start processing soon.'
    }

    // Add cancelled message
    if (job.status === 'cancelled') {
      response.message = 'Job was cancelled.'
    }

    console.log(`📊 Job ${jobId} status: ${job.status} (${response.progress.percentage}%)`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('Job status check error:', error)
    
    return NextResponse.json({
      success: false,
      jobId: '',
      status: 'failed',
      progress: { current: 0, total: 0, percentage: 0 },
      error: error instanceof Error ? error.message : 'Failed to check job status',
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse<{ success: boolean; message: string; error?: string }>> {
  try {
    const payload = await getPayload({ config })
    const { jobId } = await params

    console.log(`🛑 Cancelling job: ${jobId}`)

    // Check if job exists
    const result = await payload.find({
      collection: 'image-generation-jobs',
      where: { jobId: { equals: jobId } },
      limit: 1,
    })

    if (!result.docs || result.docs.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Job not found',
      }, { status: 404 })
    }

    const job = result.docs[0]

    // Can only cancel pending or processing jobs
    if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
      return NextResponse.json({
        success: false,
        message: `Cannot cancel job with status: ${job.status}`,
      }, { status: 400 })
    }

    // Cancel in background service
    const backgroundJobService = BackgroundJobService.getInstance()
    const cancelled = await backgroundJobService.cancelJob(jobId, payload)

    if (cancelled) {
      return NextResponse.json({
        success: true,
        message: 'Job cancelled successfully',
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Job was not actively running, but marked as cancelled',
      })
    }

  } catch (error) {
    console.error('Job cancellation error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to cancel job',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
