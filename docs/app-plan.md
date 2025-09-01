Of course. The availability of a production-ready DINOv3 service is a game-changer. It transforms the concept of "quality assurance" from a manual or abstract idea into a concrete, automatable engineering task. The plan to establish a 360° reference set is an excellent strategy for building a robust foundation for consistency.

This revised plan integrates the DINOv3 service as a core, non-negotiable step in the asset lifecycle. It acts as an automated quality and consistency gatekeeper for every image that enters the library.

Here is the new, comprehensive markdown document for creating the character library.

---

# Implementation Plan: AI-Powered Character Asset Library (v3.0)

## 1. Executive Summary

This document outlines the implementation plan for a state-of-the-art Digital Asset Library for Characters. This version (v3.0) is built on a trinity of powerful, decoupled services:

1.  **Payload CMS v3:** The central hub and user-facing source of truth for all character data.
2.  **A Generative Image Model (e.g., Gemini):** The creative engine for producing new character visuals.
3.  **The DINOv3 Analysis Service (`dino.ft.tc`):** The automated, non-negotiable gatekeeper for ensuring the quality and consistency of every visual asset.

This architecture replaces subjective manual review with objective, machine-driven validation. The core workflow is centered around creating a foundational "360° Core Reference Set" for each character, which is then used by the DINOv3 service to validate all subsequent generated content.

## 2. High-Level System Architecture

The architecture relies on an orchestrator within the Payload backend to manage interactions between the generative model and the DINOv3 analysis service.

```
+--------------------------------+       +------------------------------------+
|      User / Content Editor     |       |      User / Application            |
+---------------+----------------+       +-----------------+------------------+
                | (CRUD Operations)                         | (Asks Question)
                v                                           v
+--------------------------------+       +------------------------------------+
|  1. PAYLOAD CMS + MONGODB      |       |  4. STANDALONE PATHRAG SERVICE     |
|  (Source of Truth)             |--(A)-->|  - Ingests formatted character data|
|  - Character Persona           |       |  - Provides a /query API endpoint  |
|  - Curated & Validated Gallery |       +------------------------------------+
+---------------+----------------+
                |
                | (B. Orchestrates Generation & Validation)
                v
+-----------------------------------------------------------------------------+
|  2. ORCHESTRATION LAYER (Within Payload Backend)                            |
|       |                                        |                            |
|       | 1. Calls Generative Model              | 3. Saves Result to Payload |
|       v                                        |                            |
|  [Generative Model API]                        ^                            |
|       |                                        |                            |
|       | 2. Sends Generated Image for QA        |                            |
|       v                                        |                            |
|  3. DINOv3 ANALYSIS SERVICE (dino.ft.tc) <-----+                            |
|  - Manages Assets (Upload/Store)                                            |
|  - Validates Consistency & Quality (`/character-matching`, `/analyze-quality`)|
+-----------------------------------------------------------------------------+
```

*   **(A) Data Sync:** When a character's text persona is updated, a hook formats and sends it to the PathRAG service.
*   **(B) Generation & QA Loop:** When a new image is needed, the Orchestration Layer calls the generative model, sends the result to the DINOv3 service for validation, and only saves the final asset with its QA scores back into Payload.

## 3. Pillar 1: The Data Backbone (Payload CMS Collection)

The `characters` collection schema is updated to store critical metadata from the DINOv3 service, making every image's quality and consistency metrics queryable.

### `characters` Collection Definition

