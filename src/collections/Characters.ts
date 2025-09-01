import type { CollectionConfig } from 'payload'
import { characterWorkflowService } from '../services/CharacterWorkflowService'
import { pathragService } from '../services/PathRAGService'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'characterId', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Character Name',
      admin: {
        description: 'The primary name of the character.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Character Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Development', value: 'in_development' },
        { label: 'Ready for Production', value: 'ready' },
        { label: 'In Production', value: 'in_production' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'characterId',
      type: 'text',
      label: 'Character ID',
      unique: true,
      admin: {
        description: 'Unique identifier for this character (auto-generated if not provided).',
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (!data?.characterId && data?.name) {
              // Generate a character ID from the name if not provided
              data.characterId = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return data?.characterId
          },
        ],
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Persona & Identity',
          fields: [
            {
              name: 'biography',
              type: 'richText',
              label: 'Character Biography',
              admin: {
                description: 'Detailed background story and history of the character.',
              },
            },
            {
              name: 'personality',
              type: 'richText',
              label: 'Personality & Traits',
              admin: {
                description: 'Character personality, behavioral traits, and psychological profile.',
              },
            },
            {
              name: 'motivations',
              type: 'richText',
              label: 'Motivations & Goals',
              admin: {
                description: 'What drives this character, their goals and desires.',
              },
            },
            {
              name: 'relationships',
              type: 'richText',
              label: 'Relationships & Connections',
              admin: {
                description: 'Key relationships with other characters and entities.',
              },
            },
            {
              name: 'backstory',
              type: 'richText',
              label: 'Backstory & Origin',
              admin: {
                description: 'Origin story and formative experiences.',
              },
            },
            {
              name: 'skills',
              type: 'array',
              label: 'Skills & Abilities',
              fields: [
                {
                  name: 'skill',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'level',
                  type: 'select',
                  options: [
                    { label: 'Beginner', value: 'beginner' },
                    { label: 'Intermediate', value: 'intermediate' },
                    { label: 'Advanced', value: 'advanced' },
                    { label: 'Expert', value: 'expert' },
                    { label: 'Master', value: 'master' },
                  ],
                },
                {
                  name: 'description',
                  type: 'textarea',
                },
              ],
            },
          ],
        },
        {
          label: 'Physical & Voice',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'age',
                  type: 'number',
                  label: 'Age',
                  admin: { width: '33%' },
                },
                {
                  name: 'height',
                  type: 'text',
                  label: 'Height',
                  admin: { width: '33%' },
                },
                {
                  name: 'weight',
                  type: 'text',
                  label: 'Weight',
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'eyeColor',
                  type: 'text',
                  label: 'Eye Color',
                  admin: { width: '50%' },
                },
                {
                  name: 'hairColor',
                  type: 'text',
                  label: 'Hair Color',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'physicalDescription',
              type: 'richText',
              label: 'Physical Description',
              admin: {
                description:
                  'Detailed physical appearance, distinguishing features, and overall look.',
              },
            },
            {
              name: 'voiceDescription',
              type: 'richText',
              label: 'Voice & Speech',
              admin: {
                description: 'Voice characteristics, accent, speech patterns, and mannerisms.',
              },
            },
            {
              name: 'clothing',
              type: 'richText',
              label: 'Clothing & Style',
              admin: {
                description: 'Typical clothing style, fashion preferences, and signature looks.',
              },
            },
          ],
        },
        {
          label: 'Reference Image Gallery',
          fields: [
            {
              name: 'workflowActions',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/CharacterWorkflowButtons',
                },
                condition: (data) => !!data?.id, // Only show for existing characters
              },
            },
            {
              name: 'masterReferenceImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Master Reference Image',
              admin: {
                description:
                  'The single "genesis" image that defines the character. All consistency is measured against this.',
              },
            },
            {
              name: 'masterReferenceProcessed',
              type: 'checkbox',
              label: 'Master Reference Processed',
              admin: {
                readOnly: true,
                description:
                  'Indicates if the master reference image has been processed by DINOv3.',
                position: 'sidebar',
              },
            },
            {
              name: 'masterReferenceQuality',
              type: 'number',
              label: 'Master Reference Quality Score',
              admin: {
                readOnly: true,
                description: 'Quality score of the master reference image (0-100).',
                position: 'sidebar',
              },
            },
            {
              name: 'coreSetGenerated',
              type: 'checkbox',
              label: '360° Core Set Generated',
              admin: {
                readOnly: true,
                description: 'Indicates if the 360° core reference set has been generated.',
                position: 'sidebar',
              },
            },
            {
              name: 'coreSetGeneratedAt',
              type: 'date',
              label: 'Core Set Generated At',
              admin: {
                readOnly: true,
                description: 'Timestamp when the 360° core set was generated.',
                position: 'sidebar',
              },
            },
            {
              name: 'coreSetQuality',
              type: 'json',
              label: 'Core Set Quality Metrics',
              admin: {
                readOnly: true,
                description: 'Quality metrics for the generated 360° core set.',
                position: 'sidebar',
                hidden: true, // Hidden by default as it's technical data
              },
            },
            {
              name: 'pathragSynced',
              type: 'checkbox',
              label: 'PathRAG Synced',
              admin: {
                readOnly: true,
                description:
                  'Indicates if character persona has been synced to PathRAG knowledge base.',
                position: 'sidebar',
              },
            },
            {
              name: 'pathragLastSync',
              type: 'date',
              label: 'PathRAG Last Sync',
              admin: {
                readOnly: true,
                description: 'Timestamp of the last successful PathRAG sync.',
                position: 'sidebar',
              },
            },
            {
              name: 'pathragDocumentCount',
              type: 'number',
              label: 'PathRAG Documents',
              admin: {
                readOnly: true,
                description: 'Number of documents synced to PathRAG knowledge base.',
                position: 'sidebar',
              },
            },
            {
              name: 'lastConsistencyValidation',
              type: 'date',
              label: 'Last Consistency Validation',
              admin: {
                readOnly: true,
                description: 'Timestamp of the last consistency validation run.',
                position: 'sidebar',
              },
            },
            {
              name: 'consistencyValidationSummary',
              type: 'json',
              label: 'Consistency Validation Summary',
              admin: {
                readOnly: true,
                description: 'Summary statistics from the last consistency validation.',
                position: 'sidebar',
                hidden: true, // Hidden by default as it's technical data
              },
            },
            {
              name: 'imageGallery',
              type: 'array',
              label: 'Character Image Gallery',
              admin: {
                description: 'A library of all generated and validated shots.',
              },
              fields: [
                {
                  name: 'imageFile',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Image File',
                },
                {
                  name: 'isCoreReference',
                  type: 'checkbox',
                  label: 'Is Part of 360° Core Set?',
                  admin: {
                    description: 'Check this for the initial 360-degree turnaround images.',
                  },
                },
                // DINOv3 Validation Data
                {
                  name: 'dinoAssetId',
                  type: 'text',
                  label: 'DINOv3 Asset ID',
                  admin: {
                    readOnly: true,
                    description: 'The unique key from the DINOv3 service (R2 object key).',
                  },
                },
                {
                  name: 'dinoProcessingStatus',
                  type: 'select',
                  label: 'DINOv3 Status',
                  options: [
                    { label: 'Pending', value: 'pending' },
                    { label: 'Processing', value: 'processing' },
                    { label: 'Validation Failed', value: 'validation_failed' },
                    { label: 'Validation Success', value: 'validation_success' },
                  ],
                  defaultValue: 'pending',
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'qualityScore',
                      type: 'number',
                      label: 'Quality Score (0-100)',
                      admin: {
                        readOnly: true,
                        width: '50%',
                      },
                    },
                    {
                      name: 'consistencyScore',
                      type: 'number',
                      label: 'Consistency Score (0-100)',
                      admin: {
                        readOnly: true,
                        width: '50%',
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
                    description: 'Contains reasons for failure from the DINOv3 service.',
                  },
                },
                // Image Metadata
                {
                  name: 'shotType',
                  type: 'text',
                  label: 'Shot Type',
                  admin: {
                    description: 'e.g., front, 45_left, over-the-shoulder, close-up',
                  },
                },
                {
                  name: 'tags',
                  type: 'textarea',
                  label: 'Image Tags',
                  admin: {
                    description: 'Descriptive tags for this image (lighting, mood, pose, etc.)',
                  },
                },
                {
                  name: 'generationPrompt',
                  type: 'textarea',
                  label: 'Generation Prompt',
                  admin: {
                    description: 'The prompt used to generate this image (if AI-generated).',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        try {
          // Handle master reference image processing
          if (operation === 'update' && doc.masterReferenceImage) {
            const previousMasterRef = previousDoc?.masterReferenceImage
            const currentMasterRef = doc.masterReferenceImage

            // Check if master reference image was added or changed
            if (currentMasterRef && currentMasterRef !== previousMasterRef) {
              console.log(`Processing new master reference for character: ${doc.name}`)

              // Get the media document
              const mediaDoc = await req.payload.findByID({
                collection: 'media',
                id: typeof currentMasterRef === 'string' ? currentMasterRef : currentMasterRef.id,
              })

              if (mediaDoc && mediaDoc.dinoAssetId) {
                // Process master reference with workflow service
                const result = await characterWorkflowService.processMasterReference(
                  doc.characterId || doc.id,
                  Buffer.from([]), // We'll get the buffer from the media file
                  mediaDoc.filename || 'master_reference.jpg',
                  req.payload,
                )

                if (result.success) {
                  console.log(`✓ Master reference processed successfully for ${doc.name}`)

                  // Update the character document with processing results
                  await req.payload.update({
                    collection: 'characters',
                    id: doc.id,
                    data: {
                      // Add a field to track master reference processing status
                      masterReferenceProcessed: true,
                      masterReferenceQuality: result.qualityScore,
                    },
                  })
                } else {
                  console.error(
                    `✗ Master reference processing failed for ${doc.name}:`,
                    result.error,
                  )
                }
              }
            }
          }

          // PathRAG sync for character persona data
          await syncCharacterToPathRAG(doc, operation, previousDoc)
        } catch (error) {
          console.error('Character hook error:', error)
        }

        return doc
      },
    ],
  },
}

