# Insets Library - Implementation Plan

## Overview
The Insets Library will manage insert shots, close-ups, and detail shots for movie production. These are typically brief shots that show specific objects, actions, or details that support the narrative without showing characters' faces.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Inset-focused:**

```typescript
// Primary Inset Fields
name: string                    // Inset name (e.g., "Clock Ticking", "Letter Close-up")
insetId: string                // Unique identifier (auto-generated from name)
status: 'planned' | 'shot' | 'approved' | 'archived'

// Inset Classification
category: 'object' | 'action' | 'text' | 'detail' | 'transition' | 'symbolic'
subcategory: string            // Watch, hands, document, texture, etc.
insetType: 'cutaway' | 'insert' | 'detail' | 'macro' | 'extreme_closeup'
purpose: 'narrative' | 'transition' | 'emphasis' | 'time' | 'mood' | 'information'
duration: number               // Typical duration in seconds

// Visual Specifications
visual: {
  subject: string             // What the inset shows
  framing: 'extreme_closeup' | 'closeup' | 'medium_closeup' | 'detail'
  angle: string              // Top-down, side, angled, etc.
  depth: 'shallow' | 'medium' | 'deep'
  focus: {
    type: 'sharp' | 'soft' | 'rack_focus' | 'pull_focus'
    point: string            // What's in focus
    transition?: string      // Focus change during shot
  }
  movement: {
    camera: 'static' | 'pan' | 'tilt' | 'zoom' | 'dolly' | 'handheld'
    subject: 'static' | 'moving' | 'rotating' | 'transforming'
    speed: 'slow' | 'normal' | 'fast'
  }
}

// Technical Specifications
technical: {
  lens: {
    type: 'macro' | 'telephoto' | 'standard' | 'wide'
    focalLength: number      // mm
    aperture: string         // f-stop range
    minFocusDistance: number // For macro work
  }
  camera: {
    sensor: string           // Full frame, crop, etc.
    resolution: string       // 4K, 2K, HD
    frameRate: number        // FPS
    shutterSpeed: string     // For motion blur control
    iso: number             // Light sensitivity
  }
  lighting: {
    setup: string           // Key light, fill, rim, etc.
    quality: 'hard' | 'soft' | 'mixed'
    direction: string       // Front, side, back, top
    color: string          // Temperature and tint
    special: string[]      // Practical lights, effects
  }
}

// Content & Context
content: {
  objects: string[]          // Physical objects in shot
  text?: {
    visible: boolean
    readable: boolean
    language: string
    content?: string         // Actual text if readable
    font?: string           // Font style if important
  }
  actions: string[]         // Actions taking place
  details: string[]         // Important details to show
  symbolism: string[]       // Symbolic elements
}

// Story Integration
story: {
  sceneContext: string      // Which scene this supports
  narrativeFunction: string // Information, mood, transition
  characterConnection: string[] // Which characters relate to this
  plotRelevance: string     // How it advances plot
  emotionalTone: string     // Mood it creates/supports
  timing: {
    placement: 'beginning' | 'middle' | 'end' | 'transition'
    relationship: 'before' | 'during' | 'after'
    reference: string       // What it's before/during/after
  }
}

// Production Requirements
production: {
  setup: {
    time: number            // Setup time in minutes
    complexity: 'simple' | 'moderate' | 'complex'
    crew: number           // Crew members needed
    equipment: string[]    // Special equipment needed
  }
  shooting: {
    takes: number          // Expected number of takes
    variations: string[]   // Different versions needed
    coverage: string[]     // Multiple angles/framings
    challenges: string[]   // Potential difficulties
  }
  location: {
    type: 'studio' | 'practical' | 'exterior'
    requirements: string[] // Specific location needs
    lighting: string[]     // Lighting requirements
    access: string        // Equipment access needs
  }
}

// Props & Elements
elements: {
  hero: {
    name: string
    condition: string       // Pristine, aged, damaged
    multiples: boolean     // Need backup copies
    handling: string[]     // Special handling needs
  }[]
  supporting: string[]     // Background elements
  practical: string[]      // Practical effects elements
  safety: string[]        // Safety considerations
}

// Post-Production
postProduction: {
  colorGrading: {
    style: string          // Natural, stylized, etc.
    mood: string          // Warm, cool, neutral
    contrast: string      // Low, normal, high
    saturation: string    // Desaturated, normal, saturated
  }
  effects: {
    needed: boolean
    types: string[]       // Cleanup, enhancement, etc.
    complexity: string    // Simple, moderate, complex
  }
  sound: {
    sync: boolean         // Needs sync sound
    effects: string[]     // Sound effects needed
    emphasis: string[]    // Audio emphasis points
  }
}

// Quality Standards
quality: {
  sharpness: 'soft' | 'normal' | 'tack_sharp' | 'hyper_sharp'
  exposure: 'underexposed' | 'normal' | 'overexposed' | 'high_key' | 'low_key'
  composition: string[]   // Rule of thirds, centered, etc.
  aesthetics: string[]   // Beautiful, gritty, clinical, etc.
  technical: string[]    // Focus accuracy, exposure, etc.
}

// Variations & Alternatives
variations: {
  angles: string[]        // Different camera angles
  framings: string[]     // Different frame sizes
  lighting: string[]     // Different lighting setups
  timing: string[]       // Different timing options
  conditions: string[]   // Different prop conditions
}

// Budget & Schedule
budget: {
  setup: number          // Setup costs
  shooting: number       // Shooting costs
  equipment: number      // Special equipment rental
  props: number         // Prop costs
  postProduction: number // Post costs
  total: number         // Total cost
  currency: string
}
schedule: {
  prep: number          // Prep time in hours
  shoot: number         // Shooting time in hours
  post: number          // Post time in hours
  total: number         // Total time
}
```