```typescript
// src/collections/Characters.ts
import { CollectionConfig } from 'payload/types';
// ... other imports

const Characters: CollectionConfig = {
  slug: 'characters',
  admin: { useAsTitle: 'name' },
  hooks: {
    // Hooks for PathRAG sync (as defined previously)
  },
  fields: [
    // ... (name, status, characterId, Persona, Physical tabs remain the same)
    {
      type: 'tabs',
      tabs: [
        // ... Persona & Identity Tab
        // ... Physical & Voice Tab
        {
          label: 'Reference Image Gallery',
          fields: [
            {
              name: 'masterReferenceImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Master Reference Image',
              admin: { description: 'The single "genesis" image that defines the character. All consistency is measured against this.' },
            },
            {
              name: 'imageGallery',
              type: 'array',
              label: 'Character Image Gallery',
              admin: { description: 'A library of all generated and validated shots.' },
              fields: [
                { name: 'imageFile', type: 'upload', relationTo: 'media', required: true },
                {
                  name: 'isCoreReference',
                  type: 'checkbox',
                  label: 'Is Part of 360° Core Set?',
                  admin: { description: 'Check this for the initial 360-degree turnaround images.' },
                },
                // --- DINOv3 VALIDATION DATA ---
                {
                  name: 'dinoAssetId',
                  type: 'text',
                  label: 'DINOv3 Asset ID',
                  admin: { readOnly: true, description: 'The unique key from the DINOv3 service (R2 object key).' },
                },
                {
                  name: 'dinoProcessingStatus',
                  type: 'select',
                  label: 'DINOv3 Status',
                  options: ['pending', 'processing', 'validation_failed', 'validation_success'],
                  defaultValue: 'pending',
                  admin: { readOnly: true },
                },
                {
                  type: 'row', fields: [
                    { name: 'qualityScore', type: 'number', label: 'Quality Score (0-100)', admin: { readOnly: true, width: '50%' } },
                    { name: 'consistencyScore', type: 'number', label: 'Consistency Score (0-100)', admin: { readOnly: true, width: '50%' } },
                  ]
                },
                { name: 'validationNotes', type: 'textarea', label: 'Validation Notes', admin: { readOnly: true, description: 'Contains reasons for failure from the DINOv3 service.' } },
                // --- END DINOv3 DATA ---
                { name: 'shotType', type: 'text', label: 'Shot Type (e.g., front, 45_left, over-the-shoulder)' },
                { name: 'tags', type: 'textarea', label: 'Image Tags' },
              ],
            },
          ],
        },
      ],
    },
  ],
};```

## 4. Pillar 2: The Automated Character Workflow (Enhanced Strategy)

This workflow formalizes your 360° turnaround strategy and embeds the DINOv3 service at every step.

#### Phase 1: Persona Definition
*   **Action:** A creator fills out the character's text-based persona in Payload.
*   **System:** The `afterChange` hook syncs this text data to the PathRAG service.

#### Phase 2: Master Reference Creation (The "Genesis Image")
*   **Action:** An artist generates the first, perfect image of the character. This image is uploaded to the `masterReferenceImage` field in Payload.
*   **System (Automated):**
    1.  The Orchestrator sends the image to `POST /api/v1/upload-media`.
    2.  It receives the `dinoAssetId` and saves it to the media document.
    3.  It calls `POST /api/v1/extract-features` to process the image.
    4.  The character is now ready for the next phase.

#### Phase 3: Core Reference Set Generation (The 360° Turnaround)
*   **Action:** A user clicks a button in the Payload UI like "Generate 360° Core Set".
*   **System (Automated Loop):**
    1.  The Orchestrator runs 8 times, for angles [0°, 45°, 90°, ..., 315°].
    2.  In each loop, it calls the generative model with a prompt like *"Full body shot of [Character Name], neutral expression, studio lighting, turned 45 degrees to the left"* and provides the **master reference image** for consistency.
    3.  The generated image is sent to the DINOv3 service for the standard upload/extract workflow.
    4.  **Crucially**, it then calls `POST /validate-consistency` comparing the new turnaround image against the **master reference image**.
    5.  The `consistencyScore` is retrieved. If it's above a set threshold (e.g., 95%), the image is saved to the `imageGallery` with `isCoreReference` checked. If not, it can be flagged for review or automatically retried.

