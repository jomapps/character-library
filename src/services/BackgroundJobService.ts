/**
 * Background Job Processing Service
 * 
 * Handles async image generation jobs with progress tracking
 */

import { CoreSetGenerationService } from './CoreSetGenerationService'
import { EnhancedCoreSetGenerationService } from './EnhancedCoreSetGenerationService'
import { ImageGenerationJob } from '../collections/ImageGenerationJobs'

export interface JobProgress {
  current: number
  total: number
  percentage: number
  currentTask?: string
}

export interface JobResult {
  success: boolean
  generatedImages?: Array<{
    url: string
    angle: string
    quality: number
    dinoAssetId?: string
    mediaId?: string
  }>
  failedImages?: Array<{
    angle: string
    error: string
    attempts: number
  }>
  totalAttempts?: number
  processingTime?: number
  error?: string
}

export class BackgroundJobService {
  private static instance: BackgroundJobService
  private coreSetService: CoreSetGenerationService
  private enhancedCoreSetService: EnhancedCoreSetGenerationService
  private activeJobs: Map<string, boolean> = new Map()

  constructor() {
    this.coreSetService = new CoreSetGenerationService()
    this.enhancedCoreSetService = new EnhancedCoreSetGenerationService()
  }

  static getInstance(): BackgroundJobService {
    if (!BackgroundJobService.instance) {
      BackgroundJobService.instance = new BackgroundJobService()
    }
    return BackgroundJobService.instance
  }

  /**
   * Start a background job for image generation
   */
  async startJob(
    jobId: string,
    characterId: string,
    jobType: 'core-set' | '360-set',
    requestData: any,
    payload: any
  ): Promise<void> {
    if (this.activeJobs.has(jobId)) {
      console.warn(`Job ${jobId} is already running`)
      return
    }

    this.activeJobs.set(jobId, true)
    console.log(`🚀 Starting background job: ${jobId} (${jobType})`)

    try {
      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing', payload, {
        current: 0,
        total: requestData.imageCount || 27,
        percentage: 0,
        currentTask: 'Initializing...'
      })

      let result: JobResult

      if (jobType === 'core-set') {
        result = await this.processCoreSetJob(jobId, characterId, requestData, payload)
      } else {
        result = await this.process360SetJob(jobId, characterId, requestData, payload)
      }

      // Update job with results
      if (result.success) {
        await this.updateJobStatus(jobId, 'completed', payload, {
          current: requestData.imageCount || 27,
          total: requestData.imageCount || 27,
          percentage: 100,
          currentTask: 'Completed'
        }, result)
      } else {
        await this.updateJobStatus(jobId, 'failed', payload, undefined, undefined, result.error)
      }

    } catch (error) {
      console.error(`❌ Job ${jobId} failed:`, error)
      await this.updateJobStatus(
        jobId, 
        'failed', 
        payload, 
        undefined, 
        undefined, 
        error instanceof Error ? error.message : 'Unknown error'
      )
    } finally {
      this.activeJobs.delete(jobId)
      console.log(`✅ Job ${jobId} completed`)
    }
  }

  /**
   * Process core set generation job
   */
  private async processCoreSetJob(
    jobId: string,
    characterId: string,
    requestData: any,
    payload: any
  ): Promise<JobResult> {
    try {
      // Get character data
      const character = await payload.findByID({
        collection: 'characters',
        id: characterId,
        depth: 2,
      })

      if (!character) {
        throw new Error('Character not found')
      }

      // Check if character has master reference image
      const masterRef = typeof character.masterReferenceImage === 'string'
        ? null
        : character.masterReferenceImage

      if (!masterRef?.dinoAssetId) {
        throw new Error('Character must have a master reference image')
      }

      // Update progress
      await this.updateJobProgress(jobId, payload, {
        current: 0,
        total: 27,
        percentage: 0,
        currentTask: 'Starting core set generation...'
      })

      // Generate core set using enhanced service
      const result = await this.enhancedCoreSetService.generate360CoreSetEnhanced(
        characterId,
        masterRef.dinoAssetId,
        character,
        payload,
        {
          customSeed: requestData.customSeed,
          qualityThreshold: requestData.qualityThreshold || 75,
          maxRetries: requestData.maxRetries || 3,
          useEnhancedPrompts: true,
          validateCameraParameters: true,
          enhancedQualityThreshold: requestData.qualityThreshold || 80,
        },
        // Progress callback
        async (current: number, total: number, currentTask: string) => {
          await this.updateJobProgress(jobId, payload, {
            current,
            total,
            percentage: Math.round((current / total) * 100),
            currentTask
          })
        }
      )

      if (!result.success) {
        throw new Error(result.error || 'Core set generation failed')
      }

      // Convert result to job format
      return {
        success: true,
        generatedImages: result.generatedImages.map(img => ({
          url: `https://media.rumbletv.com/media/${img.imageId}`, // Construct URL
          angle: img.referenceShot.shotName,
          quality: img.qualityScore,
          dinoAssetId: img.dinoAssetId,
          mediaId: img.imageId,
        })),
        failedImages: result.failedImages.map(fail => ({
          angle: fail.referenceShot.shotName,
          error: fail.error,
          attempts: fail.attempts,
        })),
        totalAttempts: result.totalAttempts,
        processingTime: Date.now() - Date.parse(new Date().toISOString()), // Approximate
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Process 360 set generation job
   */
  private async process360SetJob(
    jobId: string,
    characterId: string,
    requestData: any,
    payload: any
  ): Promise<JobResult> {
    // This would implement the 360-set generation logic
    // For now, we'll use the same core set logic
    return this.processCoreSetJob(jobId, characterId, requestData, payload)
  }

  /**
   * Update job status in database
   */
  private async updateJobStatus(
    jobId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled',
    payload: any,
    progress?: JobProgress,
    results?: JobResult,
    error?: string
  ): Promise<void> {
    try {
      const updateData: any = { status }

      if (progress) {
        updateData.progress = progress
      }

      if (results) {
        updateData.results = results
      }

      if (error) {
        updateData.error = error
      }

      if (status === 'processing' && !updateData.startedAt) {
        updateData.startedAt = new Date().toISOString()
      }

      if (status === 'completed' || status === 'failed') {
        updateData.completedAt = new Date().toISOString()
      }

      await payload.update({
        collection: 'image-generation-jobs',
        where: { jobId: { equals: jobId } },
        data: updateData,
      })

    } catch (error) {
      console.error(`Failed to update job ${jobId}:`, error)
    }
  }

  /**
   * Update job progress only
   */
  private async updateJobProgress(
    jobId: string,
    payload: any,
    progress: JobProgress
  ): Promise<void> {
    await this.updateJobStatus(jobId, 'processing', payload, progress)
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string, payload: any): Promise<boolean> {
    if (!this.activeJobs.has(jobId)) {
      return false
    }

    this.activeJobs.delete(jobId)
    await this.updateJobStatus(jobId, 'cancelled', payload)
    return true
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string, payload: any): Promise<ImageGenerationJob | null> {
    try {
      const result = await payload.find({
        collection: 'image-generation-jobs',
        where: { jobId: { equals: jobId } },
        limit: 1,
      })

      return result.docs[0] || null
    } catch (error) {
      console.error(`Failed to get job status for ${jobId}:`, error)
      return null
    }
  }

  /**
   * Check if job is active
   */
  isJobActive(jobId: string): boolean {
    return this.activeJobs.has(jobId)
  }
}