### 2. Image Generation Prompts
**Inset-focused prompting:**

```typescript
// Base prompt structure for insets
const insetPromptTemplate = `
{INSET_SUBJECT}, {FRAMING} shot, {ANGLE} angle,
{LIGHTING_QUALITY} lighting, {DEPTH_OF_FIELD} depth of field,
{VISUAL_STYLE}, {MOOD}, professional cinematography,
macro photography, high detail, cinematic quality
`

// Specialized prompt types
const promptTypes = {
  object: "Extreme close-up of {OBJECT}, showing {DETAILS}, {LIGHTING} lighting",
  action: "Detail shot of {ACTION}, {MOVEMENT} motion, {TIMING}",
  text: "Close-up of {TEXT_DOCUMENT}, {READABILITY}, {LIGHTING} lighting",
  symbolic: "Symbolic detail shot of {SYMBOL}, {MOOD} atmosphere",
  transition: "Transitional insert of {SUBJECT}, {VISUAL_STYLE}",
  macro: "Macro photography of {SUBJECT}, extreme detail, {TEXTURE}"
}

// Visual style descriptors
const visualStyles = {
  cinematic: "cinematic visual style with dramatic lighting and composition",
  documentary: "documentary style with natural lighting and realistic framing",
  artistic: "artistic visual style with creative composition and lighting",
  commercial: "commercial photography style with perfect lighting and detail"
}
```

### 3. API Endpoints Adaptation
**Inset-specific endpoints:**

```typescript
// Core inset management
POST /api/v1/insets/create
PUT /api/v1/insets/{id}/update
GET /api/v1/insets/{id}
DELETE /api/v1/insets/{id}

// Inset discovery and search
POST /api/v1/insets/search
POST /api/v1/insets/query
GET /api/v1/insets/by-project/{projectId}
GET /api/v1/insets/by-category/{category}
GET /api/v1/insets/by-scene/{sceneId}
GET /api/v1/insets/by-purpose/{purpose}

// Image generation for insets
POST /api/v1/insets/{id}/generate-object-shot
POST /api/v1/insets/{id}/generate-action-detail
POST /api/v1/insets/{id}/generate-text-closeup
POST /api/v1/insets/{id}/generate-symbolic-shot
POST /api/v1/insets/{id}/generate-transition-shot
POST /api/v1/insets/{id}/generate-macro-detail

// Technical planning
GET /api/v1/insets/{id}/equipment-requirements
GET /api/v1/insets/{id}/lighting-setup
POST /api/v1/insets/{id}/shot-list
GET /api/v1/insets/{id}/technical-specs

// Production support
POST /api/v1/insets/{id}/schedule-estimate
GET /api/v1/insets/{id}/crew-requirements
POST /api/v1/insets/{id}/budget-estimate
GET /api/v1/insets/{id}/prop-requirements

// Story integration
GET /api/v1/insets/by-narrative-function/{function}
POST /api/v1/insets/{id}/story-context
GET /api/v1/insets/{id}/scene-integration
```

