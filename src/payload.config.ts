// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Characters } from './collections/Characters'
import { ReferenceShots } from './collections/ReferenceShots'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Configure Cloudflare R2 storage adapter
const s3Adapter = s3Storage({
  config: {
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    region: 'auto', // Required for Cloudflare R2
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Required for R2
  },
  bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
  collections: {
    media: {
      prefix: 'media', // Optional: organize files in a folder
      generateFileURL: ({ filename }) => {
        // Generate the public URL using the custom domain
        const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 'https://media.rumbletv.com'
        return `${baseUrl}/media/${filename}`
      },
    },
  },
})

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Characters, ReferenceShots],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Adapter,
  ],
})