#### Phase 4: On-Demand Production Generation & Automated QA
*   **Action:** A user needs a new shot (e.g., *"Jax smiling, wearing a leather jacket, cinematic lighting"*).
*   **System (Automated):**
    1.  The Orchestrator calls the generative model, providing the prompt and the **entire Core Reference Set** (the master + the 8 turnaround images) to ensure maximum consistency from all angles.
    2.  The generated image is sent to the DINOv3 service for upload and feature extraction.
    3.  **Automated QA Gate:** The Orchestrator makes two parallel calls to the DINOv3 service:
        *   `POST /character-matching` with the `masterReferenceImage`'s `dinoAssetId` and the new image's `dinoAssetId`.
        *   `POST /analyze-quality` with the new image's `dinoAssetId`.
    4.  The `consistencyScore` and `qualityScore` are returned.
    5.  The Orchestrator saves the new image to the `imageGallery`, populating all DINOv3 fields. The `dinoProcessingStatus` is set to `validation_success` or `validation_failed` based on predefined thresholds.
    6.  **Result:** The Payload UI now contains a complete, validated library. An artist can immediately see which images are high-quality and consistent, and filter out any that failed the automated QA.

## 5. Pillar 3: Service Integration Logic

### The DINOv3 Orchestration Service
This will be a module within your Payload backend responsible for managing all interactions with `dino.ft.tc`.

**Key Functions to Implement:**

1.  `uploadAndExtract(imageBuffer)`:
    *   Calls `POST /api/v1/upload-media`.
    *   Calls `POST /api/v1/extract-features`.
    *   Returns the `dinoAssetId` and status.

2.  `validateNewAsset(newAssetId, masterRefAssetId)`:
    *   Calls `POST /character-matching` with the two IDs.
    *   Calls `POST /analyze-quality` with the `newAssetId`.
    *   Returns an object: `{ consistencyScore, qualityScore, validationNotes }`.

**Payload Hook Implementation:**
You will need a hook on the `media` collection itself to trigger the initial processing.

```typescript
// src/collections/Media.ts
const Media: CollectionConfig = {
  slug: 'media',
  // ... other config
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        // Check if the image has already been processed to avoid loops
        if (doc.dinoAssetId) return doc; 

        // 1. Get image buffer from storage
        const imageBuffer = await getBufferFromStorage(doc.filename);
        
        // 2. Call the orchestrator
        const { dinoAssetId } = await req.payload.dinoOrchestrator.uploadAndExtract(imageBuffer);
        
        // 3. Update the media doc with the new ID (triggers another hook, hence the check at the start)
        await req.payload.update({
          collection: 'media',
          id: doc.id,
          data: { dinoAssetId: dinoAssetId, dinoProcessingStatus: 'processing' },
        });

        return doc;
      },
    ],
  },
  // ... fields
};
```

## 6. Implementation Roadmap

1.  **Phase 1: Setup & Schema**
    *   Implement the updated `characters` and `media` collection schemas in Payload CMS. Add all new DINOv3-related fields.

2.  **Phase 2: Build the DINOv3 Orchestrator**
    *   Create a service class/module within the Payload backend.
    *   Implement robust functions for every required DINOv3 endpoint (`uploadAndExtract`, `validateNewAsset`, etc.), including error handling and retries.
    *   Securely manage the `dino.ft.tc` API key/token.

3.  **Phase 3: Implement Core Workflows**
    *   Develop the "Generate 360° Core Set" custom button/endpoint in Payload.
    *   Implement the on-demand generation logic that orchestrates the `Generative Model -> DINOv3 Validation -> Payload Save` loop.

4.  **Phase 4: UI Enhancements & PathRAG**
    *   Customize the Payload Admin UI to visually represent the validation status (e.g., green/red icons next to images). Add filtering based on quality and consistency scores.
    *   Implement the `syncToPathrag` hook for the character's textual data.