### 4. UI Component Updates
**Inset-focused interface:**

```typescript
// Main inset components
InsetCard.tsx               // Display inset with preview
InsetDetailView.tsx        // Full inset specs and context
InsetCreationForm.tsx      // Form for creating new insets
InsetSearchInterface.tsx   // Search with purpose/category filters
InsetLibraryView.tsx       // Overview of all inset shots

// Specialized components
PurposeSelector.tsx
FramingGuide.tsx
LightingPlanner.tsx
TechnicalSpecs.tsx
StoryIntegration.tsx
VariationManager.tsx
QualityStandards.tsx

// Image generation components
ObjectShotGenerator.tsx
ActionDetailGenerator.tsx
TextCloseupGenerator.tsx
SymbolicShotGenerator.tsx
TransitionShotGenerator.tsx
MacroDetailGenerator.tsx

// Production components
ShotPlanner.tsx
EquipmentList.tsx
CrewPlanner.tsx
ScheduleEstimator.tsx
BudgetTracker.tsx
```

### 5. Story Integration Points
**Inset-narrative connections:**

```typescript
// Story context integration
interface InsetStoryIntegration {
  narrativeFunction: string    // Information delivery, mood setting
  plotAdvancement: string     // How it moves story forward
  characterConnection: string // Which character it relates to
  emotionalBeat: string      // Emotional moment it supports
  symbolism: string[]        // Symbolic meanings
  timing: string            // When in scene it appears
}

// Scene-inset relationships
interface SceneInsetMatch {
  sceneId: string
  insetId: string
  placement: 'opening' | 'middle' | 'closing' | 'transition'
  function: 'information' | 'mood' | 'emphasis' | 'time' | 'transition'
  importance: 'critical' | 'supporting' | 'enhancement'
  duration: number          // Seconds in final edit
}
```

### 6. Consistency Checking Logic
**Inset-specific validation:**

```typescript
// Visual consistency checks
- Lighting style consistency with main scenes
- Color grading compatibility
- Focus and depth consistency
- Framing and composition standards
- Technical quality standards

// Story consistency checks
- Narrative function clarity
- Character connection logic
- Timing and placement appropriateness
- Emotional tone alignment
- Plot relevance validation

// Production consistency checks
- Equipment availability
- Location accessibility
- Prop condition matching
- Schedule feasibility
- Budget constraint adherence
```

### 7. Reference Management System
**Inset asset organization:**

```typescript
// Image gallery structure
interface InsetImageGallery {
  objectShots: MediaItem[]        // Object close-ups and details
  actionDetails: MediaItem[]      // Action and movement details
  textCloseups: MediaItem[]       // Document and text shots
  symbolicShots: MediaItem[]      // Symbolic and metaphorical shots
  transitionShots: MediaItem[]    // Transitional insert shots
  macroDetails: MediaItem[]       // Extreme macro photography
  variations: MediaItem[]         // Different angles and framings
  references: MediaItem[]         // Reference and inspiration shots
}

// Reference categorization
interface InsetReference {
  referenceType: 'object' | 'action' | 'text' | 'symbolic' | 'transition' | 'macro'
  purpose: string               // Narrative function
  framing: string              // Shot framing type
  lighting: string             // Lighting setup used
  technical: string            // Technical approach
  storyContext: string         // Scene and story context
  isMasterReference: boolean   // Primary reference for this inset
  qualityApproved: boolean     // Meets quality standards
  qualityScore: number         // Technical and artistic quality
  narrativeValue: number       // Story contribution value
}
```

