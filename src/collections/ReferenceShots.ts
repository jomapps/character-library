import type { CollectionConfig } from 'payload'

export const ReferenceShots: CollectionConfig = {
  slug: 'reference-shots',
  admin: {
    useAsTitle: 'shotName',
    defaultColumns: ['shotName', 'lensMm', 'mode', 'angle', 'crop', 'pack'],
    group: 'Character System',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user, // Only authenticated users can create
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Unique Slug',
      admin: {
        description: 'Unique identifier for this shot template (e.g., "35a_front_full_a_pose_v1")',
      },
    },
    {
      name: 'shotName',
      type: 'text',
      required: true,
      label: 'Shot Name',
      admin: {
        description: 'Display name for this shot (e.g., "35mm FRONT FULL (A pose)")',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'lensMm',
          type: 'number',
          required: true,
          label: 'Lens (mm)',
          admin: {
            description: 'Camera lens focal length',
            width: '33%',
          },
          validate: (val: number | null | undefined) => {
            if (val && ![35, 50, 85].includes(val)) {
              return 'Lens must be 35, 50, or 85mm'
            }
            return true
          },
        },
        {
          name: 'fStop',
          type: 'number',
          required: true,
          label: 'F-Stop',
          admin: {
            description: 'Camera aperture setting',
            width: '33%',
          },
        },
        {
          name: 'iso',
          type: 'number',
          required: true,
          label: 'ISO',
          defaultValue: 200,
          admin: {
            description: 'Camera ISO setting',
            width: '34%',
          },
        },
      ],
    },
    {
      name: 'shutterSpeed',
      type: 'text',
      required: true,
      label: 'Shutter Speed',
      defaultValue: '1/250',
      admin: {
        description: 'Camera shutter speed (e.g., "1/250")',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'mode',
          type: 'text',
          required: true,
          label: 'Mode',
          admin: {
            description: 'Shot mode/category',
            width: '50%',
          },
        },
        {
          name: 'angle',
          type: 'select',
          required: true,
          label: 'Angle',
          options: [
            { label: 'Front', value: 'front' },
            { label: '3/4 Left', value: '3q_left' },
            { label: '3/4 Right', value: '3q_right' },
            { label: 'Profile Left', value: 'profile_left' },
            { label: 'Profile Right', value: 'profile_right' },
            { label: 'Back', value: 'back' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'crop',
          type: 'select',
          required: true,
          label: 'Crop',
          options: [
            { label: 'Full Body', value: 'full' },
            { label: '3/4 (Mid-thigh)', value: '3q' },
            { label: 'Medium Close-Up (Shoulders)', value: 'mcu' },
            { label: 'Close-Up (Chest)', value: 'cu' },
            { label: 'Hands', value: 'hands' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'expression',
          type: 'text',
          required: true,
          label: 'Expression',
          admin: {
            description: 'Facial expression (neutral, determined, etc.)',
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pose',
          type: 'text',
          required: true,
          label: 'Pose',
          admin: {
            description: 'Body pose (a_pose, t_pose, relaxed, etc.)',
            width: '50%',
          },
        },
        {
          name: 'referenceWeight',
          type: 'number',
          required: true,
          label: 'Reference Weight',
          defaultValue: 0.9,
          admin: {
            description: 'Reference image strength (0.85-0.95)',
            width: '50%',
          },
          validate: (val: number | null | undefined) => {
            if (val && (val < 0.85 || val > 0.95)) {
              return 'Reference weight must be between 0.85 and 0.95'
            }
            return true
          },
        },
      ],
    },
    {
      name: 'pack',
      type: 'select',
      required: true,
      label: 'Pack Type',
      options: [
        { label: 'Core (Essential)', value: 'core' },
        { label: 'Add-on (Optional)', value: 'addon' },
      ],
      defaultValue: 'core',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
      admin: {
        description: 'Technical description of this shot',
      },
    },
    {
      name: 'usageNotes',
      type: 'textarea',
      required: true,
      label: 'Usage Notes',
      admin: {
        description: 'When and how to use this shot type',
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: {
        description: 'Searchable tags for this shot template',
      },
    },
    {
      name: 'fileNamePattern',
      type: 'text',
      required: true,
      label: 'File Name Pattern',
      admin: {
        description: 'Template for generated filenames using placeholders like {CHAR}, {LENS}, etc.',
      },
    },
    {
      name: 'promptTemplate',
      type: 'textarea',
      required: true,
      label: 'Prompt Template',
      admin: {
        description: 'Universal prompt template with placeholders for image generation',
        rows: 8,
      },
    },
    {
      type: 'collapsible',
      label: 'Advanced Settings',
      fields: [
        {
          name: 'isActive',
          type: 'checkbox',
          label: 'Active',
          defaultValue: true,
          admin: {
            description: 'Whether this template is available for generation',
          },
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: 'Sort Order',
          defaultValue: 0,
          admin: {
            description: 'Order for displaying templates (lower numbers first)',
          },
        },
        {
          name: 'version',
          type: 'text',
          label: 'Version',
          defaultValue: 'v1',
          admin: {
            description: 'Template version for tracking updates',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Auto-generate slug if not provided
        if (data && !data.slug && data.shotName) {
          data.slug = data.shotName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
        }
        return data
      },
    ],
  },
}
