# Integrating PayloadCMS v3 with Cloudflare R2 via the S3 Storage Plugin

This document outlines how to connect PayloadCMS v3 to Cloudflare R2 for media storage. It leverages the S3-compatible API of R2 and the `payload-s3-storage` plugin.

## Core Components

1.  **PayloadCMS v3**: A headless CMS that provides the admin interface for uploading and managing content, including media files.
2.  **Cloudflare R2**: An object storage service that is compatible with the Amazon S3 API. It stores the actual file data.
3.  **`payload-s3-storage` Plugin**: The middleware that connects PayloadCMS to an S3-compatible service. When a file is uploaded to Payload, this plugin intercepts it and redirects it to the specified R2 bucket instead of storing it on the local server filesystem.

**Version Compatibility**: It is critical that the version of the `payload-s3-storage` plugin matches the major version of your PayloadCMS installation. For Payload v3, you must use a v3-compatible version of the plugin.

## The Workflow: From Upload to Public URL

Here is the step-by-step process of how a file uploaded in Payload becomes a publicly accessible URL served from Cloudflare R2.

1.  **Prerequisites & Configuration**:
    *   You have a Cloudflare R2 bucket with a public URL enabled (e.g., `https://pub-xxxxxxxx.r2.dev`).
    *   You have generated R2 API credentials (Access Key ID and Secret Access Key).
    *   In your `payload.config.ts`, you configure the `payload-s3-storage` plugin, providing the R2 bucket name, API endpoint, region (`auto`), and credentials.
    *   Crucially, you set the `public-url` option in the plugin configuration to your R2 bucket's public domain.

    ```typescript
    // payload.config.ts
    import { s3Storage } from '@payloadcms/storage-s3'

    const s3Adapter = s3Storage({
      config: {
        endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`,
        region: 'auto', // Important for R2
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      },
      bucket: process.env.R2_BUCKET_NAME,
    })

    // In your Media collection definition
    export const Media = {
      slug: 'media',
      upload: {
        staticURL: '/media',
        staticDir: 'media',
        adapter: s3Adapter,
        adminThumbnail: ({ doc }) => `${doc.url}`,
      },
      // ...
    }
    ```

2.  **User Uploads File**: An admin user accesses the Payload dashboard, navigates to a Media collection, and uploads an image (e.g., `my-character.jpg`).

3.  **Plugin Intercepts**: Payload's upload handler passes the file stream and metadata to the `payload-s3-storage` plugin.

4.  **API Call to R2**: The plugin, using the AWS S3 SDK under the hood, makes a `PutObject` API call to the configured R2 endpoint (`https://<ACCOUNT_ID>.r2.cloudflarestorage.com`). The file's data is sent in the body of this request.

5.  **R2 Stores Object**: Cloudflare R2 receives the request, authenticates it using the provided credentials, and stores the file data as an object in the specified bucket (`<YOUR_BUCKET_NAME>`).

6.  **Public URL Generation**: The plugin does **not** ask R2 for the URL. Instead, it deterministically constructs the public URL based on the configuration you provided. It combines the `public-url` from the config with the filename: `https://<YOUR_R2_PUBLIC_URL>/my-character.jpg`.

7.  **Payload Saves Metadata**: The plugin returns the file metadata, including the newly constructed public URL, to Payload. Payload then saves this metadata to its database (e.g., MongoDB or Postgres). The database record for `my-character.jpg` now contains a `url` field with the value `https://<YOUR_R2_PUBLIC_URL>/my-character.jpg`.

8.  **Serving the Image**: When a front-end application or user requests the image via Payload's API, Payload retrieves the media document from its database and returns the `url` field. The client's browser then makes a direct GET request to the Cloudflare R2 public URL, and R2 serves the image.

## Testing the Workflow

To verify this entire workflow, we can perform an end-to-end test.

### Test Steps

1.  **Configure Environment**: Ensure that environment variables for R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and the R2 Account ID for the endpoint) are correctly set up in your `.env` file.
2.  **Use an Upload Script**: A dedicated script can simulate the upload process without needing to go through the UI. This project contains `upload-test-image.js` for this purpose.
3.  **Execute the Script**: Run the script, pointing it to a local test image (e.g., `tests/test-data/character-image.jpg`).
4.  **Verify the Output**: The script should log the response from the upload endpoint. A successful response will contain the full public URL of the image now hosted on R2.
5.  **Manual Verification**: Access the logged URL in a web browser. The image should load correctly. You can also check your Cloudflare R2 bucket dashboard to see the newly uploaded file.

### Example: Exact Workflow Execution

This is a test using the project's tools.

1.  **Setup**: The `.env` file is populated with the necessary R2 credentials.
2.  **Command**: The following command will be executed:
    ```sh
    node upload-test-image.js
    ```
3.  **Expected Result**: The script will send `tests/test-data/character-image.jpg` to the local running Payload instance, which will use the S3 adapter to upload it to R2. The console will log a JSON object containing the `url` of the uploaded file, pointing to the R2 public domain.