## Tech Stack

### Core Framework & Runtime
- **Next.js 15.4.4** - React framework with App Router
- **React 19.1.1** - Frontend UI library
- **TypeScript 5.7.3** - Type-safe JavaScript
- **Node.js ^18.20.2 || >=20.9.0** - Runtime environment
- **pnpm ^9 || ^10** - Package manager

### Backend & CMS
- **PayloadCMS 3.54.0** - Headless CMS and admin panel
  - `@payloadcms/next` - Next.js integration
  - `@payloadcms/ui` - Admin UI components
  - `@payloadcms/richtext-lexical` - Rich text editor
  - `@payloadcms/payload-cloud` - Cloud deployment plugin

### Database & Storage
- **MongoDB** - Primary database via `@payloadcms/db-mongodb`
- **Mongoose** - MongoDB object modeling
- **Cloudflare R2** - Object storage via `@payloadcms/storage-s3`
  - Media file storage and CDN
  - Custom domain integration (`https://media.rumbletv.com`)

### Image Processing & AI
- **Fal.ai** - AI image generation service
  - Text-to-image: `fal-ai/nano-banana`
  - Image-to-image: `fal-ai/nano-banana/edit`
- **Sharp 0.34.2** - High-performance image processing
- **DINOv3 Service** - Visual consistency validation
- **OpenRouter API** - LLM integration for descriptions

### External Services Integration
- **PathRAG Service** - Knowledge base management
- **BAML** - Prompt engineering and AI orchestration
- **Cloudflare R2** - File storage and CDN
- **OpenRouter** - AI model routing and management

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **@tailwindcss/forms** - Form styling plugin
- **Lucide React ^0.542.0** - Icon library
- **PostCSS ^8.5.6** - CSS processing

### Forms & Validation
- **React Hook Form ^7.62.0** - Form state management
- **@hookform/resolvers ^5.2.1** - Form validation resolvers
- **Zod ^4.1.5** - Schema validation

### Development & Testing
- **ESLint ^9.16.0** - Code linting
- **Prettier ^3.4.2** - Code formatting
- **Vitest 3.2.3** - Unit testing framework
- **Playwright 1.54.1** - End-to-end testing
- **@testing-library/react 16.3.0** - React testing utilities

### Build & Deployment
- **Cross-env ^7.0.3** - Cross-platform environment variables
- **Autoprefixer ^10.4.21** - CSS vendor prefixing
- **GraphQL ^16.8.1** - API query language
- **PM2** - Process management (via ecosystem.config.js)

### Development Tools
- **Dotenv 16.4.7** - Environment variable management
- **Node-fetch ^3.3.2** - HTTP client
- **Form-data ^4.0.4** - Multipart form data handling
- **React Syntax Highlighter ^15.6.6** - Code syntax highlighting

### Configuration Files
- `next.config.mjs` - Next.js configuration with Payload integration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration with path mapping
- `payload.config.ts` - PayloadCMS configuration
- `ecosystem.config.js` - PM2 deployment configuration

### Environment Variables
```bash
# Database
DATABASE_URI=mongodb://127.0.0.1/insets-library
PAYLOAD_SECRET=your-payload-secret

# AI Services
FAL_KEY=your-fal-api-key
FAL_TEXT_TO_IMAGE_MODEL=fal-ai/nano-banana
FAL_IMAGE_TO_IMAGE_MODEL=fal-ai/nano-banana/edit
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4

# External Services
DINO_SERVICE_URL=https://dino.ft.tc
DINO_API_KEY=your-dino-api-key
PATHRAG_SERVICE_URL=https://pathrag.ft.tc
PATHRAG_API_KEY=your-pathrag-api-key

# Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ENDPOINT=your-r2-endpoint
CLOUDFLARE_R2_PUBLIC_URL=https://media.yourdomain.com

# Admin
PAYLOADCMS_ADMIN_EMAIL=admin@yourdomain.com
PAYLOADCMS_ADMIN_PASSWORD=your-admin-password
```

This comprehensive plan provides the foundation for creating a robust Insets Library that serves the unique needs of detail shot planning, production, and integration for movie storytelling.
