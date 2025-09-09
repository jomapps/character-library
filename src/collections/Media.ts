import type { CollectionConfig } from 'payload'
import { dinoOrchestrator } from '../services/DinoOrchestrator'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    // DINOv3 Integration Fields
    {
      name: 'dinoAssetId',
      type: 'text',
      label: 'DINOv3 Asset ID',
      admin: {
        readOnly: true,
        description: 'The unique asset ID from the DINOv3 service (R2 object key).',
        position: 'sidebar',
      },
    },
    {
      name: 'dinoMediaUrl',
      type: 'text',
      label: 'DINOv3 Media URL',
      admin: {
        readOnly: true,
        description: 'The public URL for the media asset from DINOv3 service.',
        position: 'sidebar',
      },
    },
    {
      name: 'dinoProcessingStatus',
      type: 'select',
      label: 'DINOv3 Processing Status',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Validation Failed', value: 'validation_failed' },
        { label: 'Validation Success', value: 'validation_success' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'pending',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'dinoFeatures',
      type: 'json',
      label: 'DINOv3 Feature Vector',
      admin: {
        readOnly: true,
        description: '384-dimensional feature vector from DINOv3 model.',
        position: 'sidebar',
        hidden: true, // Hidden by default as it's technical data
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'qualityScore',
          type: 'number',
          label: 'Quality Score',
          admin: {
            readOnly: true,
            width: '50%',
            description: 'Image quality score (0-100) from DINOv3 analysis.',
          },
        },
        {
          name: 'consistencyScore',
          type: 'number',
          label: 'Consistency Score',
          admin: {
            readOnly: true,
            width: '50%',
            description: 'Character consistency score (0-100) when compared to reference.',
          },
        },
      ],
    },
    {
      name: 'validationNotes',
      type: 'textarea',
      label: 'Validation Notes',
      admin: {
        readOnly: true,
        description: 'Detailed notes from DINOv3 validation process, including failure reasons.',
      },
    },
    {
      name: 'dinoProcessedAt',
      type: 'date',
      label: 'DINOv3 Processed At',
      admin: {
        readOnly: true,
        description: 'Timestamp when DINOv3 processing was completed.',
        position: 'sidebar',
      },
    },
  ],
  upload: true,
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Only process on create operations and if not already processed
        if (operation !== 'create' || doc.dinoAssetId) {
          return doc
        }

        try {
          // For R2 storage, we need to download the file from the URL
          if (!doc.url) {
            console.warn(`Media URL not available for DINOv3 processing: ${doc.filename}`)
            return doc
          }

          console.log(`Downloading image from R2 for DINOv3 processing: ${doc.url}`)

          // Download the image from R2
          const response = await fetch(doc.url)
          if (!response.ok) {
            console.warn(`Failed to download image from R2: ${response.status} ${response.statusText}`)
            return doc
          }

          const imageBuffer = Buffer.from(await response.arrayBuffer())

          // Update status to processing
          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              dinoProcessingStatus: 'processing',
            },
          })

          // Process with DINOv3 orchestrator
          const result = await dinoOrchestrator.uploadAndExtract(
            imageBuffer,
            doc.filename || 'unknown',
          )

          console.log(`DINOv3 processing: ${result.status} - Asset ID: ${result.dinoAssetId}`)

          // Update the document with DINOv3 results
          const updateData: Record<string, any> = {
            dinoAssetId: result.dinoAssetId,
            dinoMediaUrl: result.dinoMediaUrl,
            dinoProcessingStatus: result.status === 'error' ? 'error' : 'validation_success',
            dinoProcessedAt: new Date().toISOString(),
          }

          if (result.features) {
            updateData.dinoFeatures = result.features
          }

          if (result.error) {
            updateData.validationNotes = result.error
          }

          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: updateData,
          })

          console.log(`DINOv3 processing completed for media: ${doc.id}`)
        } catch (error) {
          console.error('DINOv3 processing failed:', error)

          // Update status to error
          await req.payload.update({
            collection: 'media',
            id: doc.id,
            data: {
              dinoProcessingStatus: 'error',
              validationNotes: error instanceof Error ? error.message : 'Unknown processing error',
              dinoProcessedAt: new Date().toISOString(),
            },
          })
        }

        return doc
      },
    ],
  },
}