/**
 * Sync character data to PathRAG knowledge base
 */
async function syncCharacterToPathRAG(doc: any, operation: string, previousDoc?: any) {
  try {
    // Only sync on create and update operations
    if (operation !== 'create' && operation !== 'update') {
      return
    }

    // Check if persona-related fields have changed
    const personaFields = [
      'name',
      'biography',
      'personality',
      'motivations',
      'relationships',
      'backstory',
      'skills',
      'physicalDescription',
      'voiceDescription',
      'clothing',
      'age',
      'height',
      'weight',
      'eyeColor',
      'hairColor',
    ]

    let shouldSync = operation === 'create'

    // For updates, check if any persona fields changed
    if (operation === 'update' && previousDoc) {
      shouldSync = personaFields.some((field) => {
        const currentValue = JSON.stringify(doc[field])
        const previousValue = JSON.stringify(previousDoc[field])
        return currentValue !== previousValue
      })
    }

    if (!shouldSync) {
      console.log(`No persona changes detected for character: ${doc.name}`)
      return
    }

    console.log(`Syncing character persona to PathRAG: ${doc.name}`)

    // Sync to PathRAG
    const syncResult = await pathragService.syncCharacterToKnowledgeBase(doc)

    if (syncResult.success) {
      console.log(
        `✓ Successfully synced ${doc.name} to PathRAG (${syncResult.documentsInserted} documents)`,
      )

      // Note: We don't update the document here to avoid infinite loops
      // The sync status will be updated by a separate API call or manual process
    } else {
      console.error(`✗ Failed to sync ${doc.name} to PathRAG:`, syncResult.error)
    }
  } catch (error) {
    console.error(`PathRAG sync error for character ${doc.name}:`, error)
  }
}
