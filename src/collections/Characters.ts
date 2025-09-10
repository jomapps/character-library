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
            {
              name: 'role',
              type: 'select',
              label: 'Narrative Role',
              options: [
                { label: 'Protagonist', value: 'protagonist' },
                { label: 'Antagonist', value: 'antagonist' },
                { label: 'Supporting', value: 'supporting' },
                { label: 'Minor', value: 'minor' },
              ],
            },
            {
              name: 'archetype',
              type: 'text',
              label: 'Archetype',
              admin: { description: 'Classical or story archetype (e.g., Mentor, Trickster).' },
            },
            {
              name: 'psychology',
              type: 'group',
              label: 'Psychology',
              fields: [
                { name: 'motivation', type: 'textarea', label: 'Core Motivation' },
                { name: 'fears', type: 'textarea', label: 'Primary Fears' },
                { name: 'desires', type: 'textarea', label: 'Key Desires' },
                { name: 'flaws', type: 'textarea', label: 'Notable Flaws' },
              ],
            },
            {
              name: 'characterArc',
              type: 'group',
              label: 'Character Arc',
              admin: { description: 'Start → Transformation → End states.' },
              fields: [
                { name: 'startState', type: 'textarea', label: 'Start State' },
                { name: 'transformation', type: 'textarea', label: 'Transformation' },
                { name: 'endState', type: 'textarea', label: 'End State' },
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
              name: 'clothing',
              type: 'richText',
              label: 'Clothing & Style',
              admin: {
                description: 'Typical clothing style, fashion preferences, and signature looks.',
              },
            },
            {
              name: 'dialogueVoice',
              type: 'group',
              label: 'Dialogue Voice Profile',
              admin: {
                description: 'Structured voice profile used for voice-generation and dialogue rendering.',
              },
              fields: [
                {
                  name: 'voiceDescription',
                  type: 'richText',
                  label: 'Voice & Speech',
                  admin: {
                    description: 'Voice characteristics, accent, speech patterns, and mannerisms.',
                  },
                },
                { name: 'style', type: 'text', label: 'Voice Style' },
                {
                  name: 'patterns',
                  type: 'array',
                  label: 'Speech Patterns',
                  fields: [ { name: 'pattern', type: 'text', required: true } ],
                },
                { name: 'vocabulary', type: 'textarea', label: 'Vocabulary Profile' },
              ],
            },
            {
              name: 'voiceModels',
              type: 'array',
              label: 'Voice Generation Models',
              admin: {
                description: 'List of models and their voice IDs usable for TTS/dialogue generation. Multiple entries supported. voiceId may be empty initially.',
              },
              fields: [
                { name: 'modelName', type: 'text', required: true, label: 'Model Name' },
                { name: 'voiceId', type: 'text', required: false, label: 'Voice ID' },
                { name: 'voiceSample', type: 'relationship', label: 'Voice Sample', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Novel Movie Integration',
          fields: [
            {
              name: 'novelMovieIntegration',
              type: 'group',
              label: 'Novel Movie Project Integration',
              admin: {
                description: 'Integration settings and sync status with Novel Movie projects.',
              },
              fields: [
                {
                  name: 'projectId',
                  type: 'text',
                  label: 'Project ID',
                  admin: {
                    description: 'The Novel Movie project ID this character belongs to.',
                  },
                },
                {
                  name: 'projectName',
                  type: 'text',
                  label: 'Project Name',
                  admin: {
                    description: 'The name of the Novel Movie project.',
                  },
                },
                {
                  name: 'lastSyncAt',
                  type: 'date',
                  label: 'Last Sync Time',
                  admin: {
                    readOnly: true,
                    description: 'Timestamp of the last successful sync with Novel Movie.',
                  },
                },
                {
                  name: 'syncStatus',
                  type: 'select',
                  label: 'Sync Status',
                  options: [
                    { label: 'Synced', value: 'synced' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Conflict', value: 'conflict' },
                    { label: 'Error', value: 'error' },
                  ],
                  defaultValue: 'pending',
                  admin: {
                    description: 'Current synchronization status with Novel Movie.',
                  },
                },
                {
                  name: 'conflictResolution',
                  type: 'select',
                  label: 'Conflict Resolution Strategy',
                  options: [
                    { label: 'Manual Resolution', value: 'manual' },
                    { label: 'Auto Resolution', value: 'auto' },
                  ],
                  defaultValue: 'manual',
                  admin: {
                    description: 'How to handle sync conflicts between systems.',
                  },
                },
                {
                  name: 'changeLog',
                  type: 'array',
                  label: 'Change Log',
                  admin: {
                    description: 'History of changes and sync operations.',
                  },
                  fields: [
                    {
                      name: 'timestamp',
                      type: 'date',
                      required: true,
                      label: 'Change Time',
                    },
                    {
                      name: 'source',
                      type: 'select',
                      required: true,
                      label: 'Change Source',
                      options: [
                        { label: 'Novel Movie', value: 'novel-movie' },
                        { label: 'Character Library', value: 'character-library' },
                      ],
                    },
                    {
                      name: 'changes',
                      type: 'array',
                      label: 'Changed Fields',
                      fields: [
                        {
                          name: 'field',
                          type: 'text',
                          required: true,
                        },
                      ],
                    },
                    {
                      name: 'resolvedBy',
                      type: 'text',
                      label: 'Resolved By',
                      admin: {
                        description: 'User or system that resolved conflicts.',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'enhancedRelationships',
              type: 'array',
              label: 'Character Relationships',
              admin: {
                description: 'Detailed character relationships with other characters in the project.',
              },
              fields: [
                {
                  name: 'characterId',
                  type: 'text',
                  required: true,
                  label: 'Related Character ID',
                  admin: {
                    description: 'ID of the related character.',
                  },
                },
                {
                  name: 'characterName',
                  type: 'text',
                  label: 'Related Character Name',
                  admin: {
                    description: 'Name of the related character for reference.',
                  },
                },
                {
                  name: 'relationshipType',
                  type: 'text',
                  required: true,
                  label: 'Relationship Type',
                  admin: {
                    description: 'Type of relationship (e.g., friend, enemy, family, mentor).',
                  },
                },
                {
                  name: 'relationshipDynamic',
                  type: 'textarea',
                  label: 'Relationship Dynamic',
                  admin: {
                    description: 'Description of how these characters interact.',
                  },
                },
                {
                  name: 'storyContext',
                  type: 'textarea',
                  label: 'Story Context',
                  admin: {
                    description: 'How this relationship affects the story.',
                  },
                },
                {
                  name: 'visualCues',
                  type: 'array',
                  label: 'Visual Cues',
                  admin: {
                    description: 'Visual elements that represent this relationship.',
                  },
                  fields: [
                    {
                      name: 'cue',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'strength',
                  type: 'number',
                  label: 'Relationship Strength',
                  min: 1,
                  max: 10,
                  admin: {
                    description: 'Strength of the relationship (1-10).',
                  },
                },
                {
                  name: 'conflictLevel',
                  type: 'number',
                  label: 'Conflict Level',
                  min: 1,
                  max: 10,
                  admin: {
                    description: 'Level of conflict in the relationship (1-10).',
                  },
                },
              ],
            },
            {
              name: 'sceneContexts',
              type: 'array',
              label: 'Scene Contexts',
              admin: {
                description: 'Track character appearances in different scenes.',
              },
              fields: [
                {
                  name: 'sceneId',
                  type: 'text',
                  required: true,
                  label: 'Scene ID',
                },
                {
                  name: 'sceneType',
                  type: 'select',
                  label: 'Scene Type',
                  options: [
                    { label: 'Dialogue', value: 'dialogue' },
                    { label: 'Action', value: 'action' },
                    { label: 'Emotional', value: 'emotional' },
                    { label: 'Establishing', value: 'establishing' },
                  ],
                },
                {
                  name: 'generatedImages',
                  type: 'array',
                  label: 'Generated Images',
                  fields: [
                    {
                      name: 'imageId',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'qualityScores',
                  type: 'array',
                  label: 'Quality Scores',
                  fields: [
                    {
                      name: 'score',
                      type: 'number',
                      min: 0,
                      max: 100,
                    },
                  ],
                },
                {
                  name: 'lastGenerated',
                  type: 'date',
                  label: 'Last Generated',
                },
              ],
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
              name: 'enhancedQualityMetrics',
              type: 'group',
              label: 'Enhanced Quality Metrics',
              admin: {
                description: 'Comprehensive quality metrics for Novel Movie integration.',
                position: 'sidebar',
              },
              fields: [
                {
                  name: 'narrativeConsistency',
                  type: 'number',
                  label: 'Narrative Consistency Score',
                  min: 0,
                  max: 100,
                  admin: {
                    readOnly: true,
                    description: 'Consistency with story narrative (0-100).',
                  },
                },
                {
                  name: 'crossSceneConsistency',
                  type: 'number',
                  label: 'Cross-Scene Consistency Score',
                  min: 0,
                  max: 100,
                  admin: {
                    readOnly: true,
                    description: 'Visual consistency across different scenes (0-100).',
                  },
                },
                {
                  name: 'relationshipVisualConsistency',
                  type: 'number',
                  label: 'Relationship Visual Consistency',
                  min: 0,
                  max: 100,
                  admin: {
                    readOnly: true,
                    description: 'Visual consistency in relationship interactions (0-100).',
                  },
                },
                {
                  name: 'lastValidated',
                  type: 'date',
                  label: 'Last Validation',
                  admin: {
                    readOnly: true,
                    description: 'Timestamp of last quality validation.',
                  },
                },
                {
                  name: 'validationHistory',
                  type: 'array',
                  label: 'Validation History',
                  admin: {
                    readOnly: true,
                    description: 'History of quality validation runs.',
                  },
                  fields: [
                    {
                      name: 'timestamp',
                      type: 'date',
                      required: true,
                    },
                    {
                      name: 'validationType',
                      type: 'select',
                      options: [
                        { label: 'Visual', value: 'visual' },
                        { label: 'Narrative', value: 'narrative' },
                        { label: 'Complete', value: 'complete' },
                      ],
                    },
                    {
                      name: 'score',
                      type: 'number',
                      min: 0,
                      max: 100,
                    },
                    {
                      name: 'notes',
                      type: 'textarea',
                    },
                  ],
                },
              ],
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
          // Master reference processing is now handled entirely by the Media collection hooks
          // This prevents infinite loops and duplicate processing
          if (operation === 'update' && doc.masterReferenceImage) {
            console.log(`Character ${doc.name} updated with master reference, processing handled by Media collection`)
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
      'role',
      'archetype',
      'psychology',
      'characterArc',
      'physicalDescription',
      'dialogueVoice',
      'voiceModels',
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
