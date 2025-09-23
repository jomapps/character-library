/**
 * Image Generation Jobs Collection
 * 
 * Tracks background image generation jobs for async processing
 */

import type { CollectionConfig } from 'payload'

export interface ImageGenerationJob {
  id: string
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
  requestData: {
    imageCount?: number
    style?: string
    qualityThreshold?: number
    maxRetries?: number
    angles?: string[]
    customSeed?: number
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
  startedAt: string
  completedAt?: string
  estimatedCompletionAt?: string
  createdAt: string
  updatedAt: string
}

const ImageGenerationJobs: CollectionConfig = {
  slug: 'image-generation-jobs',
  admin: {
    useAsTitle: 'jobId',
    defaultColumns: ['jobId', 'characterId', 'jobType', 'status', 'progress', 'createdAt'],
    group: 'System',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'jobId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique identifier for the job',
      },
    },
    {
      name: 'characterId',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'ID of the character for which images are being generated',
      },
    },
    {
      name: 'jobType',
      type: 'select',
      required: true,
      options: [
        { label: 'Core Set (27 shots)', value: 'core-set' },
        { label: '360° Set (Custom)', value: '360-set' },
        { label: 'Single Image', value: 'single-image' },
      ],
      admin: {
        description: 'Type of image generation job',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      index: true,
      admin: {
        description: 'Current status of the job',
      },
    },
    {
      name: 'progress',
      type: 'group',
      fields: [
        {
          name: 'current',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of images completed',
          },
        },
        {
          name: 'total',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of images to generate',
          },
        },
        {
          name: 'percentage',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Completion percentage (0-100)',
          },
        },
        {
          name: 'currentTask',
          type: 'text',
          admin: {
            description: 'Description of current task being processed',
          },
        },
      ],
    },
    {
      name: 'requestData',
      type: 'json',
      admin: {
        description: 'Original request parameters',
      },
    },
    {
      name: 'results',
      type: 'json',
      admin: {
        description: 'Generation results including images and metadata',
      },
    },
    {
      name: 'error',
      type: 'textarea',
      admin: {
        description: 'Error message if job failed',
      },
    },
    {
      name: 'startedAt',
      type: 'date',
      admin: {
        description: 'When the job started processing',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        description: 'When the job completed',
      },
    },
    {
      name: 'estimatedCompletionAt',
      type: 'date',
      admin: {
        description: 'Estimated completion time',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate percentage
        if (data.progress && data.progress.total > 0) {
          data.progress.percentage = Math.round((data.progress.current / data.progress.total) * 100)
        }
        
        // Set completion time when status changes to completed/failed
        if ((data.status === 'completed' || data.status === 'failed') && !data.completedAt) {
          data.completedAt = new Date().toISOString()
        }
        
        return data
      },
    ],
  },
}

export default ImageGenerationJobs
